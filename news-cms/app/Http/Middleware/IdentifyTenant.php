<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $domain = $request->getHost();
        
        $tenant = \Illuminate\Support\Facades\Cache::remember("tenant_lookup_{$domain}", 3600, function () use ($domain) {
            $t = Tenant::where('domain', $domain)->first();
            if (!$t) {
                $t = Tenant::first() ?: Tenant::create(['name' => 'Default Site', 'domain' => $domain]);
            }
            return $t;
        });

        // Bind the tenant to the service container
        app()->instance('tenant', $tenant);

        return $next($request);
    }
}
