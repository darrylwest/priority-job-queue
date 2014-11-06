/**
 * standard gulp build file
 */

'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    mochaReporter = process.env.reporter || 'nyan'; // dot, spec, progress, tap

var paths = {
    src: 'lib/*.js',
    tests: 'test/*.js'
};

var errorHandler = function(err) {
    gutil.beep();
    console.log( err );
};

gulp.task('jshint', function() {
    gulp.src([ paths.src, paths.tests ] )
        .pipe( plumber({ errorHandler:errorHandler }) )
        .pipe( jshint() )
        .pipe( jshint.reporter('jshint-stylish') );
});

gulp.task('mocha', function() {
    gulp.src( paths.tests )
        .pipe( plumber({ errorHandler:errorHandler }) )
        .pipe( mocha({ reporter:mochaReporter }) );
});

gulp.task('test', [ 'jshint', 'mocha' ]);

gulp.task('watch', [ 'jshint', 'mocha' ], function() {
    gulp.watch( [ paths.src, paths.tests ], [ 'jshint', 'mocha' ] );
});

gulp.task('default', [ 'watch' ]);

