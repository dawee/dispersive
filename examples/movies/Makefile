babel := babel
browserify := browserify
sourcesdir := lib
builddir := es5
standalone := static/dispersive-movies.js
main := lib/main.js



sources := $(shell find ${sourcesdir} -name *.js)
objects := $(addprefix ${builddir}/, ${sources})
objectdirs := $(addsuffix .dir, $(dir ${objects}))

all: $(standalone)

re: clean all

clean:
	@rm -rf ${builddir} ${standalone}

${standalone}: ${objectdirs} ${objects}
	@mkdir -p $(dir $@)
	@${browserify} -t aliasify ${builddir}/${main} -o ${standalone}

%.dir:
	@mkdir -p $(dir $@)
	@touch $@

${builddir}/%.js: %.js
	@mkdir -p $(dir %@)
	@${babel} $< > $@

