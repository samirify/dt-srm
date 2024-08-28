<?php

declare(strict_types=1);

namespace Samirify\Deployment\Service;

use Symfony\Component\Yaml\Yaml;
use Exception;

final class Projects
{
    public $values = [];

    public function __construct()
    {
        $projectFilePath = __DIR__ . '/../../config/project-pipelines.yaml';

        if (!file_exists($projectFilePath)) {
            throw new Exception('Could find projects configuration file!');
        }

        $projects = Yaml::parseFile($projectFilePath);

        $this->values =  $projects ?? [];
    }

    public function availableProjects(): array
    {
        return $this->values['availableProjects'] ?? [];
    }
}
