// =================================================================================================
// plugin
// =================================================================================================
var fs = require('fs');
var browserSync = require('browser-sync');
var del = require('del');
var gulp = require('gulp');
var marked = require('marked');
var mkdirp = require('mkdirp');
var path = require('path');
var runSequence = require('run-sequence');
var webpack = require('webpack-stream');
var webpackConfig = require('./webpack.config.js');
var fontAwesome = require('node-font-awesome');
var $ = require('gulp-load-plugins')();
// =================================================================================================
// setup
// =================================================================================================
var relativePath = true;
var sitemap = true;
var filepath = {
	dst: {
		src: 'src/',
		dev: 'dst/',
		test: '../test/',
		stage: '../stage/',
		prod: '../prod/'
	},
	common: {
		all: 'common/**/*',
		css: 'common/css/',
		js: 'common/js/',
		img: 'common/img/',
		font: 'common/font/',
		sass: 'common/sass/',
		icon: 'common/icon/'
	},
	json: {
		src: 'src/_data/**/*.json',
		watch: ['src/_data/**/*.json', 'src/**/*.md', '!src/styleguide/**/*.md'],
		post: {
			src: ['src/**/*.md', '!src/styleguide/**/*.md']
		}
	},
	html: {
		watch: ['src/_data.json', 'src/**/*.ejs'],
		page: {
			src: ['src/page/**/*.ejs', '!src/page/_**/*', '!src/page/**/_*.ejs'],
			testSrc: ['src/page/**/*.ejs', '!src/page/_**/*', '!src/page/**/_*.ejs', '!src/page/dev/**/*']
		},
		post: {
			src: 'src/page/'
		},
	},
	font: {
		designSrc: 'design/icon/**/*.svg',
		designDst: 'src/common/icon/',
		iconSrc: 'src/common/icon/*.svg',
		iconDst: 'src/common/font/',
		src: 'src/common/font/**/*',
		dst: 'dst/common/font/',
		watch: ['src/common/font/**/*', 'src/common/icon/**', 'design/icon/**', 'src/common/icon/**/*.svg', '!design/**/*.+(psd|ai)']
	},
	sass: {
		src: ['src/common/sass/app.scss'],
		vendorSrc: ['src/common/sass/vendor.scss'],
		foundationSrc: ['src/common/sass/foundation.scss'],
		foundationWatch: ['src/common/sass/foundation/**/*', '!src/common/sass/component/_icon.scss'],
		componentSrc: ['src/common/sass/component.scss'],
		componentWatch: ['src/common/sass/foundation/**/*', 'src/common/sass/component/**/*', '!src/common/sass/component/_icon.scss'],
		projectSrc: ['src/common/sass/project.scss'],
		projectWatch: ['src/common/sass/**/*', '!src/common/sass/scope/dev/**/*', '!src/common/sass/utility/**/*', '!src/common/sass/component/_icon.scss'],
		utilitySrc: ['src/common/sass/utility.scss'],
		utilityWatch: ['src/common/sass/foundation/**/*', 'src/common/sass/utility/**/*', '!src/common/sass/component/_icon.scss'],
		devSrc: ['src/common/sass/dev.scss'],
		devWatch: ['src/common/sass/scope/dev/**/*', '!src/common/sass/component/_icon.scss']
	},
	styleGuide: {
		src: 'src/styleguide/aigis_config.yml',
		watch: ['dst/common/css/**/*', 'src/styleguide/**/*', '!dst/common/css/dev.css', '!src/common/sass/component/_icon.scss']
	},
	js: {
		src: 'src/common/js/*.js',
		watch: ['src/common/js/**/*.js', 'webpack.config.js']
	},
	img: {
		designSrc: ['design/**/*.+(jpg|jpeg|png|gif|svg)', '!design/icon/**/*'],
		designDst: 'src/common/img/',
		src: 'src/common/img/**/*.+(jpg|jpeg|png|gif|svg)',
		dst: 'dst/common/img/',
		watch: ['src/common/img/**', 'src/common/img/**/*.+(jpg|jpeg|png|gif|svg)', 'design/**', 'design/**/*.+(jpg|jpeg|png|gif|svg)', '!design/**/*.+(psd|ai)', '!design/icon']
	},
	browserSync: {
		watch: ['dst/**/*']
	}
}
var cleanFile = ['src/_data.json', 'src/_data/_post.json', 'src/common/sass/foundation/_icon.scss', 'src/common/font/icon.*', 'src/common/font/**', 'src/common/sass/foundation/mixin/_icon.scss', 'src/common/sass/component/_icon.scss', 'dst/', '../test/'];
// =================================================================================================
// json
// =================================================================================================
gulp.task('json', ['jsonData'], function() {
	return jsonData = JSON.parse(fs.readFileSync('src/_data.json'));
});
gulp.task('jsonData', ['jsonPost'], function() {
	var src = filepath.json.src;
	var dst = filepath.dst.src;
	return gulp.src(src).pipe($.mergeJson({
		fileName: '_data.json'
	})).pipe(gulp.dest(dst));
});
gulp.task('jsonPost', function() {
	var src = filepath.json.post.src;
	var dst = filepath.dst.src + '_data';
	return gulp.src(src).pipe($.util.buffer()).pipe($.markdownToJson(marked, '_post.json')).pipe(gulp.dest(dst));
});
// =================================================================================================
// html
// =================================================================================================
gulp.task('html', function(cb) {
	runSequence('json', 'fileSetup', 'page', 'post', cb);
});
// -----------------------------------------------
// fileSetup
// -----------------------------------------------
gulp.task('fileSetup', function() {
	var ejsDst = filepath.dst.src + 'page/';
	var sassDst = filepath.dst.src + filepath.common.sass;
	var imgDst = filepath.dst.src + filepath.common.img;
	var dirname = path.dirname;

	function appendFile(path, contents, cb) {
		fs.access(path, function(err) {
			if(err) {
				mkdirp(dirname(path), function(err) {
					if(err) return cb(err)
					fs.appendFileSync(path, contents, cb)
				})
			}
		})
	};

	function appendDir(path, cb) {
		fs.access(path, function(err) {
			if(err) {
				mkdirp(path, function(err) {
					if(err) return cb(err)
				})
			}
		})
	};
	// page
	// ----------------------
	var sassBaseArray = [];
	for(var key in jsonData.page) {
		var dataPath = key;
		var dataPathArray = dataPath.split('/');
		var dataHierarchy = ejsHierarchy(dataPathArray);
		var dataName = dataPathArray[dataPathArray.length - 1];
		var dataDir = '';
		for(var i in dataPathArray) {
			if(i != dataPathArray.length - 1) {
				dataDir += dataPathArray[i] + '/';
			}
		}
		if(sassBaseArray.indexOf(dataDir) == -1) {
			sassBaseArray.push(dataDir);
		}
		// ejs
		var ejscode = jsonData.fileSetup.ejscode.replace(/filename/g, dataPath).replace(/fileHierarchy/g, ejspath).replace(/(\r\n)/g, '\n');
		appendFile(ejsDst + dataPath + '.ejs', ejscode, function(err) {
			if(err) throw err;
		});
		// sass
		if(dataPathArray.length == 1) {
			var sasscode = jsonData.fileSetup.sasscode.replace('modifier', "data-modifier='" + dataName + "'").replace(/(\r\n)/g, '\n');
			appendFile(sassDst + 'scope/_' + dataName + '.scss', sasscode, function(err) {
				if(err) throw err;
			});
		} else {
			var modifierArray = dataPathArray;
			modifierArray.pop();
			var baseModifier = '';
			for(var c in modifierArray) {
				if(c != modifierArray.length - 1) {
					baseModifier += modifierArray[c] + ' ';
				} else {
					baseModifier += modifierArray[c];
				}
			}
			var sasscode = jsonData.fileSetup.sasscode.replace(/filename/g, dataPath).replace('modifier', "data-modifier='" + baseModifier + ' ' + dataName + "'").replace(/(\r\n)/g, '\n');
			appendFile(sassDst + 'scope/' + dataDir + '_' + dataName + '.scss', sasscode, function(err) {
				if(err) throw err;
			});
		}
		// img
		appendDir(imgDst + 'scope/' + dataPath, function(err) {
			if(err) throw err;
		});
	}
	for(var i in sassBaseArray) {
		var dataDir = sassBaseArray[i];
		var baseModifier = dataDir.slice(0, -1);
		if(baseModifier) {
			var sasscode = jsonData.fileSetup.sasscode.replace(/filename/g, dataDir + 'base').replace('modifier', "data-modifier^='" + baseModifier + "'").replace(/(\r\n)/g, '\n');
			appendFile(sassDst + 'scope/' + dataDir + '_base.scss', sasscode, function(err) {
				if(err) throw err;
			});
		}
	}
	// post
	// ----------------------
	for(var key in jsonData.post) {
		var dataPath = jsonData.post[key].filename;
		// sass
		appendDir(imgDst + 'post/' + dataPath, function(err) {
			if(err) throw err;
		});
	}
	// module
	// ----------------------
	for(var i in jsonData.module) {
		var dataPath = jsonData.module[i];
		var dataPathArray = dataPath.split('/');
		var dataHierarchy = ejsHierarchy(dataPathArray);
		var ejspath = "ejspath = '../" + dataHierarchy + "'";
		var classname = dataPath.replace(/\//g, '-');
		// ejs
		var ejscode = jsonData.fileSetup.modEjscode.replace(/filename/g, dataPath).replace(/fileHierarchy/g, ejspath).replace(/classname/g, classname).replace(/(\r\n)/g, '\n');
		appendFile(ejsDst + '_module/' + dataPath + '.ejs', ejscode, function(err) {
			if(err) throw err;
		});
		// sass
		var sasscode = jsonData.fileSetup.modSasscode.replace(/filename/g, dataPath).replace(/classname/g, classname).replace(/(\r\n)/g, '\n');
		appendFile(sassDst + 'module/_' + dataPath + '.scss', sasscode, function(err) {
			if(err) throw err;
		});
		// img
		appendDir(imgDst + 'module/' + dataPath, function(err) {
			if(err) throw err;
		});
	}
	// template, layout
	// ----------------------
	for(var i in jsonData.template) {
		var dataPath = jsonData.template[i];
		var dataPathArray = dataPath.split('/');
		var dataHierarchy = ejsHierarchy(dataPathArray);
		var ejspath = "ejspath = '../" + dataHierarchy + "'";
		var tempModifier = dataPath.replace(/\//g, ' ');
		// ejs
		var ejscode = jsonData.fileSetup.templateEjscode.replace(/filename/g, dataPath).replace(/fileHierarchy/g, ejspath).replace(/(\r\n)/g, '\n');
		appendFile(ejsDst + '_template/' + dataPath + '.ejs', ejscode, function(err) {
			if(err) throw err;
		});
		// sass
		var sasscode = jsonData.fileSetup.layoutSasscode.replace(/filename/g, dataPath).replace(/tempModifier/g, tempModifier).replace(/(\r\n)/g, '\n');
		appendFile(sassDst + 'layout/_' + dataPath + '.scss', sasscode, function(err) {
			if(err) throw err;
		});
		// img
		appendDir(imgDst + 'layout/' + dataPath, function(err) {
			if(err) throw err;
		});
	}
});
// -----------------------------------------------
// page
// -----------------------------------------------
gulp.task('page', function() {
	if(dev == true) {
		var src = filepath.html.page.src;
	} else {
		var src = filepath.html.page.testSrc;
	};
	var dst = dstDir;
	var pages = JSON.parse(fs.readFileSync('src/_data.json')).page;
	var posts = JSON.parse(fs.readFileSync('src/_data.json')).post;
	return gulp.src(src).pipe($.plumber({
		errorHandler: $.notify.onError('<%= error.message %>')
	})).pipe($.data(function(file) {
		var filename = file.path.replace(/.*page\/(.*)\.ejs/, '$1');
		var parentArray = filename.split('/');
		var hierarchy = ejsHierarchy(parentArray);
		var data = [];
		data['filename'] = filename;
		data['page'] = ejsPages(pages, hierarchy);
		data['post'] = ejsPosts(posts, hierarchy);
		data['path'] = ejsCommon(hierarchy);
		data['ejspath'] = ejsPath(parentArray);
		data['parent'] = ejsParent(parentArray);
		data['site'] = jsonData.site;
		data['contents'] = jsonData.contents;
		data['dev'] = dev;
		Object.assign(data, pages[filename]);
		data = pagedataCheck(data, filename);
		return data;
	})).pipe($.ejs()).pipe($.rename({
		extname: '.html'
	})).pipe($.prettify({
		indent_char: '\t',
		indent_size: 1
	})).pipe(gulp.dest(dst));
});
// -----------------------------------------------
// post
// -----------------------------------------------
gulp.task('post', function() {
	var dst = dstDir;
	for(var key in jsonData.post) {
		var data = jsonData.post[key];
		var template = data.template;
		var filename = data.filename;
		var src = filepath.html.post.src + template + '.ejs';
		var pages = JSON.parse(fs.readFileSync('src/_data.json')).page;
		var posts = JSON.parse(fs.readFileSync('src/_data.json')).post;
		var parentArray = filename.split('/');
		var hierarchy = ejsHierarchy(parentArray);
		data['filename'] = filename;
		data['page'] = ejsPages(pages, hierarchy);
		data['post'] = ejsPosts(posts, hierarchy);
		data['path'] = ejsCommon(hierarchy);
		data['ejspath'] = ejsPath(parentArray);
		data['parent'] = ejsParent(parentArray);
		data['file'] = filename;
		data['site'] = jsonData.site;
		data['contents'] = jsonData.contents;
		data['dev'] = dev;
		data = postdataCheck(data, filename);
		gulp.src(src).pipe($.plumber({
			errorHandler: $.notify.onError('<%= error.message %>')
		})).pipe($.ejs(data)).pipe($.rename(filename + '.html')).pipe($.prettify({
			indent_char: '\t',
			indent_size: 1
		})).pipe($.changed(dst, {
			hasChanged: $.changed.compareSha1Digest
		})).pipe(gulp.dest(dst));
	}
});
// -----------------------------------------------
// function
// -----------------------------------------------
var ejsHierarchy = function(parentArray) {
	if(relativePath) {
		var hierarchy = '';
		if(parentArray.length != 1) {
			for(var key in parentArray) {
				if(key != 0) {
					hierarchy += '../';
				}
			}
		}
	} else {
		var hierarchy = '/';
	}
	return hierarchy;
}
var ejsPages = function(pages, hierarchy) {
	var url;
	for(var key in pages) {
		if(relativePath) {
			url = hierarchy + key + '.html';
		} else {
			url = url.replace('index.html', '');
		}
		pages[key].url = url;
	}
	return pages;
}
var ejsPosts = function(posts, hierarchy) {
	for(var key in posts) {
		var post = posts[key];
		var filename = post.filename;
		post.url = hierarchy + filename + '.html';
		if(!post.date) {
			post.date = post.updatedAt.replace(/T.*$/, '');
		}
		if(!post.cat) {
			var cat = '';
			var catArray = filename.split('/');
			if(catArray != 1) {
				for(var catKey in catArray) {
					if(catKey != catArray.length - 1) {
						cat += catArray[catKey] + '/';
					}
				}
				cat = cat.slice(0, -1);
				post.cat = cat;
			}
		}
	}
	return posts;
}
var ejsParent = function(parentArray) {
	var filename;
	var parents = [];
	if(parentArray.length == 1) {
		if(parentArray == 'index') {
			return parents;
		} else {
			parents.push('index');
			return parents;
		}
	} else {
		parents.push('index');
		parentArray.forEach(function(value, key) {
			if(key == 0) {
				filename = value;
				parents.push(filename + '/index');
			} else if(value == 'index') {
				return parents;
			} else {
				filename += '/' + value;
				parents.push(filename + '/index');
			}
		});
		parents.pop();
		return parents;
	}
}
var ejsCommon = function(hierarchy) {
	var common = {
		css: hierarchy + filepath.common.css,
		img: hierarchy + filepath.common.img,
		js: hierarchy + filepath.common.js
	}
	return common;
}
var ejsPath = function(parentArray) {
	var hierarchy = '';
	if(parentArray.length != 1) {
		for(var key in parentArray) {
			if(key != 0) {
				hierarchy += '../';
			}
		}
	}
	return hierarchy;
}
var pagedataCheck = function(data, filename) {
	var pagedata = data;
	if(!pagedata.description) {
		pagedata.description = jsonData.site.description;
	}
	if(!pagedata.pageModifier) {
		pagedata.pageModifier = '';
		var pageModifierArray = filename.split('/');
		for(var i in pageModifierArray) {
			if(i != pageModifierArray.length - 1) {
				pagedata.pageModifier += pageModifierArray[i] + ' ';
			} else {
				pagedata.pageModifier += pageModifierArray[i];
			}
		}
	}
	return pagedata;
}
var postdataCheck = function(data, filename) {
	var postdata = data;
	if(!postdata.keyword) {
		postdata.keyword = postdata.site.keyword;
	}
	if(!postdata.description) {
		postdata.description = postdata.site.description;
	}
	if(!postdata.date) {
		postdata.date = postdata.updatedAt.replace(/T.*$/, '');
	}
	if(!postdata.pageModifier) {
		var pageModifierArray = filename.split('/');
		var pageModifier = '';
		for(var i in pageModifierArray) {
			if(i != pageModifierArray.length - 1) {
				pageModifier += pageModifierArray[i] + ' ';
			} else {
				pageModifier += pageModifierArray[i];
			}
		}
		postdata.pageModifier = pageModifier;
	}
	return postdata;
}
// =================================================================================================
// font
// =================================================================================================
gulp.task('font', ['designIconDst', 'icon', 'fontAwesome'], function() {
	var src = filepath.font.src;
	var dst = filepath.font.dst;
	return gulp.src(src).pipe($.plumber({
		errorHandler: $.notify.onError('Error: <%= error.message %>')
	})).pipe($.changed(dst)).pipe(gulp.dest(dst));
});
// -----------------------------------------------
// fontAwesome
// -----------------------------------------------
gulp.task('fontAwesome', function() {
	var dst = filepath.font.iconDst;
	var fontAwewome = [
		fontAwesome.fonts
	];
	return gulp.src(fontAwewome).pipe($.changed(dst)).pipe(gulp.dest(dst));
});
// -----------------------------------------------
// icon
// -----------------------------------------------
gulp.task('icon', function() {
	var src = filepath.font.iconSrc;
	var dst = filepath.font.iconDst;
	var fontName = 'icon';
	var template = filepath.dst.src + filepath.common.icon + '_icon.scss';
	var scss = '../sass/component/_icon.scss';
	var fontPath = '../font/'
	return gulp.src(src).pipe($.svgmin()).pipe($.iconfontCss({
		fontName: fontName,
		path: 'src/common/icon/_icon.scss',
		targetPath: scss,
		fontPath: fontPath
	})).pipe($.iconfont({
		fontName: fontName,
		formats: ['ttf', 'eot', 'woff', 'svg'],
		appendCodepoints: false
	})).pipe(gulp.dest(dst));
});
// -----------------------------------------------
// designIconDst
// -----------------------------------------------
gulp.task('designIconDst', function() {
	var src = filepath.font.designSrc;
	var dst = filepath.font.designDst;
	return gulp.src(src).pipe($.rename(function(path) {
		path.dirname = '';
	})).pipe($.changed(dst)).pipe(gulp.dest(dst));
});
// =================================================================================================
// sass
// =================================================================================================
gulp.task('sass', ['font'], function() {
	var src = filepath.sass.src;
	var dst = dstDir + filepath.common.css;
	return gulp.src(src).pipe($.sourcemaps.init()).pipe($.plumber({
		errorHandler: $.notify.onError('Error: <%= error.message %>')
	})).pipe($.sassGlob()).pipe($.sass({
		includePaths: [
			fontAwesome.scssPath
		]
	})).pipe($.autoprefixer()).pipe($.cleanCss()).pipe($.sourcemaps.write('./')).pipe(gulp.dest(dst));
});
gulp.task('sassVendor', function() {
	var src = filepath.sass.vendorSrc;
	var dst = dstDir + filepath.common.css;
	return gulp.src(src).pipe($.plumber({
		errorHandler: $.notify.onError('Error: <%= error.message %>')
	})).pipe($.sassGlob()).pipe($.sass({
		includePaths: [
			fontAwesome.scssPath
		]
	})).pipe($.autoprefixer()).pipe(gulp.dest(dst));
});
gulp.task('sassFoundation', function() {
	var src = filepath.sass.foundationSrc;
	var dst = dstDir + filepath.common.css;
	return gulp.src(src).pipe($.plumber({
		errorHandler: $.notify.onError('Error: <%= error.message %>')
	})).pipe($.sassGlob()).pipe($.sass()).pipe($.autoprefixer()).pipe(gulp.dest(dst));
});
gulp.task('sassComponent', ['font'], function() {
	var src = filepath.sass.componentSrc;
	var dst = dstDir + filepath.common.css;
	return gulp.src(src).pipe($.plumber({
		errorHandler: $.notify.onError('Error: <%= error.message %>')
	})).pipe($.sassGlob()).pipe($.sass()).pipe($.autoprefixer()).pipe(gulp.dest(dst));
});
gulp.task('sassProject', function() {
	var src = filepath.sass.projectSrc;
	var dst = dstDir + filepath.common.css;
	return gulp.src(src).pipe($.plumber({
		errorHandler: $.notify.onError('Error: <%= error.message %>')
	})).pipe($.sassGlob()).pipe($.sass()).pipe($.autoprefixer()).pipe(gulp.dest(dst));
});
gulp.task('sassUtility', function() {
	var src = filepath.sass.utilitySrc;
	var dst = dstDir + filepath.common.css;
	return gulp.src(src).pipe($.plumber({
		errorHandler: $.notify.onError('Error: <%= error.message %>')
	})).pipe($.sassGlob()).pipe($.sass()).pipe($.autoprefixer()).pipe(gulp.dest(dst));
});
gulp.task('sassDev', function() {
	var src = filepath.sass.devSrc;
	var dst = dstDir + filepath.common.css;
	return gulp.src(src).pipe($.plumber({
		errorHandler: $.notify.onError('Error: <%= error.message %>')
	})).pipe($.sassGlob()).pipe($.sass()).pipe($.autoprefixer()).pipe(gulp.dest(dst));
});
// =================================================================================================
// styleGuide
// =================================================================================================
gulp.task('styleGuide', function() {
	var src = filepath.styleGuide.src;
	return gulp.src(src).pipe($.plumber({
		errorHandler: $.notify.onError('Error: <%= error.message %>')
	})).pipe($.aigis());
});
// =================================================================================================
// js
// =================================================================================================
gulp.task('js', function() {
	var src = filepath.js.src;
	var dst = dstDir + filepath.common.js;
	return gulp.src(src).pipe($.plumber({
		errorHandler: $.notify.onError('Error: <%= error.message %>')
	})).pipe(webpack(webpackConfig)).pipe(gulp.dest(dst));
});
// =================================================================================================
// img
// =================================================================================================
gulp.task('img', ['designImgDst'], function() {
	var src = filepath.img.src;
	var dst = filepath.img.dst;
	var imageminOptions = {
		optimizationLevel: 7
	}
	if(dev) {
		return gulp.src(src).pipe($.ignore.include({
			isFile: true
		})).pipe($.changed(dst)).pipe(gulp.dest(dst));
	} else {
		return gulp.src(src).pipe($.ignore.include({
			isFile: true
		})).pipe($.changed(dst)).pipe($.imagemin(imageminOptions)).pipe(gulp.dest(dst));
	}
});
// -----------------------------------------------
// designImgDst
// -----------------------------------------------
gulp.task('designImgDst', function() {
	var designSrc = filepath.img.designSrc;
	var designDst = filepath.img.designDst;
	return gulp.src(designSrc).pipe($.rename(function(path) {
		var filename = path.dirname.replace('-assets', '');
		path.dirname = filename;
	})).pipe($.changed(designDst)).pipe(gulp.dest(designDst));
});
// =================================================================================================
// robots
// =================================================================================================
gulp.task('robots', function() {
	return gulp.src(
		[filepath.dst.src + 'robots.txt'], {
			base: filepath.dst.src
		}).pipe($.changed(filepath.dst.dev)).pipe(gulp.dest(filepath.dst.dev));
});
// =================================================================================================
// browserSync
// =================================================================================================
gulp.task('browserSync', function() {
	return browserSync({
		server: {
			baseDir: dstDir
		},
		open: 'external',
		port: 9000,
		files: filepath.browserSync.watch
	});
});
// =================================================================================================
// test
// =================================================================================================
gulp.task('test', function() {
	return gulp.src(
		[filepath.dst.dev + filepath.common.font + '**/*', filepath.dst.dev + 'robots.txt'], {
			base: filepath.dst.dev
		}).pipe($.changed(filepath.dst.test)).pipe(gulp.dest(filepath.dst.test));
});
// =================================================================================================
// stage
// =================================================================================================
gulp.task('stage', function() {
	return gulp.src(
		[filepath.dst.test + '**/*', '!' + filepath.dst.test + filepath.common.css + 'app.css.map', '!' + filepath.dst.test + '_dev-sitemap.html'], {
			base: filepath.dst.test
		}).pipe($.changed(filepath.dst.stage)).pipe(gulp.dest(filepath.dst.stage));
});
// =================================================================================================
// prod
// =================================================================================================
gulp.task('prod', ['prodCopy'], function() {
	var jsonData = JSON.parse(fs.readFileSync('src/_data.json'));
	if(sitemap) {
		return gulp.src(filepath.dst.prod + '**/*.html', {
			read: false
		}).pipe($.sitemap({
			siteUrl: jsonData.site.url
		})).pipe(gulp.dest(filepath.dst.prod));
	} else {
		return gulp.src(filepath.dst.prod + '**/*.html', {
			read: false
		}).pipe(gulp.dest(filepath.dst.prod));
	}
});
gulp.task('prodCopy', function() {
	return gulp.src(
		[filepath.dst.stage + '**/*', '!' + filepath.dst.stage + 'robots.txt'], {
			base: filepath.dst.stage
		}).pipe($.changed(filepath.dst.prod)).pipe(gulp.dest(filepath.dst.prod));
});
// =================================================================================================
// devDstClean
// =================================================================================================
gulp.task('devDstClean', function(cb) {
	return del(cleanFile, {
		force: true
	});
});
// =================================================================================================
// watch
// =================================================================================================
gulp.task('watch', ['browserSync'], function() {
	gulp.watch(filepath.json.watch, ['json']);
	gulp.watch(filepath.html.watch, ['html']);
	gulp.watch(filepath.font.watch, ['font']);
	gulp.watch(filepath.sass.foundationWatch, ['sassFoundation']);
	gulp.watch(filepath.sass.componentWatch, ['sassComponent']);
	gulp.watch(filepath.sass.projectWatch, ['sassProject']);
	gulp.watch(filepath.sass.utilityWatch, ['sassUtility']);
	gulp.watch(filepath.sass.devWatch, ['sassDev']);
	gulp.watch(filepath.styleGuide.watch, ['styleGuide']);
	gulp.watch(filepath.js.watch, ['js']);
	gulp.watch(filepath.img.watch, ['img']);
});
// =================================================================================================
// DEVELOPMENT
// =================================================================================================
gulp.task('1 ============== DEVELOPMENT', function(cb) {
	dstDir = filepath.dst.dev;
	dev = true;
	runSequence('html', 'font', 'sassVendor', 'sassFoundation', 'sassComponent', 'sassProject', 'sassUtility', 'sassDev', 'styleGuide', 'js', 'img', 'robots', 'watch', 'browserSync', cb);
});
// =================================================================================================
// TEST
// =================================================================================================
gulp.task('2 ============== TEST', function(cb) {
	dstDir = filepath.dst.test;
	dev = false;
	runSequence('test', 'html', 'sass', 'js', 'img', 'browserSync', cb);
});
// =================================================================================================
// STAGE
// =================================================================================================
gulp.task('3 ============== STAGING', function(cb) {
	runSequence('stage', cb);
});
// =================================================================================================
// PRODUCTION
// =================================================================================================
gulp.task('4 ============== PRODUCTION', function(cb) {
	runSequence('prod', cb);
});
// =================================================================================================
// CLEAN-UP
// =================================================================================================
gulp.task('X ============== CLEAN-UP', function(cb) {
	runSequence('devDstClean');
});