<?php

declare(strict_types=1);

use Monolog\Formatter\LineFormatter;
use Monolog\Handler\RotatingFileHandler;
use Monolog\Logger;
use Psr\Container\ContainerInterface;
use Psr\Log\LoggerInterface;
use Slim\App;
use Slim\Factory\AppFactory;

// Define app container
return [
    'settings' => fn () => require __DIR__ . '/settings.php',

    'db' => static function (): PDO {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;port=%s;charset=utf8',
            $_ENV['DB_HOST'],
            $_ENV['DB_NAME'],
            $_ENV['DB_PORT']
        );
        $pdo = new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASS']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

        return $pdo;
    },

    App::class => function (ContainerInterface $container) {
        $app = AppFactory::createFromContainer($container);

        (require __DIR__ . '/../config/cors.php')($app);
        (require __DIR__ . '/../config/routes.php')($app);
        (require __DIR__ . '/../config/middleware.php')($app);

        return $app;
    },

    LoggerInterface::class => function (ContainerInterface $container) {
        $settings = $container->get('settings')['logger'];
        $logger = new Logger('app');

        $filename = sprintf('%s/app.log', $settings['path']);
        $level = $settings['level'];
        $rotatingFileHandler = new RotatingFileHandler($filename, 0, $level, true, 0777);
        $rotatingFileHandler->setFormatter(new LineFormatter(null, null, false, true));
        $logger->pushHandler($rotatingFileHandler);

        return $logger;
    },
];
