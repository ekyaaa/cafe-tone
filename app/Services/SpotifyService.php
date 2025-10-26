<?php
// filepath: app/Services/SpotifyService.php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

class SpotifyService
{
    private $client;
    private $clientId;
    private $clientSecret;
    private $redirectUri;

    public function __construct()
    {
        $this->client = new Client(['base_uri' => 'https://api.spotify.com/v1/']);
        $this->clientId = config('services.spotify.client_id');
        $this->clientSecret = config('services.spotify.client_secret');
        $this->redirectUri = config('services.spotify.redirect_uri');
    }

    /**
     * Get authorization URL with Web Playback SDK scopes
     */
    public function getAuthUrl()
    {
        $scopes = [
            // User info
            'user-read-private',
            'user-read-email',
            
            // Playback control
            'user-read-playback-state',
            'user-modify-playback-state',
            'user-read-currently-playing',
            
            // Web Playback SDK (REQUIRED!)
            'streaming',
            
            // Library
            'user-library-read',
            'user-library-modify',
            
            // Playlists
            'playlist-read-private',
            'playlist-read-collaborative',
            'playlist-modify-public',
            'playlist-modify-private',
            
            // Top items
            'user-top-read',
            
            // Recently played
            'user-read-recently-played',
        ];

        $query = http_build_query([
            'client_id' => $this->clientId,
            'response_type' => 'code',
            'redirect_uri' => $this->redirectUri,
            'scope' => implode(' ', $scopes),
            'show_dialog' => false,
        ]);

        return "https://accounts.spotify.com/authorize?{$query}";
    }

