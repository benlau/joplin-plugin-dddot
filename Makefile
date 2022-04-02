LIBS_PATH=src/libs

.PHONY: copy-libs
copy-libs:
	mkdir -p ${LIBS_PATH}
	cp bower_components/jquery/dist/jquery.min.js ${LIBS_PATH}
	cp bower_components/codemirror/lib/* ${LIBS_PATH}
	cp bower_components/Sortable/Sortable.min.js ${LIBS_PATH}

.PHONY: install
install:
	npm install
	bower install
	make copy-libs

