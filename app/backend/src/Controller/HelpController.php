<?php

declare(strict_types=1);

namespace Samirify\Deployment\Controller;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Samirify\Deployment\Service\Help\HelpService;

class HelpController extends AbstractController
{
    public function __construct(
        private readonly HelpService $helpService,
    ) {}

    public function getTopic(
        ServerRequestInterface $request,
        ResponseInterface $response,
        array $args
    ): ResponseInterface {
        $topicCode = $args['code'];

        $repoData = $this->helpService->getTopic($topicCode);

        return $this->jsonSuccess($repoData);
    }
}
