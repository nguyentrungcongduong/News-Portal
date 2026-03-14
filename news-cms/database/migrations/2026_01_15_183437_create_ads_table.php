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
        Schema::create('ads', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('position'); // header, sidebar, in_article, footer
            $table->enum('type', ['image', 'html'])->default('image');
            $table->text('html_code')->nullable(); 
            $table->string('image_url')->nullable();
            $table->string('link')->nullable();

            $table->integer('quota_impressions')->nullable();
            $table->integer('quota_clicks')->nullable();

            $table->integer('impressions')->default(0);
            $table->integer('clicks')->default(0);

            $table->enum('status', ['draft', 'active', 'paused', 'stopped'])->default('draft');

            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ads');
    }
};
