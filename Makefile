
validate: lint test es5-test

re: clean lib

clean:
	@rm -rf lib

lint:
	@eslint src

test: re
	@mocha

es5-test: re
	@DISPERSIVE_ECMA=5 mocha --compilers js:babel-register --require babel-polyfill

lib:
	@babel src --out-dir lib

.PHONY: test
