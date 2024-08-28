<?php

declare(strict_types=1);

use Samirify\Deployment\Controller\ProjectController;
use Slim\App;
use Slim\Exception\HttpNotFoundException;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Samirify\Deployment\Controller\HelpController;
use Samirify\Deployment\Controller\MainController;

// Define app routes
return function (App $app) {
    $app->options('/{routes:.*}', function (Request $request, Response $response) {
        return $response;
    });

    $app->get('/initialise', MainController::class . ':initialise');

    $app->get('/project-data/{code}', ProjectController::class . ':projectData');
    $app->get('/projects', ProjectController::class . ':projectsList');
    $app->post('/deploy-project', ProjectController::class . ':initiateProjectDeployment');
    $app->post('/re-deploy-project/{id}', ProjectController::class . ':reDeployProject');
    $app->get('/project-status/{id}', ProjectController::class . ':projectStatus');
    $app->get('/export-project-log/{id}', ProjectController::class . ':exportProjectDeploymentLog');

    $app->get('/help/topic/{code}', HelpController::class . ':getTopic');

    $app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function ($request, $response) {
        throw new HttpNotFoundException($request);
    });
};
