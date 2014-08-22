var gulp = require('gulp');
var exec = require('child_process').exec;
var mocha = require('gulp-mocha');



gulp.task('jsdoc', function(){

    return exec('./node_modules/.bin/jsdoc index.js -d doc -t ./node_modules/ink-docstrap/template -c ./node_modules/ink-docstrap/template/jsdoc.conf.json README.md', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
  });

});

gulp.task('tests', function () {
    gulp.src('test/*.js', {read: false})
        .pipe(mocha({reporter: 'spec'}));
});


gulp.task('build', ['tests', 'jsdoc']);
