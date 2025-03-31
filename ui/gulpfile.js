const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const purgecss = require('gulp-purgecss');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');

// 1) COMPILE SASS => build/css/app.css
function compileSass() {
  return src('src/scss/app.scss')
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(dest('build/css'));
}

// 2) OPTIMIZE IMAGES => build/img
function optimizeImages() {
  return src('src/img/**/*') // Double asterisk for nested folders
    .pipe(imagemin({ optimizationLevel: 3 }))
    .pipe(dest('build/img'));
}

// 3) COPY HTML => build/
//    Copies top-level index.html AND all .html in src/**, no exceptions
function copyHtml() {
  return src(['index.html', 'src/**/*.html'])
    .pipe(dest('build'));
} 

// 4) COPY JS => build/js
//    If you have JS in 'src/js', adjust or add another task
function copyJs() {
  return src('js/**/*.js')
    .pipe(dest('build/js'));
}

// 5) PURGE + MINIFY CSS => build/css/app.min.css
function minifyCss() {
  return src('build/css/app.css')
    .pipe(
      purgecss({
        content: [
          'build/**/*.html',
          'build/js/**/*.js'
        ]
      })
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('build/css'));
}

// ----------------------
// DEVELOPMENT WORKFLOW
// ----------------------
function dev() {
  watch('src/scss/**/*.scss', compileSass);
  watch('src/img/**/*', optimizeImages);
  watch(['index.html', 'src/**/*.html'], copyHtml);
  watch('js/**/*.js', copyJs);
}

// ----------------------
// BUILD TASKS
// ----------------------
exports.build = series(
  parallel(optimizeImages, compileSass, copyHtml, copyJs),
  minifyCss
);

exports.default = series(
  parallel(optimizeImages, compileSass, copyHtml, copyJs),
  dev
);
