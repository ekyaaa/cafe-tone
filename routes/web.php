<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SpotifyController;
use App\Http\Controllers\Admin\AdminPageController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\User\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// ========================================
// GUEST ROUTES (Belum Login)
// ========================================
Route::middleware(['guest'])->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])
        ->name('login');
    
    Route::post('/login', [LoginController::class, 'login'])
        ->name('login.submit');
});

// ========================================
// LOGOUT (Harus Login)
// ========================================
Route::post('/logout', [LoginController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

// ========================================
// SPOTIFY AUTHENTICATION (Admin Only)
// ========================================
Route::middleware(['auth'])->group(function () {
    Route::get('/spotify/login', [SpotifyController::class, 'login'])->name('spotify.login');
    Route::get('/spotify/callback', [SpotifyController::class, 'callback'])->name('spotify.callback');
    Route::post('/spotify/disconnect', [SpotifyController::class, 'disconnect'])->name('spotify.disconnect');
});

// ========================================
// SPOTIFY API ENDPOINTS
// ========================================
Route::middleware(['auth'])->prefix('api/spotify')->group(function () {
    // Public (all users can see status)
    Route::get('/check-connection', [SpotifyController::class, 'checkConnection']);
    Route::get('/current-playback', [SpotifyController::class, 'getCurrentPlayback']);
    
    // Admin only (control)
    Route::get('/token', [SpotifyController::class, 'getToken']);
    Route::post('/play', [SpotifyController::class, 'play']);
    Route::post('/pause', [SpotifyController::class, 'pause']);
    Route::post('/next', [SpotifyController::class, 'next']);
    Route::post('/previous', [SpotifyController::class, 'previous']);
});

// ========================================
// ADMIN ROUTES (id_role = 1)
// ========================================
Route::prefix('admin')
    ->middleware(['auth', 'admin'])
    ->name('admin.')
    ->group(function () {
        Route::get('/', [AdminPageController::class, 'index'])->name('home');
        Route::get('/explore', [AdminPageController::class, 'explore'])->name('explore');
        Route::get('/library', [AdminPageController::class, 'library'])->name('library');
        Route::get('/playlist/{id}', [AdminPageController::class, 'playlist'])->name('playlist');
    });

// ========================================
// USER ROUTES (id_role = 2 atau 3)
// ========================================
Route::prefix('user')
    ->middleware(['auth'])
    ->name('user.')
    ->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('home');
        Route::get('/explore', [UserController::class, 'explore'])->name('explore');
        Route::get('/library', [UserController::class, 'library'])->name('library');
        Route::get('/playlist/{id}', [UserController::class, 'playlist'])->name('playlist');
    });

// ========================================
// ROOT REDIRECT (Redirect ke role masing-masing)
// ========================================
Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();
        
        // Redirect based on role
        if ($user->id_role === 1) {
            return redirect()->route('admin.home');
        } else {
            return redirect()->route('user.home');
        }
    }
    
    return redirect()->route('login');
})->name('home');