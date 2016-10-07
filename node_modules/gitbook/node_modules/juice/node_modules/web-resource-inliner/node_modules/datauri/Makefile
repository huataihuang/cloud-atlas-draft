SHELL = /bin/sh
NPM   = npm
NODE  = node
GRUNT = node_modules/grunt/bin/grunt

install:
	$(NPM) install
test: lint spec
fulltest: clean install test
clean:
	rm -rf node_modules
lint:
	./node_modules/.bin/jshint datauri.js cli.js lib/*
spec:
	@echo "Running test suite..."
	$(NODE) test/run.js
.PHONY: all test fulltest clean lint mocha