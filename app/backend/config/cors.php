<?php

declare(strict_types=1);

use Slim\App;

// Define app cors
return function (App $app) {
    $app->add(function ($request, $handler) {
        $response = $handler->handle($request);

        $allowedOrigins = explode(',', $_ENV['CORS_ALLOWED_ORIGINS'] ?? 'localhost');

        if (in_array($_SERVER['HTTP_ORIGIN'] ?? '', $allowedOrigins)) {
            $response = $response->withHeader('Access-Control-Allow-Origin', $_SERVER['HTTP_ORIGIN']);
        }

        return $response
            ->withHeader('Access-Control-Allow-Credentials', 'true')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    });
};
