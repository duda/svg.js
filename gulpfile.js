var gulp    = require('gulp')
  , concat  = require('gulp-concat')
  , header  = require('gulp-header')
  , rename  = require('gulp-rename')
  , rimraf  = require('gulp-rimraf')
  , size    = require('gulp-size')
  , uglify  = require('gulp-uglify')
  , wrapper = require('gulp-wrapper')
  , jasmine = require('gulp-jasmine')
  , request = require('request')
  , fs      = require('fs')
  , pkg     = require('./package.json')

var headerLong = ['/*!'
  , '* <%= pkg.name %> - <%= pkg.description %>'
  , '* @version <%= pkg.version %>'
  , '* <%= pkg.homepage %>'
  , '*'
  , '* @copyright <%= pkg.author %>'
  , '* @license <%= pkg.license %>'
  , '*'
  , '* BUILT: <%= pkg.buildDate %>'
  , '*/'
  , ''].join('\n')

var headerShort = '/*! <%= pkg.name %> v<%= pkg.version %> <%= pkg.license %>*/'

// all files in the right order (currently we don't use any dependency management system)
var parts = [
  'src/svg.js'
, 'src/regex.js'
, 'src/utilities.js'
, 'src/default.js'
, 'src/color.js'
, 'src/array.js'
, 'src/pointarray.js'
, 'src/patharray.js'
, 'src/number.js'
, 'src/viewbox.js'
, 'src/element.js'
, 'src/fx.js'
, 'src/boxes.js'
, 'src/matrix.js'
, 'src/attr.js'
, 'src/transform.js'
, 'src/style.js'
, 'src/parent.js'
, 'src/container.js'
, 'src/transporter.js'
, 'src/relative.js'
, 'src/event.js'
, 'src/defs.js'
, 'src/group.js'
, 'src/arrange.js'
, 'src/mask.js'
, 'src/clip.js'
, 'src/gradient.js'
, 'src/pattern.js'
, 'src/doc.js'
, 'src/shape.js'
, 'src/symbol.js'
, 'src/use.js'
, 'src/rect.js'
, 'src/ellipse.js'
, 'src/line.js'
, 'src/poly.js'
, 'src/pointed.js'
, 'src/path.js'
, 'src/image.js'
, 'src/text.js'
, 'src/textpath.js'
, 'src/nested.js'
, 'src/hyperlink.js'
, 'src/marker.js'
, 'src/sugar.js'
, 'src/set.js'
, 'src/data.js'
, 'src/memory.js'
, 'src/selector.js'
, 'src/loader.js'
, 'src/helpers.js'
, 'src/polyfill.js'
]

gulp.task('clean', function() {
  return gulp.src('dist/*', { read: false }) // faster
    .pipe(rimraf())
})

/**
 * compile everything in /src to one file in the order defined in the MODULES constant
 * embed it in an immediate function call‏
 * uglify this file and call it svg.min.js
 * add the license information to the header plus the build time stamp‏
 */
gulp.task('unify', ['clean'], function() {
  pkg.buildDate = Date()
  return gulp.src(parts)
    .pipe(concat('svg.js', { newLine: '\n' }))
    // wrap the whole thing in an immediate function call
    .pipe(wrapper({ header:';(function() {\n', footer: '\n}).call(this);' }))
    .pipe(header(headerLong, { pkg: pkg }))
    .pipe(gulp.dest('dist'))
    .pipe(size({ showFiles: true, title: 'Full' }))
})

/**
 ‎* gzip the file and get it's size to display in the terminal‏
 * add the license info
 * show the gzipped file size
 */
gulp.task('minify', ['unify'], function() {
  return gulp.src('dist/svg.js')
    .pipe(uglify())
    .pipe(rename({ suffix:'.min' }))
    .pipe(size({ showFiles: true, title: 'Minified' }))
    .pipe(header(headerShort, { pkg: pkg }))
    .pipe(gulp.dest('dist'))
    .pipe(size({ showFiles: true, gzip: true, title: 'Gzipped' }))
})

/**
 ‎* rebuild documentation using documentup
 */

gulp.task('docs', function() {
  fs.readFile('README.md', 'utf8', function (err, data) {
    request.post(
      'http://documentup.com/compiled'
    , { form: { content: data, name: 'SVG.js', theme: 'v1' } }
    , function (error, response, body) {
        // Replace stylesheet
        body = body.replace('//documentup.com/stylesheets/themes/v1.css', 'svgjs.css')

        // Write file
        fs.writeFile('docs/index.html', body, function(err) {})
      }
    )
  })
})

gulp.task('default', ['clean', 'unify', 'minify'], function() {})





