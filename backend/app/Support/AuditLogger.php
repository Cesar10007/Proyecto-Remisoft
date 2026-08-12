<?php

namespace App\Support;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request as RequestFacade;

class AuditLogger
{
    public static function log(string $event, array $context = []): void
    {
        Log::channel('audit')->info($event, array_merge([
            'event'      => $event,
            'ip'         => RequestFacade::ip(),
            'user_agent' => RequestFacade::userAgent(),
            'timestamp'  => now()->toIso8601String(),
        ], $context));
    }
}
