'use strict';

// Подключение плагинов через переменные (connection of plugins through variables):
var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    csso = require('gulp-csso'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    stylus = require('gulp-stylus'),
    pngquant = require('imagemin-pngquant'),
    pug = require('gulp-pug'),
    uglify = require('gulp-uglify');

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

// Подключение Browsersync (connection of Browsersync):
var browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

// Таск для работы Browsersync, автообновление браузера (Browsersync task, autoreload of browser):
gulp.task('serve', function(){
  browserSync.init({
    server: './app'
    // browser: 'firefox'
  });
  gulp.watch('./app/pug/**/*.pug', gulp.series('html'));
  gulp.watch(['./app/blocks/**/*.styl', './app/styl/**/*.styl'], gulp.series('css'));
  gulp.watch('./app/blocks/**/*.js', gulp.series('js'));
  gulp.watch('*.html').on('change', reload);
});

// Таск для работы Pug, преобразование Pug в HTML (Pug to HTML conversion task):
gulp.task('html', function(){
  return gulp.src('./app/pug/pages/*.pug')
    .pipe(plumber())
    .pipe(pug({pretty: true}))
    .pipe(gulp.dest('./app'))
    .pipe(browserSync.stream());
});

// Таск для преобразования Stylus-файлов в CSS (Stylus to CSS conversion):
gulp.task('css', function(){
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

// Таск для объединения и минификации пользовательских JS-файлов (task for merger and minification custom JS files)
gulp.task('js', function(){
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

// Таск для объединения и минификации CSS-файлов внешних библиотек (task for merger and minification CSS files of libraries, plugins and frameworks)
gulp.task('cssVendor', function(){
  return gulp.src([
    './app/vendor/normalize.css/normalize.css',
    './app/vendor/bootstrap/dist/css/bootstrap.min.css',
    './app/vendor/font-awesome/svg-with-js/css/fa-svg-with-js.css'
  ])
  .pipe(concat('vendor.min.css'))
  .pipe(csso())
  .pipe(gulp.dest('./app/assets/css'));
});

// Таск для объединения и минификации JS-файлов внешних библиотек (task for merger and minification JS files of libraries, plugins and frameworks)
gulp.task('jsVendor', function(){
  return gulp.src([
    './app/vendor/jquery/dist/jquery.min.js',
    './app/vendor/bootstrap/dist/js/bootstrap.min.js',
    './app/vendor/font-awesome/svg-with-js/js/fontawesome-all.min.js'
   ])   // return gulp.src(paths.app.vendor.js.src) - альтернативный вариант написания пути к файлам при создании переменных
  .pipe(concat('vendor.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('./app/assets/js'));
});

// Таск для объединения папок fonts внешних библиотек (task for merger fonts folders of libraries, plugins and frameworks)
// gulp.task('fontsVendor', function(){
//   return gulp.src([
//     './app/vendor/font-awesome/web-fonts-with-css/webfonts/*.*'
//   ])
//   .pipe(gulp.dest('./app/assets/webfonts'));
// });
// Для использования добавить в task build

// Таск для предварительной очистки (удаления) production-папки (task for delete of production folder dist):
gulp.task('clean', function(){
  return del('./dist');
});

// Таск для обработки изображений (images optimization task):
gulp.task('img', function(){
  return gulp.src('./app/assets/img/**/*.*')
    .pipe(imagemin({use: [pngquant]}))
    .pipe(gulp.dest('./dist/assets/img'));
});

// Таск для формирования production-папки (task for creating of production folder dist):
gulp.task('dist', function(){
  var htmlDist = gulp.src('./app/*.html')
    .pipe(gulp.dest('./dist'));
  var cssDist = gulp.src('./app/assets/css/*.css')
    .pipe(gulp.dest('./dist/assets/css'));
  var jsDist = gulp.src('./app/assets/js/*.js')
    .pipe(gulp.dest('./dist/assets/js'));
  var fontsDist = gulp.src('./app/assets/fonts/*.*')
    .pipe(gulp.dest('./dist/assets/fonts'));
  return htmlDist, cssDist, jsDist, fontsDist;
});

// Таск для сборки (build task):
gulp.task('build', gulp.parallel('html', 'css', 'js', 'cssVendor', 'jsVendor'));

// Таск для разработки (development task):
gulp.task('default', gulp.series('build', 'serve'));

// Таск для production (production task):
gulp.task('public', gulp.series('clean', 'img', 'dist'));