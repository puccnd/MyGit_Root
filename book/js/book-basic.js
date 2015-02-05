(function(_w, _d) {
	"use strict",
	bookId = "bookBasicID";

	_d.onselectstart = function() {
		return false;
	};

	// Just for on document ready loaded
	var fnStack = [];

	function readyFn() {
		for (var i = 0; i < fnStack.length; i++)
			fnStack[i].call();
	}

	if (_d.addEventListener)
		_d.addEventListener("DOMContentLoaded", function() {
			_d.removeEventListener("DOMContentLoaded", arguments.callee, false);
			readyFn();
		}, false);
	else if (_d.attachEvent)
		_d.attachEvent("onreadystatechange", function() {
			if (_d.readyState == "complete") {
				_d.detachEvent("onreadystatechange", arguments.callee);
				readyFn();
			}
		});
	else if (_d.body)
		_d.body.onload = readyFn;
	else
		window.onload = readyFn;

	// Basic & low level functions
	var getObject = function(key, value) {
		var res = {};
		res[key] = value;
		return res;
	};
	var extendObject = function(object, object2) {
		if (!object) return null;
		if (!object2) return object;
		for (var prop in object2)
			object[prop] = object2[prop];
		return object;
	};

	// like jQuery usage
	var $ = function(fn) {
		if (typeof fn == "function") {
			if (fnStack.indexOf(fn) == -1)
				fnStack.push(fn);
		} else
			return new _$(fn);
	};

	// Data cache for tmp operations
	var dataStack = (function(_stack) {
		var eventStack = {};
		_w.eStack = eventStack;
		var eventFlags = {};
		var generalId = function() {
			return ("bb_" + Date.now() + Math.random()).replace(".", "");
		};
		var originalBinding = function(domObject, eventType, callback) {
			if (domObject.addEventListener)
				domObject.addEventListener(eventType, callback, false);
			else if (domObject.attachEvent)
				domObject.attachEvent(eventType, callback);
			else
				domObject["on" + eventType.toLowerCase()] = callback;
		};
		return (_stack = {
			tmp: {},
			getAttr: function(domObject, attrName) {
				try {
					return domObject.getAttribute(attrName);
				} catch (e) {
					throw new Error("读取对象属性" + attrName + "失败！原因：" + e.message);
				}
			},
			chkAttr: function(domObject, attrName) {
				var bbid = _stack.getAttr(domObject, attrName);
				if (!bbid) {
					bbid = generalId();
					_stack.addAttr(domObject, attrName, bbid);
				}
				return bbid;
			},
			addAttr: function(domObject, attrName, value) {
				domObject.setAttribute(attrName, value);
			},
			delAttr: function(domObject, attrName) {
				domObject.removeAttribute(attrName);
			},
			addEventStack: function(domObject, eventType, callback) {
				if (!domObject || !eventType || !callback)
					return;
				var bbid = _stack.getAttr(domObject, bookId);
				if (!bbid || bbid == "") {
					bbid = generalId();
					_stack.addAttr(domObject, bookId, bbid);
				}
				if (!eventStack[bbid]) eventStack[bbid] = {};
				if (!eventStack[bbid][eventType])
					eventStack[bbid][eventType] = [];
				var allowAddEventHandler = false;
				var es = eventStack[bbid][eventType];
				if (es.indexOf(callback) == -1) {
					var repeatIdx = -1;
					for (var i = 0; i < es.length; i++) {
						if (es[i].name == callback.name && callback.name != "") {
							repeatIdx = i;
							break;
						}
					}
					if (repeatIdx == -1) {
						for (var i = 0; i < es.length; i++) {
							if (es[i].toString() == callback.toString()) {
								repeatIdx = i;
								break;
							}
						}
						if (repeatIdx != -1)
							es.splice(repeatIdx, 1);
					} else {
						es.splice(repeatIdx, 1);
					}
				} else {
					es.splice(es.indexOf(callback), 1);
				}
				eventStack[bbid][eventType].push(callback);
				if (!eventFlags[bbid])
					eventFlags[bbid] = {};
				if (!eventFlags[bbid][eventType]) {
					eventFlags[bbid][eventType] = true;
					originalBinding(domObject, eventType, function(event) {
						var stk = eventStack[bbid][eventType].slice(0);
						if (stk.length > 0)
							stk.forEach(function(f) {
								if (f && typeof f == "function")
									f.call(domObject, event);
							});
					});
				}
			},
			delEventStack: function(domObject, eventType, callback) {
				var bbid = _stack.getAttr(domObject, bookId);
				if (!bbid) return _stack.addAttr(domObject, bookId, generalId());
				if (!eventStack[bbid]) return;
				if (!eventStack[bbid][eventType]) return;
				if (!callback) {
					eventStack[bbid][eventType] = [];
					return;
				}
				var idx = eventStack[bbid][eventType].indexOf(callback);
				if (idx == -1) return;
				eventStack[bbid][eventType].splice(idx, 1);
			},
			callEventStack: function(domObject, eventType) {
				var bbid = _stack.getAttr(domObject, bookId);
				if (!bbid) return _stack.addAttr(domObject, bookId, generalId());
				if (!eventStack[bbid]) return;
				if (!eventStack[bbid][eventType]) return;
				var stk = eventStack[bbid][eventType].slice(0);
				if (stk.length > 0)
					stk.forEach(function(f) {
						if (f && typeof f == "function")
							f.call(domObject, event);
					});
			}
		});
	})();

	// capsualized object _$
	var _$ = function(fn) {
		if (typeof fn == "string") {
			if (fn.length > 1) {
				if (fn.substring(0, 1) == "#") {
					var o = _d.getElementById(fn.substring(1));
					this.data = o;
				} else if (fn.substring(0, 1) == ".") {
					var oArr = _d.getElementsByClassName(fn.substring(1));
					this.data = oArr;
				}
			}
		} else if (typeof fn == "object")
			this.data = fn;
	};

	var withData = function(_$_, doThings) {
		var data = _$_.data;
		if (!data) return;
		if (Array.isArray(data)) {
			Array.forEach.call(data, function(i) {
				doThings.call(_$_, i);
			});
		} else {
			doThings.call(_$_, data);
		}
	};

	_$.addObject = function(name, property) {
		$[name] = _$[name] = property;
		return _$;
	};

	// Extend _$, but $ can call this method, too.
	_$.addObject("data", function(dataName, dataObject) {
		if (!!dataObject || dataObject == 0 || dataObject == false)
			dataStack.tmp[dataName] = dataObject;
		else
			return dataStack.tmp[dataName];
	}).addObject("removeData", function(dataName) {
		delete dataStack.tmp[dataName];
	}).addObject("extend", function(name, property) {
		extendObject(_$.prototype, getObject(name, property));
	}).addObject("docSize", function() {
		return {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight
		};
	});

	// Extend _$.this.setStyle, set "width" & "height" to attribute meanwhile
	_$.extend("setStyle", function(styleOptions) {
		withData(this, function(domObject) {
			for (var styleName in styleOptions) {
				var styleProperty = styleOptions[styleName];
				domObject.style[styleName] = styleProperty;
			}
			if (styleOptions.hasOwnProperty("width"))
				domObject.setAttribute("width", styleOptions.width);
			if (styleOptions.hasOwnProperty("height"))
				domObject.setAttribute("height", styleOptions.height);
		});
		return this;
	});

	// timer object
	var timerDo = function(callback, timeout, continueFunction) {
		var tick = null;
		tick = window.setTimeout(function() {
			if (tick) window.clearTimeout(tick);
			callback.call();
			if (continueFunction && (typeof continueFunction == "function") && continueFunction())
				timerDo(callback, timeout, continueFunction);
		}, timeout);
	};

	// extend the event driver
	_$.extend("bind", function(name, callback) {
		withData(this, function(domObject) {
			dataStack.addEventStack(domObject, name, callback);
		});
		return this;
	});
	_$.extend("timerBind", function(timeout, name, callback) {
		var _this = this;
		timerDo(function() {
			_this.bind(name, callback);
		}, timeout);
		return _this;
	});
	_$.extend("unbind", function(name, callback) {
		withData(this, function(domObject) {
			dataStack.delEventStack(domObject, name, callback);
		});
		return this;
	});
	_$.extend("timerUnbind", function(timeout, name, callback) {
		var _this = this;
		timerDo(function() {
			_this.unbind(name, callback);
		}, timeout);
		return _this;
	});
	_$.extend("trigger", function(name) {
		withData(this, function(domObject) {
			dataStack.callEventStack(domObject, name);
		});
		return this;
	});
	_$.extend("timerTrigger", function(timeout, name) {
		var _this = this;
		timerDo(function() {
			_this.trigger(name);
		}, timeout);
		return _this;
	});

	// canvas basic tool
	var getCanvasSize = function(can) {
		var w = dataStack.getAttr(can, "width");
		var h = dataStack.getAttr(can, "height");
		return {
			w: parseFloat(w),
			h: parseFloat(h),
			x: parseFloat(w),
			y: parseFloat(h)
		};
	};
	var CanvasTool = function(_tool) {
		var randomPos = function(max) {
			var r1 = Math.random(),
				r2 = Math.random();
			return {
				x: r1 * max.x,
				y: r2 * max.y
			};
		};
		var randomDir = function(from, max) {
			var r1 = Math.random(),
				r2 = Math.random();
			var to = {};
			to.x = from.x + (r1 >= 0.5 ? 1 : -1) * 50 * Math.random();
			to.y = from.y + (r2 >= 0.5 ? 1 : -1) * 50 * Math.random();
			if (to.x < 0 || to.x > max.x)
				to.x = from.x + (r1 >= 0.5 ? -1 : 1) * 5;
			if (to.y < 0 || to.y > max.y)
				to.y = from.y + (r2 >= 0.5 ? -1 : 1) * 5;
			return to;
		};
		return (_tool = {
			setInitCtx: function(domObject, opts) {
				var ctx = domObject.getContext("2d");
				ctx.lineJoin = ctx.lineCap = "round";
				ctx.lineWidth = 3;
				ctx.strokeStyle = opts.strokeStyle || "blue";
				return _tool;
			},
			drawLine: function(domObject) {
				var canvas = getCanvasSize(domObject);
				var ctx = domObject.getContext("2d");
				var myBookId = dataStack.chkAttr(domObject, bookId);
				var lastPos = $.data(myBookId + "lastPos");
				var from, to;
				if (!lastPos) {
					from = randomPos(canvas);
					to = randomDir(from, canvas);
				} else {
					from = lastPos;
					to = randomDir(from, canvas);
				}
				$.data(myBookId + "lastPos", to);
				ctx.beginPath();
				ctx.moveTo(from.x, from.y);
				ctx.lineTo(to.x, to.y);
				ctx.stroke();
				ctx.closePath();
				ctx.save();
				ctx.beginPath();
				ctx.arc((from.x + to.x) / 2, (from.y + to.y) / 2, 30 * Math.random() + 3, 0, 2 * Math.PI, false);
				ctx.lineWidth = 1;
				ctx.shadowOffsetX = 1;
				ctx.shadowColor = ctx.strokeStyle;
				ctx.stroke();
				ctx.closePath();
				ctx.restore();
			}
		});
	};

	// canvas factors
	_$.extend("endlessDraw", function() {
		var colors = ["red", "orange", "yellow", "green", "indigo", "blue", "purple", "cyan", "black", "silver"];
		var continueFunction = function() {
			return true;
		};
		var timeout = 20;
		withData(this, function(domObject) {
			var canvas = getCanvasSize(domObject);
			var ctx = domObject.getContext("2d");
			ctx.fillStyle = "rgba(55,55,55,0.25)";
			timerDo(function() {
				for (var i = 0; i < 50; i++) {
					var tool = CanvasTool();
					tool.setInitCtx(domObject, {
						strokeStyle: colors[i % colors.length]
					});
					tool.drawLine(domObject);
				}
			}, timeout, continueFunction);
			timerDo(function() {
				ctx.fillRect(0, 0, canvas.w, canvas.h);
			}, timeout * 4, continueFunction);
		});
		return this;
	});

	// Set it open
	_w.$ = _w.BookBasic = $;
})(window, document);