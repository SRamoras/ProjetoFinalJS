
COMMAND ?= start
up:
	docker compose up --build

build:
	docker build -t finalproject .

run: build
	docker run --rm -it -v "$(shell pwd)":/app finalproject npm run $(COMMAND)

bash: build
	docker run --rm -it -v "$(shell pwd)":/app finalproject bash