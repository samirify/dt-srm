<?php

declare(strict_types=1);

namespace Samirify\Deployment\Service\VersionControl;

use Samirify\Deployment\Service\VersionControl\DTO\RepoDataDTO;
use Samirify\Deployment\Service\VersionControl\Interface\RepoServiceInterface;
use Exception;
use GuzzleHttp\Client;
use Samirify\Deployment\Service\Projects;

class BitBucketService implements RepoServiceInterface
{
    public const BITBUCKET_API_ROOT = 'https://api.bitbucket.org/2.0/repositories/';
    public const BITBUCKET_DOWNLOAD_ROOT = 'https://bitbucket.org/';

    private array $project = [];
    private array $availableProjects = [];

    private string $bitbucketApiRoot;
    private string $bitbucketDownloadRoot;

    public function __construct(
        private readonly string $code,
    ) {
        $this->availableProjects = (new Projects())->availableProjects();
        $this->project = $this->availableProjects[$this->code];

        $this->bitbucketApiRoot = self::BITBUCKET_API_ROOT . $this->project['files']['workspace'] . '/';
        $this->bitbucketDownloadRoot = self::BITBUCKET_DOWNLOAD_ROOT . $this->project['files']['workspace'] . '/';
    }

    public function getData(): RepoDataDTO
    {
        $branches = $this->getRemoteData($this->project['files']['repoName'] . '/refs/branches');
        $commits = $this->getRemoteData($this->project['files']['repoName'] . '/commits');

        return RepoDataDTO::create($this->formatBranches($branches['values'] ?? []), $this->formatCommits($commits['values'] ?? []));
    }

    private function getRemoteData(string $path): array
    {
        if (empty($this->project)) {
            throw new Exception('Project not found!', 404);
        }

        $client = new Client();

        $response = $client->request('GET', $this->bitbucketApiRoot . $path, [
            'headers'        => [
                'Authorization' => "Bearer {$this->project['files']['repoToken']}"
            ],
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }

    private function formatBranches(array $remoteBranches): array
    {
        $branches = [];

        foreach ($remoteBranches as $branch) {
            array_push($branches, [
                'id' => $branch['name'],
                'name' => $branch['name'],
            ]);
        }

        return $branches;
    }

    private function formatCommits(array $remoteCommits): array
    {
        $commits = [];

        foreach ($remoteCommits as $commit) {
            array_push($commits, [
                'id' => $commit['hash'],
                'name' => $commit['message'],
            ]);
        }

        return $commits;
    }

    public function downloadRepo(string $downloadPath, string $branch): void
    {
        $filePath = "{$downloadPath}/{$branch}.zip";
        $remoteFilePath = $this->bitbucketDownloadRoot .  "{$this->project['files']['repoName']}/get/{$branch}.zip";

        exec("curl --request GET --url '{$remoteFilePath}' -u {$this->project['files']['appUser']}:{$this->project['files']['appPassword']} --output {$filePath} 2>&1", $out, $return);

        if (!file_exists($filePath) || filesize($filePath) <= 0) {
            @unlink($filePath);
            throw new Exception('Error downloading files!');
        }
    }
}
