<?php

declare(strict_types=1);

namespace Samirify\Deployment\Service\VersionControl;

use Samirify\Deployment\Service\VersionControl\DTO\RepoDataDTO;
use Samirify\Deployment\Service\VersionControl\Interface\RepoServiceInterface;
use Exception;
use Samirify\Deployment\Service\Projects;

class SVNService implements RepoServiceInterface
{
    private array $project = [];
    private array $availableProjects = [];

    public function __construct(
        private readonly string $code,
    ) {
        $this->availableProjects = (new Projects())->availableProjects();
        $this->project = $this->availableProjects[$this->code];
    }

    public function getData(): RepoDataDTO
    {
        // Implement logic for SVN
        throw new Exception('SVN not implemented yet!');

        // return RepoDataDTO::create([], []);
    }

    public function downloadRepo(string $downloadPath, string $branch): void
    {
        // Implement logic for SVN
        throw new Exception('SVN not implemented yet!');
    }
}
