
validate: test es5-test

re: clean es5

clean:
	@rm -rf lib

lint:
	@eslint lib

test:
	@mocha

es5-test: re
	@DISPERSIVE_ECMA=5 mocha --compilers js:babel-register --require babel-polyfill

es5:
	@babel src --out-dir lib

.PHONY: test
