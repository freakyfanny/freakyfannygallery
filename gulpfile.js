'use strict';

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    webpack = require('webpack'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber'),
    autoprefixer = require('gulp-autoprefixer'),
    maps = require('gulp-sourcemaps'),
    del = require('del'),
    minify = require('gulp-cssmin'),
    typescript = require('gulp-typescript'),
    exec = require('child_process').exec;

var app = {
	name: 'Freakyfanny Gallery',
	theme: 'freakyfanny',
	src: './src',
	tmp: './.tmp_src',
	dst: './dist',
	dst_assets: './dist/assets',
	assets_path: './src/assets',
	versions: {
		app: '0.0.1',
		iconfont: "1",
	}
};

var config = {
  sasspath: 'src/scss',
  apppath: 'src/app',
  distpath: 'dist',
  distapppath: 'dist/assets/app',  
  distcsspath: 'dist/assets/css',
  distimagespath: 'dist/assets/images',
  distfontpath: 'dist/assets/fonts',
  distlib : 'dist/lib/',
  distlangpath: 'dist/lang_files',
  distconfigpath: 'dist/config',
  tsconfigpath: "tsconfig.json"
};

gulp.task('webpack', function(callback) {
    webpack(require('./config/webpack.dev.js'),
        function(err, stats) {
            if (err) throw new gutil.PluginError("webpack", err);
            gutil.log("[webpack]", stats.toString({
                chunks: false,
                colors: true
            }));
            callback();
        });
});

gulp.task('concatscripts', function(){
   gulp.src([
       'src/app/*.ts'])
   .pipe(typescript(typescript.createProject(config.tsconfigpath)))
   .pipe(gulp.dest(config.distapppath));
});

gulp.task('minifyscripts', function(){
    return gulp.src(config.distapppath + "app.js")
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest(config.distapppath));
    });

gulp.task('compilesass', function(){
    return gulp.src(config.sasspath + '/main.scss')
      .pipe(plumber())
      .pipe(maps.init())
      .pipe(sass())
      .pipe(autoprefixer('last 1 version'))
      .pipe(maps.write('./'))      .pipe(gulp.dest(config.distcsspath))
      .pipe(minify())      
      .pipe(rename({suffix:'.min'}))
      .pipe(gulp.dest(config.distcsspath));
});

gulp.task('handlescripts', ['webpack']);

gulp.task('dist', ['handlescripts', 'compilesass', 'handlelang', 'handleconfig'], function() {
  return    gulp.src(['src/img/**'] , { base: ''}). 
                    pipe(gulp.dest(config.distimagespath))  &&
            gulp.src(['src/scss/main.css'], { base: '' }).
                    pipe(gulp.dest(config.distcsspath)) &&
            gulp.src(['index.html'], { base: './'}) 
                    .pipe(gulp.dest(config.distpath));
});

gulp.task("default", ["clean"], function() {
  console.log("welcome to this application, we gonna build an awesome formbuilder");

  gulp.start('dist');
});

gulp.task('clean', function() {
  del([config.distpath, config.distcsspath + '/main.css*', config.distapppath + '/app*.js*']);    
  del([config.apppath + '/app*.js*']);
});

gulp.task('serve', ['watch','runnode']);

gulp.task('watch', function() {
  gulp.watch('src/scss/**/*.scss', ['compilesass']);
  gulp.watch('lang_files/*', ['handlelang']);
  gulp.watch('src/config/*', ['handleconfig']);
  var webpackConfig = require('./config/webpack.dev.js');
  webpackConfig.watch = true;
  webpack(webpackConfig, function(err, stats) {
      if (err) throw new gutil.PluginError("webpack", err);
      gutil.log("[webpack]", stats.toString({
          chunks: false,
          colors: true
      }));
  });
});

gulp.task('runnode', function (callback) {
    exec('node server.js', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        callback(err);
    });
});

gulp.task('handlelang', function() {
    gulp.src(['lang_files/*'])
        .pipe(gulp.dest(config.distlangpath));
})

gulp.task('handleconfig', function() {
    gulp.src(['src/config/*'])
        .pipe(gulp.dest(config.distconfigpath));
})