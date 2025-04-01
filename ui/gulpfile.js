const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const purgecss = require('gulp-purgecss');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');

// 1) COMPILE SASS => build/src/css/app.css
function compileSass() {
  return src('src/scss/app.scss')
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(dest('build/src/css'));
}

// 2) OPTIMIZE IMAGES => build/src/img
function optimizeImages() {
  return src('src/img/**/*')
    .pipe(imagemin({ optimizationLevel: 3 }))
    .pipe(dest('build/src/img'));
}

// 3) COPY HTML
function copyHtml() {
  // Copiar solo index.html en build/
  src('index.html')
    .pipe(dest('build'));

  // Copiar el resto de los HTML en build/src/pages/
  return src(['src/**/*.html'])
    .pipe(dest('build/src'));
}

// 4) COPY JS + JSON => build/js
function copyJs() {
  return src('js/**/*.{js,json}') // Incluye tanto .js como .json
    .pipe(dest('build/js'));
}

// 5) PURGE + MINIFY CSS => build/src/css/app.min.css
function minifyCss() {
  return src('build/src/css/app.css')
    .pipe(
      purgecss({
        content: [
          'build/**/*.html',
          'build/src/js/**/*.js'
        ]
      })
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('build/src/css'));
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
