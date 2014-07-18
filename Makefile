test:
	./node_modules/.bin/mocha -r should
min:
	./node_modules/.bin/uglifyjs browser/preach.js \
	-o browser/preach.min.js \
	-c -m \
	--source-map browser/preach.min.map \
	--comments \
	--stats
bundle:
	./node_modules/.bin/browserify -r ./index.js:Preach -o browser/preach.js
watch:
	watchify index.js src/preach.js -o browser/preach.js
build: test bundle min
.PHONY: test min bundle build watch