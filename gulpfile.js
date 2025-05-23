import gulp from "gulp";
import concat from "gulp-concat";
import autoPrefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import uglify from "gulp-uglify";
import {deleteSync } from "del";
import browserSyncModule from "browser-sync";
import imagemin from "gulp-imagemin";
import gcmq from "gulp-group-css-media-queries";
import sourcemaps from "gulp-sourcemaps";
import babel from "gulp-babel";

// ✅ Initialize browserSync
const browserSync = browserSyncModule.create();

// ✅ Compile Sass
const sass = gulpSass(dartSass);

const paths = {
  styles: {
    src: './src/styles/main.scss',
    dest: './build/css'
  },
  scripts: {
    src: './src/js/**/*.js',
    dest: './build/js'
  },
  images: {
    src: './src/images/**/*',
    dest: './build/images'
  },
  html: {
    src: './src/*.html',
    dest: './build/'
  },
  deleteSync: './build/*'
};

// ✅ Styles task
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(gcmq())
    .pipe(concat("styles.css"))
    .pipe(autoPrefixer({
      overrideBrowserslist: ['> 1%', 'last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// Scripts task
async function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify({
      toplevel: true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

async function images() {
  return gulp.src(paths.images.src)
    .pipe(imagemin().on('error', function (err) {
      console.error(err.message);
    }))
    .pipe(gulp.dest(paths.images.dest));
}

// ✅ Clear task
function clean(done) {
  deleteSync([paths.deleteSync]);
  done(); 
}

// ✅ HTML task
function html() {
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// ✅ Watch task
function watch() {
  browserSync.init({
    server: {
      baseDir: './build'
    },
    tunnel: false,
    port: 5500
  });

  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch('./src/*.html', html);
  gulp.watch('./*.html').on('change', browserSync.reload);
}

// ✅ Register tasks
gulp.task('build', gulp.series(clean, gulp.parallel(html, styles, scripts, images)));
gulp.task('dev', gulp.series('build', watch));