//Gulp Requires...
//Main
const gulp = require('gulp')

//CSS
const postcss = require('gulp-postcss')

//Google Closure Compiler
const closureCompiler = require('google-closure-compiler').gulp()

//Browsersync
const browserSync = require('browser-sync').create()

//Github pages
const ghpages = require('gh-pages');


//Tasks...
//HTML task
gulp.task('html', ()=> {
	return gulp.src('src/*.html')
		.pipe(gulp.dest('dist'))
})

//JS task
gulp.task('js', ()=> {
	return gulp.src('src/js/*.js')
		//Pipe in the Google Closure Compiler
		.pipe(closureCompiler({
			compilation_level: 'ADVANCED',
			js_output_file: 'app.min.js',
			debug: true
        }, {
        	platform: ['native', 'java', 'javascript']
        }))
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.stream())
})

//CSS task
gulp.task('css', ()=> {
	return gulp.src('src/css/*.css')
		.pipe(
			postcss([
				//PostCSS plugins
				require('autoprefixer'),
				require('postcss-preset-env')({
					stage: 1,
					browsers: 'last 2 versions'
				})
			])
		)
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream())
})

//Fonts task
gulp.task('fonts', ()=> {
	return gulp.src('src/fonts/*')
		.pipe(gulp.dest('dist/fonts'))
})


//Watch task (Browser Sync)
gulp.task('watch', ()=> {
	browserSync.init({
		server: {
			baseDir: 'dist/'
		}
	})

	gulp.watch('src/*.html', gulp.series('html'))
		.on('change', browserSync.reload)

	gulp.watch('src/js/', gulp.series('js'))
	gulp.watch('src/css/', gulp.series('css'))

})

//Deploy to Github pages
gulp.task('deploy', ()=> {
	return ghpages.publish('dist')
})

gulp.task('default', gulp.series('html','js','css','fonts','watch'))