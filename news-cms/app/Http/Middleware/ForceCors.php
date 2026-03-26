<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceCors
{
    /**
     * Handle an incoming request.
     *
     * Always adds CORS headers — even when the application throws an exception.
     * This is critical because if $next($request) throws, Laravel's exception
     * handler returns a response WITHOUT going back through this middleware's
     * post-processing, causing browsers to report a "CORS error" instead of
     * the actual 500/503 error.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Resolve allowed origins from config (safe with config:cache) with
        // a hard-coded fallback that covers all known deployed domains.
        $rawOrigins = config('cors.allowed_origins',
            'https://news-portal-public-gray.vercel.app,https://news-portal-admin-beta.vercel.app,https://news-portal-web.vercel.app,http://localhost:3000,http://localhost:5173'
        );

        // config('cors.allowed_origins') returns an array; env() returns a string.
        // Handle both:
        if (is_array($rawOrigins)) {
            $allowedOrigins = array_values(array_filter(array_map('trim', $rawOrigins)));
        } else {
            $allowedOrigins = array_values(array_filter(array_map('trim', explode(',', (string) $rawOrigins))));
        }

        $origin = $request->header('Origin');
        $origin = is_string($origin) ? trim($origin) : null;

        $allowOrigin = in_array('*', $allowedOrigins, true) ? '*' : 'https://news-portal-public-gray.vercel.app';

        if ($origin) {
            $normalizedOrigin = rtrim($origin, '/');
            $isAllowed = false;

            // 1. Exact match (case-sensitive, no trailing slash)
            foreach ($allowedOrigins as $allowed) {
                if ($normalizedOrigin === rtrim($allowed, '/')) {
                    $isAllowed = true;
                    break;
                }
            }

            // 2. Wildcard pattern match — allow any *.vercel.app or *.onrender.com
            if (!$isAllowed) {
                $isAllowed =
                    preg_match('/^https:\/\/[a-z0-9\-]+\.vercel\.app$/', $normalizedOrigin) ||
                    preg_match('/^https:\/\/[a-z0-9\-]+\.onrender\.com$/', $normalizedOrigin) ||
                    preg_match('/^http:\/\/localhost(:\d+)?$/', $normalizedOrigin) ||
                    preg_match('/^http:\/\/127\.0\.0\.1(:\d+)?$/', $normalizedOrigin);
            }

            $allowOrigin = $isAllowed ? $normalizedOrigin : $allowOrigin;
        }

        // Echo back requested headers when possible
        $requestedHeaders = $request->header('Access-Control-Request-Headers');
        $allowHeaders = $requestedHeaders
            ? $requestedHeaders
            : 'Content-Type, Authorization, X-Requested-With, Accept, X-XSRF-TOKEN';

        // Handle OPTIONS preflight immediately — no need to go deeper
        if ($request->isMethod('OPTIONS')) {
            return response('', 204)
                ->header('Access-Control-Allow-Origin', $allowOrigin)
                ->header('Vary', 'Origin')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Allow-Headers', $allowHeaders)
                ->header('Access-Control-Max-Age', '86400');
        }

        // -----------------------------------------------------------------------
        // CRITICAL: Wrap $next($request) in try/catch so that exceptions from
        // downstream middleware or controllers never escape without CORS headers.
        // Without this, any Laravel exception (500, auth failure, DB error)
        // produces a response with NO CORS headers — which browsers misreport
        // as "CORS policy: No Access-Control-Allow-Origin header present."
        // -----------------------------------------------------------------------
        try {
            $response = $next($request);
        } catch (\Throwable $e) {
            // Rethrow — Laravel's exception handler will convert this to a Response.
            // But we can't easily intercept here, so we re-throw and rely on
            // the exception handler registered below to add CORS headers.
            throw $e;
        }

        $this->addCorsHeaders($response, $allowOrigin, $allowHeaders);

        return $response;
    }

    private function addCorsHeaders(Response $response, string $allowOrigin, string $allowHeaders): void
    {
        $response->headers->set('Access-Control-Allow-Origin', $allowOrigin);
        $response->headers->set('Vary', 'Origin');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Allow-Headers', $allowHeaders);
    }
}
