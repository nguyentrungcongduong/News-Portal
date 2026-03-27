<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Supported OAuth providers
     */
    protected $providers = ['google', 'facebook'];

    /**
     * Redirect to OAuth provider
     */
    public function redirect(Request $request, string $provider)
    {
        if (!in_array($provider, $this->providers)) {
            return response()->json([
                'message' => 'Provider không được hỗ trợ.'
            ], 400);
        }

        try {
            // Get redirect url from query or default
            $redirectUrl = rtrim($request->query('redirect_url', $this->getDefaultFrontendUrl()), '/');
            
            // Build state object
            $state = base64_encode(json_encode([
                'redirect_url' => $redirectUrl,
            ]));

            // Get the redirect URL from Socialite
            $url = Socialite::driver($provider)
                ->stateless()
                ->with(['state' => $state])
                ->redirect()
                ->getTargetUrl();

            return response()->json([
                'url' => $url
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Socialite Redirect Error ($provider): " . $e->getMessage());
            return response()->json([
                'message' => 'Lỗi kết nối với nhà cung cấp xác thực. Vui lòng kiểm tra cấu hình.',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Handle OAuth callback
     */
    public function callback(Request $request, string $provider)
    {
        // Extract original frontend redirect URL from state
        $frontendUrl = $this->getDefaultFrontendUrl();
        $state = $request->query('state');
        if ($state) {
            $stateData = json_decode(base64_decode($state), true);
            if (is_array($stateData) && isset($stateData['redirect_url'])) {
                $frontendUrl = rtrim($stateData['redirect_url'], '/');
            }
        }

        if (!in_array($provider, $this->providers)) {
            return $this->redirectToFrontendWithError('Provider không được hỗ trợ.', $frontendUrl);
        }

        try {
            // We still use stateless() because we are using an API route
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Socialite Callback Error ($provider): " . $e->getMessage());
            return $this->redirectToFrontendWithError('Không thể xác thực với ' . ucfirst($provider) . '. Vui lòng thử lại.', $frontendUrl);
        }

        if (!$socialUser->getEmail()) {
            return $this->redirectToFrontendWithError('Không thể lấy email từ ' . ucfirst($provider) . '. Vui lòng cấp quyền truy cập email.', $frontendUrl);
        }

        try {
            // Check if user exists with this email
            $existingUser = User::withoutGlobalScopes()
                ->where('email', $socialUser->getEmail())
                ->first();

            if ($existingUser) {
                // IMPORTANT: Block Admin/Editor from OAuth login
                if (in_array($existingUser->role, ['admin', 'editor', 'author'])) {
                    // We allow 'author'? User said only 'user' role. Let's check existingUser role.
                    if (in_array($existingUser->role, ['admin', 'editor'])) {
                        return $this->redirectToFrontendWithError(
                            'Tài khoản Admin/Editor không được phép đăng nhập bằng ' . ucfirst($provider) . '. Vui lòng sử dụng mật khẩu.',
                            $frontendUrl
                        );
                    }
                }

                // Check if blocked
                if ($existingUser->is_blocked) {
                    return $this->redirectToFrontendWithError('Tài khoản của bạn đã bị khóa.', $frontendUrl);
                }

                // Update OAuth info if not set
                if (!$existingUser->oauth_provider) {
                    $existingUser->update([
                        'oauth_provider' => $provider,
                        'oauth_id' => $socialUser->getId(),
                        'avatar' => $socialUser->getAvatar() ?? $existingUser->avatar,
                    ]);
                }

                $user = $existingUser;
            } else {
                // Create new user with role 'user'
                $name = $socialUser->getName() ?? $socialUser->getNickname() ?? 'User';
                $user = User::create([
                    'name' => $name,
                    'slug' => Str::slug($name) . '-' . Str::random(5),
                    'email' => $socialUser->getEmail(),
                    'oauth_provider' => $provider,
                    'oauth_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                    'role' => 'user', 
                    'password' => null, 
                    'email_verified_at' => now(),
                    'tenant_id' => $this->getTenantId(),
                ]);

                // Assign role via Spatie if using it
                try {
                    if (method_exists($user, 'assignRole')) {
                        $user->assignRole('user');
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning("Could not assign 'user' role to OAuth user: " . $e->getMessage());
                }
            }

            // Delete old tokens and create new one
            $user->tokens()->delete();
            $token = $user->createToken('oauth-token')->plainTextToken;

            // Redirect to frontend with token
            return $this->redirectToFrontendWithSuccess($token, $user, $frontendUrl);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("OAuth Finalization Error ($provider): " . $e->getMessage());
            return $this->redirectToFrontendWithError('Có lỗi xảy ra trong quá trình xử lý tài khoản. Vui lòng thử lại sau.', $frontendUrl);
        }
    }

    /**
     * Handle OAuth login from frontend (SPA flow)
     * Frontend sends the OAuth code/token directly
     */
    public function handleToken(Request $request, string $provider)
    {
        if (!in_array($provider, $this->providers)) {
            return response()->json([
                'message' => 'Provider không được hỗ trợ.'
            ], 400);
        }

        $request->validate([
            'access_token' => 'required|string',
        ]);

        try {
            $socialUser = Socialite::driver($provider)
                ->stateless()
                ->userFromToken($request->access_token);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Token không hợp lệ hoặc đã hết hạn.'
            ], 401);
        }

        if (!$socialUser->getEmail()) {
            return response()->json([
                'message' => 'Không thể lấy email. Vui lòng cấp quyền truy cập email.'
            ], 400);
        }

        // Check if user exists
        $existingUser = User::withoutGlobalScopes()
            ->where('email', $socialUser->getEmail())
            ->first();

        if ($existingUser) {
            // Block Admin/Editor from OAuth login
            if (in_array($existingUser->role, ['admin', 'editor'])) {
                return response()->json([
                    'message' => 'Tài khoản Admin/Editor không được phép đăng nhập bằng ' . ucfirst($provider) . '.'
                ], 403);
            }

            if ($existingUser->is_blocked) {
                return response()->json([
                    'message' => 'Tài khoản của bạn đã bị khóa.'
                ], 403);
            }

            // Update OAuth info
            if (!$existingUser->oauth_provider) {
                $existingUser->update([
                    'oauth_provider' => $provider,
                    'oauth_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar() ?? $existingUser->avatar,
                ]);
            }

            $user = $existingUser;
        } else {
            // Create new user
            $user = User::create([
                'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                'email' => $socialUser->getEmail(),
                'oauth_provider' => $provider,
                'oauth_id' => $socialUser->getId(),
                'avatar' => $socialUser->getAvatar(),
                'role' => 'user',
                'password' => null,
                'email_verified_at' => now(),
                'tenant_id' => $this->getTenantId(),
            ]);

            if (method_exists($user, 'assignRole')) {
                $user->assignRole('user');
            }
        }

        // Generate token
        $user->tokens()->delete();
        $token = $user->createToken('oauth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'message' => 'Đăng nhập thành công!'
        ]);
    }

    /**
     * Get tenant ID from request header or default tenant
     */
    protected function getTenantId()
    {
        return request()->header('X-Tenant-ID') ?? app('tenant')?->id ?? 1;
    }

    /**
     * Get default frontend URL
     */
    protected function getDefaultFrontendUrl()
    {
        $urls = explode(',', config('app.frontend_url', 'http://localhost:3000'));
        return trim($urls[0]);
    }

    /**
     * Redirect to frontend with error
     */
    protected function redirectToFrontendWithError(string $message, string $frontendUrl = null)
    {
        $frontendUrl = $frontendUrl ?? $this->getDefaultFrontendUrl();
        // Just in case the mapped frontendUrl still has commas
        if (strpos($frontendUrl, ',') !== false) {
            $frontendUrl = explode(',', $frontendUrl)[0];
        }
        $encodedMessage = urlencode($message);
        
        return redirect("{$frontendUrl}/auth/callback?error={$encodedMessage}");
    }

    /**
     * Redirect to frontend with success token
     */
    protected function redirectToFrontendWithSuccess(string $token, User $user, string $frontendUrl = null)
    {
        $frontendUrl = $frontendUrl ?? $this->getDefaultFrontendUrl();
        // Just in case the mapped frontendUrl still has commas
        if (strpos($frontendUrl, ',') !== false) {
            $frontendUrl = explode(',', $frontendUrl)[0];
        }
        
        return redirect("{$frontendUrl}/auth/callback?token={$token}&user_id={$user->id}");
    }
}
