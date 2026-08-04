<?php

namespace App\Logging;

use Monolog\Formatter\JsonFormatter;
class JsonLineFormatter
{
    public function __invoke($logger): void
    {
        foreach ($logger->getHandlers() as $handler) {
            $handler->setFormatter(new JsonFormatter(JsonFormatter::BATCH_MODE_NEWLINES, true));
        }
    }
}
