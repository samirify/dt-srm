<?php

declare(strict_types=1);

namespace Samirify\Deployment\Controller;

use Nyholm\Psr7\Response;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Throwable;

abstract class AbstractController
{
    protected function jsonSuccess(array $data = []): ResponseInterface
    {
        $responseData = [
            'success' => true,
        ];

        if (!empty($data)) $responseData['data'] = $data;

        $responseBody = json_encode($responseData);
        $response = new Response();
        $response->getBody()->write($responseBody);
        $response = $response->withHeader('Content-Type', 'application/json');

        return $response;
    }

    protected function jsonError(Throwable $error): ResponseInterface
    {
        $responseData = [
            'success' => false,
            'errors' => [$error->getMessage()]
        ];

        $responseBody = json_encode($responseData);
        $response = new Response($error->getCode());
        $response->getBody()->write($responseBody);
        $response = $response->withHeader('Content-Type', 'application/json');

        return $response;
    }

    protected function getParsedBody(ServerRequestInterface $request): array
    {
        return $request->getParsedBody() ?? json_decode($request->getBody()->getContents() ?? '', true) ?? [];
    }
}
