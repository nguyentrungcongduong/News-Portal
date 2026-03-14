<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * Editor = Content Gatekeeper - chỉ động vào CONTENT, không động SYSTEM
     *
     * Editor có quyền:
     * - edit_post_all
     * - approve_post
     * - reject_post
     *
     * Editor KHÔNG có quyền:
     * - publish_post
     * - manage_user
     * - manage_role
     * - manage_ads
     * - view_audit_log
     * - manage_setting
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Admin có tất cả quyền
        if ($user->role === 'admin') {
            return $next($request);
        }

        // Editor chỉ có quyền content - check cụ thể
        if ($user->role === 'editor') {
            $editorPermissions = [
                'edit_post_all',
                'approve_post',
                'reject_post',
                'view_posts',
                'view_comments',
                'moderate_comments',
            ];

            if (!in_array($permission, $editorPermissions)) {
                return response()->json([
                    'message' => 'Bạn không có quyền truy cập chức năng này. Editor chỉ có quyền quản lý nội dung.',
                    'required_permission' => $permission,
                    'your_role' => $user->role
                ], 403);
            }
        }

        // Author không có quyền admin
        if ($user->role === 'author') {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập trang quản trị',
                'your_role' => $user->role
            ], 403);
        }

        return $next($request);
    }
}
