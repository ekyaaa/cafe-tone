<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('r_role')->insert([
            ['role_name' => 'admin'],
            ['role_name' => 'user'],
            ['role_name' => 'user_vip'],
        ]);
    }
}
