<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('editorial_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('note');
            $table->enum('visibility', ['editor', 'admin'])->default('editor');
            $table->timestamps();

            $table->index('post_id');
            $table->index('user_id');
            $table->index('visibility');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('editorial_notes');
    }
};
