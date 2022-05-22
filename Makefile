.SILENT:

COLOR_RESET = \033[0m
COLOR_GREEN = \033[32m
COLOR_YELLOW = \033[33m
PROJECT_NAME = `basename $(PWD)`

.DEFAULT_GOAL = help

## Prints this help
help:
	printf "${COLOR_YELLOW}\n${PROJECT_NAME}\n\n${COLOR_RESET}"
	awk '/^[a-zA-Z\-\_0-9\.%]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "${COLOR_GREEN}$$ make %s${COLOR_RESET} %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)
	printf "\n"

## setups project locally
setup:
	pip install -r requirements.txt

## builds Docker image for local environment
build-local:
	docker build --target local -t globocom/aws-neptune-endpoint .

## builds Docker image for production environment
build-prod:
	docker build -t globocom/aws-neptune-endpoint .

## pushes the PROD image to Docker Hub
push: build-prod
	docker push globocom/aws-neptune-endpoint

## runs project locally
run:
	docker run --rm -it -p 5000:5000 --env-file configs/.env.local -v `pwd`:/app globocom/aws-neptune-endpoint

