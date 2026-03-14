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
        // PostgreSQL keeps check constraints when changing enum to string
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_status_check');
            DB::statement('ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Usually not needed to restore a broken constraint, 
        // but for completeness one would add it back with original values
    }
};
