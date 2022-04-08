'use strict';

const routerTarget = document.getElementById('routerTarget');
let routerLinks = document.querySelectorAll('[routerLink]');

/**
 * @param {HTMLElement} target 
 * @param {String} location Full href of desired path
 * @returns Inputted location
 */
function routePage(target, location) {
	let html;
	fetch(location, {
		cache: 'no-store',
		headers: {
			'Router-raw': 'true',
			'pragma': 'no-cache',
			'cache-control': 'no-cache'
		},
	})
		.then(data => data.text())
		.then(data => html = data)
		.catch(err => html = err)
		.finally(() => target.innerHTML = html);
		return location;
}

window.addEventListener('popstate', (e) => {
	console.log(e.path[0].location.href);
	routePage(routerTarget, e.path[0].location.href);
});

routerLinks.forEach(async link => {
	link.addEventListener('click', (e) => {
		e.preventDefault();
		window.history.pushState('', '', routePage(routerTarget, link.href));
	});
});
