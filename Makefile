test:
	mocha -r should
min:
	uglifyjs browser/preach.js \
	-o browser/preach.min.js \
	-c -m \
	--source-map browser/preach.min.map \
	--comments \
	--stats
bundle:
	browserify index.js -o browser/preach.js
watch:
	watchify index.js src/preach.js -o browser/preach.js
build: test bundle min
.PHONY: test min bundle build watch