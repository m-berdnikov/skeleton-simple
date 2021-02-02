const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const del = require('del');
const plumber = require('gulp-plumber')

const ASSETS_PATH = 'public',
    TEMPLATES_PATH = 'templates';

function browsersync() {
    browserSync.init({ // Инициализация Browsersync
        server: { baseDir: ASSETS_PATH }, // Указываем папку сервера
        notify: false, // Отключаем уведомления
        online: true // Режим работы: true или false
    })
}

function compressJS() {
    return src(`${ASSETS_PATH}/src/js/**/*.js`)
        .pipe(plumber())
        .pipe(babel())
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest(`${ASSETS_PATH}/build/js/`))
        .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function sassFun() {
    return src(`${ASSETS_PATH}/src/scss/**/*.scss`)
        // .pipe(eval(preprocessor)()) // Преобразуем значение переменной "preprocessor" в функцию
        .pipe(plumber())
        .pipe(sass())
        .pipe(dest(`${ASSETS_PATH}/build/css/`))
        .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function compressCSS() {
    return src([`${ASSETS_PATH}/build/css/**/*.css`, `!${ASSETS_PATH}/build/css/**/*.min.css`])
        .pipe(plumber())
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
        .pipe(cleancss({ level: { 2: { removeDuplicateRules: true } }/* , format: 'beautify' */ })) // Минифицируем стили
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest(`${ASSETS_PATH}/build/css/`))
        .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function compressImg() {
    return src(`${ASSETS_PATH}/src/img/**/*`)
        .pipe(newer(`${ASSETS_PATH}/build/img/`)) // Проверяем, было ли изменено (сжато) изображение ранее
        .pipe(imagemin()) // Сжимаем и оптимизируем изображеня
        .pipe(dest(`${ASSETS_PATH}/build/img/`)) 
}

function cleanBuild() {
	return del(`${ASSETS_PATH}/build/**/*`, { force: true })
}

function startWatch() {
    watch(`${ASSETS_PATH}/src/js/**/*.js`, compressJS);
    watch(`${ASSETS_PATH}src/scss/**/*.scss`, sassFun);
    watch(`${ASSETS_PATH}/src/img/**/*`, compressImg);
    watch(`${ASSETS_PATH}/**/*.html`).on('change', browserSync.reload);
}

exports.js = compressJS;
exports.sass = sassFun;
exports.img = compressImg;

exports.default = parallel(sassFun, compressJS, compressImg, browsersync, startWatch);
exports.css = series(sassFun, compressCSS);
exports.build = series(cleanBuild, sassFun, compressCSS, compressJS, compressImg);