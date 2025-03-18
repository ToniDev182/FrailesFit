const { src, dest, watch, series } = require('gulp');

// Compilar CSS
const sass = require('gulp-sass')(require('sass'));
const purgecss = require('gulp-purgecss');
const rename = require('gulp-rename');

// Optimización de imágenes
const imagemin = require('gulp-imagemin');

// Compilar SASS a CSS
function css(done) {
    src('src/scss/app.scss') // Identifica el archivo principal
        .pipe(sass()) // Compila SASS a CSS
        .pipe(dest('build/css')) // Guarda en la carpeta destino
    done();
}

// Minificar y limpiar CSS para producción
function cssbuild(done) {
    src('build/css/app.css') // Asegúrate de que este archivo existe
        .pipe(purgecss({
            content: [
                'index.html',
                'producto1.html',
                'producto2.html',
                'producto3.html',
                'producto4.html',
                'producto5.html',
                'producto6.html',
                'producto7.html',
                'producto8.html',
                'producto9.html',
                'tienda.html',
                'ofertas.html',
                'nosotros.html',
                'gastronomia.html',
                'entorno.html',
                'Elaboracion.html',
                'contacto.html',
                'base.html'
            ]
        }))
        .pipe(rename({ suffix: '.min' })) // Agregar sufijo .min al archivo
        .pipe(dest('build/css')) // Guarda en la carpeta destino con el sufijo .min
    done();
}

// Optimizar imágenes
function imagenes(done) {
    src('src/img//*') // Selecciona todas las imágenes
        .pipe(imagemin({ optimizationLevel: 3 })) // Optimiza imágenes
        .pipe(dest('build/img')) // Guarda en la carpeta destino
    done();
}

// Vigilar cambios en archivos SCSS e imágenes
function dev(done) {
    watch('src/scss/**/*.scss', css); // Observa cambios en archivos SCSS
    watch('src/img/**/', imagenes); // Observa cambios en imágenes
    done();
}

// Tareas disponibles en Gulp
exports.css = css;
exports.imagenes = imagenes;
exports.dev = dev;
exports.build = series(cssbuild);
exports.default = series(imagenes, css, dev);

