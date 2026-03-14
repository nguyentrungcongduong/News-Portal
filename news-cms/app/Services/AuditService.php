<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Log a system action with full context.
     * Production-ready: Answers WHO, WHAT, WHERE, WHEN, HOW
     * 
     * @param User|null $user Who did it
     * @param string $action What action (e.g., 'post.create', 'post.approve')
     * @param mixed $subject What entity (Post, Comment, User, etc.)
     * @param array|null $before State before action
     * @param array|null $after State after action
     * @return AuditLog
     */
    public static function log(
        ?User $user,
        string $action,
        $subject,
        $before = null,
        $after = null
    ): AuditLog {
        // Get user if not provided
        if (!$user) {
            $user = auth()->user();
        }

        return AuditLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'subject_type' => is_object($subject) ? class_basename($subject) : $subject,
            'subject_id' => is_object($subject) ? ($subject->id ?? null) : null,
            'before' => $before,
            'after' => $after,
            'ip' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'created_at' => now(),
        ]);
    }

    /**
     * Convenience method for create actions
     */
    public static function logCreate(?User $user, $subject, $after = null): AuditLog
    {
        $action = strtolower(class_basename($subject)) . '.create';
        return self::log($user, $action, $subject, null, $after);
    }

    /**
     * Convenience method for update actions
     */
    public static function logUpdate(?User $user, $subject, $before = null, $after = null): AuditLog
    {
        $action = strtolower(class_basename($subject)) . '.update';
        return self::log($user, $action, $subject, $before, $after);
    }

    /**
     * Convenience method for delete actions
     */
    public static function logDelete(?User $user, $subject, $before = null): AuditLog
    {
        $action = strtolower(class_basename($subject)) . '.delete';
        return self::log($user, $action, $subject, $before, null);
    }
}
