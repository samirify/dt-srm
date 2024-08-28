<?php

declare(strict_types=1);

use DI\ContainerBuilder;
use Slim\App;

require __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$container = (new ContainerBuilder())
    ->addDefinitions(__DIR__ . '/../config/container.php')
    ->build();

$container->get(App::class)->run();
