<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\PostController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\MediaController;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

// Health check - used by Render's health check system and frontend keep-alive ping
// Keeps the free-tier server warm and provides a fast status endpoint
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()->toISOString()]);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// DEBUG: Check user
Route::get('/debug/user/{email}', function ($email) {
    $user = \App\Models\User::withoutGlobalScopes()->where('email', $email)->first();
    return response()->json([
        'found' => $user ? true : false,
        'tenant_id' => $user->tenant_id ?? null,
        'role' => $user->role ?? null,
        'is_blocked' => $user->is_blocked ?? null,
    ]);
});

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
Route::post('/auth/change-password', [AuthController::class, 'changePassword'])->middleware('auth:sanctum');

// OAuth Routes (Google, Facebook) - CHỈ cho User, KHÔNG cho Admin/Editor
Route::get('/auth/{provider}/redirect', [\App\Http\Controllers\Api\SocialAuthController::class, 'redirect'])
    ->where('provider', 'google|facebook');
Route::get('/auth/{provider}/callback', [\App\Http\Controllers\Api\SocialAuthController::class, 'callback'])
    ->where('provider', 'google|facebook');
Route::post('/auth/{provider}/token', [\App\Http\Controllers\Api\SocialAuthController::class, 'handleToken'])
    ->where('provider', 'google|facebook');

// User Notification Center (Works for all roles)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllRead']);

    // Preferences
    Route::get('/notification-settings', [\App\Http\Controllers\Api\NotificationPreferenceController::class, 'index']);
    Route::post('/notification-settings', [\App\Http\Controllers\Api\NotificationPreferenceController::class, 'update']);

    // Author Requests (Public)
    Route::post('/author-requests', [\App\Http\Controllers\Api\Public\AuthorRequestController::class, 'store']);
    Route::get('/author-requests/status', [\App\Http\Controllers\Api\Public\AuthorRequestController::class, 'status']);
});

// Public News Routes
Route::prefix('public')->group(function () {
    Route::get('/home', [\App\Http\Controllers\Api\Public\HomeController::class, 'index']);
    Route::get('/posts', [\App\Http\Controllers\Api\Public\PostController::class, 'index']);
    Route::get('/posts/{slug}', [\App\Http\Controllers\Api\Public\PostController::class, 'show']);
    Route::get('/categories', [\App\Http\Controllers\Api\Public\PostController::class, 'categories']);
    Route::get('/categories/{slug}', [\App\Http\Controllers\Api\Public\CategoryController::class, 'show']);
    Route::get('/authors/{slug}', [\App\Http\Controllers\Api\Public\AuthorController::class, 'show']);
    Route::get('/search', [\App\Http\Controllers\Api\Public\SearchController::class, 'search']);
    Route::get('/trending', [\App\Http\Controllers\Api\Public\StatsController::class, 'trending']);
    Route::post('/posts/{id}/like', [\App\Http\Controllers\Api\Public\PostController::class, 'like'])->middleware(['auth:sanctum', 'blocked']);

    // Comments
    Route::get('/posts/{slug}/comments', [\App\Http\Controllers\Api\Public\CommentController::class, 'index']);
    Route::post('/posts/{slug}/comments', [\App\Http\Controllers\Api\Public\CommentController::class, 'store'])->middleware(['auth:sanctum', 'throttle:5,1', 'blocked']);
    Route::post('/comments/{id}/report', [\App\Http\Controllers\Api\Public\CommentController::class, 'report'])->middleware('auth:sanctum');

    // Ads
    Route::get('/ads', [\App\Http\Controllers\Api\Public\AdController::class, 'index']);
    Route::post('/ads/{id}/click', [\App\Http\Controllers\Api\Public\AdController::class, 'trackClick']);

    // Announcements (Breaking news/System alerts for visitors)
    Route::get('/announcements/active', [\App\Http\Controllers\Api\Public\AnnouncementController::class, 'index']);
    Route::get('/breaking-news', [\App\Http\Controllers\Api\Public\AnnouncementController::class, 'breakingNews']);
    Route::get('/notifications', [\App\Http\Controllers\Api\Public\NotificationController::class, 'index']);
});

