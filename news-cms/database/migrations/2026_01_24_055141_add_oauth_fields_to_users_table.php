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
        Schema::table('users', function (Blueprint $table) {
            $table->string('oauth_provider')->nullable()->after('email'); // google, facebook
            $table->string('oauth_id')->nullable()->after('oauth_provider');
            $table->string('avatar')->nullable()->change(); // User avatar from OAuth
            $table->string('password')->nullable()->change(); // Make password nullable for OAuth users
            
            $table->index(['oauth_provider', 'oauth_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['oauth_provider', 'oauth_id']);
            $table->dropColumn(['oauth_provider', 'oauth_id']);
            $table->string('password')->nullable(false)->change();
        });
    }
};
