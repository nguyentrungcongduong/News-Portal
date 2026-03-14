<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Update legacy 'editor' role to 'author' to satisfy new constraint
        DB::table('users')->where('role', 'editor')->update(['role' => 'author']);

        // 2. Drop the existing check constraint
        // Note: The constraint name is typically users_role_check in Laravel/Postgres
        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");

        // 3. Add the new check constraint
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'author', 'user'))");

        // 4. Change the default value
        DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert default
        DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'author'");

        // Drop new constraint
        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");

        // Restore old constraint (including editor)
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'editor', 'author'))");
    }
};
