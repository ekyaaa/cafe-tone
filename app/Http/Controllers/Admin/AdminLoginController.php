<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class AdminLoginController extends Controller
{
    public function login()
    {
        $state = Str::random(16);
        $scope = 'playlist-modify-private playlist-modify-public';

        $query = http_build_query([
            'response_type' => 'code',
            'client_id' => env('SPOTIFY_CLIENT_ID'),
            'scope' => $scope,
            'redirect_uri' => env('SPOTIFY_REDIRECT_URI'),
            'state' => $state
        ]);

        return redirect('https://accounts.spotify.com/authorize?' . $query);
    }

    public function callback(Request $request)
    {
        $code = $request->get('code');
        $state = $request->get('state');

        if (!$state || $state !== session('spotify_state')) {
            return redirect('/')->with('error', 'State mismatch');
        }

        try {
            $response = Http::asForm()->post('https://accounts.spotify.com/api/token', [
                'code' => $code,
                'redirect_uri' => env('SPOTIFY_REDIRECT_URI'),
                'grant_type' => 'authorization_code',
            ])->withHeaders([
                'Authorization' => 'Basic ' . base64_encode(env('SPOTIFY_CLIENT_ID') . ':' . env('SPOTIFY_CLIENT_SECRET')),
            ])->throw(); // throw exception on else 200 response

            $data = $response->json();
            $accessToken = $data['access_token'];
            $refreshToken = $data['refresh_token'];

            // Simpan ke database atau session
            // ...

            return redirect('/dashboard')->with('success', 'Spotify connected');
        } catch (\Exception $e) {
            return redirect('/')->with('error', 'Failed to get token: ' . $e->getMessage());
        }
    }
}
