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
  path = require('path'),
  fs = require('fs'),
  iconv = require('iconv-lite'),
  utfToGbk = function(a, orUrl, tagUrl) {
    a.on('end', function () {
      fs.readFile(orUrl, 'utf-8', function (err, data) {
        var gbkCode = new Buffer(iconv.encode(data, 'gbk'));
        fs.writeFile(tagUrl, gbkCode, function (err) {
          if (err) {
            return;
          }
        });
      });
    });
  };
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
  var cssFlow = gulp.src(['./dist/css/*[!.min].css'])
    .pipe(rename({suffix: ".min"}))
    .pipe(minifyCss({keepSpecialComments: 1, keepBreaks: false, removeEmpty: true, debug: true}))
    .pipe(gulp.dest('./dist/css/'));
  utfToGbk(cssFlow, './dist/css/bootstrap.min.css', './use_version/css/bootstrap.min.css')
});
// # 定义一个监控css文件变化的任务
gulp.task('miniCss', function () {
  gulp.watch('./dist/css/*[!.min].css', ['minifyCss']);
});

/*gulp.task('rename', function(){
  gulp.src(['./src/less/animate/!**!/!*.css'])
    .pipe(rename({extname: ".less"}))
    .pipe(gulp.dest('./test/'))
});*/


/*gulp.task('miniScript', function() {
  gulp.src(['./src/js/!*.js'])
    .pipe(uglify())
    .pipe(concat('evPublicInit.js'))
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest('dist/js'))
});*/
const scriptSrc = require('./src/js/scriptSrc'),
  scriptArray = scriptSrc.src();
gulp.task('miniScript', function() {
  var jsFlow = gulp.src(scriptArray)
    .pipe(concat('evPublicInit.js'))
    .pipe(minifyJs())
    // .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest('dist/js'));
  utfToGbk(jsFlow, './dist/js/evPublicInit-min.js', './use_version/js/evPublicInit-min.js');
});

// # 定义一个监控js文件变化的任务
gulp.task('miniJs', function () {
  gulp.watch('./src/js/*.js', ['miniScript']);
});

//html文件合并
gulp.task('fileinclude', function () {
  gulp.src(['./views/**/*.html', '!./views/include', '!./views/include/**'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('docs'));
});

// # 定义一个监控html文件变化的任务
gulp.task('htmlConcat', function () {
  gulp.watch(['./views/**/*.html'], ['fileinclude']);
});

gulp.task('load', function () {
  gulp.src(['./docs/*.html']).pipe(connect.reload());
  // gulp.pipe(connect.reload());
});


//定义livereload任务
gulp.task('connect', function () {
  connect.server({
    'livereload': true
  });
});

gulp.task('popup', function(){
  //js
  var jsFlow = gulp.src(['./src/js/popup.js'])
    .pipe(uglify())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest('./dist/alone_module/popup'));
  utfToGbk(jsFlow, './dist/alone_module/popup/popup.min.js', './use_version/alone_module/popup/popup.min.js');
  // less - css
  gulp.src(['./src/less/alone_module/popup.less'])
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes')]
    }))
    .pipe(autoprefixer({
      browsers: ['last 4 versions'],
      cascade: true
    }))
    .pipe(gulp.dest('./dist/alone_module/popup'));
  // css - min
  var cssFlow = gulp.src(['./dist/alone_module/popup/popup.css'])
    .pipe(rename({suffix: ".min"}))
    .pipe(minifyCss({keepSpecialComments: 1, keepBreaks: false, removeEmpty: true, debug: true}))
    .pipe(gulp.dest('./dist/alone_module/popup'));
  utfToGbk(cssFlow, './dist/alone_module/popup/popup.min.css', './use_version/alone_module/popup/popup.min.css');
});
gulp.task('datePicker', function(){
  //js
  var jsFlow = gulp.src(['./src/js/moment.js', './src/js/datepicker.all.js'])
    .pipe(concat('datepicker.js'))
    .pipe(uglify())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest('./dist/alone_module/datepicker'));
  utfToGbk(jsFlow, './dist/alone_module/datepicker/datepicker.min.js', './use_version/alone_module/datepicker/datepicker.min.js');
  // less - css
  gulp.src(['./src/less/alone_module/datepicker.less'])
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes')]
    }))
    .pipe(autoprefixer({
      browsers: ['last 4 versions'],
      cascade: true
    }))
    .pipe(gulp.dest('./dist/alone_module/datepicker/'));
  // css - min
  var cssFlow = gulp.src(['./dist/alone_module/datepicker/datepicker.css'])
    .pipe(rename({suffix: ".min"}))
    .pipe(minifyCss({keepSpecialComments: 1, keepBreaks: false, removeEmpty: true, debug: true}))
    .pipe(gulp.dest('./dist/alone_module/datepicker'));
  utfToGbk(cssFlow, './dist/alone_module/datepicker/datepicker.min.css', './use_version/alone_module/datepicker/datepicker.min.css');

});


gulp.task('watch', function () {
  gulp.watch(['./docs/**', './dist/css/*.min.css'], ['load']);
});
gulp.task('default', ['watch', 'lessCss', 'miniCss', 'miniJs', 'htmlConcat', 'connect']);

