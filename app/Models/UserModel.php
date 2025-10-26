<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class UserModel extends Authenticatable
{
    use Notifiable;

    protected $table = 'm_user';
    protected $primaryKey = 'user_id';

    protected $fillable = [
        'user_name',
        'email',
        'password',
        'id_role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relationship to Spotify token
    public function spotifyToken()
    {
        return $this->hasOne(SpotifyToken::class, 'user_id', 'user_id');
    }

    // Check if user is admin
    public function isAdmin()
    {
        return $this->id_role === 1;
    }

    // Check if user has Spotify connected
    public function hasSpotifyConnected()
    {
        return $this->spotifyToken !== null;
    }
}
