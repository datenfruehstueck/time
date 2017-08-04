var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
	pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
	replaceString: /\bgulp[\-.]/
});
var mainBowerFiles = require('main-bower-files');

gulp.task('script', function() {
        gulp.src([
                'bower_components/jquery/dist/jquery.js', 
                'bower_components/bootstrap/dist/js/bootstrap.js', 
                'bower_components/moment/moment.js', 
                'js/*'
            ])
            .pipe(plugins.filter([ '**/*.js' ]))
            .pipe(plugins.debug())
            .pipe(plugins.concat('testtimer.js'))
            .pipe(plugins.uglify())
            .pipe(gulp.dest('dist'));
    });


gulp.task('style', function() {
        gulp.src([
                'bower_components/bootstrap/less/bootstrap.less', 
                'style/*'
            ])
            .pipe(plugins.filter([ '**/*.css', '**/*.less' ]))
            .pipe(plugins.debug())
            .pipe(plugins.less())
            .pipe(plugins.concat('testtimer.css'))
            .pipe(plugins.uglifycss())
            .pipe(gulp.dest('dist'));
    });

gulp.task('static', function() {
        gulp.src([ 'static/*', 'static/.htaccess' ])
            .pipe(gulp.dest('dist/'));
    });

gulp.task('default', [ 'script', 'style', 'static' ]);
