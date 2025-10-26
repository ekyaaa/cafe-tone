<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminPageController extends Controller
{
    /**
     * Display the home page for admin
     */
    public function index()
    {
        return Inertia::render('HomeAdmin', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Display the explore page
     */
    public function explore()
    {
        return Inertia::render('Explore', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Display the library page
     */
    public function library()
    {
        return Inertia::render('Library', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Display a specific playlist
     */
    public function playlist($id)
    {
        // Nanti bisa ambil data playlist dari database atau Spotify API
        return Inertia::render('Playlist', [
            'playlistId' => $id,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }
}
