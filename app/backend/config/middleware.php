<?php

use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;
use Slim\App;

// Define Custom Error Handler
$customErrorHandler = function (
    ServerRequestInterface $request,
    Throwable $exception,
) use ($app) {
    $allowedResponseCodes = [400, 401, 402, 403, 404, 405, 406, 500, 501, 502, 503];

    $logger = $app->getContainer()->get(LoggerInterface::class);

    if ($logger) {
        $logger->error($exception->getMessage());
    }

    $responseData = [
        'success' => false,
        'errors' => [$exception->getMessage()]
    ];

    $responseBody = json_encode($responseData);
    $resCode = in_array((int)$exception->getCode(), $allowedResponseCodes) ? (int)$exception->getCode() : 500;
    $response = $app->getResponseFactory()->createResponse($resCode);
    $response->getBody()->write($responseBody);
    $response = $response->withHeader('Content-Type', 'application/json');

    return $response;
};

return function (App $app) use ($customErrorHandler) {
    $app->addBodyParsingMiddleware();
    $app->addRoutingMiddleware();

    // Add error middleware
    $errorMiddleware = $app->addErrorMiddleware(true, true, true);
    $errorMiddleware->setDefaultErrorHandler($customErrorHandler);
};
