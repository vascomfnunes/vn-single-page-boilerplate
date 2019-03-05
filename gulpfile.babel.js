var gulp = require('gulp')
var sass = require('gulp-sass')
var postcss = require('gulp-postcss')
var autoprefixer = require('autoprefixer')
var cssnano = require('cssnano')
var sourcemaps = require('gulp-sourcemaps')
var browserSync = require('browser-sync').create()
var uglify = require('gulp-uglify-es').default
var htmlmin = require('gulp-htmlmin')
var changed = require('gulp-changed')
var imagemin = require('gulp-imagemin')
var concat = require('gulp-concat')
var babel = require('gulp-babel')

var paths = {
  styles: {
    src: 'src/scss/**/*.scss',
    dest: 'dist/css'
  },
  js: {
    src: 'src/js/**/*.js',
    dest: 'dist/js'
  },
  html: {
    src: 'src/**/*.html',
    dest: 'dist'
  },
  staticContent: {
    src: 'static/**/*',
    dest: 'dist'
  },
  images: {
    src: 'assets/img/*',
    dest: 'dist/img'
  },
  fonts: {
    src: 'node_modules/@fortawesome/fontawesome-free/webfonts/*',
    dest: 'dist/webfonts'
  }
}

// Set the browser that you want to support
const AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
]

function style () {
  return gulp
    .src(['node_modules/animate.css/animate.min.css', 'node_modules/@fortawesome/fontawesome-free/scss/fontawesome.scss', 'node_modules/@fortawesome/fontawesome-free/scss/regular.scss', 'node_modules/@fortawesome/fontawesome-free/scss/solid.scss', 'node_modules/@fortawesome/fontawesome-free/scss/v4-shims.scss', 'node_modules/@fortawesome/fontawesome-free/scss/brands.scss', 'node_modules/bootstrap/scss/bootstrap.scss', paths.styles.src])
  // Initialize sourcemaps before compilation starts
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', sass.logError)
  // Use postcss with autoprefixer and compress the compiled file using cssnano
    .pipe(postcss([autoprefixer({ browsers: AUTOPREFIXER_BROWSERS }), cssnano()]))
  // Now add/write the sourcemaps
    .pipe(sourcemaps.write())
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest(paths.styles.dest))
  // Add browsersync stream pipe after compilation
    .pipe(browserSync.stream())
}

function js () {
  return gulp
    .src(['node_modules/jquery/dist/jquery.min.js', 'node_modules/bootstrap/dist/js/bootstrap.min.js', paths.js.src])
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest(paths.js.dest))
    .pipe(browserSync.stream())
}

function fonts () {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest))
}

function html () {
  return gulp
    .src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream())
}
// A simple task to reload the page
function reload () {
  browserSync.reload()
}

function staticContent () {
  return gulp
    .src([paths.staticContent.src, 'static/.static'])
    .pipe(gulp.dest(paths.staticContent.dest))
}

function images () {
  return gulp
    .src(paths.images.src)
    .pipe(changed(paths.images.dest))
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browserSync.stream())
}

// Add browsersync initialization at the start of the watch task
function watch () {
  browserSync.init({
    // You can tell browserSync to use this directory and serve it as a mini-server
    server: {
      baseDir: 'dist'
    }
    // If you are already serving your website locally using something like apache
    // You can use the proxy setting to proxy that instead
    // proxy: "yourlocal.dev"
  })
  gulp.watch(paths.styles.src, style)
  gulp.watch(paths.js.src, js)
  gulp.watch(paths.html.src, html)
  gulp.watch(paths.images.src, images)
  // reload()
}

// Don't forget to expose the task!
exports.watch = watch

// Expose the task by exporting it
// This allows you to run it from the commandline using
// $ gulp style
exports.style = style
exports.js = js
exports.html = html
exports.staticContent = staticContent
exports.images = images
exports.fonts = fonts

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
var build = gulp.series(staticContent, fonts, js, images, style, html)

/*
 * You can still use `gulp.task` to expose tasks
 */
gulp.task('build', build)

/*
 * Define default task that can be called by just running `gulp` from cli
 */
gulp.task('default', build)
