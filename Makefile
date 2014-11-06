
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

.PHONY:	npm
.PHONY:	watch
.PHONY:	test
.PHONY:	docs
