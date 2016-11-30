
validate: lint test es5-test

re: clean lib

clean:
	@rm -rf lib

lint:
	@eslint src

test:
	@mocha

es5-test: re
	@DISPERSIVE_ECMA=5 mocha

lib:
	@babel src --out-dir lib

doc:
	@jsdoc src/queryset.js -t ./node_modules/docdash -d doc

.PHONY: doc test
