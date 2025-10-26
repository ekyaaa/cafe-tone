<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display the home page for regular user
     */
    public function index()
    {
        return Inertia::render('HomeUser', [
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
        return Inertia::render('User/Explore', [
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
        return Inertia::render('User/Library', [
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
        return Inertia::render('User/Playlist', [
            'playlistId' => $id,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }
}
