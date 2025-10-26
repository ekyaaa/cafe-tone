<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckSpotifyConnected
{
    /**
     * Handle an incoming request.
     *
     * Middleware untuk cek apakah user sudah connect Spotify
     * 
     * Usage:
     * Route::middleware(['auth', 'spotify'])->group(function () {
     *     Route::get('/player', [MusicController::class, 'index']);
     * });
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Cek apakah user sudah login
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // Cek apakah user sudah connect dengan Spotify
        // Asumsi: User punya relasi dengan SpotifyToken
        if (!$user->spotifyToken || !$user->spotifyToken->access_token) {
            return redirect()->route('spotify.login')
                ->with('error', 'Silakan hubungkan akun Spotify Anda terlebih dahulu.');
        }

        // Cek apakah token masih valid
        if ($user->spotifyToken->isExpired()) {
            // Redirect ke refresh token atau login ulang
            return redirect()->route('spotify.login')
                ->with('error', 'Token Spotify Anda sudah expired, silakan login ulang.');
        }

        return $next($request);
    }
}
