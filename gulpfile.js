const gulp = require('gulp');
const del = require('del');
const autoprefixer = require('gulp-autoprefixer');
const clean_css = require('gulp-clean-css');
const concat = require('gulp-concat');
const browserify = require('browserify');
const babelify = require("babelify");
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const livereload = require('gulp-livereload');

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

// JS: Process ES6 code into minified ES5 (allows use of import)
const build_js_main = () => {
    return browserify(['src/js/main.js', 'src/js/dbhelper.js'])
    .transform(babelify.configure({
      presets: ['env']
    }))
    .bundle()
    .pipe(source('main_bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('build/bundle_js'));
}

// JS: Process ES6 code into minified ES5 (allows use of import)
const build_js_restaurant = () => {
    return browserify(['src/js/restaurant_info.js', 'src/js/dbhelper.js'])
    .transform(babelify.configure({
      presets: ['env']
    }))
    .bundle()
    .pipe(source('restaurant_bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('build/bundle_js'));
}

// JS: Nothing special for now
const build_sw = () => {
    return gulp.src(['src/service-worker.js'])
        .pipe(gulp.dest(`build`));
}

// Images just get copied to build folder
const build_img = () => {
    return gulp.src(`src/img/*`)
        .pipe(gulp.dest(`build/img`));
}

// Build process
const build = gulp.series(clean, build_html, build_css, build_js_main, build_js_restaurant, build_sw, build_img);

// Watchers (watch src files for changes, then rebuild)
gulp.task('watch', () => {
    gulp.watch('src/**/*', build);
    // Other watchers go here
})

// Set the default tasks to "build" and watch
gulp.task('default', gulp.series(build, 'watch'), () => {
    console.log('Starting...');
})



