<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SpotifyService;
use App\Models\SpotifyTokenModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminHomeController extends Controller
{
    protected $spotifyService;

    public function __construct(SpotifyService $spotifyService)
    {
        $this->spotifyService = $spotifyService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        Log::info('🏠 [HomeAdmin] Loading page for user', ['user_id' => $user->user_id]);
        
        $spotifyToken = SpotifyTokenModel::where('user_id', $user->user_id)->first();
        
        if (!$spotifyToken) {
            Log::warning('⚠️ [HomeAdmin] No Spotify token found in t_spotify_token');
            return Inertia::render('HomeAdmin', [
                'auth' => ['user' => $user],
                'listenAgain' => [],
                'topTracks' => [],
                'indonesianHits' => [],
            ]);
        }

        Log::info('✅ [HomeAdmin] Spotify token found in t_spotify_token');

        if ($spotifyToken->expired_at && now()->isAfter($spotifyToken->expired_at)) {
            Log::info('🔄 [HomeAdmin] Token expired, refreshing...');
            try {
                $tokenData = $this->spotifyService->refreshAccessToken($spotifyToken->refresh_token);
                
                $spotifyToken->update([
                    'access_token' => $tokenData['access_token'],
                    'expired_at' => now()->addSeconds($tokenData['expires_in']),
                ]);
                Log::info('✅ [HomeAdmin] Token refreshed successfully');
            } catch (\Exception $e) {
                Log::error('❌ [HomeAdmin] Failed to refresh token', ['error' => $e->getMessage()]);
                return Inertia::render('HomeAdmin', [
                    'auth' => ['user' => $user],
                    'listenAgain' => [],
                    'topTracks' => [],
                    'indonesianHits' => [],
                ]);
            }
        }

        $accessToken = $spotifyToken->access_token;

        try {
            Log::info('🎵 [HomeAdmin] Fetching Spotify data...');

            // 1. Get Recently Played (Listen Again)
            Log::info('📀 [HomeAdmin] Fetching recently played...');
            $recentlyPlayed = $this->spotifyService->getRecentlyPlayed($accessToken, 4);
            $listenAgain = $this->formatRecentlyPlayed($recentlyPlayed);
            Log::info('✅ [HomeAdmin] Listen Again', ['count' => count($listenAgain)]);

            // 2. Get Top Tracks
            Log::info('🔥 [HomeAdmin] Fetching top tracks...');
            $topTracksData = $this->spotifyService->getTopTracks($accessToken, 'short_term', 4);
            $topTracks = $this->formatTopTracks($topTracksData);
            Log::info('✅ [HomeAdmin] Top Tracks', ['count' => count($topTracks)]);

            // 3. Get Indonesian Hits - PERBAIKAN DI SINI
            Log::info('🇮🇩 [HomeAdmin] Fetching Indonesian hits...');
            $indonesianHits = $this->getIndonesianHits($accessToken);
            Log::info('✅ [HomeAdmin] Indonesian Hits', ['count' => count($indonesianHits)]);

        } catch (\Exception $e) {
            Log::error('❌ [HomeAdmin] Error fetching Spotify data', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $listenAgain = [];
            $topTracks = [];
            $indonesianHits = [];
        }

        Log::info('📊 [HomeAdmin] Final data counts', [
            'listenAgain' => count($listenAgain),
            'topTracks' => count($topTracks),
            'indonesianHits' => count($indonesianHits),
        ]);

        return Inertia::render('HomeAdmin', [
            'auth' => ['user' => $user],
            'listenAgain' => $listenAgain,
            'topTracks' => $topTracks,
            'indonesianHits' => $indonesianHits,
        ]);
    }

    private function formatRecentlyPlayed($data)
    {
        if (!isset($data['items'])) {
            return [];
        }

        return collect($data['items'])->map(function ($item) {
            $track = $item['track'];
            return [
                'id' => $track['id'],
                'title' => $track['name'],
                'artist' => collect($track['artists'])->pluck('name')->join(', '),
                'thumbnail' => $track['album']['images'][0]['url'] ?? null,
                'uri' => $track['uri'],
                'duration_ms' => $track['duration_ms'],
                'type' => 'track',
                'played_at' => $item['played_at'],
            ];
        })->take(4)->values()->toArray();
    }

    private function formatTopTracks($data)
    {
        if (!isset($data['items'])) {
            return [];
        }

        return collect($data['items'])->map(function ($track) {
            return [
                'id' => $track['id'],
                'title' => $track['name'],
                'artist' => collect($track['artists'])->pluck('name')->join(', '),
                'thumbnail' => $track['album']['images'][0]['url'] ?? null,
                'uri' => $track['uri'],
                'duration_ms' => $track['duration_ms'],
                'popularity' => $track['popularity'],
                'type' => 'track',
            ];
        })->take(4)->values()->toArray();
    }

    /**
     * Get Indonesian hits - SOLUSI BARU
     */
    private function getIndonesianHits($accessToken)
    {
        try {
            // Strategi 1: Cari playlist "Indonesian" atau "Indonesia"
            Log::info('🔍 [HomeAdmin] Searching for Indonesian playlists...');
            $searchResult = $this->spotifyService->search($accessToken, 'Indonesia Top Hits', 'playlist', 5);
            
            if (isset($searchResult['playlists']['items']) && count($searchResult['playlists']['items']) > 0) {
                // Ambil playlist pertama yang ditemukan
                $playlist = $searchResult['playlists']['items'][0];
                $playlistId = $playlist['id'];
                
                Log::info('✅ [HomeAdmin] Found Indonesian playlist', [
                    'name' => $playlist['name'],
                    'id' => $playlistId
                ]);
                
                $tracksData = $this->spotifyService->getPlaylistTracks($accessToken, $playlistId, 6);
                return $this->formatPlaylistTracks($tracksData);
            }
            
            // Strategi 2: Jika tidak ada, gunakan top tracks Indonesia dari user
            Log::info('⚠️ [HomeAdmin] No Indonesian playlist found, using user top tracks');
            $topTracksData = $this->spotifyService->getTopTracks($accessToken, 'medium_term', 6);
            return $this->formatTopTracksToAlbumFormat($topTracksData);

        } catch (\Exception $e) {
            Log::error('❌ [HomeAdmin] Error fetching Indonesian hits', ['error' => $e->getMessage()]);
            
            // Fallback: Return empty atau top tracks
            try {
                $topTracksData = $this->spotifyService->getTopTracks($accessToken, 'medium_term', 6);
                return $this->formatTopTracksToAlbumFormat($topTracksData);
            } catch (\Exception $fallbackError) {
                return [];
            }
        }
    }

    private function formatPlaylistTracks($data)
    {
        if (!isset($data['items'])) {
            return [];
        }

        return collect($data['items'])->map(function ($item) {
            $track = $item['track'];
            
            if (!$track) {
                return null;
            }

            return [
                'id' => $track['id'],
                'title' => $track['name'],
                'artist' => collect($track['artists'])->pluck('name')->join(', '),
                'thumbnail' => $track['album']['images'][0]['url'] ?? null,
                'uri' => $track['uri'],
                'duration_ms' => $track['duration_ms'],
                'type' => 'track',
                'isPlaying' => false,
            ];
        })->filter()->take(6)->values()->toArray();
    }

    /**
     * Format top tracks ke format album (untuk fallback)
     */
    private function formatTopTracksToAlbumFormat($data)
    {
        if (!isset($data['items'])) {
            return [];
        }

        return collect($data['items'])->map(function ($track) {
            return [
                'id' => $track['id'],
                'title' => $track['name'],
                'artist' => collect($track['artists'])->pluck('name')->join(', '),
                'thumbnail' => $track['album']['images'][0]['url'] ?? null,
                'uri' => $track['uri'],
                'duration_ms' => $track['duration_ms'],
                'type' => 'track',
                'isPlaying' => false,
            ];
        })->take(6)->values()->toArray();
    }
}