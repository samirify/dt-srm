<?php

declare(strict_types=1);

namespace Samirify\Deployment\Controller;

use Exception;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Samirify\Deployment\Service\DeploymentService;
use Samirify\Deployment\Service\Projects;
use Samirify\Deployment\Service\RepoProjectService;

class ProjectController extends AbstractController
{
    public function __construct(
        private readonly DeploymentService $deploymentService,
        private readonly RepoProjectService $repoProjectService,
        private readonly Projects $projects,
    ) {}

    public function projectsList(): ResponseInterface
    {
        $projects = [];

        foreach ($this->projects->availableProjects() as $key => $project) {
            $projects[] = [
                'id' => $key,
                'name' => $project['name']
            ];
        }

        return $this->jsonSuccess([
            'projects' => $projects,
            'deployments' => $this->deploymentService->getDeploymentRecords([
                'id',
                'project_code',
                'branch',
                'status_code',
                'created_date'
            ])
        ]);
    }

    public function projectData(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $projectCode = $args['code'];

        $repoData = $this->repoProjectService
            ->setCode($projectCode)
            ->getRepoData();

        return $this->jsonSuccess($repoData);
    }

    public function initiateProjectDeployment(ServerRequestInterface $request): ResponseInterface
    {
        $requestParams = $this->getParsedBody($request);

        $deploy = $this->deploymentService->deploy($requestParams);

        return $this->jsonSuccess($deploy);
    }

    public function reDeployProject(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $deploymentId = (int)$args['id'];

        $pipeline = $this->deploymentService->getDeploymentRecordById((int)$deploymentId);

        if (!$pipeline) {
            return $this->jsonError(new Exception('Pipeline not found!', 404));
        }

        if ('STARTED' !== $pipeline['status_code']) {
            $this->deploymentService->reDeploy($deploymentId);
        }

        return $this->jsonSuccess([
            'status' => $pipeline['status_code']
        ]);
    }

    public function projectStatus(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $deploymentId = $args['id'];

        $pipeline = $this->deploymentService->getDeploymentRecordById((int)$deploymentId);

        if (!$pipeline) {
            return $this->jsonError(new Exception('Pipeline not found!', 404));
        }

        $this->deploymentService->projectStatus($deploymentId);

        return $this->jsonSuccess([
            'project' => [
                'id' => $pipeline['project_code'],
                'status' => $pipeline['status_code'],
                'deploymentId' => $deploymentId,
                'name' => $this->projects->availableProjects()[$pipeline['project_code']]['name'],
                'branch' => $pipeline['branch']
            ]
        ]);
    }

    public function exportProjectDeploymentLog(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $deploymentId = $args['id'];

        $deploymentRecord = $this->deploymentService->getDeploymentRecordById((int)$deploymentId);

        if (!$deploymentRecord) {
            $response->getBody()->write($this->deploymentService->projectDeploymentLogError('Project not found!'));
            return $response;
        }

        $logContent = $this->deploymentService->getProjectDeploymentLogContent($deploymentId, $deploymentRecord['completed_log']);

        $response->getBody()->write($logContent['html']);

        return $response;
    }
}
