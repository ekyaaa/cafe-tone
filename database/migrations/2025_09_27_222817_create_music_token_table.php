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
        Schema::create('t_music_token', function (Blueprint $table) {
            $table->id('music_token_id');
            $table->string('music_token', 255);
            $table->dateTime('last_requested_at')->nullable();
            $table->dateTime('expired_at')->default(now()->addHour(24));
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_music_token');
    }
};