    /**
     * Exchange authorization code for access token
     */
    public function getAccessToken($code)
    {
        try {
            $response = $this->client->post('https://accounts.spotify.com/api/token', [
                'form_params' => [
                    'grant_type' => 'authorization_code',
                    'code' => $code,
                    'redirect_uri' => $this->redirectUri,
                    'client_id' => $this->clientId,
                    'client_secret' => $this->clientSecret,
                ],
            ]);

            return json_decode($response->getBody(), true);
        } catch (GuzzleException $e) {
            Log::error('Error getting Spotify access token', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Refresh access token
     */
    public function refreshAccessToken($refreshToken)
    {
        try {
            $response = $this->client->post('https://accounts.spotify.com/api/token', [
                'form_params' => [
                    'grant_type' => 'refresh_token',
                    'refresh_token' => $refreshToken,
                    'client_id' => $this->clientId,
                    'client_secret' => $this->clientSecret,
                ],
            ]);

            return json_decode($response->getBody(), true);
        } catch (GuzzleException $e) {
            Log::error('Error refreshing Spotify token', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get user's current playback state
     */
    public function getCurrentPlayback($accessToken)
    {
        try {
            $response = $this->client->get('me/player', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
            ]);

            $statusCode = $response->getStatusCode();

            // 204 No Content = No playback
            if ($statusCode === 204) {
                return null;
            }

            return json_decode($response->getBody(), true);
        } catch (GuzzleException $e) {
            // 404 = No active device
            if ($e->getCode() === 404) {
                return null;
            }

            Log::error('Error getting current playback', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
            ]);
            throw $e;
        }
    }

    /**
     * Get user's playlists
     */
    public function getPlaylists($accessToken, $limit = 50, $offset = 0)
    {
        try {
            $response = $this->client->get('me/playlists', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
                'query' => [
                    'limit' => $limit,
                    'offset' => $offset,
                ],
            ]);

            return json_decode($response->getBody(), true);
        } catch (GuzzleException $e) {
            Log::error('Error getting playlists', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get playlist tracks
     */
    public function getPlaylistTracks($accessToken, $playlistId, $limit = 100, $offset = 0)
    {
        try {
            $response = $this->client->get("playlists/{$playlistId}/tracks", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
                'query' => [
                    'limit' => $limit,
                    'offset' => $offset,
                ],
            ]);

            return json_decode($response->getBody(), true);
        } catch (GuzzleException $e) {
            Log::error('Error getting playlist tracks', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Search for tracks, artists, albums, playlists
     */
    public function search($accessToken, $query, $type = 'track', $limit = 20)
    {
        try {
            $response = $this->client->get('search', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
                'query' => [
                    'q' => $query,
                    'type' => $type,
                    'limit' => $limit,
                ],
            ]);

            return json_decode($response->getBody(), true);
        } catch (GuzzleException $e) {
            Log::error('Error searching Spotify', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Play a track/playlist
     */
    public function play($accessToken, $deviceId = null, $contextUri = null, $uris = null, $positionMs = 0)
    {
        try {
            $body = [];

            if ($contextUri) {
                $body['context_uri'] = $contextUri;
            }

            if ($uris) {
                $body['uris'] = $uris;
            }

            if ($positionMs > 0) {
                $body['position_ms'] = $positionMs;
            }

            $query = $deviceId ? ['device_id' => $deviceId] : [];

            $response = $this->client->put('me/player/play', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                    'Content-Type' => 'application/json',
                ],
                'query' => $query,
                'json' => $body,
            ]);

            return $response->getStatusCode() === 204;
        } catch (GuzzleException $e) {
            Log::error('Error playing track', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Pause playback
     */
    public function pause($accessToken, $deviceId = null)
    {
        try {
            $query = $deviceId ? ['device_id' => $deviceId] : [];

            $response = $this->client->put('me/player/pause', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
                'query' => $query,
            ]);

            return $response->getStatusCode() === 204;
        } catch (GuzzleException $e) {
            Log::error('Error pausing playback', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Skip to next track
     */
    public function next($accessToken, $deviceId = null)
    {
        try {
            $query = $deviceId ? ['device_id' => $deviceId] : [];

            $response = $this->client->post('me/player/next', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
                'query' => $query,
            ]);

            return $response->getStatusCode() === 204;
        } catch (GuzzleException $e) {
            Log::error('Error skipping to next track', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Skip to previous track
     */
    public function previous($accessToken, $deviceId = null)
    {
        try {
            $query = $deviceId ? ['device_id' => $deviceId] : [];

            $response = $this->client->post('me/player/previous', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
                'query' => $query,
            ]);

            return $response->getStatusCode() === 204;
        } catch (GuzzleException $e) {
            Log::error('Error skipping to previous track', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Seek to position in currently playing track
     */
    public function seek($accessToken, $positionMs, $deviceId = null)
    {
        try {
            $query = ['position_ms' => $positionMs];
            
            if ($deviceId) {
                $query['device_id'] = $deviceId;
            }

            $response = $this->client->put('me/player/seek', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
                'query' => $query,
            ]);

            return $response->getStatusCode() === 204;
        } catch (GuzzleException $e) {
            Log::error('Error seeking position', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Set playback volume
     */
    public function setVolume($accessToken, $volumePercent, $deviceId = null)
    {
        try {
            $query = ['volume_percent' => min(100, max(0, $volumePercent))];
            
            if ($deviceId) {
                $query['device_id'] = $deviceId;
            }

            $response = $this->client->put('me/player/volume', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
                'query' => $query,
            ]);

            return $response->getStatusCode() === 204;
        } catch (GuzzleException $e) {
            Log::error('Error setting volume', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get user's top tracks
     */
    public function getTopTracks($accessToken, $timeRange = 'medium_term', $limit = 20)
    {
        try {
            $response = $this->client->get('me/top/tracks', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
                'query' => [
                    'time_range' => $timeRange, // short_term, medium_term, long_term
                    'limit' => $limit,
                ],
            ]);

            return json_decode($response->getBody(), true);
        } catch (GuzzleException $e) {
            Log::error('Error getting top tracks', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get available devices
     */
    public function getDevices($accessToken)
    {
        try {
            $response = $this->client->get('me/player/devices', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
            ]);

            return json_decode($response->getBody(), true);
        } catch (GuzzleException $e) {
            Log::error('Error getting devices', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Transfer playback to a device
     */
    public function transferPlayback($accessToken, $deviceId, $play = false)
    {
        try {
            $response = $this->client->put('me/player', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'device_ids' => [$deviceId],
                    'play' => $play,
                ],
            ]);

            return $response->getStatusCode() === 204;
        } catch (GuzzleException $e) {
            Log::error('Error transferring playback', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}