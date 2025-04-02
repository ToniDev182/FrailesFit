const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const purgecss = require('gulp-purgecss');
const rename = require('gulp-rename');

// 1) COMPILAR SASS => genera build/src/css/app.css
function compileSass() {
  return src('src/scss/app.scss')
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(dest('build/src/css'));
}

// 2) COPIAR ARCHIVOS HTML
function copyHtml() {
  // Copiar index.html en la carpeta build/
  src('index.html')
    .pipe(dest('build'));

  // Copiar el resto de archivos HTML en build/src/pages/
  return src(['src/**/*.html'])
    .pipe(dest('build/src'));
}

// 3) COPIAR ARCHIVOS JS Y JSON => genera build/js
function copyJs() {
  return src('js/**/*.{js,json}') // Copia tanto archivos .js como .json
    .pipe(dest('build/js'));
}

// 4) PURGAR Y MINIFICAR CSS => genera build/src/css/app.min.css
function minifyCss() {
  return src('build/src/css/app.css')
    .pipe(
      purgecss({
        content: [
          'build/**/*.html', // Analiza los archivos HTML para eliminar CSS no utilizado
          'build/src/js/**/*.js' // También revisa los archivos JS por clases CSS usadas
        ]
      })
    )
    .pipe(rename({ suffix: '.min' })) // Renombra el archivo a app.min.css
    .pipe(dest('build/src/css'));
}

// ----------------------
// FLUJO DE DESARROLLO
// ----------------------
function dev() {
  watch('src/scss/**/*.scss', compileSass); // Vigila cambios en los archivos SCSS y recompila
  watch(['index.html', 'src/**/*.html'], copyHtml); // Vigila cambios en HTML y los copia
  watch('js/**/*.js', copyJs); // Vigila cambios en JS y los copia
}

// ----------------------
// TAREAS DE COMPILACIÓN
// ----------------------
exports.build = series(
  parallel(compileSass, copyHtml, copyJs), // Ejecuta las tareas en paralelo
  minifyCss // Luego minifica el CSS
);

exports.default = series(
  parallel(compileSass, copyHtml, copyJs), // Ejecuta las tareas en paralelo
  dev // Inicia el modo desarrollo con vigilancia de cambios
);
