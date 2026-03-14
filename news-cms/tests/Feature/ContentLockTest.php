<?php

namespace Tests\Feature;

use App\Models\ContentLock;
use App\Models\Post;
use App\Models\User;
use Tests\TestCase;

class ContentLockTest extends TestCase
{
    protected User $editor;
    protected User $admin;
    protected Post $post;

    protected function setUp(): void
    {
        parent::setUp();

        $this->editor = User::factory()->create(['role' => 'editor']);
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->post = Post::factory()->create();
    }

    /** @test */
    public function user_can_acquire_lock()
    {
        $response = $this->actingAs($this->editor)
            ->post('/api/content-locks/acquire', [
                'lockable_type' => 'Post',
                'lockable_id' => $this->post->id,
            ]);

        $response->assertStatus(200);
        $response->assertJson(['acquired' => true]);

        $this->assertDatabaseHas('content_locks', [
            'lockable_type' => 'Post',
            'lockable_id' => $this->post->id,
            'user_id' => $this->editor->id,
        ]);
    }

    /** @test */
    public function second_user_cannot_acquire_locked_resource()
    {
        // First user locks
        $this->actingAs($this->editor)
            ->post('/api/content-locks/acquire', [
                'lockable_type' => 'Post',
                'lockable_id' => $this->post->id,
            ]);

        // Second user tries to lock
        $response = $this->actingAs($this->admin)
            ->post('/api/content-locks/acquire', [
                'lockable_type' => 'Post',
                'lockable_id' => $this->post->id,
            ]);

        $response->assertStatus(409);
        $response->assertJson(['acquired' => false]);
        $response->assertJsonPath('lock.user_id', $this->editor->id);
    }

    /** @test */
    public function user_can_renew_own_lock()
    {
        // Acquire lock
        $this->actingAs($this->editor)
            ->post('/api/content-locks/acquire', [
                'lockable_type' => 'Post',
                'lockable_id' => $this->post->id,
            ]);

        $originalLock = ContentLock::where('lockable_type', 'Post')
            ->where('lockable_id', $this->post->id)
            ->first();

        sleep(1); // Wait 1 second

        // Renew lock
        $response = $this->actingAs($this->editor)
            ->post('/api/content-locks/renew', [
                'lockable_type' => 'Post',
                'lockable_id' => $this->post->id,
            ]);

        $response->assertStatus(200);
        $response->assertJson(['acquired' => true]);

        $renewedLock = ContentLock::where('lockable_type', 'Post')
            ->where('lockable_id', $this->post->id)
            ->first();

        // expires_at should be newer
        $this->assertTrue($renewedLock->expires_at > $originalLock->expires_at);
    }

    /** @test */
    public function user_can_release_lock()
    {
        // Acquire lock
        $this->actingAs($this->editor)
            ->post('/api/content-locks/acquire', [
                'lockable_type' => 'Post',
                'lockable_id' => $this->post->id,
            ]);

        // Release lock
        $response = $this->actingAs($this->editor)
            ->post('/api/content-locks/release', [
                'lockable_type' => 'Post',
                'lockable_id' => $this->post->id,
            ]);

        $response->assertStatus(200);
        $response->assertJson(['released' => true]);

        $this->assertDatabaseMissing('content_locks', [
            'lockable_type' => 'Post',
            'lockable_id' => $this->post->id,
        ]);
    }

    /** @test */
    public function admin_can_force_unlock()
    {
        // Editor locks
        $this->actingAs($this->editor)
            ->post('/api/content-locks/acquire', [
                'lockable_type' => 'Post',
                'lockable_id' => $this->post->id,
            ]);

        // Admin force unlocks
        $response = $this->actingAs($this->admin)
            ->post('/api/content-locks/force-unlock', [
                'lockable_type' => 'Post',
                'lockable_id' => $this->post->id,
            ]);

        $response->assertStatus(200);
        $response->assertJson(['force_unlocked' => true]);

        $this->assertDatabaseMissing('content_locks', [
            'lockable_type' => 'Post',
            'lockable_id' => $this->post->id,
        ]);
    }

    /** @test */
    public function lock_check_shows_status()
    {
        // Acquire lock
        $this->actingAs($this->editor)
            ->post('/api/content-locks/acquire', [
                'lockable_type' => 'Post',
                'lockable_id' => $this->post->id,
            ]);

        // Check status
        $response = $this->actingAs($this->admin)
            ->get('/api/content-locks/check', [
                'lockable_type' => 'Post',
                'lockable_id' => $this->post->id,
            ]);

        $response->assertStatus(200);
        $response->assertJson(['locked' => true]);
        $response->assertJsonPath('lock.user_name', $this->editor->name);
    }
}
