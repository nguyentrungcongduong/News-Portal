<?php

namespace Database\Seeders;

use App\Models\ContentLock;
use App\Models\EditorialNote;
use App\Models\Post;
use App\Models\PostSlug;
use Illuminate\Database\Seeder;

class ContentLockSeeder extends Seeder
{
    /**
     * Run the database seeds for testing content locks
     */
    public function run(): void
    {
        // Get first 3 posts for testing
        $posts = Post::take(3)->get();

        if ($posts->isEmpty()) {
            $this->command->warn('No posts found. Create posts first.');
            return;
        }

        // Simulate an active lock
        $firstPost = $posts->first();
        ContentLock::firstOrCreate(
            [
                'lockable_type' => 'Post',
                'lockable_id' => $firstPost->id,
            ],
            [
                'user_id' => 1, // Admin
                'locked_at' => now(),
                'expires_at' => now()->addMinutes(10),
            ]
        );

        $this->command->info('✓ Sample content locks created');
    }
}
