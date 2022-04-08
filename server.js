'use strict';

// Imports
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const htmlParser = require('node-html-parser');
// const {routePage} = require('./src/router');

// Global functions
function readFile(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, (err, data) => {
			if (err) reject(err);
			resolve(data);
		});		
	});
}

// Paths
app.use((req, res, next) => {
	// Path prefix
	const prefix = 'public';

	// Error template
	function errTemplate(msg) {
		return `<h1 style="font-family:monospace;font-weight:400">Error</h1><div style="display:block;background:#faa;width:fit-content;padding:2px 4px;font-family:monospace;border-radius:2px">${msg}</div>`;
	}
	
	// If ends in 'index.html', redirect to last directory
	if (req.path.split('/').pop() === 'index.html') return res.redirect(path.join(...req.path.split('/').slice(0, -1)));
	
	// Find out if requested path is a directory or file
	if (req.path.split('/').pop() === '') {
		// Handle directory
		if (req.header('Router-raw') === 'true') {
			// Send raw html instead of full page
			readFile(path.join(__dirname, prefix, req.path, 'index.html'))
				.then(data => {
					data = data.toString();
					res.send(data);
				})
				.catch(() => {
					res.status(500);
					res.send(errTemplate('Error'));
				});
			return;
		}
		let parent;
		readFile(path.join(__dirname, 'src', 'components', 'main.html'))
			.then(d => parent = d.toString())
			.then(() => readFile(path.join(__dirname, prefix, req.path, 'index.html')))
			.then(data => {
				data = data.toString();
				const parsed = htmlParser.parse(parent);
				parsed.getElementById('routerTarget').innerHTML = data;
				res.send(parsed.toString());
			})
			.catch(err => {
				res.status(500);
				res.send(errTemplate(err.message));
			});
	} else {
		// Handle file
		readFile(prefix + req.path)
			.then(data => {
				data = data.toString();
				const fileExt = req.path.split('/').pop().split('.').pop();
				// MIME type handling
				switch(fileExt) {
					case 'css':
						res.type('text/css');
						break;
					case 'json':
						res.type('application/json');
						break;
					default:
						res.type('text/plain');
				}
				res.send(data);
			})
			.catch(err => {
				if (err.code === 'ENOENT') {
					// 404
				}
				let userCode = '';
				switch(err.code) {
					case 'ENOENT':
						// 404
						res.status(404);
						userCode = 'Page not found';
						break;
					default:
						// Assume 500 (for now)
						res.status(500);
						userCode = 'Internal server error';
				}
				res.send(errTemplate(userCode));
			});
	}
});

// Listen
app.listen(8599);
