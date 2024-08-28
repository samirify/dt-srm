<?php

namespace Samirify\Deployment\Exception;

use Exception;

final class DeploymentInProgressException extends Exception
{
    protected $code = 102;
    protected $message = 'Another deployment is already in progress! Please wait until it finishes..';
}
