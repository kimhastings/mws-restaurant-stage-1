const gulp = require('gulp');
const del = require('del');
const autoprefixer = require('gulp-autoprefixer');
const clean_css = require('gulp-clean-css');
const concat = require('gulp-concat');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

// Empty out the build directory
const clean = () => {
    return del(['build']);
}

// HTML: nothing needed here beyond copying to the build dir
const build_html = () => {
    return gulp.src('src/*.html')
        .pipe(gulp.dest(`build/`));
}

// CSS: minify then copy
const build_css = () => {
    return gulp.src(`src/css/styles.css`)
        .pipe(clean_css({ sourceMap: true }))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(concat(`styles.min.css`))
        .pipe(gulp.dest(`build/css`));
}

// JS: Nothing special for now
const copy_js = () => {
    return gulp.src(`src/js/*.js`)
        .pipe(gulp.dest(`build/js`));
}

// SW: Process service worker ES6 code into minified ES5 (allows use of import)
const build_sw = () => {
    return browserify('src/service-worker.js')
        .transform('babelify')
        .bundle()
        .pipe(source('service-worker.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('build/'));
}

// Resources just get copied to build folder
const copy_img = () => {
    return gulp.src(`src/img/*`)
        .pipe(gulp.dest(`build/img`));
}

// Build process
const build = gulp.series(clean, build_html, build_css, copy_js, build_sw, copy_img);

// Watchers (watch src files for changes, then rebuild)
gulp.task('watch', () => {
    gulp.watch('src/**/*', build);
    // Other watchers go here
})

// Set the default tasks to "build" and watch
gulp.task('default', gulp.series(build, 'watch'), () => {
    console.log('Starting...');
})



