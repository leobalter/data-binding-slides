var fs = require("fs");
var path = require("path");

module.exports = function(grunt) {
  function getDeckname(filepath) {
    return path.basename(filepath).replace(/\.(md|html)$/, ".md");
  }
  var deck = grunt.option("deck");
  if (deck) {
    deck = getDeckname(grunt.file.expand("slides/*" + deck + "*.md")[0] || "???");
    grunt.log.writeln("Deck: " + deck);
  } else {
    deck = "*.md";
  }

  grunt.initConfig({

    pkg: require('./package.json'),

    copy: {
      slides: {
        options: {
          process: function(content, srcpath) {
            return grunt.file.read("templates/index.jade");
          },
        },
        expand: true,
        cwd: "slides",
        src: deck,
        dest: "output",
        rename: function(dest, src) {
          return dest + "/" + src.replace(/\.md$/, ".html");
        },
      }
    },
    jade: {
      slides: {
        options: {
          pretty: true,
          data: function(dest, src) {
            var deckpath = "slides/" + getDeckname(dest);
            var source = grunt.file.read(deckpath);
            var matches = source.match(/^#\s*(.*)$/m);
            var title = "???";
            if (!matches) {
              grunt.log.warn("Missing title for deck " + deckpath);
            } else {
              title = matches[1];
            }
            return {
              title: title,
              source: source,
            };
          }
        },
        expand: true,
        src: "output/*.html",
      }
    },

    clean: {
      slides: ["output/*.html"],
      zip: ["slides.zip"]
    },

    watch: {
      livereload: {
        options: {
          livereload: true
        },
        files: ["output/**/*"],
        tasks: [],
      },
      slides: {
        files: [
          "templates/*",
          "slides/" + deck,
        ],
        tasks: ["build"],
      }
    },

    compress: {
      options: {
        mode: "zip"
      },

      slides : {
        options: {
          archive: "slides.zip",
        },
        files: [
          {
            cwd : "output/",
            src : ["**/*"],
            dest: ".",
            expand: true
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jade");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-compress");

  grunt.registerTask("build", ["clean", "copy", "jade"]);
  grunt.registerTask("dev", ["build", "watch"]);
  grunt.registerTask("zip", ["build", "compress"]);

  grunt.registerTask("default", ["build"]);

};
