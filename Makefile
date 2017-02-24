sources := $(shell find -name "*.js" -not -path "./node_modules/*" -not -path "./index.js" -not -path "./test/*")

eslint := $(shell npm bin)/eslint

lint:
	@${eslint} ${sources}
