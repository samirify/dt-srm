# Samirify Custom Release App - Frontend (Docker)

Samirify Custom Release App is a Dockerized application which will require only Docker Desktop to be intalled in your machine. Then you'll run a simple command to spin up the dev environment, and another to stop and remove the container as shown below

# Installation

First off, you need to verify if you have Docker installed by running this command in your console.

`> docker -v`

If not, refer to the Docker installation [here](https://docs.docker.com/get-docker/).

## Docker commands

**Note:** Run the following commands from the root directory **not** from the docker directory!

## Development

> Build and run **dev** container

`> docker compose -p samirify-frontend -f docker/docker-compose.yml --env-file .env up -d --build`

You can now start the development and your local application will be available here: http://localhost:3003/

> Stop and remove **dev** container

`> docker compose -p samirify-frontend -f docker/docker-compose.yml --env-file .env down`
