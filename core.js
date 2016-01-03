/**
 * rubickjs
 */

"use strict";

(function(win){
	var Rubick = {};
	win.r = win.Rubick = Rubick;

	/**
	 * Internal + Utility methods
	 */

	r.extend = function(oldObj, newObj){
		r.forEach(Object.keys(newObj), function(i,v){
			oldObj[v] = newObj[v];
		});
		return oldObj;
	}

	r.forEach = function(arr, cb){
		if(!cb || typeof(cb)!=="function") return arr;
		var newArr = [];
		for(var i=0;i<arr.length;i++){
			var ret = cb(i,arr[i]);
			newArr.push(ret!==undefined ? ret : arr[i]);
		}
		return newArr;
	}

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
		if(!this._events || !this._events[ev]) return;

		var cbs = this._events[ev],
				bubble = true;
		for(var i=0;i<cbs.length;i++) {
			var cb = cbs[i];
			if(cb) {
				if(cb(obj) === false){
					bubble = false;
				}
			}
		}
		return bubble;
	}

	/**
	 * Inheritance boilerplate
	 */
	r.Inheritor = function(c, superC){
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
	 * AJAJ/AJAX methods
	 * adapted from reptile core
	 */
	r.xhr = function(url, cfg){
		cfg = r.extend({
			method: "post",
			async: true,
			contentType: "application/x-www-form-urlencoded"
		}, cfg);

		r.xhr.emit("preparedata", cfg);

		// format	data into proper string
		if(cfg.data && typeof(cfg.data)!=="string") {
			var str = [];
			r.forEach(Object.keys(cfg.data), function(i,name){
				var val = cfg.data[name];
				if(Array.isArray(val)) {
					r.forEach(val, function(j,itm){
						str.push(name+"[]="+itm);
					})
				} else {
					str.push(name +"="+ encodeURIComponent(val));
				}
			})
			cfg.data = str.join("&");
		}

		var xhr = new XMLHttpRequest(),
				xhrSuccess 	= function(){},
				xhrFail 		= function(){},
				xhrFinally	= function(){};

		xhr.open(cfg.method, url, cfg.async, cfg.username, cfg.password);
		xhr.setRequestHeader("Content-Type", cfg.contentType);
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest"); // prevent csrf

		r.xhr.emit("beforesend", {params: cfg, transport: xhr}); // last stop before call

		xhr.onload = function(){
			var response 		= xhr.responseText,
					rawHeaders 	= xhr.getAllResponseHeaders() || "",
					status 			= xhr.status;

			var isSuccess = status>=200 || status<=300;

			var headersArray = rawHeaders.split("\r\n"),
					headers = {};
			r.forEach(headersArray, function(i,hdrItm){
				var hdr = hdrItm.split(": ");
				if(hdr.length<2) return; // not a keyval pair
				headers[hdr[0]] = hdr[1];
			});

			// post call
			var stop = r.xhr.emit("aftersend", {
				params: cfg,
				response: response,
				isSuccess: isSuccess,
				status: status,
				headers: headers
			});
			if(stop === false) return; // force stop execution

			var doneFunc = isSuccess ? xhrSuccess : xhrFail;
			doneFunc(response, status, headers);
			xhrFinally(response, status, headers);
		}

		xhr.onerror = function(){
			r.xhr.emit("aftersend", {
				params: cfg,
				response: response,
				isSuccess: isSuccess,
				status: status,
				headers: headers
			});
			xhrFail(response, status, headers);
			xhrFinally(response, status, headers);
		}

		xhr.send(cfg.data);

		return {
			abort: function(){
				xhrSuccess = xhrFail = xhrFinally = function(){};
				xhr.abort();
			},
			success: function(fn){
				xhrSuccess = fn;
				return this;
			},
			fail: function(fn){
				xhrFail = fn;
				return this;
			},
			finally: function(fn){
				xhrFinally = fn;
				return this;
			}
		}
	}

	r.extend(r.xhr, r.Observer.prototype);

	r.post = function(url, data) {
		var cfg = {};
		if(data.isJson && data.data){
			cfg = {
				contentType: "application/json",
				data: JSON.stringify(data.data)
			};
		}
		return r.xhr(url, cfg);
	}

	/**
	 * DOM methods
	 */

	r.$ = function(el){
		return document.querySelector(el);
	}

	r.$$ = function(els){
		return document.querySelectorAll(els);
	}
})(window);
