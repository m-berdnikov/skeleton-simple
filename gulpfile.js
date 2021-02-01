const { src, dest, parallel, series, watch } = require('gulp');

// Подключаем Browsersync
const browserSync = require('browser-sync').create();

// Подключаем gulp-concat
const concat = require('gulp-concat');

// Подключаем gulp-uglify-es
const uglify = require('gulp-uglify-es').default;

// Подключаем модули gulp-sass и gulp-less
const sass = require('gulp-sass');
const less = require('gulp-less');

// Подключаем Autoprefixer
const autoprefixer = require('gulp-autoprefixer');

// Подключаем модуль gulp-clean-css
const cleancss = require('gulp-clean-css');

// Подключаем gulp-imagemin для работы с изображениями
const imagemin = require('gulp-imagemin');

// Подключаем модуль gulp-newer
const newer = require('gulp-newer');

// Подключаем модуль del
const del = require('del');

const ASSETS_PATH = 'public',
    TEMPLATES_PATH = 'templates';

// Определяем логику работы Browsersync
function browsersync() {
    browserSync.init({ // Инициализация Browsersync
        server: { baseDir: ASSETS_PATH }, // Указываем папку сервера
        notify: false, // Отключаем уведомления
        online: true // Режим работы: true или false
    })
}

function compressJS() {
    return src([ // Берём файлы из источников
        // 'node_modules/jquery/dist/jquery.min.js', // Пример подключения библиотеки
        // `${ASSETS_PATH}/src/js/**/*.js` // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
        ASSETS_PATH + '/src/js/**/*.js'
    ])
        .pipe(concat('main.min.js')) // Конкатенируем в один файл
        .pipe(uglify()) // Сжимаем JavaScript
        .pipe(dest(ASSETS_PATH + '/build/js/')) // Выгружаем готовый файл в папку назначения
        .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function styles() {
    return src(ASSETS_PATH + '/src/scss/**/*.scss') // Выбираем источник: "app/sass/main.sass" или "app/less/main.less"
        // .pipe(eval(preprocessor)()) // Преобразуем значение переменной "preprocessor" в функцию
        .pipe(sass()) // Преобразуем значение переменной "preprocessor" в функцию
        .pipe(concat('style.min.css')) // Конкатенируем в файл main.min.js
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
        .pipe(cleancss({ level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ })) // Минифицируем стили
        .pipe(dest(ASSETS_PATH + '/build/css/')) // Выгрузим результат в папку "app/css/"
        .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function images() {
    return src(ASSETS_PATH + '/src/img/**/*') // Берём все изображения из папки источника
        .pipe(newer(ASSETS_PATH + '/build/img/')) // Проверяем, было ли изменено (сжато) изображение ранее
        .pipe(imagemin()) // Сжимаем и оптимизируем изображеня
        .pipe(dest(ASSETS_PATH + '/build/img/')) // Выгружаем оптимизированные изображения в папку назначения
}

function cleanimg() {
    return del(ASSETS_PATH + '/build/img/**/*', { force: true }) // Удаляем всё содержимое папки "app/images/dest/"
}

function buildcopy() {
    return src([ // Выбираем нужные файлы
        ASSETS_PATH + '/build/css/**/*.min.css',
        ASSETS_PATH + '/build/js/**/*.min.js',
        ASSETS_PATH + '/build/img/**/*',
        ASSETS_PATH + '/**/*.html',
    // ], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
    ])
    .pipe(dest(ASSETS_PATH + '/dist')) // Выгружаем в папку с финальной сборкой
}

function cleandist() {
	return del(ASSETS_PATH + '/dist/**/*', { force: true }) // Удаляем всё содержимое папки "dist/"
}

function startWatch() {
    // Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
    watch([ASSETS_PATH + '/src/js/**/*.js'], compressJS);

    // Мониторим файлы препроцессора на изменения
    watch(ASSETS_PATH + 'src/scss/**/*.scss', styles);

    // Мониторим папку-источник изображений и выполняем images(), если есть изменения
    watch(ASSETS_PATH + '/src/img/**/*', images);

    // Мониторим файлы HTML на изменения
    watch(ASSETS_PATH + '/**/*.html').on('change', browserSync.reload);
}


// Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.browsersync = browsersync;

// Экспортируем функцию compressJS() в таск js
exports.js = compressJS;

// Экспортируем функцию styles() в таск styles
exports.styles = styles;

// Экспорт функции images() в таск images
exports.img = images;

// Экспортируем функцию cleanimg() как таск cleanimg
exports.cleanimg = cleanimg;


exports.buildcopy = buildcopy;


// Экспортируем дефолтный таск с нужным набором функций
exports.default = parallel(styles, compressJS, images, browsersync, startWatch);

// Создаём новый таск "build", который последовательно выполняет нужные операции
exports.build = series(cleandist, styles, compressJS, images, buildcopy);
