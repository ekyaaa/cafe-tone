<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('t_spotify_token', function (Blueprint $table) {
            $table->id('spotify_token_id');
            $table->text('access_token');
            $table->text('refresh_token');
            $table->dateTime('expired_at');
            $table->timestamps();

            $table->foreignId('user_id')->constrained('m_user', 'user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_spotify_token');
    }
};
