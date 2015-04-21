module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            user: {
                // options: {
                //     mangle: false,
                //     compress: false,
                //     beautify: true
                // },
                files: {
                    'static/js/user.min.js': [
                        // Jquery
                        'bower_components/jquery/dist/jquery.js',
                        // Bootstrap
                        'bower_components/bootstrap/dist/js/bootstrap.js',
                        // Tagsinput
                        'bower_components/bootstrap-tagsinput/dist/bootstrap-tagsinput.js',
                        // DataTables
                        'bower_components/datatables/media/js/jquery.dataTables.js',
                        'bower_components/datatables-colvis/js/dataTables.colVis.js',
                        'bower_components/datatables-responsive/js/dataTables.responsive.js',
                        // Dates
                        'bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.js',
                    ],
                },
            },
            admin: {
                files: {
                    'static/js/admin.min.js': [
                        // Codemirror
                        'bower_components/codemirror/lib/codemirror.js',
                        'bower_components/codemirror/addon/mode/simple.js',
                        'bower_components/codemirror/addon/mode/multiplex.js',
                        'bower_components/codemirror/mode/xml/xml.js',
                    ],
                },
            },
        },
        less: {
            user: {
                options: {
                    cleancss: true
                },
                files: {
                    'static/css/user.min.css': [
                        // Bootstrap
                        'bower_components/bootstrap/less/bootstrap.less',
                        // Font Awesome
                        'bower_components/font-awesome/less/font-awesome.less',
                        // Tagsinput
                        'bower_components/bootstrap-tagsinput/dist/bootstrap-tagsinput.less',
                        // Datatables
                        'bower_components/datatables/media/jquery.dataTables.css',
                        'bower_components/datatables/media/css/dataTables.bootstrap.css',
                        'bower_components/datatables-colvis/css/dataTables.colVis.css',
                        'bower_components/datatables-responsive/css/dataTables.fontAwesome.css',
                        // Dates
                        'bower_components/bootstrap-datepicker/dist/css/bootstrap-datepicker.css',
                        // Custom
                        'assets/styles.css',
                    ],
                },
            },
            admin: {
                files: {
                    'static/css/admin.min.css': [
                        'bower_components/codemirror/lib/codemirror.css',
                    ],
                },
            },
        },
        copy: {
            build: {
                files: [
                    {expand:true, cwd: 'bower_components/font-awesome/', src: ['fonts/*'], dest: 'static/'}
                ]
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                },
                src: ['test/**/*.js']
            },
        }
    });

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-concurrent');
    // Default task(s).
    grunt.registerTask('build', ['uglify', 'less', 'copy']);
    grunt.registerTask('test', ['mochaTest']);

};
