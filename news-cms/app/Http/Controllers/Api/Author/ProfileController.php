<?php

namespace App\Http\Controllers\Api\Author;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\User;

class ProfileController extends Controller
{
    /**
     * Get current author profile
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()
        ]);
    }

    /**
     * Update current author profile
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'avatar' => 'nullable|string',
            'social_links' => 'nullable|array',
            'social_links.facebook' => 'nullable|url',
            'social_links.twitter' => 'nullable|url',
            'social_links.linkedin' => 'nullable|url',
            'social_links.instagram' => 'nullable|url',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Cập nhật thông tin cá nhân thành công',
            'data' => $user
        ]);
    }
}
