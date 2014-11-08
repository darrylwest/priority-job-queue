
all:
	@make npm
	@make test

npm:
	@npm install

test:
	@( gulp test )

watch:
	@( gulp watch )

docs:
	@( gulp jsdoc )

bundle:
	browserify examples/main.js --debug -o examples/bundle.js

.PHONY:	npm
.PHONY:	watch
.PHONY:	test
.PHONY:	docs
.PHONY:	bundle
