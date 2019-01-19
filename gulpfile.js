'use strict';

const { src, dest, series, watch } = require('gulp'),
  pug = require('gulp-pug'),
  clean = require('gulp-clean'),
  bSync = require('browser-sync').create(),
  sass = require('gulp-sass'),
  sassGlob = require('gulp-sass-glob'),
  postcss = require('gulp-postcss'),
  cssnano = require('gulp-cssnano'),
  rename = require('gulp-rename'),
  autoprefixer = require('autoprefixer'),
  imagemin = require('gulp-imagemin'),
  newer = require('gulp-newer');

function cleanDistDir() {
  return src('dist/', {read: false, allowEmpty: true})
    .pipe(clean());
}

function browserSync() {
  bSync.init({
    server: {
      baseDir: 'dist/',
    },
  })
}

function buildHTML() {
  delete require.cache[require.resolve('./src/_data/site.js')];
  return src('src/pug/pages/*.pug')
    .pipe(pug({
      locals: require('./src/_data/site.js'),
      pretty: true,
    }))
    .pipe(dest('dist/'))
    .pipe(bSync.stream());
}

function buildCSS() {
  return src('src/sass/main.scss')
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('dist/css'))
    .pipe(postcss([ autoprefixer() ]))
    .pipe(cssnano())
    .pipe(rename(path => {
      path.extname = '.min.css'
    }))
    .pipe(dest('dist/css'))
    .pipe(bSync.stream());
}

function buildImages() {
  return src('src/images/*')
    .pipe(newer('dist/images'))
    .pipe(imagemin({
      verbose: true,
    }))
    .pipe(dest('dist/images'));
}

function serveAndWatch() {
  browserSync();
  buildSite();
  watch('src/**/*', buildSite);
}

const buildSite = series(buildHTML, buildCSS, buildImages);

exports.default = buildSite;
exports.serve = browserSync;
exports.watch = serveAndWatch;
exports.clean = cleanDistDir;