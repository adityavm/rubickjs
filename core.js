/**
 * rubickjs
 */

"use strict";

(function(win){
	var Rubick = {};
	win.r = win.Rubick = Rubick;

	/**
	 * Observer class
	 */
	r.Observer = function(){ }
	r.Observer._class = "Observer";
	var ro = r.Observer.prototype;
	ro.on = function(ev, cb){
		if(!this._events) this._events = {};
		if(!this._events[ev])
			this._events[ev] = [];

		this._events[ev].push(cb);
	}
	ro.emit = function(ev, obj) {
		if(!this._events[ev]) return;

		var cbs = this._events[ev];
		for(var i=0;i<cbs.length;i++) {
			var cb = cbs[i];
			if(cb) {
				cb(obj);
			}
		}
	}

	/**
	 * Inheritance boilerplate
	 */
	r.Extend = function(c, superC){
		if(!superC._class){
			throw new Error("Class cannot be inherited. Define _class.");
			return;
		}

		c.prototype = Object.create(superC.prototype);
		c.prototype._inherits  = superC.prototype._inherits || [];
	  c.prototype._inherits.push(superC._class);
		return c.prototype;
	}

	/**
	 * Utility methods
	 */

	r.$ = function(el){
		return document.querySelector(el);
	}

	r.$$ = function(els){
		return document.querySelectorAll(els);
	}
})(window);
