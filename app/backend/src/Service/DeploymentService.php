<?php

declare(strict_types=1);

namespace Samirify\Deployment\Service;

use DateTime;
use DI\Container;
use DirectoryIterator;
use Exception;
use PDO;
use Psr\Log\LoggerInterface;
use Ramsey\Uuid\Uuid;
use Samirify\Deployment\Traits\UploadTrait;
use Stevebauman\Hypertext\Transformer;
use Symfony\Component\Process\Process;

class DeploymentService
{
    use UploadTrait;

    private $db;

    private LoggerInterface $logger;

    public function __construct(
        private readonly Container $container,
    ) {
        $this->db = $this->container->get('db');
        $this->logger = $this->container->get(LoggerInterface::class);

        $this->databaseSetup();
    }

    public function deploy(array $values): array
    {
        // // Consider running db cleanup before inserting new!
        $deploymentId = $this->createDeploymentRecord($values);

        $process = new Process(['php', '../bin/console', 'deploy:app', $deploymentId]);
        $process->setOptions(['create_new_console' => true]);
        $process->start();

        return [
            'deploymentId' => $deploymentId,
        ];
    }

    public function reDeploy(int $deploymentId): void
    {
        $process = new Process(['php', '../bin/console', 'deploy:app', $deploymentId, '--live-messages', 'y']);
        $process->setOptions(['create_new_console' => true]);
        $process->start();
    }

    public function clearLogFiles(string $folder): void
    {
        $files = glob($folder . '/*.json');

        foreach ($files as $file) {
            if (is_file($file)) unlink($file);
        }
    }

    public function getDeploymentRecords(array $selectCols = ['*']): array
    {
        $select = implode(',', $selectCols);

        $sql = "SELECT $select FROM pipelines ORDER BY created_date DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();

        $pipelines = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $pipelines ?: [];
    }

    public function getDeploymentRecordById(int $id): array
    {
        $sql = "SELECT * FROM pipelines WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);

        $project = $stmt->fetch(PDO::FETCH_ASSOC);

        return $project ?: [];
    }

    private function createDeploymentRecord(array $data): int|string
    {
        if (!isset($data['project']) || !isset($data['branch'])) {
            throw new Exception('Missing project code and/or branch!', 400);
        }

        $sql = "INSERT INTO pipelines (project_code, branch, status_code) VALUES (?, ?, ?)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$data['project'], $data['branch'], 'NEW']);

        return $this->db->lastInsertId();
    }

    public function updateDeploymentRecordStatus(int $deploymentId, string $status): void
    {
        $sql = "UPDATE pipelines SET status_code = ?, completed_log = NULL WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$status, $deploymentId]);
    }

    public function updateDeploymentRecordCompletedLog(int $deploymentId, string $completedLog): void
    {
        $sql = "UPDATE pipelines SET completed_log = ? WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$completedLog, $deploymentId]);
    }

    public function updateDeploymentRecordLogMessages(int $deploymentId, string $logMessages): void
    {
        $sql = "UPDATE pipelines SET log_messages = ? WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$logMessages, $deploymentId]);
    }

    public function clearDeploymentRecordLogMessages(int $deploymentId): void
    {
        $sql = "UPDATE pipelines SET log_messages = NULL WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$deploymentId]);
    }

    private function databaseSetup(): bool
    {
        try {
            $result = $this->db->query("SELECT 1 FROM pipelines LIMIT 1");
        } catch (Exception $e) {
            $sql = "CREATE TABLE IF NOT EXISTS pipelines (
                id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                project_code VARCHAR(30) NOT NULL,
                branch VARCHAR(255) NOT NULL,
                status_code VARCHAR(30) NOT NULL,
                completed_log LONGTEXT NULL,
                log_messages LONGTEXT NULL,
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )";

            // use exec() because no results are returned
            $this->db->exec($sql);
            return false;
        }

