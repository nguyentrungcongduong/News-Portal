<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@cms.com'],
            [
                'name' => 'System Admin',
                'email' => 'admin@cms.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        // Assign role via Spatie
        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }

        $this->command->info('✅ Admin user created:');
        $this->command->info('   Email: admin@cms.com');
        $this->command->info('   Password: admin123');
    }
}
