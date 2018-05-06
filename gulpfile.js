'use strict';

//Задание путей к используемым файлам и папкам (paths to folders and files):
//var paths = {
// dir: {
//   app: './app',
//   dist: './dist'
// },
// watch: {
//   html: './app/pug/**/*.pug',
//   css: [
//     './app/blocks/**/*.styl',
//     './app/config/**/*.styl'
//   ],
//   js: './app/blocks/**/*.js'
// },
// app: {
//   html: {
//     src: './app/pug/pages/*.pug',
//     dest: './app'
//   },
//   common: {
//     css: {
//       src: [
//         './app/config/variables.styl',
//         './app/config/mixins.styl',
//         './app/blocks/**/*.styl'
//       ],
//       dest: './app/assets/css'
//     },
//     js: {
//       src: './app/blocks/**/*.js',
//       dest: './app/assets/js'
//     }
//   },
//   vendor: {
//     css: {
//       src: [
//         './app/vendor/normalize-css/normalize.css',
//         './app/vendor/bootstrap/dist/css/bootstrap.min.css',
//         './app/vendor/font-awesome/css/font-awesome.min.css'
//       ],
//       dest: './app/assets/css'
//     },
//     js: {
//       src: [
//         './app/vendor/jquery/dist/jquery.min.js',
//         './app/vendor/bootstrap/dist/js/bootstrap.min.js'
//       ],
//       dest: './app/assets/js'
//     },
//     fonts: {
//       src: [
//         './app/vendor/font-awesome/fonts/*.*'
//       ],
//       dest: './app/assets/fonts'
//     }
//   }
// },
// img: {
//   src: './app/assets/images/**/*.*',
//   dest: './dist/assets/images'
// },
// dist: {
//   html: {
//     src: './app/*.html',
//     dest: './dist'
//   },
//   css: {
//     src: './app/assets/css/*.min.css',
//     dest: './dist/assets/css'
//   },
//   js: {
//     src: './app/assets/js/*.min.js',
//     dest: './dist/assets/js'
//   },
//   fonts: {
//     src: './app/assets/fonts/*.*',
//     dest: './dist/assets/fonts'
//   }
// }
//}

// Подключение плагинов через переменные (connection of plugins through variables):
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const csso = require('gulp-csso');
const del = require('del');
const imagemin = require('gulp-imagemin');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const stylus = require('gulp-stylus');
const pngquant = require('imagemin-pngquant');
const pug = require('gulp-pug');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();// Подключение Browsersync
const reload = browserSync.reload;//(connection of Browsersync)

// Tasks
/* Browsersync
(Browsersync, autoreload of browser) */
gulp.task('serve', function(){
	browserSync.init({
		server: './app', // browser: 'firefox'
		notify: false,
		open: false
	});
	gulp.watch('./app/pug/**/*.pug', gulp.series('html'));
	gulp.watch(['./app/blocks/**/*.styl', './app/styl/**/*.styl'], gulp.series('css'));
	gulp.watch('./app/blocks/**/*.js', gulp.series('js'));
	gulp.watch('*.html').on('change', reload);
});

/* Pug, преобразование Pug в HTML
(Pug to HTML conversion) */
gulp.task('html', function () {
	return gulp.src('./app/pug/pages/*.pug')
		.pipe(plumber())
		.pipe(pug({pretty: true}))
		.pipe(gulp.dest('./app'))
		.pipe(browserSync.stream());
});

/* Stylus, преобразование Stylus в CSS
(Stylus to CSS conversion) */
gulp.task('css', function () {
	return gulp.src('./app/styl/styles.styl')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(stylus())
		.pipe(autoprefixer())
		.pipe(gulp.dest('./app/assets/css'))
		.pipe(rename({suffix: ".min"}))
		.pipe(csso())
		.pipe(gulp.dest('./app/assets/css'))
		.pipe(sourcemaps.write())
		.pipe(browserSync.stream());
});

/* JS, объединение и минификации
(Merger and minimisation custom JS files) */
gulp.task('js', function () {
	return gulp.src('./app/blocks/**/*.js')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(concat('scripts.js'))
		.pipe(gulp.dest('./app/assets/js'))
		.pipe(uglify()) //Минификация
		.pipe(rename({suffix: ".min"}))
		.pipe(gulp.dest('./app/assets/js'))
		.pipe(sourcemaps.write())
		.pipe(browserSync.stream());
});

/* Css-Vendor, объединение и минификации файлов внешних библиотек
(Merger and minimisation CSS files of libraries, plugins and frameworks) */
gulp.task('cssVendor', function () {
	return gulp.src([
		'./app/vendor/normalize.css/normalize.css',
		'./app/assets/bootstrap/css/bootstrap.min.css',
		'./app/vendor/font-awesome/svg-with-js/css/fa-svg-with-js.css'
	])
		.pipe(concat('vendor.min.css'))
		.pipe(csso())
		.pipe(gulp.dest('./app/assets/css'));
});

/* Js-Vendor, объединение и минификации файлов внешних библиотек
(Merger and minimisation JS files of libraries, plugins and frameworks) */
gulp.task('jsVendor', function () {
	return gulp.src([
		'./app/vendor/jquery/dist/jquery.min.js',
		'./app/vendor/bootstrap/dist/js/bootstrap.min.js',
		'./app/vendor/font-awesome/svg-with-js/js/fontawesome-all.min.js'
	])   // return gulp.src(paths.app.vendor.js.src) - альтернативный вариант написания пути к файлам при создании переменных
		.pipe(concat('vendor.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./app/assets/js'));
});

/* Fonts-Vendor, объединение папок внешних библиотек
(merger fonts folders of libraries, plugins and frameworks) */
/*
gulp.task('fontsVendor', function(){
	return gulp.src(['./app/vendor/font-awesome/web-fonts-with-css/webfonts/*.*'])
	.pipe(gulp.dest('./app/assets/webfonts'));
});
 Для использования добавить в task build
*/

/* Предварительная очистка production-папки
(delete of production folder dist) */
gulp.task('clean', function () {
	return del('./dist');
});

/* Обработка изображений
(images optimization) */
gulp.task('img', function () {
	return gulp.src('./app/assets/img/**/*.*')
		.pipe(imagemin({use: [pngquant]}))
		.pipe(gulp.dest('./dist/assets/img'));
});

/* Production, формирование папки
(creating of production folder dist) */
gulp.task('dist', function () {
	const htmlDist = gulp.src('./app/*.html')
		.pipe(gulp.dest('./dist'));
	const cssDist = gulp.src('./app/assets/css/*.css')
		.pipe(gulp.dest('./dist/assets/css'));
	const jsDist = gulp.src('./app/assets/js/*.js')
		.pipe(gulp.dest('./dist/assets/js'));
	const fontsDist = gulp.src('./app/assets/fonts/*.*')
		.pipe(gulp.dest('./dist/assets/fonts'));
	return (htmlDist, cssDist, jsDist, fontsDist);
});

/* Сборка
(build) */
gulp.task('build', gulp.parallel('html', 'css', 'js', 'cssVendor', 'jsVendor'));

/* Разработка
(development) */
gulp.task('default', gulp.series('build', 'serve'));

/* Production
(production) */
gulp.task('public', gulp.series('clean', 'img', 'dist'));

