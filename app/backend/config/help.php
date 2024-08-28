<?php

declare(strict_types=1);

return [
    'topics' => [
        'how_do_i_setup_my_repository' => [
            'code' => 'how_do_i_setup_my_repository',
            'title' => 'How do I setup my repository?',
            'subTitle' => 'Learn how to setup your repository.',
            'contentFilePath' => 'help/help-topics/how_do_i_setup_my_repository.html',
        ],
        'how_do_i_configure_my_bitbucket_repository' => [
            'code' => 'how_do_i_configure_my_bitbucket_repository',
            'title' => 'How do I configure my BitBucket repository?',
            'subTitle' => 'This guide will take you step by step through the process of configuring your BitBucket repository.',
            'contentFilePath' => 'help/help-topics/how_do_i_configure_my_bitbucket_repository.html',
        ]
    ],
    'faqs' => [
        'q1' => [
            'code' => 'q1',
            'question' => 'What do I do when I get error "must specify at least one container source"?',
            'answerFilePath' => 'help/faqs/container_source_error_1.html',
        ],
        'q2' => [
            'code' => 'no_such_host_is_known_error',
            'question' => 'What do I do when I get "No such host is known" error? (Local development ONLY!)',
            'answerFilePath' => 'help/faqs/no_such_host_is_known_error.html',
        ]
    ]
];
