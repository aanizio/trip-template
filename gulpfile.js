'use strict';

const { src, dest, series, watch } = require('gulp'),
  pug = require('gulp-pug'),
  pugLocals = require('./src/_data/site.json'),
  clean = require('gulp-clean'),
  bSync = require('browser-sync').create(),
  sass = require('gulp-sass'),
  sassGlob = require('gulp-sass-glob'),
  postcss = require('gulp-postcss'),
  cssnano = require('gulp-cssnano'),
  rename = require('gulp-rename'),
  autoprefixer = require('autoprefixer'),
  imagemin = require('gulp-imagemin');

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
  return src('src/pug/pages/*.pug')
    .pipe(pug({
      locals: pugLocals,
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
    .pipe(imagemin({
      verbose: true,
    }))
    .pipe(dest('dist/images'));
}

const buildSite = series(cleanDistDir, buildHTML, buildCSS, buildImages);

function serveAndWatch() {
  browserSync();
  watch('src/**/*', buildSite);
}

exports.default = buildSite;
exports.serve = browserSync;
exports.watch = serveAndWatch;