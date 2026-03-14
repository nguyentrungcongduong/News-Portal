<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuthorRequest;
use App\Notifications\AuthorRequestProcessed;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuthorRequestController extends Controller
{
    /**
     * Display a listing of author requests.
     */
    public function index(Request $request)
    {
        $status = $request->get('status', 'pending');

        $requests = AuthorRequest::with('user:id,name,email')
            ->when($status, function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->latest()
            ->paginate(20);

        return response()->json($requests);
    }

    /**
     * Approve or reject an author request.
     */
    public function process(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_note' => 'nullable|string'
        ]);

        $authorRequest = AuthorRequest::findOrFail($id);

        if ($authorRequest->status !== 'pending') {
            return response()->json(['message' => 'Yêu cầu này đã được xử lý.'], 422);
        }

        DB::transaction(function () use ($authorRequest, $validated) {
            $authorRequest->update([
                'status' => $validated['status'],
                'admin_note' => $validated['admin_note'],
                'processed_at' => now(),
                'processed_by' => Auth::id()
            ]);

            if ($validated['status'] === 'approved') {
                $user = $authorRequest->user;
                $user->update(['role' => 'author']);
                
                // If using Spatie Permissions:
                if (method_exists($user, 'syncRoles')) {
                    $user->syncRoles(['author']);
                }
            }
        });

        AuditService::log(null, $validated['status'] . '_author_request', $authorRequest, null, ['user_id' => $authorRequest->user_id]);

        return response()->json([
            'message' => $validated['status'] === 'approved' ? 'Yêu cầu đã được duyệt. Người dùng giờ là Tác giả.' : 'Yêu cầu đã bị từ chối.',
            'data' => $authorRequest
        ]);
    }
}
