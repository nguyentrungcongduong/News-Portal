<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_locks', function (Blueprint $table) {
            $table->id();
            $table->string('lockable_type'); // 'Post', 'Category', etc.
            $table->unsignedBigInteger('lockable_id');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('locked_at')->useCurrent();
            $table->timestamp('expires_at');
            $table->timestamps();

            // Unique index: một resource chỉ có 1 lock active
            $table->unique(['lockable_type', 'lockable_id']);
            $table->index('user_id');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_locks');
    }
};
