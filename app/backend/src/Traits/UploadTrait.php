<?php

declare(strict_types=1);

namespace Samirify\Deployment\Traits;

use Exception;

trait UploadTrait
{
    public function ftpUpload(string $localPath, array $project, array $options = []): void
    {
        $logsFilePath = $options['logs_file_path'] ?? null;
        $exportLog = $options['export_log'] ?? false;

        $export = true === $exportLog && !is_null($logsFilePath) ? "set log:file/xfer {$logsFilePath};" : '';

        $command = "lftp -c \"open -u {$project['remote']['username']},{$project['remote']['password']} {$project['remote']['host']}; set ftp:ssl-allow no; set cmd:interactive yes; set dns:cache-expire never; set mirror:use-pget-n 10; {$export} mirror -R --Remove-source-files --parallel=50 {$localPath} {$project['remote']['location']}\" 1>&2";

        exec($command, $output, $error);

        if ($error) {
            throw new Exception("Upload failed! " . json_encode($error));
        }
    }
}
