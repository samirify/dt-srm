<?php

declare(strict_types=1);

namespace Samirify\Deployment\Service\VersionControl\Interface;

use Samirify\Deployment\Service\VersionControl\DTO\RepoDataDTO;

interface RepoServiceInterface
{
    public function getData(): RepoDataDTO;

    public function downloadRepo(string $downloadPath, string $branch): void;
}
