
COMMAND ?= start
up:
	docker compose up --build

build:
	docker build -t i-js .

run: build
	docker run --rm -it -v "$(shell pwd)":/app i-js npm run $(COMMAND)

bash: build
	docker run --rm -it -v "$(shell pwd)":/app i-js bash