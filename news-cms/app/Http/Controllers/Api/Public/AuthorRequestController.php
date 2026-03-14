<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\AuthorRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthorRequestController extends Controller
{
    /**
     * Store a newly created author request.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Check if user already has a pending or approved request
        $existingRequest = AuthorRequest::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existingRequest) {
            if ($existingRequest->status === 'approved') {
                return response()->json(['message' => 'Bạn đã là tác giả hoặc yêu cầu của bạn đã được duyệt.'], 422);
            }
            return response()->json(['message' => 'Yêu cầu của bạn đang chờ xử lý.'], 422);
        }

        $validated = $request->validate([
            'bio' => 'required|string|min:50',
            'portfolio_url' => 'nullable|url',
            'experience' => 'nullable|string',
        ]);

        $authorRequest = AuthorRequest::create([
            'user_id' => $user->id,
            'bio' => $validated['bio'],
            'portfolio_url' => $validated['portfolio_url'],
            'experience' => $validated['experience'],
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Yêu cầu của bạn đã được gửi thành công. Vui lòng chờ quản trị viên phê duyệt.',
            'data' => $authorRequest
        ], 201);
    }

    /**
     * Get the status of the current user's request.
     */
    public function status()
    {
        $request = AuthorRequest::where('user_id', Auth::id())
            ->latest()
            ->first();

        return response()->json(['data' => $request]);
    }
}
