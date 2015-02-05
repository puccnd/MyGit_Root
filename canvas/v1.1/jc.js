/**
 * Canvas框架
 *
 * 其中：
 * <li> 事件交给专门的处理器，设定处理模式与处理器分离 </li>
 * <li> 模拟毛笔，结果仿佛成了油漆笔 </li>
 *
 * @author Libo Pu
 */

(function($, _w) {
	var JQ = function(arr) {
		var _container = [];
		if (arr)
			_container.concat(arr.slice(0));
		this.enHead = function(object) {
			_container.splice(0, 0, object);
		};
		this.enTail = function(object) {
			_container.push(object);
		};
		this.deHead = function() {
			return _container.shift();
		};
		this.deTail = function() {
			return _container.pop();
		};
		this.first = function() {
			return _container.unshift();
		};
		this.last = function() {
			return _container[_container.length - 1];
		};
		this.remove = function(idx) {
			return _container.splice(idx, 1)[0];
		};
		this.getValue = function() {
			return _container;
		};
		this.each = function(callback) {
			if (!callback)
				return;
			for (var i = 0; i < _container; i++) {
				callback.call(null, i, _container[i]);
			}
		};
	};
	var JH = (function(me) {
		var jcInstance = null;
		var setContext = function() {
			if (!jcInstance)
				return;
			var ctx = jcInstance.context;
			ctx.lineJoin = "bevel";
			ctx.lineCap = "round";
			ctx.lineWidth = jcInstance.penstyle.lineWidth;
			ctx.strokeStyle = jcInstance.penstyle.strokeStyle;
			ctx.fillStyle = jcInstance.penstyle.fillStyle;
			ctx.globalAlpha = jcInstance.penstyle.alpha;
			ctx.globalCompositeOperation = jcInstance.penstyle.composite;
			ctx.save();
		};
		var normalWidth = 18,
			limitWidth = 5,
			bigs = 50,
			mids = 20;
		var dis0 = null,
			p0 = null,
			t0 = null,
			lw = null;
		var diff = function(a, b) {
			return a - b;
		};
		var distance = function(p1, p2) {
			var dis = Math.sqrt(diff(p1.x, p2.x) * diff(p1.x, p2.x) + diff(p1.y, p2.y) * diff(p1.y, p2.y));
			var xr = diff(p2.x, p1.x) / dis,
				yr = diff(p2.y, p1.y) / dis;
			return [Math.ceil(dis), xr, yr];
		};
		var longChange = function(cw, dis) {
			var res = [];
			res[0] = cw;
			if (dis > bigs) {
				res[1] = limitWidth;
				dis0 = dis;
				return res;
			} else if (dis > mids) {
				if (!dis0) {
					res[1] = Math.max(0.9 * cw, limitWidth);
				} else {
					var ran = Math.random();
					if (ran < 0.3) {
						res[1] = Math.max((0.9 + ran * (1.01 - 0.9)) * cw, limitWidth);
					} else if (dis > dis0) {
						res[1] = Math.max(0.9 * cw, limitWidth);
					} else {
						res[1] = Math.max(1.01 * cw, limitWidth);
					}
				}
				dis0 = dis;
				return res;
			} else {
				res[1] = normalWidth;
				dis0 = dis;
				return res;
			}
		};
		var drawLine = function(p1, p2) {
			var dis = distance(p1, p2);
			lw = lw || normalWidth;
			var res = longChange(lw, dis[0]);
			if (!p1)
				return;
			if (!jcInstance)
				return;
			var f = jcInstance.controls.drawable;
			if (!f)
				return;
			var ctx = jcInstance.context;
			ctx.save();
			if (!p2 || (p1.x == p2.x && p1.y == p2.y)) {
				ctx.beginPath();
				ctx.arc(p1.x, p1.y, ctx.lineWidth / 2, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.closePath();
			} else {
				var rounds = parseInt(dis[0] * 1.5) + 1;
				for (var i = 0; i < rounds; i++) {
					var rate = i / rounds,
						rate2 = (i + 1) / rounds;
					var fx = (p2.x - p1.x) * rate + p1.x;
					var fy = (p2.y - p1.y) * rate + p1.y;
					var tx = (p2.x - p1.x) * rate2 + p1.x;
					var ty = (p2.y - p1.y) * rate2 + p1.y;
					var lwi = res[0] + (res[1] - res[0]) * rate;
					ctx.beginPath();
					ctx.moveTo(fx, fy);
					ctx.lineTo(tx, ty);
					ctx.lineWidth = lwi;
					//ctx.shadowColor = "rgba(190,190,190,0.5)";
					ctx.shadowColor = "rgba(0,0,0,0.1)";
					ctx.shadowOffsetX = -1;
					ctx.shadowOffsetY = -1;
					ctx.stroke();
					ctx.closePath();
				}
			}
			ctx.restore();
			p0 = p1;
			lw = res[1];
		};
		var checkRealData = function(data) {
			return (data != null && data != undefined && data != NaN);
		};
		var stopJQEvent = function(e) {
			e.stopPropagation();
			e.preventDefault();
		};
		var docMouseEvents = function(fn1, fn2, fn3) {
			$(document).unbind("mousemove mouseup mouseout").bind("mousemove",
				fn1).bind("mouseup", fn2).bind("mouseout", fn3);
		};
		var docTouchEvents = function(fn1, fn2, fn3) {
			$(document).unbind("touchmove touchend touchcancel").bind(
				"touchmove", fn1).bind("touchend", fn2).bind("touchcancel",
				fn3);
		};
		var getMousePoint = function(evt) {
			return {
				x: evt.originalEvent.pageX,
				y: evt.originalEvent.pageY
			};
		};
		var getCommonTouch = function(evt, i) {
			if (!checkRealData(i))
				i = 0;
			return {
				x: evt.originalEvent.targetTouches[i].pageX,
				y: evt.originalEvent.targetTouches[i].pageY
			};
		};
		var getFinalTouch = function(evt, i) {
			if (!checkRealData(i))
				i = 0;
			return {
				x: evt.originalEvent.changedTouches[i].pageX,
				y: evt.originalEvent.changedTouches[i].pageY
			};
		};
		var draw = {};
		draw.drawStart = function(startEvent, startData) {
			// dis0 = null, p0 = null, t0 = null, lw = null;
			if (startEvent.type.indexOf("touch") == -1) {
				startData.isStart = true;
				startData.startAt = getMousePoint(startEvent);
			} else {
				var tt = startEvent.originalEvent.targetTouches;
				if (!startData.startAt)
					startData.startAt = {};
				if (!startData.lastAt)
					startData.lastAt = {};
				for (var i = 0; i < tt.length; i++) {
					var identifier = tt[i].identifier;
					var p = getCommonTouch(startEvent, i);
					startData.startAt[identifier] = p;
					startData.isStart[identifier] = true;
				}
			}
			return true;
		};
		draw.drawMove = function(moveEvent, startData) {
			if (moveEvent.type.indexOf("touch") == -1) {
				if (!startData.isStart)
					return true;
				var moveAt = getMousePoint(moveEvent);
				if (!startData.lastAt) {
					drawLine(startData.startAt, moveAt);
					startData.lastAt = moveAt;
				} else {
					drawLine(startData.lastAt, moveAt);
					startData.lastAt = moveAt;
				}
			} else {
				var tt = startEvent.originalEvent.targetTouches;
				for (var i = 0; i < tt.length; i++) {
					var identifier = tt[i].identifier;
					if (!startData.isStart[identifier])
						continue;
					var p = getCommonTouch(moveEvent, i);
					if (!startData.lastAt[identifier]) {
						drawLine(startData.startAt[identifier], p);
						startData.lastAt[identifier] = p;
					} else {
						drawLine(startData.lastAt[identifier], p);
						startData.lastAt[identifier] = p;
					}
					startData.startAt[identifier] = p;
				}
			}
			return true;
		};
		draw.drawEnd = function(endEvent, startData) {
			if (endEvent.type.indexOf("touch") == -1) {
				if (!startData.isStart)
					return true;
				if (!startData.lastAt) {
					drawLine(startData.startAt);
				}
				startData.isStart = undefined;
				startData.startAt = undefined;
				startData.lastAt = undefined;
			} else {
				var ct = endEvent.originalEvent.changedTouches;
				for (var i = 0; i < ct.length; i++) {
					var identifier = ct[i].identifier;
					if (!startData.isStart[identifier])
						continue;
					var p = getFinalTouch(endEvent, i);
					if (!startData.lastAt[identifier]) {
						drawLine(startData.startAt[identifier], p);
					} else {
						drawLine(startData.lastAt[identifier], p);
					}
					startData.isStart[identifier] = undefined;
					startData.startAt[identifier] = undefined;
					startData.lastAt[identifier] = undefined;
				}
			}
			return true;
		};
		draw.drawStop = function(stopEvent, startData) {
			if (stopEvent.type.indexOf("touch") == -1) {
				if (!startData.isStart)
					return true;
				if (!startData.lastAt) {
					drawLine(startData.startAt);
				}
				startData.isStart = false;
				startData.startAt = null;
				startData.lastAt = null;
			} else {
				var tt = startEvent.originalEvent.targetTouches;
				for (var i = 0; i < tt.length; i++) {
					var identifier = tt[i].identifier;
					if (!startData.isStart[identifier])
						continue;
					var p = getCommonTouch(moveEvent, i);
					if (!startData.lastAt[identifier]) {
						drawLine(startData.startAt[identifier], p);
						startData.lastAt[identifier] = p;
					} else {
						drawLine(startData.lastAt[identifier], p);
						startData.lastAt[identifier] = p;
					}
					startData.startAt[identifier] = p;
				}
				var ct = endEvent.originalEvent.changedTouches;
				for (var i = 0; i < ct.length; i++) {
					var identifier = ct[i].identifier;
					if (!startData.isStart[identifier])
						continue;
					var p = getFinalTouch(endEvent, i);
					if (!startData.lastAt[identifier]) {
						drawLine(startData.startAt[identifier], p);
					} else {
						drawLine(startData.lastAt[identifier], p);
					}
					startData.isStart[identifier] = undefined;
					startData.startAt[identifier] = undefined;
					startData.lastAt[identifier] = undefined;
				}
			}
			return true;
		};
		return (me = {
			isReal: checkRealData,
			setJc: function(obj) {
				jcInstance = obj;
				return this;
			},
			onEvent: function() {
				$(jcInstance.canvas).unbind().bind("mousedown", function(md) {
					stopJQEvent(md);
					setContext();
					me.draw(md, docMouseEvents);
				}).bind("touchstart", function(ts) {
					stopJQEvent(ts);
					setContext();
					me.draw(ts, docTouchEvents);
				});
				return this;
			},
			draw: function(startEvent, docEventsHandler) {
				var startData = {};
				var idx = jcInstance.controls.getIndex();
				switch (idx) {
					// 0-�滭 1-���� 2-ѡ��
					case 0:
						draw.drawStart(startEvent, startData);
						break;
					case 1:
						break;
					case 2:
						break;
					default:
						break;
				}
				var fn1 = function(event) {
					var idx = jcInstance.controls.getIndex();
					switch (idx) {
						case 0:
							draw.drawMove(event, startData);
							break;
						case 1:
							break;
						case 2:
							break;
						default:
							break;
					}
				};
				var fn2 = function(event) {
					var idx = jcInstance.controls.getIndex();
					switch (idx) {
						case 0:
							draw.drawEnd(event, startData);
							break;
						case 1:
							break;
						case 2:
							break;
						default:
							break;
					}
				};
				var fn3 = function(event) {
					var idx = jcInstance.controls.getIndex();
					switch (idx) {
						case 0:
							draw.drawStop(event, startData);
							break;
						case 1:
							break;
						case 2:
							break;
						default:
							break;
					}
				};
				docEventsHandler.call(null, fn1, fn2, fn3);
			}
		});
	})();
	_w.jc = $.jc = jc = function(canvas) {
		if (!$(canvas)[0]) {
			alert("No canvas found!");
			return;
		}
		this.version = 2;
		this.canvas = $(canvas)[0];
		this.context = this.canvas.getContext("2d");
		var modes = ["draw", "eraser", "select"];
		this.controls = {
			mode: modes[0],
			changeModeTo: function(index) {
				this.mode = modes[index];
			},
			getIndex: function() {
				return modes.indexOf(this.mode);
			},
			IMG_POST_SLICE: 86666,
			drawable: true,
			selectable: true,
			movable: true,
			scalable: true,
			resizable: true,
			communicatable: true
		};
		var compositeModes = ["source-over", "destination-out"];
		this.penstyle = {
			lineWidth: 4,
			setLineWidth: function(val) {
				this.lineWidth = val;
			},
			//strokeStyle: "rgb(255,0,0)",
			strokeStyle: "rgb(0,0,0)",
			//fillStyle: "rgb(255,0,0)",
			fillStyle: "rgb(0,0,0)",
			setPenColor: function(val) {
				this.strokeStyle = val;
				this.fillStyle = val;
			},
			alpha: 1,
			setGlobalAlpha: function(val) {
				this.alpha = alpha;
			},
			composite: compositeModes[0],
			switchComposite: function(val) {
				this.composite = compositeModes[val];
			},
			dataImage: new JQ(),
			getCtx: function() {
				return {
					lineWidth: this.lineWidth,
					strokeStyle: this.strokeStyle,
					fillStyle: this.fillStyle,
					alpha: this.alpha,
					composite: this.composite
				};
			},
			saveCtx: function() {
				var ctx = this.getCtx();
				this.dataImage.enTail(ctx);
			},
			restoreCtx: function() {
				var ctx = this.dataImage.deTail();
				if (ctx) {
					if (ctx.lineWidth)
						this.lineWidth = ctx.lineWidth;
					if (ctx.strokeStyle)
						this.strokeStyle = ctx.strokeStyle;
					if (ctx.fillStyle)
						this.fillStyle = ctx.fillStyle;
					if (ctx.alpha)
						this.alpha = ctx.alpha;
					if (ctx.composite)
						this.composite = ctx.composite;
				}
			}
		};
		this.objects = [];
		this.actions = [];
		this.addObject = function(object) {
			var isReal = JH.isReal;
			if (isReal(object)) {
				this.objects.push(object);
				this.actions.push({
					command: "addObject",
					object: object
				});
			}
		};
		this.removeObject = function(idx) {
			var isReal = JH.isReal;
			if (isReal(idx) && isReal(this.objects[idx]) && isReal(this.objects[idx].id)) {
				var rid = this.objects[idx].id;
				this.objects.splice(idx, 1);
				this.actions.push({
					command: "removeObject",
					objectId: rid
				});
			}
		};
	};
	jc.prototype = {
		start: function() {
			JH.setJc(this).onEvent();
			return this;
		}
	};
})(jQuery, window);