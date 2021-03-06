import gulp from 'gulp';
import del from 'del';
import autoprefixer from 'gulp-autoprefixer';
import clean_css from 'gulp-clean-css';
import concat from 'gulp-concat';
import browserify from 'browserify';
import babelify from "babelify";
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';

// Empty out the build directory
const clean = () => {
    return del(['build']);
}

// PWA needs manifest
const build_manifest = () => {
    return gulp.src('src/manifest.json')
        .pipe(gulp.dest(`build/`));
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

// Icons just get copied to build folder
const build_icon = () => {
    return gulp.src(`src/icons/*`)
        .pipe(gulp.dest(`build/icons`));
}

// Build process
const build = gulp.series(clean, build_manifest, build_html, build_css, build_js_main, build_js_restaurant, build_sw, build_img, build_icon);

// Watchers (watch src files for changes, then rebuild)
gulp.task('watch', () => {
    gulp.watch('src/**/*', build);
    // Other watchers go here
})

// Set the default tasks to "build" and watch
// gulp.task('default', gulp.series(build, 'watch'), () => {
gulp.task('default', gulp.series(build), () => {
    console.log('Starting...');
})



