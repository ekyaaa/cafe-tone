<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpotifyTokenModel extends Model
{
    protected $table = 't_spotify_token';
    protected $primaryKey = 'spotify_token_id';

    protected $fillable = [
        'user_id',
        'access_token',
        'refresh_token',
        'expired_at',
    ];

    protected $casts = [
        'expired_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(UserModel::class, 'user_id', 'user_id');
    }

    /**
     * Check if token is expired
     */
    public function isExpired()
    {
        return $this->expired_at && now()->gt($this->expired_at);
    }
}
