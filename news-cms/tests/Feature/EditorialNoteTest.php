<?php

namespace Tests\Feature;

use App\Models\EditorialNote;
use App\Models\Post;
use App\Models\User;
use Tests\TestCase;

class EditorialNoteTest extends TestCase
{
    protected User $editor;
    protected User $author;
    protected User $admin;
    protected Post $post;

    protected function setUp(): void
    {
        parent::setUp();

        $this->editor = User::factory()->create(['role' => 'editor']);
        $this->author = User::factory()->create(['role' => 'author']);
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->post = Post::factory()->create(['author_id' => $this->author->id]);
    }

    /** @test */
    public function editor_can_create_note()
    {
        $response = $this->actingAs($this->editor)
            ->post("/api/posts/{$this->post->id}/editorial-notes", [
                'note' => 'Cần bổ sung nguồn',
                'visibility' => 'editor',
            ]);

        $response->assertStatus(201);
        $response->assertJson([
            'content' => 'Cần bổ sung nguồn',
            'visibility' => 'editor',
        ]);

        $this->assertDatabaseHas('editorial_notes', [
            'post_id' => $this->post->id,
            'user_id' => $this->editor->id,
            'note' => 'Cần bổ sung nguồn',
        ]);
    }

    /** @test */
    public function author_cannot_create_note()
    {
        $response = $this->actingAs($this->author)
            ->post("/api/posts/{$this->post->id}/editorial-notes", [
                'note' => 'Some note',
                'visibility' => 'editor',
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function editor_can_only_see_editor_notes()
    {
        // Create admin-only note
        EditorialNote::create([
            'post_id' => $this->post->id,
            'user_id' => $this->admin->id,
            'note' => 'Admin only',
            'visibility' => 'admin',
        ]);

        // Create editor note
        EditorialNote::create([
            'post_id' => $this->post->id,
            'user_id' => $this->editor->id,
            'note' => 'For editors',
            'visibility' => 'editor',
        ]);

        $response = $this->actingAs($this->editor)
            ->get("/api/posts/{$this->post->id}/editorial-notes");

        $response->assertStatus(200);
        $this->assertEquals(1, count($response->json('notes')));
        $response->assertJsonPath('notes.0.content', 'For editors');
    }

    /** @test */
    public function admin_can_see_all_notes()
    {
        // Create both types
        EditorialNote::create([
            'post_id' => $this->post->id,
            'user_id' => $this->admin->id,
            'note' => 'Admin only',
            'visibility' => 'admin',
        ]);

        EditorialNote::create([
            'post_id' => $this->post->id,
            'user_id' => $this->editor->id,
            'note' => 'For editors',
            'visibility' => 'editor',
        ]);

        $response = $this->actingAs($this->admin)
            ->get("/api/posts/{$this->post->id}/editorial-notes");

        $response->assertStatus(200);
        $this->assertEquals(2, count($response->json('notes')));
    }

    /** @test */
    public function author_cannot_see_notes()
    {
        EditorialNote::create([
            'post_id' => $this->post->id,
            'user_id' => $this->editor->id,
            'note' => 'For editors',
            'visibility' => 'editor',
        ]);

        $response = $this->actingAs($this->author)
            ->get("/api/posts/{$this->post->id}/editorial-notes");

        $response->assertStatus(200);
        $this->assertEquals(0, count($response->json('notes')));
    }

    /** @test */
    public function note_author_can_edit_own_note()
    {
        $note = EditorialNote::create([
            'post_id' => $this->post->id,
            'user_id' => $this->editor->id,
            'note' => 'Original',
            'visibility' => 'editor',
        ]);

        $response = $this->actingAs($this->editor)
            ->put("/api/posts/{$this->post->id}/editorial-notes/{$note->id}", [
                'note' => 'Updated',
                'visibility' => 'admin',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('editorial_notes', [
            'id' => $note->id,
            'note' => 'Updated',
        ]);
    }

    /** @test */
    public function count_returns_filtered_count()
    {
        EditorialNote::create([
            'post_id' => $this->post->id,
            'user_id' => $this->admin->id,
            'note' => 'Admin only',
            'visibility' => 'admin',
        ]);

        EditorialNote::create([
            'post_id' => $this->post->id,
            'user_id' => $this->editor->id,
            'note' => 'For editors',
            'visibility' => 'editor',
        ]);

        $response = $this->actingAs($this->editor)
            ->get("/api/posts/{$this->post->id}/editorial-notes/count");

        $response->assertStatus(200);
        $response->assertJson(['count' => 1]); // Only sees editor note
    }
}
