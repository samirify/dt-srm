<?php

declare(strict_types=1);

namespace Samirify\Deployment\Command;

use DirectoryIterator;
use Exception;
use Samirify\Deployment\Exception\DeploymentInProgressException;
use Samirify\Deployment\Service\DeploymentService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Lock\Key;
use Symfony\Component\Lock\LockFactory;
use Symfony\Component\Lock\Store\FlockStore;
use WebSocket\Client;
use WebSocket\Middleware\CloseHandler;
use WebSocket\Middleware\PingResponder;

class SendSocketUpdatesCommand extends Command
{
    public function __construct(
        private readonly DeploymentService $deploymentService,
        private readonly string $basePath,
    ) {
        parent::__construct();
    }

    /**
     * @return void
     */
    protected function configure(): void
    {
        $this
            ->setName('deployment:updates')
            ->setDescription('Deployment updates.')
            ->setHelp('This command will start the socket server and send live updates...')
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
        try {
            $deploymentId = $input->getArgument('deployment-id');

            $key = new Key('deployment-messages-' . $deploymentId);
            $store = new FlockStore();
            $factory = new LockFactory($store);

            $lock = $factory->createLockFromKey($key);

            $deploymentRecord = $this->deploymentService->getDeploymentRecordById((int)$deploymentId);

            if (!$lock->acquire() && ($deploymentRecord && in_array($deploymentRecord['status_code'], ['STARTED']))) {
                throw new DeploymentInProgressException();
            }

            $done = false;
            $stepsFiles = ['1-start', '2-pull', '3-pull', '4-extract', '5-extract', '6-extract', '7-upload', '8-upload', '9-upload', '10-done', 'error'];

            $deploymentRecord = $this->deploymentService->getDeploymentRecordById((int)$deploymentId);

            $existingMessages = json_decode($deploymentRecord['log_messages'] ?? '', true) ?: [];

            $logsFolder = "{$this->basePath}/release-files/deployment-{$deploymentId}-logs";

            if (count($existingMessages) > 0 && (!is_dir($logsFolder) || count(scandir($logsFolder)) === 2)) {
                $client = $this->getClient();
                system("rm -rf {$logsFolder}");

                foreach ($existingMessages as $msg) {
                    $client->text(json_encode($msg));
                }

                mkdir($logsFolder, 0777, true);
                $client->close();
            } else {
                $client = $this->getClient();

                do {
                    $logsDir = new DirectoryIterator($logsFolder);

                    foreach ($logsDir as $fileinfo) {
                        if ('json' === strtolower($fileinfo->getExtension())) {
                            foreach ($stepsFiles as $k => $stepFile) {
                                $thisStepFile = "{$logsFolder}/{$stepFile}.json";
                                if (file_exists($thisStepFile) && in_array($stepFile, $stepsFiles)) {
                                    unset($stepsFiles[$k]);

                                    $messages = json_decode(file_get_contents($thisStepFile), true);

                                    foreach ($messages as $message) {
                                        $client->text(json_encode($message));
                                    }
                                }
                            }
                        }
                    }

                    $doneFile = "{$logsFolder}/10-done.json";
                    $done = file_exists($doneFile);

                    sleep(1);
                } while (!$done);

                $client->close();
            }

            $output->writeln(sprintf("<%s>%s</>", 'fg=black;bg=yellow', 'Started deployment id: ' . $deploymentId));
        } catch (DeploymentInProgressException $e) {
            $output->writeln(' <error> ' . $e->getMessage() . ' </error>');
            return Command::FAILURE;
        } catch (Exception $e) {
            $client = $this->getClient();
            $client->text(json_encode([
                'deploymentId' => $deploymentId,
                'textColor' => 'red',
                'content' => "An error occurred. Please check the logs!",
                'icon' => 'times',
                'deplymentStatus' => 'FAILED'
            ]));
            $output->writeln(' <error> ' . $e->getMessage() . ' </error>');
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

    private function getClient(): Client
    {
        $client = new Client("{$_ENV['SOCKETS_SERVER_PROTOCOL']}://{$_ENV['SOCKETS_SERVER_HOST']}:{$_ENV['SOCKETS_SERVER_PORT']}");
        $client
            ->setContext([
                "ssl" => [
                    "verify_peer" => $_ENV['SOCKETS_SERVER_VERIFY_PEER'] ?? false,
                    "verify_peer_name" => $_ENV['SOCKETS_SERVER_VERIFY_PEER_NAME'] ?? false,
                ],
            ])
            ->addMiddleware(new CloseHandler())
            ->addMiddleware(new PingResponder());

        return $client;
    }
}