// Admin Routes - Tách thành 2 nhóm: Admin-only và Editor-accessible

// ============================================
// EDITOR-ACCESSIBLE ROUTES (Content Management)
// Editor = Content Gatekeeper - chỉ động vào CONTENT
// ============================================
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin,editor', 'blocked'])->group(function () {

    // Posts - View & Edit (Editor có thể xem và edit)
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/{id}', [PostController::class, 'show']);
    Route::put('/posts/{id}', [PostController::class, 'update']);

    // Workflow Actions - Editor được approve/reject
    Route::post('/posts/{id}/approve', [PostController::class, 'approve']);
    Route::post('/posts/{id}/reject', [PostController::class, 'reject']);

    // Review Comments - Editor có thể comment inline
    Route::prefix('posts/{postId}/review-comments')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\Admin\ReviewCommentController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\Admin\ReviewCommentController::class, 'store']);
        Route::put('/{id}', [\App\Http\Controllers\Api\Admin\ReviewCommentController::class, 'update']);
        Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\ReviewCommentController::class, 'destroy']);
    });

    // Comments Moderation - Editor được moderate
    Route::get('/comments', [\App\Http\Controllers\Api\Admin\CommentController::class, 'index']);
    Route::match(['post', 'patch'], '/comments/{id}/approve', [\App\Http\Controllers\Api\Admin\CommentController::class, 'approve']);
    Route::match(['post', 'patch'], '/comments/{id}/reject', [\App\Http\Controllers\Api\Admin\CommentController::class, 'reject']);
    Route::match(['post', 'patch'], '/comments/{id}/ignore', [\App\Http\Controllers\Api\Admin\CommentController::class, 'ignore']);
    Route::match(['post', 'patch'], '/comments/{id}/hide', [\App\Http\Controllers\Api\Admin\CommentController::class, 'hide']);

    // Categories - View only (Editor/Author chỉ xem)
    Route::get('/categories', [CategoryController::class, 'index'])->withoutMiddleware(['role:admin,editor'])->middleware(['role:admin,editor,author']);

    // Media - View & Upload (Editor có thể upload media)
    Route::post('/media/upload', [MediaController::class, 'upload']);
    Route::get('/media', [MediaController::class, 'index']);

    // Notifications - View (Editor có thể xem notifications)
    Route::get('/notifications', [\App\Http\Controllers\Api\Admin\NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Api\Admin\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\Api\Admin\NotificationController::class, 'markAllAsRead']);

    // Dashboard Stats - Editor cần dashboard để làm việc (chỉ xem, không edit)
    Route::get('/stats/dashboard', [\App\Http\Controllers\Api\Admin\StatsController::class, 'dashboard']);

    // Announcements - View only (Editor chỉ xem, không edit)
    Route::get('/announcements', [\App\Http\Controllers\Api\Admin\AnnouncementController::class, 'index']);
    Route::get('/announcements/{id}', [\App\Http\Controllers\Api\Admin\AnnouncementController::class, 'show']);
});

