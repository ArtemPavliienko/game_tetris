const gulp = require('gulp'),
      babel = require('gulp-babel'),
      sass = require('gulp-sass'),
      minifyCSS = require('gulp-csso'),
      rename = require('gulp-rename'),
      autoprefixer = require('gulp-autoprefixer'),
      browserSync = require('browser-sync').create(),
      image = require('gulp-image');


gulp.task('serve', ['sass', 'babel'], () => {
    browserSync.init({
        server: './project'
    });

    gulp.watch('./project/*.sass',['sass']);
    gulp.watch('./project/main.js',['babel']).on('change', browserSync.reload);
    gulp.watch('./project/*.html').on('change', browserSync.reload);
});

gulp.task('sass', () => {
    gulp.watch('./project/*.sass');
    gulp.src('./project/*.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 4 versions']
        }))
        .pipe(gulp.dest('./project/css/'))
        .pipe(browserSync.stream());
});

gulp.task('css', () => {
  gulp.src('./project/css/style.css')
    .pipe(minifyCSS())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./project/css/'))
});

gulp.task('babel', () => {
    gulp.src('./project/main.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest('./project/js/'))
});

gulp.task('image', () => {
    gulp.src('./project/img/**/*')
        .pipe(image())
        .pipe(gulp.dest('./project/img/'));
});


gulp.task('delCss', () => {
    return gulp.src('./project/css/style.css')  // исходник
        .pipe(uncss({
            html: ['./project/index.html']
        }))
        .pipe(gulp.dest('./project/css/')); // результат
});



gulp.task('default', ['serve']);

gulp.task('cssImg', ['css', 'image', 'delCss']);
