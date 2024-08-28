<?php

declare(strict_types=1);

namespace Samirify\Deployment\Command;

use Samirify\Deployment\Service\DeploymentService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

class DeploymentFailedEmailCommand extends Command
{
    /** @var string $defaultName */
    protected static $defaultName = 'deployment:send-failed-email';

    private $emailConfig;

    public function __construct(
        private readonly DeploymentService $deploymentService,
    ) {
        $this->emailConfig = [
            'to' => $_ENV['APP_EMAIL_ERROR_TO_ADDRESS'] ?? ''
        ];

        parent::__construct(self::$defaultName);
    }

    /**
     * @return void
     */
    protected function configure(): void
    {
        $this
            ->setDescription('Send email')
            ->addArgument('deployment-id', InputArgument::REQUIRED)
            ->addOption('email-to', null, InputOption::VALUE_OPTIONAL, 'Recipient(s) email address(s)')
            ->addOption('subject', null, InputOption::VALUE_OPTIONAL, 'Email subject', null);
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     *
     * @return int
     * @throws \Symfony\Component\Mailer\Exception\TransportExceptionInterface
     */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $emailTo = $input->getOption('email-to') ?? '';
        $deploymentId = $input->getArgument('deployment-id');
        $subject = $input->getOption('subject') ?? 'Samirify Deployment id: ' . $deploymentId;

        $recipients = $this->emailConfig['to'] ? explode(',', $this->emailConfig['to']) : [];

        $emailFrom = $_ENV['APP_EMAIL_ERROR_FROM_ADDRESS'] ?? '';

        if (!empty($recipients) && !empty($emailFrom)) {
            if ($emailTo) {
                $recipients = array_merge($recipients, explode(';', $emailTo));
            }

            $logContent = $this->deploymentService->getProjectDeploymentLogContent($deploymentId);

            $email = (new Email())
                ->from($emailFrom)
                //->cc('cc@example.com')
                //->bcc('bcc@example.com')
                //->replyTo('fabien@example.com')
                ->priority(Email::PRIORITY_HIGH)
                ->subject($subject)
                ->text("Deployment {$deploymentId} has failed!" . PHP_EOL . $logContent['text'])
                ->html("<pre><strong>Deployment {$deploymentId} has failed!</strong></pre>{$logContent['html']}");

            foreach ($recipients as $recipient) {
                $email->to(new Address($recipient));
            }

            $transport = Transport::fromDsn($_ENV['MAILER_DSN'] ?? 'smtp://localhost');
            $mailer = new Mailer($transport);

            $mailer->send($email);

            $output->writeln('An email was sent to: ' . PHP_EOL . implode(PHP_EOL, $recipients));
        } else {
            $output->write('WARNING: No recipients configured. Email was not sent!' . PHP_EOL);
            $output->write('If you need to see the full update log lease contact the release team.');

            return Command::FAILURE;
        }


        return Command::SUCCESS;
    }
}
