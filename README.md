# Samirify Deployment Tool (DT - SRM)

## Overview
This is a simple deployment tool 

First off, you need to verify if you have Docker installed by running this command in your console.

`docker -v`

If not, refer to the [Docker installation documents](https://docs.docker.com/get-docker/).

## Development Stack

* Slim 4
* React 18
* MySQL 8

## Installation
Start by cloning the repo

```git clone https://samirify-tech@bitbucket.org/samirify/samirify-dt-srm.git```

Then
#### On MAC OS
Run this command at the root `make install`

#### On Windows OS
Unfortunately you can not run the MakeFile on Windows so you have one of two options:

1. Install third party packages to enable the make command [See this article](https://earthly.dev/blog/makefiles-on-windows/)
2. Run the commands manually as described below (remember you need to be at the root), then run `make install`

Run the following commands on this order
```
> copy ./app/backend/.env.example ./app/backend/.env
> copy ./app/backend/config/project-pipelines-example.yaml ./app/backend/config/project-pipelines.yaml
> docker compose -p samirify-dt-srm -f docker/docker-compose.backend.yml --env-file app/backend/.env up -d --build
> docker exec -it srm-php composer install
> docker exec -it srm-php php artisan key:generate
> sleep 10
> docker exec -it srm-php php artisan migrate:fresh --seed
> docker exec -it srm-php chmod 777 /var/run/docker.sock
> copy ./app/frontend/.env.example ./app/frontend/.env
> docker compose -p samirify-dt-srm -f docker/docker-compose.backend.yml --env-file app/backend/.env up -d --build
```

## Configure & Start Deploying
##### BitBucket
Currently the system supports BitBucket only! So let's run through how to set it up:

* Create a simple test repo in BitBucket.
* Create App Password here https://bitbucket.org/account/settings/app-passwords/
* Grab your `repository-name`, `workspace` and `username` (you can get your username here https://bitbucket.org/account/settings/), as we'll need them later.
* Create Repository Access Token https://bitbucket.org/[YOUR_WORKSPACE]/[YOUR_REPO_NAME]/admin/access-tokens

##### FTP

* Create an FTP account and get the `host`, `username`, `password`, and the `files/location`

#### Configuration
Navigate to `app/backend/config/project-pipelines.yaml` and setup your repository as follows:
```
availableProjects:
  uniqueProjectCode:
    name: My project name
    files:
      vc: bitbucket
      workspace: [BITBUCKET_WORKSPACE]
      repoName: [REPO_NAME]
      repoToken: [ACCESS_TOKEN]
      appUser: [APP_USER]
      appPassword: [APP_PASSWORD]
    remote:
      protocol: ftp
      location: /public_html/my-project/path
      host: X.X.X.X
      port: 21
      username: ftpUsername
      password: ftpPassword
```

#### Start Deploying
Once you've completed the steps above, start the sockets server by running:
```
make sockets-dev
```

Then navigate to [http://localhost:3003](http://localhost:3003) and start deploying!

### For more features you see our [Advanced Configuration](docs/advanced-config.md) page

### Ongoing work and improvements

- [ ] Thorough documentation and more examples
- [ ] Add support for SVN & GitHub repositories
- [ ] Add Support for SFTP & Cloud storage
- [ ] Unit Tests for Slim and React
- [ ] User authentication
- [ ] Moving cobnfiguration to User Account