<?php

declare(strict_types=1);

namespace Samirify\Deployment\Command;

use DateTime;
use Exception;
use Samirify\Deployment\Exception\DeploymentInProgressException;
use Samirify\Deployment\Service\DeploymentService;
use Samirify\Deployment\Service\Projects;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Lock\Key;
use Symfony\Component\Lock\LockFactory;
use Symfony\Component\Lock\Store\FlockStore;
use Symfony\Component\Process\Process;

class DeployCommand extends Command
{
    private string $downloadPath = '../release-files';
    private array $availableProjects = [];

    public function __construct(
        private readonly DeploymentService $deploymentService,
        private readonly string $basePath,
    ) {
        parent::__construct();
        if (!is_dir($this->downloadPath)) mkdir($this->downloadPath, 0777, true);

        $this->availableProjects = (new Projects())->availableProjects();
    }

    /**
     * @return void
     */
    protected function configure(): void
    {
        $this
            ->setName('deploy:app')
            ->setDescription('Deploy application.')
            ->setHelp('This command will start application deployment...')
            ->addOption('live-messages', null, InputOption::VALUE_OPTIONAL, 'Send live socket updates', 'n')
            ->addArgument('deployment-id', InputArgument::REQUIRED);
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     *
     * @return int
     */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $result = Command::SUCCESS;

        $deploymentId = $input->getArgument('deployment-id');

        $key = new Key('deployment-' . $deploymentId);
        $store = new FlockStore();
        $factory = new LockFactory($store);

        try {
            $startTime = new DateTime();

            $deploymentRecord = $this->deploymentService->getDeploymentRecordById((int)$deploymentId);

            $lock = $factory->createLockFromKey($key);

            if (!$lock->acquire() && ($deploymentRecord && in_array($deploymentRecord['status_code'], ['STARTED']))) {
                throw new DeploymentInProgressException();
            }

            $logsPath = "{$this->basePath}/release-files/deployment-{$deploymentId}-logs";

            $this->deploymentService->clearLogFiles($logsPath);

            $this->deploymentService->clearDeploymentRecordLogMessages((int)$deploymentId);

            $sendLiveMessages = strtolower($input->getOption('live-messages'));
            if ('y' === $sendLiveMessages) $this->sendLiveMessages($deploymentId);

            if (!is_dir($logsPath)) mkdir($logsPath, 0777, true);

            $deploymentProject = $this->availableProjects[$deploymentRecord['project_code']] ?? [];

            if (empty($deploymentProject)) {
                throw new Exception('Pipeline record not found', 404);
            }

            $branch = $deploymentRecord['branch'];
            $nestedFolderName = $deploymentProject['files']['nestedFolderName'] ?? '';

            $this->deploymentService->updateDeploymentRecordStatus((int)$deploymentId, 'STARTED');

            $this->deploymentService->logSocketMessages($logsPath . '/1-start.json', [
                [
                    'deploymentId' => $deploymentId,
                    'textColor' => 'orange',
                    'content' => 'Deployment ' . $deploymentId . ' started!',
                    'icon' => 'rocket'
                ],
                [
                    'deploymentId' => $deploymentId,
                    'textColor' => 'transparent',
                    'content' => 'Pulling files...',
                    'icon' => 'download'
                ]
            ]);

            $filesDownloaded = $this->deploymentService->downloadRepo($this->downloadPath, $deploymentRecord['project_code'], $branch);

            if (false !== $filesDownloaded) {
                $this->deploymentService->logSocketMessages($logsPath . '/2-pull.json', [
                    [
                        'deploymentId' => $deploymentId,
                        'textColor' => 'yellow',
                        'content' => "Files pulled successfully ({$filesDownloaded})",
                        'icon' => 'check',
                    ]
                ]);
            } else {
                $this->deploymentService->logSocketMessages($logsPath . '/3-pull.json', [
                    [
                        'deploymentId' => $deploymentId,
                        'textColor' => 'red',
                        'content' => 'Error pulling files!',
                        'icon' => 'times'
                    ]
                ]);

                throw new Exception('Error pulling files!', 500);
            }

            $this->deploymentService->logSocketMessages($logsPath . '/4-extract.json', [
                [
                    'deploymentId' => $deploymentId,
                    'textColor' => 'transparent',
                    'content' => 'Extracting files...',
                    'icon' => 'file-zipper'
                ]
            ]);

            $filesExtracted = $this->deploymentService->extractFiles($this->basePath, $this->downloadPath, $branch, $deploymentId);

            if (false !== $filesExtracted) {
                $this->deploymentService->logSocketMessages($logsPath . '/5-extract.json', [
                    [
                        'deploymentId' => $deploymentId,
                        'textColor' => 'yellow',
                        'content' => "Files extracted successfully ({$filesExtracted})",
                        'icon' => 'check'
                    ]
                ]);
            } else {
                $this->deploymentService->logSocketMessages($logsPath . '/6-extract.json', [
                    [
                        'deploymentId' => $deploymentId,
                        'textColor' => 'red',
                        'content' => 'Error extracting files!',
                        'icon' => 'times'
                    ]
                ]);

                throw new Exception('Error extracting files!', 500);
            }

            $this->deploymentService->logSocketMessages($logsPath . '/7-upload.json', [
                [
                    'deploymentId' => $deploymentId,
                    'textColor' => 'transparent',
                    'content' => 'Uploading files...',
                    'icon' => 'upload',
                    'longOperation' => true
                ]
            ]);

            $uploadFiles = $this->deploymentService->uploadFiles(
                "{$this->basePath}/release-files/deployment-{$deploymentId}" . (!empty($nestedFolderName) ? "/{$nestedFolderName}" : ''),
                $deploymentProject,
                [
                    'export_log' => true,
                    'logs_file_path' => "{$this->basePath}/release-files/deployment-{$deploymentId}-logs/statusLog.log"
                ]
            );

            if (false !== $uploadFiles) {
                $this->deploymentService->logSocketMessages($logsPath . '/8-upload.json', [
                    [
                        'deploymentId' => $deploymentId,
                        'textColor' => 'yellow',
                        'content' => "Files uploaded successfully ({$uploadFiles})",
                        'icon' => 'check'
                    ]
                ]);
            } else {
                $this->deploymentService->logSocketMessages($logsPath . '/9-upload.json', [
                    [
                        'deploymentId' => $deploymentId,
                        'textColor' => 'red',
                        'content' => 'Error uploading files!',
                        'icon' => 'times'
                    ]
                ]);

                throw new Exception('Error uploading files!', 500);
            }

            sleep(1);

            $endTime = new DateTime();

            $timeElapsed = $this->deploymentService->formatSeconds($endTime->getTimestamp() - $startTime->getTimestamp() - 1);

            $this->deploymentService->updateDeploymentRecordStatus((int)$deploymentId, 'SUCCEEDED');

            $this->deploymentService->logSocketMessages($logsPath . '/10-done.json', [
                [
                    'deploymentId' => $deploymentId,
                    'textColor' => 'green',
                    'content' => "Deployment completed successfully ({$timeElapsed})",
                    'icon' => 'check'
                ]
            ], 'SUCCEEDED');

            $this->deploymentService->updateDeploymentRecordCompletedLog((int)$deploymentId, $this->deploymentService->getProjectDeploymentLog($deploymentId));

            $output->writeln(sprintf("<%s>%s</>", 'fg=black;bg=yellow', 'Started deployment id: ' . $deploymentId));
        } catch (DeploymentInProgressException $e) {
            $output->writeln(' <error> ' . $e->getMessage() . ' </error>');
            $result = Command::FAILURE;
        } catch (Exception $e) {
            $this->deploymentService->updateDeploymentRecordStatus((int)$deploymentId, 'FAILED');
            $this->deploymentService->updateDeploymentRecordCompletedLog(
                (int)$deploymentId,
                $this->deploymentService->getProjectDeploymentLog($deploymentId) . PHP_EOL .
                    'Error: ' . $e->getMessage()
            );

            $this->deploymentService->logSocketMessages($logsPath . '/error.json', [
                [
                    'deploymentId' => $deploymentId,
                    'textColor' => 'red',
                    'content' => 'Error: ' . $e->getMessage(),
                    'icon' => 'times'
                ]
            ], 'FAILED');

            $this->sendFailedEmail($deploymentId);
            $output->writeln(' <error> ' . $e->getMessage() . ' </error>');
            $result = Command::FAILURE;
        } finally {
            // Clean-up
            // system("rm -rf {$logsPath}");
            system("rm -rf {$this->basePath}/release-files/deployment-{$deploymentId}");
        }

        return $result;
    }

    private function sendLiveMessages($deploymentId): void
    {
        try {
            $process = new Process(['php', "{$this->basePath}/bin/console", 'deployment:updates', $deploymentId]);
            $process->setOptions(['create_new_console' => true]);
            $process->start();
        } catch (Exception $ex) {
            file_put_contents('run.txt', $ex->getMessage());
        }
    }

    private function sendFailedEmail($deploymentId): void
    {
        try {
            $process = new Process(['php', "{$this->basePath}/bin/console", 'deployment:send-failed-email', $deploymentId]);
            $process->setOptions(['create_new_console' => true]);
            $process->start();
        } catch (Exception $ex) {
            file_put_contents('run.txt', $ex->getMessage());
        }
    }
}
