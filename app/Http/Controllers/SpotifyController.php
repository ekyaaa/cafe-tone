<?php

namespace App\Http\Controllers;

use App\Models\SpotifyTokenModel;
use App\Models\UserModel;
use App\Services\SpotifyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SpotifyController extends Controller
{
    private $spotify;

    public function __construct(SpotifyService $spotify)
    {
        $this->spotify = $spotify;
    }

    /**
     * Redirect to Spotify authorization
     * ONLY for ADMIN (id_role = 1)
     */
    public function login()
    {
        $user = Auth::user();

        Log::info('Spotify login attempt', [
            'user_id' => $user->user_id,
            'user_role' => $user->id_role,
        ]);

        // Only admin can connect
        if ($user->id_role !== 1) {
            Log::warning('Non-admin tried to connect Spotify', ['user_id' => $user->user_id]);
            return back()->withErrors(['spotify' => 'Only admins can connect Spotify']);
        }

        $authUrl = $this->spotify->getAuthUrl();
        
        Log::info('Redirecting to Spotify auth', ['url' => $authUrl]);

        return redirect($authUrl);
    }

    /**
     * Handle Spotify callback
     */
    public function callback(Request $request)
    {
        if (!$request->has('code')) {
            Log::error('Spotify callback: No code provided');
            return redirect()->route('admin.home')->withErrors(['spotify' => 'Authorization failed']);
        }

        $user = Auth::user();

        // Only admin can connect
        if ($user->id_role !== 1) {
            return redirect('/')->withErrors(['spotify' => 'Only admins can connect Spotify']);
        }

        try {
            // Exchange code for tokens
            $tokens = $this->spotify->getAccessToken($request->code);

            Log::info('Spotify tokens received', [
                'user_id' => $user->user_id,
                'has_access_token' => isset($tokens['access_token']),
                'has_refresh_token' => isset($tokens['refresh_token']),
            ]);

            // Save or update token for admin
            SpotifyTokenModel::updateOrCreate(
                ['user_id' => $user->user_id],
                [
                    'access_token' => $tokens['access_token'],
                    'refresh_token' => $tokens['refresh_token'],
                    'expired_at' => now()->addSeconds($tokens['expires_in']),
                ]
            );

            Log::info('Spotify token saved for admin', ['user_id' => $user->user_id]);

            return redirect()->route('admin.home')
                ->with('success', 'Spotify connected successfully!');

        } catch (\Exception $e) {
            Log::error('Spotify callback error', [
                'user_id' => $user->user_id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('admin.home')
                ->withErrors(['spotify' => 'Failed to connect: ' . $e->getMessage()]);
        }
    }

    /**
     * Get access token for Web Playback SDK
     * Only admin can get token for control
     */
    public function getToken(Request $request)
    {
        try {
            $user = Auth::user();

            // Only admin can control
            if ($user->id_role !== 1) {
                return response()->json(['error' => 'Only admins can control player'], 403);
            }

            $spotifyToken = SpotifyTokenModel::where('user_id', $user->user_id)->first();

            if (!$spotifyToken) {
                Log::warning('Admin does not have Spotify token', ['user_id' => $user->user_id]);
                return response()->json(['error' => 'Not connected to Spotify'], 401);
            }

            // Check if token is expired
            if ($spotifyToken->isExpired()) {
                Log::info('Token expired, refreshing...', ['user_id' => $user->user_id]);

                // Refresh token
                $tokens = $this->spotify->refreshAccessToken($spotifyToken->refresh_token);

                $spotifyToken->update([
                    'access_token' => $tokens['access_token'],
                    'expired_at' => now()->addSeconds($tokens['expires_in']),
                ]);

                return response()->json([
                    'access_token' => $tokens['access_token'],
                ]);
            }

            return response()->json([
                'access_token' => $spotifyToken->access_token,
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting Spotify token', [
                'user_id' => $user->user_id ?? null,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to get token: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current playback state (All users can see)
     */
    public function getCurrentPlayback(Request $request)
    {
        try {
            // Find admin's token (first admin with token)
            $adminToken = SpotifyTokenModel::whereHas('user', function($query) {
                $query->where('id_role', 1);
            })->first();

            if (!$adminToken) {
                return response()->json(['error' => 'No admin connected to Spotify'], 404);
            }

            $accessToken = $this->getValidAccessTokenForAdmin($adminToken);

            if (!$accessToken) {
                return response()->json(['error' => 'Failed to get valid token'], 401);
            }

            // Get current playback from Spotify API
            $response = $this->spotify->getCurrentPlayback($accessToken);

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Error getting current playback', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to get playback status'], 500);
        }
    }

    /**
     * Check connection status
     * Returns: is_admin (can control), is_connected, current_playback
     */
    public function checkConnection(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $isAdmin = $user->id_role === 1;

            // Check if ANY admin has connected Spotify
            $adminToken = SpotifyTokenModel::join('m_user', 't_spotify_token.user_id', '=', 'm_user.user_id')
                ->where('m_user.id_role', 1)
                ->select('t_spotify_token.*')
                ->first();

            $isConnected = $adminToken !== null;

            // If user is admin, check their own connection
            if ($isAdmin) {
                $ownToken = SpotifyTokenModel::where('user_id', $user->user_id)->first();
                $canControl = $ownToken !== null;
            } else {
                $canControl = false;
            }

            return response()->json([
                'is_admin' => $isAdmin,
                'can_control' => $canControl,
                'is_connected' => $isConnected,
                'connected_admin_id' => $adminToken ? $adminToken->user_id : null,
                'user' => [
                    'id' => $user->user_id,
                    'name' => $user->user_name,
                    'email' => $user->email,
                    'role' => $user->id_role,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error checking connection', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage(),
                'is_admin' => false,
                'can_control' => false,
                'is_connected' => false,
            ], 500);
        }
    }

    /**
     * Disconnect Spotify (Admin only)
     */
    public function disconnect(Request $request)
    {
        $user = Auth::user();

        if ($user->id_role !== 1) {
            return back()->withErrors(['spotify' => 'Only admins can disconnect Spotify']);
        }

        SpotifyTokenModel::where('user_id', $user->user_id)->delete();

        return back()->with('success', 'Spotify disconnected successfully!');
    }

    /**
     * Control endpoints (Admin only)
     */
    public function play(Request $request)
    {
        $user = Auth::user();

        if ($user->id_role !== 1) {
            return response()->json(['error' => 'Only admins can control playback'], 403);
        }

        $accessToken = $this->getValidAccessToken($user);

        if (!$accessToken) {
            return response()->json(['error' => 'Not connected to Spotify'], 401);
        }

        try {
            $deviceId = $request->input('device_id');
            $uris = $request->input('uris');
            $contextUri = $request->input('context_uri');
            $offset = $request->input('offset');
            $positionMs = $request->input('position_ms', 0);

            $result = $this->spotify->play(
                $accessToken,
                $deviceId,
                $contextUri,
                $uris,
                $positionMs,
                $offset
            );

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error playing', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'error' => 'Playback control failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Pause playback
     */
    public function pause(Request $request)
    {
        $user = Auth::user();

        if ($user->id_role !== 1) {
            return response()->json(['error' => 'Only admins can control playback'], 403);
        }

        $accessToken = $this->getValidAccessToken($user);

        if (!$accessToken) {
            return response()->json(['error' => 'Not connected to Spotify'], 401);
        }

        try {
            $deviceId = $request->input('device_id');
            $result = $this->spotify->pause($accessToken, $deviceId);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error pausing', [
                'message' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Playback control failed'], 500);
        }
    }

    /**
     * Next track
     */
    public function next(Request $request)
    {
        $user = Auth::user();

        if ($user->id_role !== 1) {
            return response()->json(['error' => 'Only admins can control playback'], 403);
        }

        $accessToken = $this->getValidAccessToken($user);

        if (!$accessToken) {
            return response()->json(['error' => 'Not connected to Spotify'], 401);
        }

        try {
            $deviceId = $request->input('device_id');
            $result = $this->spotify->next($accessToken, $deviceId);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error next track', [
                'message' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Playback control failed'], 500);
        }
    }

    /**
     * Previous track
     */
    public function previous(Request $request)
    {
        $user = Auth::user();

        if ($user->id_role !== 1) {
            return response()->json(['error' => 'Only admins can control playback'], 403);
        }

        $accessToken = $this->getValidAccessToken($user);

        if (!$accessToken) {
            return response()->json(['error' => 'Not connected to Spotify'], 401);
        }

        try {
            $deviceId = $request->input('device_id');
            $result = $this->spotify->previous($accessToken, $deviceId);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error previous track', [
                'message' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Playback control failed'], 500);
        }
    }

    private function controlPlayback($action, Request $request)
    {
        $user = Auth::user();

        if ($user->id_role !== 1) {
            return response()->json(['error' => 'Only admins can control playback'], 403);
        }

        $accessToken = $this->getValidAccessToken($user);

        if (!$accessToken) {
            return response()->json(['error' => 'Not connected to Spotify'], 401);
        }

        try {
            $result = $this->spotify->$action($accessToken);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error("Error with playback action: $action", [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Playback control failed'], 500);
        }
    }

    private function getValidAccessToken($user)
    {
        $spotifyToken = SpotifyTokenModel::where('user_id', $user->user_id)->first();

        if (!$spotifyToken) {
            return null;
        }

        if ($spotifyToken->isExpired()) {
            try {
                $tokens = $this->spotify->refreshAccessToken($spotifyToken->refresh_token);

                $spotifyToken->update([
                    'access_token' => $tokens['access_token'],
                    'expired_at' => now()->addSeconds($tokens['expires_in']),
                ]);

                return $tokens['access_token'];
            } catch (\Exception $e) {
                Log::error('Error refreshing token', [
                    'user_id' => $user->user_id,
                    'message' => $e->getMessage(),
                ]);
                return null;
            }
        }

        return $spotifyToken->access_token;
    }

    private function getValidAccessTokenForAdmin($adminToken)
    {
        if ($adminToken->isExpired()) {
            try {
                $tokens = $this->spotify->refreshAccessToken($adminToken->refresh_token);

                $adminToken->update([
                    'access_token' => $tokens['access_token'],
                    'expired_at' => now()->addSeconds($tokens['expires_in']),
                ]);

                return $tokens['access_token'];
            } catch (\Exception $e) {
                Log::error('Error refreshing admin token', [
                    'message' => $e->getMessage(),
                ]);
                return null;
            }
        }

        return $adminToken->access_token;
    }

    /**
     * Get recently played tracks
     */
    public function getRecentlyPlayed(Request $request)
    {
        try {
            // Find admin's token (first admin with token)
            $adminToken = SpotifyTokenModel::join('m_user', 't_spotify_token.user_id', '=', 'm_user.user_id')
                ->where('m_user.id_role', 1)
                ->select('t_spotify_token.*')
                ->first();

            if (!$adminToken) {
                return response()->json(['error' => 'No admin connected to Spotify'], 404);
            }

            $accessToken = $this->getValidAccessTokenForAdmin($adminToken);

            if (!$accessToken) {
                return response()->json(['error' => 'Failed to get valid token'], 401);
            }

            // Get recently played from Spotify API
            $response = $this->spotify->getRecentlyPlayed($accessToken, 1); // Get last 1 track

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Error getting recently played', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to get recently played'], 500);
        }
    }
}
