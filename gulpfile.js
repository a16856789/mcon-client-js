var gulp = require('gulp');
var concat = require('gulp-concat');
var wrap = require('gulp-wrap');
var print = require('gulp-print');
var version = require('./package.json').version;

gulp.task('build', function() {
	return gulp.src([
		'node_modules/simple-msg-rpc/simple-msg-rpc.js',
		'node_modules/simple-msg-rpc/bean-invoker.js',
		'mcon-client.js'
	])
	.pipe(concat('mcon-client-all.js', {newLine: ';\n\n' 
		+ '// =============================================== //\n\n'}))
	.pipe(wrap(
		  '// version\n'
		+ 'window.__mcon_client_js_version = "' + version + '";\n'
		+ '\n'
		+ '// =============================================== //\n\n'
		+ '<%=contents%>'))
	.pipe(print())
	.pipe(gulp.dest('dest/browser'));
});

gulp.task('default', ['build'], function() {
});
