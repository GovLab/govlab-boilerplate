// import paths
const libDir    = '/gulp-lib/'
      ;

// libs
var del             = require('del'),
    gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    shell           = require('gulp-shell'),
    uglify          = require('gulp-uglify'),
    ghPages         = require('gulp-gh-pages'),
    imagemin        = require('gulp-imagemin'),
    sourcemaps      = require('gulp-sourcemaps'),
    browserSync     = require('browser-sync'),
    runSequence     = require('run-sequence').use(gulp),
    nunjucksRender  = require('gulp-nunjucks-render'),

    // gulpfile config options
    config           = require(process.cwd() + '/gulp-config.js'),

    // local libs
    nunjucksEnv      = require(process.cwd() + libDir + 'gulp-nunjucks-env.js'),
    nunjucksGenerate = require(process.cwd() + libDir + 'gulp-nunjucks-generate.js'),

    // tasks
    build = require(process.cwd() + libDir + 'build-tasks.js')
    ;

// Clean Dist
gulp.task('clean', function () {
  return del(['public']);
});

// Browser Sync
gulp.task('browserSync', function () {
  browserSync({
    server: {
      baseDir: 'public'
    }
  });
});

// Sass
gulp.task('sass', function () {
  // Gets all files ending with .scss in source/sass
  return gulp.src('source/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' })).on('error', sass.logError)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/styles'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('vendor', function () {
  return gulp.src('source/static/vendor/**/*')
    .pipe(gulp.dest('public/vendor'));
});

gulp.task('image', function () {
  return gulp.src('source/static/images/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('public/images'));
});

gulp.task('js', function () {
  return gulp.src('source/static/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('public'));
});

// Nunjucks
gulp.task('yaml', build.yaml);
gulp.task('json', ['yaml'], build.json);
gulp.task('nunjucksBuildGeneratedPages', ['json'], build.nunjucksGenerated);
gulp.task('nunjucks', ['nunjucksBuildGeneratedPages'], build.nunjucks);

gulp.task('push-gh-master', shell.task(['git push origin master']));

gulp.task('push-gh-pages', function () {
  return gulp.src('public/**/*')
    .pipe(ghPages({ force: true }));
});

gulp.task('deploy', function (callback) {
  runSequence(
    'clean',
    ['sass', 'js', 'image', 'nunjucks', 'vendor'],
    'push-gh-master',
    'push-gh-pages',
    callback
  );
});

//limit watch files
gulp.task('watch', function () {
  gulp.watch('source/static/**/*.js', ['js']);
  gulp.watch('source/sass/**/*.scss', ['sass']);
  gulp.watch('source/templates/**/*.html', ['nunjucks']);
  gulp.watch('source/static/vendor/**/*.js', ['vendor']);
  gulp.watch('source/static/vendorimages/**/*', ['images']);
});

gulp.task('default', function (callback) {
  runSequence(
    'clean',
    ['sass', 'js', 'image', 'nunjucks', 'vendor'],
    ['browserSync', 'watch'],
    callback
  );
});
