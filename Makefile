CURRENT_PATH := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
DC_FRONTEND := docker compose -p samirify-dt-srm -f $(CURRENT_PATH)docker/docker-compose.frontend.yml --env-file $(CURRENT_PATH)app/frontend/.env
DC_BACKEND := docker compose -p samirify-dt-srm -f $(CURRENT_PATH)docker/docker-compose.backend.yml --env-file $(CURRENT_PATH)app/backend/.env

.PHONY: up down build logs shell

up:
	$(DC_BACKEND) up -d --build
	$(DC_FRONTEND) up -d --build
	docker exec -it srm-php chmod 777 /var/run/docker.sock

down:
	$(DC_BACKEND) down
	$(DC_FRONTEND) down

build:
	$(DC_BACKEND) build
	$(DC_FRONTEND) build
	docker exec -it srm-php chmod 777 /var/run/docker.sock

install: 
	cp ./app/backend/.env.example ./app/backend/.env
	cp ./app/backend/config/project-pipelines-example.yaml ./app/backend/config/project-pipelines.yaml
	$(DC_BACKEND) up -d --build
	docker exec -it srm-php chmod 777 /var/run/docker.sock
	docker exec -it srm-php composer install

	cp ./app/frontend/.env.example ./app/frontend/.env
	$(DC_FRONTEND) up -d --build

logs:
	$(DC_BACKEND) logs -f

shell:
	docker exec -it srm-php bash

sockets-dev:
	docker exec -it srm-php chmod 777 /var/run/docker.sock
	docker exec -it srm-php php sockets-server/index.php