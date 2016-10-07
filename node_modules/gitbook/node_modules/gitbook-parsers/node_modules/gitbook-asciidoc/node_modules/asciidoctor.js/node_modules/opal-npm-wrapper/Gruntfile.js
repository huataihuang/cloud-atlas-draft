module.exports = function(grunt){
  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),


      // Define concat task
    concat: {
      dist: {
        src: [
        'src/prepend.js',
        'index.js',
        'src/append.js'
        ],
        dest: 'index.js'
      }
    },

    // Define string-replace task
    'string-replace': {
      options: {
        // replace $inject by $opalInject
        replacements: [{
          pattern: /(var\ Opal)/ig,
          replacement: '//$1'
        }]
      },
      dist: {
        files: {
          'index.js': ['bower_components/opal/opal/current/opal.js']
        }
      }
    },
  });


  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-string-replace');

  // Define defaults task
  grunt.registerTask('default', ['string-replace', 'concat']);


};
