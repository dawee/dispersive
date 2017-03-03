babel := $(shell npm bin)/babel
mocha := $(shell npm bin)/mocha
eslint := $(shell npm bin)/eslint
sources := $(shell find src -name "*.js")
libs := $(patsubst src/%,%,${sources})

lib: field ${libs}

lint:
	@${eslint} src

field:
	@mkdir -p field

%.js: src/%.js
	@${babel} $< -o $@

field/%.js: src/field/%.js
	@${babel} $< -o $@

test: lib
	@${mocha} --compilers js:babel-core/register

.PHONY: test
