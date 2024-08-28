<?php

declare(strict_types=1);

namespace Samirify\Deployment\Service\Help;

class HelpService
{
    private array $help = [];

    public function __construct()
    {
        $projectFilePath = __DIR__ . '/../../../config/help.php';

        if (file_exists($projectFilePath)) {
            $this->help = include($projectFilePath);
        }
    }

    public function getHelp(): array
    {
        $result = [];

        if (!empty($this->help)) {
            $faqsConfig = $this->help['faqs'];
            $faqs = [];

            foreach ($faqsConfig as $faq) {
                $faqs[] = [
                    'question' => $faq['question'],
                    'answer' => file_get_contents($faq['answerFilePath'])
                ];
            }

            $result = [
                'topics' => array_values($this->help['topics']),
                'faqs' => $faqs
            ];
        }

        return [
            'help' => $result
        ];
    }

    public function getTopic(string $code): array
    {
        $topic = $this->help['topics'][$code] ?? [];

        return [
            'content' => $topic ? file_get_contents($topic['contentFilePath']) : ''
        ];
    }
}
