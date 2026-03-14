<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        // Only admins can manage users
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $users = User::when($request->role, function ($q) use ($request) {
                $q->where('role', $request->role);
            })
            ->when($request->q, function ($q) use ($request) {
                $q->where(function($query) use ($request) {
                    $query->where('name', 'like', '%' . $request->q . '%')
                          ->orWhere('email', 'like', '%' . $request->q . '%');
                });
            })
            ->latest()
            ->paginate(20);

        return response()->json($users);
    }

    /**
     * Create a new user (usually for Editor/Admin roles).
     */
    public function store(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'role' => ['required', Rule::in(['user', 'author', 'editor', 'admin'])],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'force_password_change' => true,
        ]);

        // If using Spatie Permissions
        if (method_exists($user, 'assignRole')) {
            $user->assignRole($validated['role']);
        }

        AuditService::log(null, 'create_user', $user, null, ['role' => $validated['role']]);

        return response()->json([
            'message' => 'Tài khoản đã được tạo thành công.',
            'data' => $user
        ], 201);
    }

    /**
     * Update user role or status.
     */
    public function update(Request $request, int $id)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role' => ['sometimes', Rule::in(['user', 'author', 'editor', 'admin'])],
            'is_blocked' => 'sometimes|boolean',
        ]);

        $oldRole = $user->role;
        $user->update($validated);

        if (isset($validated['role']) && $validated['role'] !== $oldRole) {
            if (method_exists($user, 'syncRoles')) {
                $user->syncRoles([$validated['role']]);
            }
            AuditService::log(null, 'change_user_role', $user, null, ['old' => $oldRole, 'new' => $validated['role']]);
        }

        if (isset($validated['is_blocked'])) {
            AuditService::log(null, $validated['is_blocked'] ? 'block_user' : 'unblock_user', $user);
        }

        return response()->json([
            'message' => 'Cập nhật tài khoản thành công.',
            'data' => $user
        ]);
    }
}
