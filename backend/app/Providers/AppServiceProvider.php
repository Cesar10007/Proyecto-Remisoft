<?php

namespace App\Providers;

use App\Support\AuditLogger;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        ResetPassword::createUrlUsing(function ($user, string $token) {
            return config('app.frontend_url') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);
        });

        // RNF-001.3 — máx. 10 req/15 min por IP en endpoints de autenticación.
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinutes(15, 10)
                ->by($request->ip())
                ->response(function (Request $request) {
                    AuditLogger::log('RATE_LIMIT_HIT', [
                        'endpoint' => $request->path(),
                    ]);

                    return response()->json([
                        'message' => 'Demasiados intentos. Intenta de nuevo más tarde.',
                    ], 429);
                });
        });
    }
}
