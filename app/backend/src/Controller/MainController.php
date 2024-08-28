<?php

declare(strict_types=1);

namespace Samirify\Deployment\Controller;

use Psr\Http\Message\ResponseInterface;
use Samirify\Deployment\Service\Help\HelpService;

class MainController extends AbstractController
{
    public function __construct(
        private readonly HelpService $helpService,
    ) {}

    public function initialise(): ResponseInterface
    {
        $repoData = $this->helpService->getHelp();

        return $this->jsonSuccess($repoData);
    }
}
