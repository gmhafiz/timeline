var gulp = require('gulp'),
    concat = require('gulp-concat'),
    deporder = require('gulp-deporder'),
    stripdebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify'),
    newer = require('gulp-newer'),
    imagemin = require('gulp-imagemin'),
    htmlclean = require('gulp-htmlclean'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    assets = require('postcss-assets'),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),
    cssnano = require('cssnano'),
    replace = require('gulp-replace'),

    devBuild = (process.env.NODE_ENV !== 'production'),
    folder = {
        src: 'dev/',
        build: 'public/'
    };

// js
gulp.task('js', function () {
    gulp.src('dev/js/*.js')
        .pipe(gulp.dest('public/js'));
});

// JS processing
gulp.task('js-process', function () {
    var jsbuild = gulp.src(folder.src + 'js/**/*')
        .pipe(deporder())
        .pipe(concat('main.js'));

    if (!devBuild) {
        jsbuild = jsbuild
            .pipe(stripdebug())
            .pipe(uglify());
    }
    return jsbuild.pipe(gulp.dest(folder.build + 'js/'));
});

// images
gulp.task('images', function () {
    var out = folder.build + 'images/';
    return gulp.src(folder.src + 'images/**/*')
        .pipe(newer(out))
        .pipe(imagemin( {optimizationLevel : 5} ))
        .pipe(gulp.dest(out));
});

// css
gulp.task('css', function() {
    // var postCssOpts = [
    //     assets({ loadPaths: ['images/'] }),
    //     autoprefixer({ browsers: ['last 2 versions', '> 2%']}),
    //     mqpacker
    // ];

    // if (!devBuild) {
    //     postCssOpts.push(cssnano);
    // }
    return gulp.src(folder.src + 'scss/main.scss')
        .pipe(sass({
            outputStyle: 'nested',
            imagePath: 'images/',
            precision: 3,
            errLogToConsole: true,
            discardComments: {
                removeAll:  true
            }
        }))
        // .pipe(postcss(postCssOpts))
        .pipe(gulp.dest(folder.build + 'css/'));
});

// html
gulp.task('html', function () {
    gulp.src('dev/*.html')
        .pipe(gulp.dest('public'));
});

// run all tasks
gulp.task('run', ['images', 'js', 'css', 'html']);

// watch
gulp.task('watch', function () {
    gulp.watch(folder.src + 'js/**/*', ['js']);
    gulp.watch(folder.src + 'images/**/*', ['images']);
    gulp.watch(folder.src + 'scss/**/*', ['css']);
    gulp.watch(folder.src + './**/*', ['html']);
});

// default
gulp.task('default', ['run', 'watch']);