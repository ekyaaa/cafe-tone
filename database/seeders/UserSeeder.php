<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        for ($i = 0; $i < 3; $i++) {
            DB::table('m_user')->insert([
                'user_name' => $faker->name(),
                'email' => $faker->unique()->safeEmail(),
                'password' => Hash::make('password123'),
                'id_role' => 1,
                'remember_token' => Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        
        // For user
        DB::table('m_user')->insert([
            'user_name' => $faker->name(),
            'email' => $faker->unique()->safeEmail(),
            'password' => Hash::make('password123'),
            'id_role' => 2,
            'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('m_user')->insert([
            'user_name' => $faker->name(),
            'email' => $faker->unique()->safeEmail(),
            'password' => Hash::make('password123'),
            'id_role' => 3,
            'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
