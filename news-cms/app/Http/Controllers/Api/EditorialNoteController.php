<?php

namespace App\Http\Controllers\Api;

use App\Models\EditorialNote;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class EditorialNoteController extends Controller
{
    /**
     * List notes của bài viết
     */
    public function index(Post $post, Request $request)
    {
        $userRole = $request->user()?->getRoleNames()->first() ?? 'guest';

        $notes = EditorialNote::forPost($post->id)
            ->forUser($request->user()?->id, $userRole)
            ->with('user')
            ->latest()
            ->get()
            ->map(fn($note) => [
                'id' => $note->id,
                'content' => $note->note,
                'author' => $note->user->name ?? 'Unknown',
                'author_id' => $note->user_id,
                'visibility' => $note->visibility,
                'created_at' => $note->created_at->toIso8601String(),
                'updated_at' => $note->updated_at->toIso8601String(),
            ]);

        return response()->json([
            'notes' => $notes,
            'total' => $notes->count(),
        ]);
    }

    /**
     * Create note
     */
    public function store(Post $post, Request $request)
    {
        $validated = $request->validate([
            'note' => 'required|string|max:5000',
            'visibility' => 'required|in:editor,admin',
        ]);

        $note = EditorialNote::create([
            'post_id' => $post->id,
            'user_id' => $request->user()->id,
            'note' => $validated['note'],
            'visibility' => $validated['visibility'],
        ]);

        return response()->json([
            'id' => $note->id,
            'content' => $note->note,
            'author' => $request->user()->name,
            'author_id' => $note->user_id,
            'visibility' => $note->visibility,
            'created_at' => $note->created_at->toIso8601String(),
        ], 201);
    }

    /**
     * Update note
     */
    public function update(Post $post, EditorialNote $note, Request $request)
    {
        // Only author hoặc admin có thể update
        if ($note->user_id !== $request->user()->id && !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'note' => 'required|string|max:5000',
            'visibility' => 'required|in:editor,admin',
        ]);

        $note->update($validated);

        return response()->json([
            'id' => $note->id,
            'content' => $note->note,
            'visibility' => $note->visibility,
            'updated_at' => $note->updated_at->toIso8601String(),
        ]);
    }

    /**
     * Delete note
     */
    public function destroy(Post $post, EditorialNote $note, Request $request)
    {
        // Only author hoặc admin có thể delete
        if ($note->user_id !== $request->user()->id && !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $note->delete();

        return response()->json(['message' => 'Note deleted'], 200);
    }

    /**
     * Count notes (unread indicator)
     */
    public function count(Post $post, Request $request)
    {
        $userRole = $request->user()?->getRoleNames()->first() ?? 'guest';

        $count = EditorialNote::forPost($post->id)
            ->forUser($request->user()?->id, $userRole)
            ->count();

        return response()->json(['count' => $count]);
    }
}
