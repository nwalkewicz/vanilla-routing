'use strict';

/**
 * @param {Number} ms Time in milliseconds before returning a promise.
 */
 function wait(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

class RouterAnimation {
	/**
	 * @param {Function} steps Code to be run when calling the animation
	 * @param {Number} time Time in milliseconds before continuing
	 * @param {Function} then Code to be run after timeout
	 */
	constructor(steps, time, then) {
		this.steps = steps;
		this.time = time;
		this.then = then;
	}

	/**
	 * Returns a fulfilled promise after animation is complete
	 * @returns {Promise}
	 */
	show() {
		return new Promise(resolve => {
			this.steps();
			wait(resolve, this.time)
				.then(this.then);
		});
	}
}

/**
 * @param {HTMLElement} target Target element
 * @param {String} html Code to replace the target
 * @param {Object} cache If not null, dumps passed data to localStorage.cache
 * @param {Array.<RouterAnimation>} animations Animations to be run
 */
async function routePage(target, html, animations, cache=null) {
	// Cache current page data if necessary (if electron, clear localStorage.cache each time app starts; otherwise, idk)
	// Await animation
	if (animations) animations.forEach(anim => {
		await anim.show();
	});
	// Route new page
	target.innerHTML = html;
}

module.exports = {
	routePage
}