// ============================================
// ADMIN-ONLY ROUTES (System Management)
// CHỈ Admin được truy cập - Editor bị chặn
// ============================================
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin', 'blocked'])->group(function () {

    // Stats Dashboard Analytics - CHỈ Admin (full analytics)
    // Basic dashboard stats đã ở Editor-accessible group ở trên

    // Comments - Admin-only actions
    Route::match(['post', 'patch'], '/comments/{id}/block-user', [\App\Http\Controllers\Api\Admin\CommentController::class, 'blockUser']);
    Route::match(['post', 'patch'], '/comments/{id}/unblock-user', [\App\Http\Controllers\Api\Admin\CommentController::class, 'unblockUser']);
    Route::delete('/comments/{id}', [\App\Http\Controllers\Api\Admin\CommentController::class, 'destroy']);

    // Moderation Dashboard - Admin only
    Route::get('/moderation/overview', [\App\Http\Controllers\Api\Admin\ModerationController::class, 'overview']);
    Route::get('/moderation/logs', [\App\Http\Controllers\Api\Admin\ModerationController::class, 'recentLogs']);
    Route::get('/moderation/comment-analytics', [\App\Http\Controllers\Api\Admin\ModerationController::class, 'commentAnalytics']);

    // Audit Logs - CHỈ Admin (Production-ready)
    Route::get('/audit-logs', [\App\Http\Controllers\Api\Admin\AuditLogController::class, 'index']);
    Route::get('/users/{id}/activity', [\App\Http\Controllers\Api\Admin\AuditLogController::class, 'userActivity']);

    // User Management - CHỈ Admin
    Route::get('/users', [\App\Http\Controllers\Api\Admin\UserController::class, 'index']);
    Route::post('/users', [\App\Http\Controllers\Api\Admin\UserController::class, 'store']);
    Route::put('/users/{id}', [\App\Http\Controllers\Api\Admin\UserController::class, 'update']);

    // Author Requests - CHỈ Admin
    Route::get('/author-requests', [\App\Http\Controllers\Api\Admin\AuthorRequestController::class, 'index']);
    Route::post('/author-requests/{id}/process', [\App\Http\Controllers\Api\Admin\AuthorRequestController::class, 'process']);

    // Ads Management - CHỈ Admin
    Route::apiResource('ads', \App\Http\Controllers\Api\Admin\AdController::class);
    Route::patch('ads/{id}/status', [\App\Http\Controllers\Api\Admin\AdController::class, 'updateStatus']);

    // Announcements - Create, Update, Delete (CHỈ Admin)
    // View routes đã ở Editor-accessible group ở trên
    Route::post('/announcements', [\App\Http\Controllers\Api\Admin\AnnouncementController::class, 'store']);
    Route::put('/announcements/{id}', [\App\Http\Controllers\Api\Admin\AnnouncementController::class, 'update']);
    Route::patch('announcements/{id}/status', [\App\Http\Controllers\Api\Admin\AnnouncementController::class, 'updateStatus']);
    Route::delete('/announcements/{id}', [\App\Http\Controllers\Api\Admin\AnnouncementController::class, 'destroy']);

    // Breaking News - CHỈ Admin
    Route::apiResource('breaking-news', \App\Http\Controllers\Api\Admin\BreakingNewsController::class);
    Route::post('/breaking-news/{id}/toggle', [\App\Http\Controllers\Api\Admin\BreakingNewsController::class, 'toggle']);

    // Media - Delete (CHỈ Admin)
    Route::delete('/media/{id}', [MediaController::class, 'destroy']);

    // Posts - Create, Delete, Publish, Archive (CHỈ Admin)
    Route::post('/posts', [PostController::class, 'store']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    Route::post('/posts/{id}/submit', [PostController::class, 'submit']);
    Route::post('/posts/{id}/publish', [PostController::class, 'publish']);
    Route::post('/posts/{id}/archive', [PostController::class, 'archive']);
    Route::post('/posts/{id}/breaking', [PostController::class, 'toggleBreaking']);

    // Versioning - CHỈ Admin
    Route::get('/posts/{post}/versions', [\App\Http\Controllers\Api\Admin\PostVersionController::class, 'index']);
    Route::post('/posts/{post}/restore/{version}', [\App\Http\Controllers\Api\Admin\PostVersionController::class, 'restore']);

    // System Notifications - Analytics (CHỈ Admin)
    Route::get('/notifications/analytics', [\App\Http\Controllers\Api\Admin\NotificationController::class, 'analytics']);

    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::patch('/categories/{category}/status', [CategoryController::class, 'toggleStatus']);
    Route::patch('/categories/{category}/home', [CategoryController::class, 'toggleHome']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Tags Management - CHỈ Admin
    Route::get('/tags', [\App\Http\Controllers\Api\Admin\TagController::class, 'index']);
    Route::post('/tags', [\App\Http\Controllers\Api\Admin\TagController::class, 'store']);
    Route::get('/tags/search', [\App\Http\Controllers\Api\Admin\TagController::class, 'search']);
    Route::get('/tags/popular', [\App\Http\Controllers\Api\Admin\TagController::class, 'popular']);
    Route::post('/tags/recalculate-counts', [\App\Http\Controllers\Api\Admin\TagController::class, 'recalculateCounts']);
    Route::post('/tags/bulk-destroy', [\App\Http\Controllers\Api\Admin\TagController::class, 'bulkDestroy']);
    Route::post('/tags/merge', [\App\Http\Controllers\Api\Admin\TagController::class, 'merge']);
    Route::get('/tags/{tag}', [\App\Http\Controllers\Api\Admin\TagController::class, 'show']);
    Route::put('/tags/{tag}', [\App\Http\Controllers\Api\Admin\TagController::class, 'update']);
    Route::patch('/tags/{tag}/featured', [\App\Http\Controllers\Api\Admin\TagController::class, 'toggleFeatured']);
    Route::delete('/tags/{tag}', [\App\Http\Controllers\Api\Admin\TagController::class, 'destroy']);

    // Menus Management
    Route::get('/menus', [\App\Http\Controllers\Api\Admin\MenuController::class, 'index']);
    Route::post('/menus', [\App\Http\Controllers\Api\Admin\MenuController::class, 'store']);
    Route::get('/menus/{id}', [\App\Http\Controllers\Api\Admin\MenuController::class, 'show']);
    Route::put('/menus/{id}', [\App\Http\Controllers\Api\Admin\MenuController::class, 'update']);
    Route::delete('/menus/{id}', [\App\Http\Controllers\Api\Admin\MenuController::class, 'destroy']);
    Route::post('/menus/{id}/items', [\App\Http\Controllers\Api\Admin\MenuController::class, 'updateItems']);
    Route::delete('/menu-items/{id}', [\App\Http\Controllers\Api\Admin\MenuController::class, 'destroyItem']);
});

