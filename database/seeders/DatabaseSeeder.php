<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Call individual seeders
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
        ]);
    }
}