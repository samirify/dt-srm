<?php

declare(strict_types=1);

use WebSocket\Server;

require __DIR__ . '/../vendor/autoload.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, X-API-KEY");
header('Content-Type: application/json');

error_reporting(-1);

$server = new Server(ssl: false, port: 4000);
$server
    ->setTimeout(300)
    ->addMiddleware(new WebSocket\Middleware\CloseHandler())
    ->addMiddleware(new WebSocket\Middleware\PingResponder())
    ->onText(function (Server $server, WebSocket\Connection $connection, WebSocket\Message\Message $message) {
        echo "Got message: {$message->getContent()} \n";
        $server->text($message->getContent());
    })
    ->onError(function ($server, $connection, $exception) {
        echo "> Error: {$exception->getMessage()}\n";
        // Act on exception
        if (!$server->isRunning()) {
            // Re-start if not running - will reconnect if necessary
            $server->start();
        }
    })
    ->start();
