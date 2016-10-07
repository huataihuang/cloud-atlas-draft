all: compile test

compile:
	./node_modules/.bin/pogo -c spawn.pogo

test:
	./node_modules/.bin/mocha ./test/spawn_test.pogo

.PHONY: test