        return $result !== false;
    }

    public function downloadRepo(string $downloadPath, string $projectCode, string $branch): string|false
    {
        try {
            $start = new DateTime();

            (new RepoProjectService())
                ->setCode($projectCode)
                ->downloadRepo($downloadPath, $branch);

            $end = new DateTime();

            return $this->formatSeconds($end->getTimestamp() - $start->getTimestamp());
        } catch (Exception $e) {
            file_put_contents('err.txt', $e->getMessage());
            return false;
        }
    }

    public function extractFiles(string $basePath, string $downloadPath, string $zipFileName, string $deploymentId): string|false
    {
        try {
            $start = new DateTime();

            $file = "{$downloadPath}/{$zipFileName}.zip";
            exec("unzip -d {$downloadPath}/deployment-{$deploymentId} {$file} 2>&1", $output, $error);

            $this->formatZipFolder("{$basePath}/release-files/deployment-{$deploymentId}");

            if (!$error) {
                unlink($file);
                $end = new DateTime();

                return $this->formatSeconds($end->getTimestamp() - $start->getTimestamp());
            } else {
                throw new Exception('Failed to extract files!');
            }
        } catch (Exception $e) {
            return false;
        }
    }

    private function formatZipFolder(string $deplymentPath): void
    {
        $directories = scandir($deplymentPath);

        foreach ($directories as $directory) {
            if ($directory !== '.' && $directory !== '..') {
                $targetDir = $deplymentPath . '/' . $directory;
                if (is_dir($targetDir)) {
                    // rcopy from http://ben.lobaugh.net/blog/864/php-5-recursively-move-or-copy-files
                    $this->rcopy($targetDir, $deplymentPath);
                    system("rm -rf {$deplymentPath}/{$directory}");
                }
            }
        }
    }

    public function uploadFiles(string $localPath, array $project, array $options = []): string|false
    {
        try {
            $start = new DateTime();

            $uploadLocalPath = $localPath;

            $docker = $project['docker'] ?? [];

            if (!empty($docker)) {
                $dockerFile = "FROM {$docker['image']}" . PHP_EOL .
                    'WORKDIR /var/www/html' . PHP_EOL .
                    'COPY . .' . PHP_EOL;
                $dockerCommands = $docker['commands'] ?? [];

                if (count($dockerCommands) > 0) {
                    foreach ($dockerCommands as $_comm) {
                        $dockerFile .= "RUN " . $_comm . PHP_EOL;
                    }
                }

                $imgId = md5(json_encode($project));

                file_put_contents($localPath . '/Dockerfile', $dockerFile);

                $this->runConsoleCommand("cd {$localPath} && docker context use default 2>&1");

                $this->runConsoleCommand("cd {$localPath} && docker build -t {$imgId} {$localPath} 2>&1");

                $artifact = $docker['artifact'] ?? '';
                $createTmpArtifactCommand = '';

                if (!empty($artifact)) {
                    $imageFilesPath = "/var/www/html/{$artifact}";
                    $uploadLocalPath .= '/' . $artifact;
                } else {
                    $imageFilesPath = "/var/www/html";
                    $createTmpArtifactCommand = 'mkdir tmp-samirify-build && cd tmp-samirify-build &&';
                    $uploadLocalPath .= '/tmp-samirify-build/html';
                }

                $this->runConsoleCommand("cd {$localPath} && {$createTmpArtifactCommand} docker rm -f sfy-{$imgId} || true && docker cp $(docker create --name sfy-{$imgId} {$imgId}):{$imageFilesPath} ./ 2>&1");

                $this->runConsoleCommand("cd {$localPath} && docker rm sfy-{$imgId} 2>&1");
            }

            switch (strtolower($project['remote']['protocol'])) {
                case 'ftp':
                    $this->ftpUpload($uploadLocalPath, $project, $options);
                    break;
                default:
                    throw new Exception("Protocol {$project['remote']['protocol']} has not been implemented yet!");
            }

            $end = new DateTime();

            return $this->formatSeconds($end->getTimestamp() - $start->getTimestamp());
        } catch (\Throwable $th) {
            if ($this->logger) $this->logger->error($th->getMessage());
            return false;
        }
    }

    private function runConsoleCommand(string $comm): void
    {
        exec($comm, $output, $error);

        if ($error) {
            file_put_contents(
                'err4.txt',
                'output: ' . json_encode($output) . PHP_EOL .
                    'error: ' . json_encode($error) . PHP_EOL .
                    'command: ' . $comm
            );
            throw new Exception(json_encode($output));
        }
    }

    /**
     * Recursively copy files from one directory to another
     * from http://ben.lobaugh.net/blog/864/php-5-recursively-move-or-copy-files
     * 
     * @param String $src - Source of files being moved
     * @param String $dest - Destination of files being moved
     */
    public function rcopy($src, $dest)
    {

        // If source is not a directory stop processing
        if (!is_dir($src)) return false;

        // If the destination directory does not exist create it
        if (!is_dir($dest)) {
            if (!mkdir($dest)) {
                // If the destination directory could not be created stop processing
                return false;
            }
        }

        // Open the source directory to read in files
        $i = new DirectoryIterator($src);
        foreach ($i as $f) {
            if ($f->isFile()) {
                copy($f->getRealPath(), "$dest/" . $f->getFilename());
            } else if (!$f->isDot() && $f->isDir()) {
                $this->rcopy($f->getRealPath(), "$dest/$f");
            }
        }
    }

    public function formatSeconds(int $seconds): string
    {
        $msg = '';

        if ($seconds >= 3600) {
            $msg .= floor($seconds / 3600) . 'h, ';
            $seconds = ($seconds % 3600);
        }

        if ($seconds >= 60) {
            $msg .= floor($seconds / 60) . 'm, ';
            $seconds = ($seconds % 60);
        }

        $msg .= floor($seconds) . 's';

        return $msg;
    }

    public function logSocketMessages(string $logFilePath, array $messages, string $deploymentStatus = 'STARTED'): void
    {
        if (count($messages) > 0) {
            try {
                $deploymentId = $messages[0]['deploymentId'];
                $deploymentRecord = $this->getDeploymentRecordById((int)$deploymentId);

                foreach ($messages as $k => $message) {
                    $id = Uuid::uuid4();
                    $createdAt = date('Y-m-d H:i:s');

                    $messages[$k]['id'] = $id;
                    $messages[$k]['hash'] = strtoupper(md5($id . $createdAt . $k . json_encode($message)));
                    $messages[$k]['createdAt'] = $createdAt;
                    $messages[$k]['deploymentStatus'] = $deploymentStatus;
                }

                file_put_contents($logFilePath, json_encode($messages));

                $existingMessages = json_decode($deploymentRecord['log_messages'] ?? '', true) ?: [];

                $this->updateDeploymentRecordLogMessages((int)$deploymentId, json_encode(array_merge($existingMessages, $messages)));
            } catch (\Throwable $th) {
                if ($this->logger) $this->logger->error($th->getMessage());
            }
        }
    }

    public function projectStatus(string $deploymentId): void
    {
        $process = new Process(['php', "../bin/console", 'deployment:updates', $deploymentId]);
        $process->setOptions(['create_new_console' => true]);
        $process->start();
    }

    public function getProjectDeploymentLogContent(string $deploymentId, string $defaultContent = ''): array
    {
        $logContent = $this->getProjectDeploymentLog($deploymentId, $defaultContent);

        $transformer = new Transformer();

        $html = <<<HTML
        <style>
            body {
                background-color: #26294c;
                color: #eee;
            }
        </style>
        <pre>$logContent</pre>
        HTML;

        return [
            'text' => $transformer->toText($html),
            'html' => $html
        ];
    }

    public function getProjectDeploymentLog(string $deploymentId, string $defaultContent = ''): string
    {
        $logContent = '';

        $folder = "../release-files/deployment-{$deploymentId}-logs";

        $files = glob($folder . '/*.json');

        natsort($files);

        if ($files) {
            foreach ($files as $file) {
                if (is_file($file)) {
                    $content = file_get_contents($file);
                    $messages = json_decode($content, true);

                    foreach ($messages as $message) {
                        $logContent .= '<div style="display: flex; padding: 2px;color: ' . ($message['textColor'] === 'transparent' ? '#eee' : $message['textColor']) . '">
                        <span style="margin-right: 5px">' . $message['createdAt'] . '</span>: <span>' . $message['content'] . '</span>
                        </div>';
                    }
                }
            }
        } else {
            $logContent = $defaultContent;
        }


        return $logContent;
    }

    public function projectDeploymentLogError(string $error): string
    {
        return <<<HTML
        <style>
            body {
                background-color: #26294c;
                color: #eee;
            }
        </style>
        <pre><div style="padding: 2px;color: red">$error</div></pre>
        HTML;
    }
}
