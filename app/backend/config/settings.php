<?php

use Psr\Log\LogLevel;

// Detect environment
$_ENV['APP_ENV'] ??= $_SERVER['APP_ENV'] ?? 'dev';

// Logger settings
$settings['logger'] = [
    // Log file location
    'path' => __DIR__ . '/../logs',
    // Default log level
    'level' => LogLevel::DEBUG,
];

// Overwrite default settings with environment specific local settings
$configFiles = [
    __DIR__ . sprintf('/local.%s.php', $_ENV['APP_ENV']),
    __DIR__ . '/env.php',
    __DIR__ . '/../../env.php',
];

foreach ($configFiles as $configFile) {
    if (!file_exists($configFile)) {
        continue;
    }

    $local = require $configFile;
    if (is_callable($local)) {
        $settings = $local($settings);
    }
}

return $settings;
