/* eslint max-len: 0, no-unused-vars: 0 */

// Require Gulp first
const gulp = require('gulp');
//  packageJson = require('./package.json'),
// Load plugins
const $ = require('gulp-load-plugins')({
  lazy: true,
});
// Static Web Server stuff
const browserSync = require('browser-sync');
// Testing
const server = browserSync.create();
// const reload = browserSync.reload;
const historyApiFallback = require('connect-history-api-fallback');
// postcss
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
// SASS
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
// Imagemin and Plugins
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
// const imageminGuetzli = require('imagemin-guetzli');
const imageminWebp = require('imagemin-webp');
// Accessibility
const axe = require('gulp-axe-webdriver');
// Utilities
const del = require('del');
// explicitly require eslint
const eslint = require('gulp-eslint');

/**
 * @name sass
 * @description SASS conversion task to produce development css with expanded syntax.
 *
 * We run this task against Dart SASS, not lib SASS.
 *
 * @see {@link http://sass-lang.com|SASS}
 * @see {@link http://sass-compatibility.github.io/|SASS Feature Compatibility}
 *
 * @return {string}
 */
gulp.task('sass', () => {
  return gulp.src('./src/sass/*.scss')
    .pipe($.sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./src/css'));
});

/**
 * @name processCSS
 *
 * @description Run autoprefixer and cleanCSS on the CSS files under ./src/css
 *
 * Moved from gulp-autoprefixer to postcss. It may open other options in the future
 * like cssnano to compress the files
 *
 * @see {@link https://github.com/postcss/autoprefixer|autoprefixer}
 *
 * @return {string}
 */
gulp.task('processCSS', () => {
  const plugins = [require('autoprefixer')];
  return gulp.src('./src/css/*.css')
    .pipe($.sourcemaps.init())
    .pipe(postcss(plugins))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./src/css'));
});

/*
UNCSS IS NOW A POSTCSS PLUGIN AND THEY
SUGGEST YOU USE IT WITH OTHER POSTCSS TOOLS
*/

/**
 * @name babel
 * @description Transpiles ES6 to ES5 using Babel. As Node and browsers support more of the spec natively this will move to supporting ES2016 and later transpilation
 *
 * It requires the `babel`and the `babel-preset-env` plugin
 *
 * @see {@link http://babeljs.io/|Babel}
 * @see {@link http://babeljs.io/docs/learn-es2015/|Learn ES2015}
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/|ECMAScript 2015 specification}
 * @return {void}
 */
gulp.task('babel', () => {
  return gulp.src('./src/scripts/**/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['@babel/preset-modules'],
    }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./src/js/'))
    .pipe($.size({
      pretty: true,
      title: 'Babel',
    }));
});

/**
 * @name eslintCheck
 * @description Runs eslint on all javascript files
 * @return {void}
 */
gulp.task('eslint', () => {
  return gulp.src(['scr/scripts/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

/**
 * @name imagemin
 * @description Reduces image file sizes. Doubly important if we'll choose to play with responsive images.
 *
 * Imagemin will compress jpg (using mozilla's mozjpeg), SVG (using SVGO) GIF and PNG images but WILL NOT create multiple versions for use with responsive images
 *
 * @see {@link https://github.com/postcss/autoprefixer|Autoprefixer}
 * @see {@link generateResponsive}
 * @return {void}
 */
gulp.task('imagemin', () => {
  return gulp.src('./src/images/originals/**/*.scss')

    .pipe(imagemin([
        imagemin.gifsicle({
          interlaced: true,
        }),
        imagemin.optipng({
          optimizationLevel: 5,
        }),
        imagemin.svgo({
          plugins: [{
              removeViewBox: true,
            },
            {
              cleanupIDs: false,
            }
          ],
        }),
        mozjpeg(),
        imageminWebp({
          quality: 85,
        }),
      ])
      .pipe(gulp.dest('./src/images')),
    );
});

/**
 * @name CopyAssets
 * @description Copies assets into the distribution directory.
 * MAKE SURE YOU CHANGE THIS TO MATCH YOUR PROJECT
 * @return {void}
 */
gulp.task('copyAssets', () => {
  return gulp.src([
      './src/**/*',
      '!./src/es6',
      '!./src/scss',
      '!./src/test',
      '!./src/cache-config.json',
      '!**/.DS_Store', // Mac specific directory we don't want to copy over
    ], {
      dot: true,
    }).pipe(gulp.dest('dist'))
    .pipe($.size({
      pretty: true,
      title: 'copy',
    }));
});

/**
 * @name clean
 * @description deletes specified files
 * @return {void}
 */
gulp.task('clean', () => {
  return del([
    'dist/',
    '.tmp',
    './src/html-content',
    './src/*.html',
    './src/pm-content',
    './src/pdf',
  ]);
});

/**
 * @name cleanCSS
 */
gulp.task('cleanCSS', () => {
  return del([
    'css/',
  ]);
});


/**
 * @name serve
 * @description Runs browsersync server on command and watches for file changes
 *
 * @param {*} done
 */
gulp.task('server', () => {
  server.init({
    server: {
      baseDir: './docs',
    },
  });
  gulp.watch('src/md-content/*.md', gulp.series('html'));
  gulp.watch('src/sass/**/*.scss', gulp.series('css'));
  gulp.watch('src/scripts/**/*.js', gulp.series('babel'));
});

/**
 * @name ceckAccessibility
 * @description Checks accessibility using gulp-axe-webdriver
 *
 */
gulp.task('checkAccessibility', () => {
    const options = {
      folderOutputReport: 'aXeReports',
      saveOutputIn: 'a11yReport.json',
      errorOnViolation: true,
      headless: true,
      rules: {},
      scriptTimeout: 60000,
      showOnlyViolations: false,
      tags: ['wcag2aa'],
      threshold: 0,
      urls: ['./src/**/*.html'],
      verbose: false,
    };
    return axe(options);
  }),

  /**
   * @name css
   * @description SASS and process CSS
   */
  gulp.task('css', gulp.series('cleanCSS', 'sass', 'processCSS'));

/**
 * @name defaultTask
 * @description uses clean, processCSS, build-template, imagemin and copyAssets to build the HTML content from Markdown source
 */
gulp.task('default', gulp.series('clean',
  gulp.parallel(
    'css',
    'imagemin',
    'copyAssets',
  ),
));

/*
This is the command to install the packages.
npm i -D gulp node-sass gulp-sourcemaps\
  @babel/core @babel/preset-modules \
  gulp-postcss autoprefixer \
  browser-sync connect-history-api-fallback \
  gulp-eslint eslint eslint-config-google \
  gulp-imagemin imagemin-mozjpeg imagemin-webp \
  del gulp-load-plugins gulp-newer \
  gulp-remarkable gulp-size  gulp-wrap \
  gulp-axe-webdriver gulp-sass
*/
