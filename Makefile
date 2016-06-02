bin = ./node_modules/.bin

test: build
	@${bin}/mocha -R nyan build/test

build:
	@${bin}/babel --presets es2015 lib/action.js lib -q -d .  

.PHONY: test build
