const { src, dest, parallel, series, watch } = require('gulp');

// Подключаем Browsersync
const browserSync = require('browser-sync').create();

// Подключаем gulp-concat
const concat = require('gulp-concat');

// Подключаем gulp-uglify-es
const uglify = require('gulp-uglify-es').default;


const ASSETS_PATH = 'public',
    TEMPLATES_PATH = 'templates';


// Определяем логику работы Browsersync
function browsersync() {
    browserSync.init({ // Инициализация Browsersync
        server: { baseDir: 'templates/pages' }, // Указываем папку сервера
        notify: false, // Отключаем уведомления
        online: true // Режим работы: true или false
    })
}

function compressJS() {
    return src([ // Берём файлы из источников
        // 'node_modules/jquery/dist/jquery.min.js', // Пример подключения библиотеки
        '${ASSETS_PATH}/src/js/main.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
    ])
        .pipe(concat('main.min.js')) // Конкатенируем в один файл
        .pipe(uglify()) // Сжимаем JavaScript
        .pipe(dest('public/build/js/')) // Выгружаем готовый файл в папку назначения
        .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function sass() {
	return src('/scss/main.' + preprocessor + '') // Выбираем источник: "app/sass/main.sass" или "app/less/main.less"
	.pipe(eval(preprocessor)()) // Преобразуем значение переменной "preprocessor" в функцию
	.pipe(concat('app.min.css')) // Конкатенируем в файл app.min.js
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
	.pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } )) // Минифицируем стили
	.pipe(dest('app/css/')) // Выгрузим результат в папку "app/css/"
	.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function startWatch() {
    // Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
    watch(['public/src/js/**/*.js'], compressJS);
}

// Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.browsersync = browsersync;

// Экспортируем функцию compressJS() в таск js
exports.js = compressJS;

// Экспортируем дефолтный таск с нужным набором функций
exports.default = parallel(compressJS, browsersync, startWatch);