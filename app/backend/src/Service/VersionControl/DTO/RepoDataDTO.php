<?php

declare(strict_types=1);

namespace Samirify\Deployment\Service\VersionControl\DTO;

class RepoDataDTO
{
    private function __construct(
        public readonly array $branches,
        public readonly array $commits
    ) {}

    public static function create(array $branches = [], array $commits = []): RepoDataDTO
    {
        return new self($branches, $commits);
    }

    public function branches(): array
    {
        return $this->branches;
    }

    public function commits(): array
    {
        return $this->commits;
    }

    public function data(): array
    {
        return [
            'branches' => $this->branches,
            'commits' => $this->commits
        ];
    }
}