// ============== PHẦN 1: CONTENT LOCK ==============
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/content-locks/acquire', [\App\Http\Controllers\Api\ContentLockController::class, 'acquire']);
    Route::post('/content-locks/release', [\App\Http\Controllers\Api\ContentLockController::class, 'release']);
    Route::get('/content-locks/check', [\App\Http\Controllers\Api\ContentLockController::class, 'check']);
    Route::post('/content-locks/renew', [\App\Http\Controllers\Api\ContentLockController::class, 'renew']);
    Route::post('/content-locks/force-unlock', [\App\Http\Controllers\Api\ContentLockController::class, 'forceUnlock'])->middleware('role:admin');
});

// ============== PHẦN 2: EDITORIAL NOTES ==============
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/posts/{post}/editorial-notes', [\App\Http\Controllers\Api\EditorialNoteController::class, 'index']);
    Route::post('/posts/{post}/editorial-notes', [\App\Http\Controllers\Api\EditorialNoteController::class, 'store'])->middleware('role:editor,admin');
    Route::put('/posts/{post}/editorial-notes/{note}', [\App\Http\Controllers\Api\EditorialNoteController::class, 'update'])->middleware('role:editor,admin');
    Route::delete('/posts/{post}/editorial-notes/{note}', [\App\Http\Controllers\Api\EditorialNoteController::class, 'destroy'])->middleware('role:editor,admin');
    Route::get('/posts/{post}/editorial-notes/count', [\App\Http\Controllers\Api\EditorialNoteController::class, 'count']);
});

