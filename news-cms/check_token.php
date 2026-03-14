<?php

use Laravel\Sanctum\PersonalAccessToken;

$token = PersonalAccessToken::find(107);

if ($token) {
    $user = $token->tokenable;
    echo json_encode([
        'user_id' => $user->id,
        'email' => $user->email,
        'role' => $user->role,
        'token_name' => $token->name,
        'created_at' => $token->created_at->format('Y-m-d H:i:s')
    ]);
} else {
    echo json_encode(['error' => 'Token not found']);
}
