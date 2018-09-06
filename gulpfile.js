const { series } = require('gulp');
const { series } = require('del');

// Set the default tasks to "build" and watch
gulp.task('default', ['build', 'watch']);

// Watchers (watch app files for changes, then rebuild)
const watch = () => {
    gulp.watch('app/**/*', build);
    // Other watchers
};
gulp.task('watch', watch);
  
// Build task
const build = gulp.series('clean', 'copy');
gulp.task('build', build);

// Clean the build directory
const clean = () => {
    return del(['build/*'], {dot: true});
};
gulp.task('clean', clean);
  
// Copy files from app directory to build directory
const copy = () => {
    return gulp.src(['app/**/*'])
    .pipe(gulp.dest('build'));
};
gulp.task('copy', copy);

gulp.task('hello', function() {
    console.log('Hello World');
});

// Install (console): npm i gulp-sass --save-dev
// Require (above): var sass = require('gulp-sass');
gulp.task('sass', function() {
    return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
      .pipe(sass())
      .pipe(gulp.dest('app/css'))
})


  