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
const plumber = require('gulp-plumber');
const realFavicon = require ('gulp-real-favicon');
const fs = require('fs');

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

const ASSETS_PATH_SRC = 'src',
    ASSETS_PATH_BUILD = 'build',
    PAGE_PATH = 'pages';

function browsersync() {
    browserSync.init({ // Инициализация Browsersync
        server: { baseDir: './' }, // Указываем папку сервера
        notify: false, // Отключаем уведомления
        online: true, // Режим работы: true или false
    })
}

function compressJS() {
    return src(`${ASSETS_PATH_SRC}/js/**/*.js`)
        .pipe(plumber())
        .pipe(babel())
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest(`${ASSETS_PATH_BUILD}/js/`))
        .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function sassFun() {
    return src(`${ASSETS_PATH_SRC}/scss/**/*.scss`)
        // .pipe(eval(preprocessor)()) // Преобразуем значение переменной "preprocessor" в функцию
        .pipe(plumber())
        .pipe(sass())
        .pipe(dest(`${ASSETS_PATH_BUILD}/css/`))
        .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function compressCSS() {
    return src([`${ASSETS_PATH_BUILD}/css/**/*.css`, `!${ASSETS_PATH_BUILD}/css/**/*.min.css`])
        .pipe(plumber())
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
        .pipe(cleancss({ level: { 2: { removeDuplicateRules: true } }/* , format: 'beautify' */ })) // Минифицируем стили
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest(`${ASSETS_PATH_BUILD}/css/`))
        .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function compressImg() {
    return src(`${ASSETS_PATH_SRC}/img/**/*`)
        .pipe(newer(`${ASSETS_PATH_BUILD}/img/`)) // Проверяем, было ли изменено (сжато) изображение ранее
        .pipe(imagemin()) // Сжимаем и оптимизируем изображеня
        .pipe(dest(`${ASSETS_PATH_BUILD}/img/`))
}

function cleanBuild() {
    return del(`${ASSETS_PATH_BUILD}/**/*`, { force: true })
}

function startWatch() {
    watch(`${ASSETS_PATH_SRC}/js/**/*.js`, compressJS);
    watch(`${ASSETS_PATH_SRC}/scss/**/*.scss`, sassFun);
    watch(`${ASSETS_PATH_SRC}/img/**/*`, compressImg);
    watch(`${PAGE_PATH}/**/*.html`).on('change', browserSync.reload);
}

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).

function generateFavicon(done) {
    realFavicon.generateFavicon({
		masterPicture: `${ASSETS_PATH_SRC}/img/logo.svg`,
		dest: `${ASSETS_PATH_SRC}/favicon`,
		iconsPath: `../${ASSETS_PATH_BUILD}/favicon`,
		design: {
			ios: {
				pictureAspect: 'noChange',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: false,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {
				design: 'raw'
			},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#da532c',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: false,
					windows10Ie11EdgeTiles: {
						small: false,
						medium: true,
						big: false,
						rectangle: false
					}
				}
			},
			androidChrome: {
				pictureAspect: 'noChange',
				themeColor: '#ffffff',
				manifest: {
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: false
				}
			},
			safariPinnedTab: {
				pictureAspect: 'silhouette',
				themeColor: '#5bbad5'
			}
		},
		settings: {
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false,
			readmeFile: false,
			htmlCodeFile: false,
			usePathAsIs: false
		},
		markupFile: FAVICON_DATA_FILE
	}, function() {
		done();
	});
}

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
function injectFaviconMarkups() {
    return src(`${PAGE_PATH}/**/*.html`)
		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(dest(`${PAGE_PATH}`));
}

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.


function checkForFaviconUpdate(done) {
    var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
}

function moveFavicon() {
    return src(`${ASSETS_PATH_SRC}/favicon/**/*`)
    .pipe(dest(`${ASSETS_PATH_BUILD}/favicon/`))
}

exports.js = compressJS;
exports.sass = sassFun;
exports.img = compressImg;
exports.createFavicon = series(generateFavicon, moveFavicon, injectFaviconMarkups);
exports.css = series(sassFun, compressCSS);
exports.build = series(cleanBuild, sassFun, compressCSS, compressJS, generateFavicon, compressImg, generateFavicon, moveFavicon, injectFaviconMarkups);
exports.default = parallel(sassFun, compressJS, compressImg, browsersync, startWatch);