// Author Routes
Route::prefix('author')->middleware(['auth:sanctum', 'role:author,admin,editor', 'blocked'])->group(function () {
    Route::get('/stats', function (Request $request) {
        $user = $request->user();
        return response()->json([
            'post_count' => \App\Models\Post::where('author_id', $user->id)->count(),
            'published_count' => \App\Models\Post::where('author_id', $user->id)->where('status', 'published')->count(),
            'pending_count' => \App\Models\Post::where('author_id', $user->id)->where('status', 'pending')->count(),
            'rejected_count' => \App\Models\Post::where('author_id', $user->id)->where('status', 'rejected')->count(),
            'total_views' => \App\Models\Post::where('author_id', $user->id)->sum('views') ?? 0,
        ]);
    });

    Route::get('/posts', [\App\Http\Controllers\Api\Author\PostController::class, 'index']);
    Route::post('/posts', [\App\Http\Controllers\Api\Author\PostController::class, 'store']);
    Route::get('/posts/{id}', [\App\Http\Controllers\Api\Author\PostController::class, 'show']);
    Route::put('/posts/{id}', [\App\Http\Controllers\Api\Author\PostController::class, 'update']);
    Route::delete('/posts/{id}', [\App\Http\Controllers\Api\Author\PostController::class, 'destroy']);
    Route::post('/posts/{id}/submit', [\App\Http\Controllers\Api\Author\PostController::class, 'submit']);

    // Profile Management
    Route::get('/profile', [\App\Http\Controllers\Api\Author\ProfileController::class, 'show']);
    Route::put('/profile', [\App\Http\Controllers\Api\Author\ProfileController::class, 'update']);

    // Media Upload - Author cần upload ảnh cho bài viết
    Route::post('/media/upload', [MediaController::class, 'upload']);
});

// ============== PAGE BUILDER ROUTES ==============
// Admin Routes - Page Builder Management
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin', 'blocked'])->group(function () {
    Route::get('/pages', [\App\Http\Controllers\Api\Admin\PageController::class, 'index']);
    Route::post('/pages', [\App\Http\Controllers\Api\Admin\PageController::class, 'store']);
    Route::get('/pages/{id}', [\App\Http\Controllers\Api\Admin\PageController::class, 'show']);
    Route::put('/pages/{id}', [\App\Http\Controllers\Api\Admin\PageController::class, 'update']);
    Route::delete('/pages/{id}', [\App\Http\Controllers\Api\Admin\PageController::class, 'destroy']);
    
    // Duplicate / Clone
    Route::post('/pages/{id}/duplicate', [\App\Http\Controllers\Api\Admin\PageController::class, 'duplicate']);
    
    // Publish / Unpublish
    Route::patch('/pages/{id}/status', [\App\Http\Controllers\Api\Admin\PageController::class, 'toggleStatus']);
    
    // Versioning
    Route::get('/pages/{id}/versions', [\App\Http\Controllers\Api\Admin\PageController::class, 'versions']);
    Route::post('/pages/{pageId}/restore/{versionId}', [\App\Http\Controllers\Api\Admin\PageController::class, 'restore']);
    
    // Block types
    Route::get('/page-builder/block-types', [\App\Http\Controllers\Api\Admin\PageController::class, 'blockTypes']);
});

// Public Routes - View Published Pages
Route::prefix('public')->group(function () {
    Route::get('/pages/{slug}', [\App\Http\Controllers\Api\Public\PageController::class, 'show']);
    
    // Tags
    Route::get('/tags', [\App\Http\Controllers\Api\Public\TagController::class, 'index']);
    Route::get('/tags/featured', [\App\Http\Controllers\Api\Public\TagController::class, 'featured']);
    Route::get('/tags/popular', [\App\Http\Controllers\Api\Public\TagController::class, 'popular']);
    Route::get('/tags/{slug}', [\App\Http\Controllers\Api\Public\TagController::class, 'show']);
    Route::get('/tags/{slug}/related', [\App\Http\Controllers\Api\Public\TagController::class, 'related']);
    
    // Menus
    Route::get('/menus/{location}', [\App\Http\Controllers\Api\Public\MenuController::class, 'showByLocation']);
});
