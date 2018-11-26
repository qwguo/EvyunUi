const gulp = require('gulp'),
  less = require('gulp-less'),
  minifyCss = require('gulp-minify-css'),
  minifyJs = require('gulp-minify'),
  uglify = require('gulp-uglify'),
  connect = require('gulp-connect'),
  rename = require('gulp-rename'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  fileinclude = require('gulp-file-include'),
  path = require('path');

/*less编译*/
gulp.task('less', function () {
  return gulp.src(['./src/less/bootstrap.less', './src/project.less'])
    .pipe(sourcemaps.init())
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes')]
    }))
    .pipe(autoprefixer({
      browsers: ['last 4 versions'],
      cascade: true
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/css'));
});
// # 定义一个监控css文件变化的任务
gulp.task('lessCss', function () {
  gulp.watch('./src/**', ['less']);
});

/*css压缩*/
gulp.task('minifyCss', function () {
  return gulp.src(['./dist/css/*[!.min].css'])
    .pipe(rename({suffix: ".min"}))
    .pipe(minifyCss({keepSpecialComments: 1, keepBreaks: false, removeEmpty: true, debug: true}))
    .pipe(gulp.dest('./dist/css/'));
});
// # 定义一个监控css文件变化的任务
gulp.task('miniCss', function () {
  gulp.watch('./dist/css/*[!.min].css', ['minifyCss']);
});


gulp.task('miniScript', function() {
  gulp.src(['./src/js/*.js'])
    .pipe(uglify())
    .pipe(concat('all.js'))
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest('dist/js'))
});

// # 定义一个监控js文件变化的任务
gulp.task('miniJs', function () {
  gulp.watch('./src/js/*.js', ['miniScript']);
});

//html文件合并
gulp.task('fileinclude', function () {
  gulp.src(['./views/**', '!./views/include', '!./views/include/**'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('docs'));
});

// # 定义一个监控html文件变化的任务
gulp.task('htmlConcat', function () {
  gulp.watch(['./views/**/*.html','./views/*.html'], ['fileinclude']);
});

gulp.task('load', function () {
  gulp.src(['./docs/**']).pipe(connect.reload());
});


//定义livereload任务
gulp.task('connect', function () {
  connect.server({
    'livereload': true
  });
});
gulp.task('watch', function () {
  gulp.watch(['./docs/**', './dist/css/*.min.css'], ['load']);
});
gulp.task('default', ['watch', 'lessCss', 'miniCss', 'miniJs', 'htmlConcat', 'connect']);

