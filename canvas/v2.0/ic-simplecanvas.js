/**
 * Jl Canvas框架
 *
 * 其中：
 * <li> 线程加工需要ic-thread.js </li>
 * <li> 消息及关键扩展需要ic-msgproc.js </li>
 * <li> jc初始化在ic-welcome.js </li>
 *
 * @author Libo Pu
 */

var stopEvent = function(e) {
	e.stopPropagation();
	e.preventDefault();
};
var getCanvasWH = function(jc) {
	return {
		width: jc.drawMaterials.canvas.width,
		height: jc.drawMaterials.canvas.height
	};
};
(function($) {
	var newDiv = "<div />";
	var newCanvas = "<canvas></canvas>";
	var selectedCls = "jc-select";
	$.switchFullscreen = function() {
		// TODO
	};
	if (!$.randomStr) {
		$.randomStr = function(len) {
			var res = "";
			var org = "abcdefghijklmnopqrstuvwxyz0123456789";
			for (var i = 0; i < len; i++) {
				res += org[parseInt(Math.random() * org.length)];
			}
			return res;
		};
	}
	$.startScriptThread = function(jsFile, extFlag) {
		if (!extFlag && "Worker" in window) {
			var worker = new Worker(jsFile);
			worker.onerror = function() {
				// 出错了，也没其他办法！
				jlAlert("线程出错！");
				$.startScriptThread(jsFile, true);
			};
			worker.onmessage = function(event) {
				var output = event.data;
				$.jcEvents.receiveData(output);
			};
			$.sendToThread = function(input, output) {
				worker.postMessage({
					input: input,
					output: output
				});
			};
			return true;
		} else {
			if (!window.JlWorker) {
				var getWin = function() {
					var fm = document.getElementById("simThread");
					if (fm && fm.contentWindow)
						return fm.contentWindow;
					return null;
				};
				window.JlWorker = function(js) {
					this.js = js;
				};
				window.JlWorker.prototype.onerror = function() {};
				window.JlWorker.prototype.onmessage = function(event) {};
				window.JlWorker.prototype.postMessage = function(data) {
					try {
						var win = getWin();
						if (win && win.dimThread) {
							win.dimThread(this, window, this.js);
							win.onJlMessage({
								data: data
							});
						}
					} catch (e) {
						this.onerror();
						jlAlert("模拟线程报错！");
					}
				};
			}
			// 模拟线程
			var worker = new window.JlWorker(jsFile);
			worker.onerror = function() {
				// 出错了，也没其他办法！
			};
			worker.onmessage = function(event) {
				var output = event.data;
				$.jcEvents.receiveData(output);
			};
			$.sendToThread = function(input, output) {
				worker.postMessage({
					input: input,
					output: output
				});
			};
			return false;
		}
	};
	var Player = {
		isPlayable: function(object) {
			if (object.type == "audio" || object.type == "video") {
				return true;
			}
			return false;
		},
		addPlayButton: function(div) {
			// TODO
		}
	};
	var absStyle = function(opts) {
		var stl = {
			position: "absolute",
			top: 0,
			left: 0,
			margin: 0,
			padding: 0
		};
		for (var prop in opts) {
			stl[prop] = opts[prop];
		}
		return stl;
	};
	var getNewImage = function(src) {
		var newImage = function(callback) {
			var img = new Image();
			img.onload = callback;
			img.onerror = function() {
				img.src = "images/notFound.png";
				jlAlert("加载图片失败！");
			};
			img.src = src;
			return img;
		};
		return {
			afterLoaded: function(callback) {
				newImage(callback);
			}
		};
	};
	$.jcEvents = (function() {
		var jcCache = {};
		var ctxCache = {};
		var cache = {};
		return {
			receiveData: function(output) {
				if (!output)
					return;
				if (output.id == "error") {
					jlAlert("线程出错：" + output.msg);
					return;
				}
				// finished
				var id = output.id;
				if (cache[id]) {
					var jc = jcCache[id];
					var ctx = ctxCache[id];
					jc.addObject(id, "line", output.points, output.rect,
						output.center, 0, ctx);
					jc.redrawAll();
					delete cache[id];
					delete jcCache[id];
					delete ctxCache[id];
					$.jcSync.onFinishLine({
						jc: jc,
						ctx: ctx,
						output: output
					});
				} else {
					delete cache[id];
					delete jcCache[id];
					delete ctxCache[id];
				}
			},
			onDrawing: function(opts) {
				$.jcSync.onDrawSingleLine(opts);
				var jc = opts.jc;
				var ctx = opts.ctx;
				var id = opts.id;
				var from = opts.from;
				var to = opts.to;
				if (!cache[id]) {
					jcCache[id] = jc;
					ctxCache[id] = ctx;
					cache[id] = {
						id: id,
						points: [],
						rect: {},
						finished: false
					};
				}
				if (cache[id].points.length == 0) {
					cache[id].points.push(from);
					cache[id].points.push(to);
				} else {
					cache[id].points.push(to);
				}
			},
			onEndDraw: function(opts) {
				var id = opts.id;
				var lastPos = opts.lastPos;
				if (!cache[id]) {
					if (opts.noLine)
						return;
					jcCache[id] = opts.jc;
					ctxCache[id] = opts.ctx;
					cache[id] = {
						id: id,
						points: [lastPos],
						rect: {
							left: lastPos.x - opts.ctx.lineWidth / 2,
							top: lastPos.y - opts.ctx.lineWidth / 2,
							width: opts.ctx.lineWidth,
							height: opts.ctx.lineWidth
						},
						center: lastPos,
						finished: true
					};
					this.receiveData(cache[id]);
				} else {
					$.sendToThread({
						type: "line",
						to: lastPos
					}, cache[id]);
				}
			}
		};
	})();
	var dwh = function() {
		return {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight
		};
	};
	var noBorder = function() {
		return {
			margin: 0,
			padding: 0,
			border: 0
		};
	};
	$.lazyStart = function(fn, t, repeatable) {
		var tick = null;
		tick = window.setTimeout(function() {
			try {
				fn.call();
			} catch (e) {}
			if (tick)
				window.clearTimeout(tick);
			if (repeatable)
				$.lazyStart(fn, t, repeatable);
		}, t);
	};
	var removeMasks = function() {
		$(".jl-mask-impl").remove();
	};
	$.showMask = function(closeFn) {
		var mask = $(newDiv).addClass("standard-mask jl-mask-impl").appendTo(
			"body");
		var imgHtml = "<div class='waiting-icon'></div>";
		var strHtml = "<span class='waiting-span'>正在处理，请稍候…</span>";
		var vCenter = $(newDiv).addClass("hv-center").appendTo(mask);
		var l = 120,
			t = 57;
		$(newDiv).addClass("simple-abs").css({
			top: -t,
			left: -l,
			height: 2 * t,
			width: 2 * l
		}).html(imgHtml + strHtml).appendTo(vCenter);
		if (!closeFn) {
			$.lazyStart(removeMasks, 500);
		} else {
			closeFn.call(null, removeMasks);
		}
	};
	$.fn.openTopic = function(options) {
		var topicTitle = options.topicTitle,
			topicImage = options.topicImage;
		var dialogDiv = $(this).addClass("jle-pop");
		var title = $('<div class="jle-title" />').appendTo(dialogDiv);
		title.append('<span>' + topicTitle + '</span>');
		var closeBtn = $('<div class="jle-close">×</div>');
		$.click(closeBtn, function() {
			$(this).closest(".jle-pop").remove();
		});
		title.append(closeBtn);
		var topicDiv = $('<div class="jle-board"></div>').appendTo(dialogDiv);
		var topic1 = $('<div class="jle-topic" />');
		topic1.append('<img src="' + topicImage + '">');
		var randomId = "ID" + new Date().getTime();
		var topic2 = $('<canvas id="re' + randomId + '" class="idle-canvas"></canvas>');
		var topic3 = $('<canvas id="' + randomId + '" redrawAt="re' + randomId + '" class="idle-canvas"></canvas>');
		$(topicDiv).append(topic1).append(topic2).append(topic3);
		if (!window.jcs)
			window.jcs = {};
		window.jcs[randomId] = $("#" + randomId).simpleCanvas({
			lineWidth: options.penWidth,
			eraserWidth: options.eraserWidth,
			color: options.penColor,
			preventResizeByJc: true,
			resizer: $(".jle-board")
		});
		window.jcs[randomId].initContext();
		var tools1 = $('<div class="jle-toolbox pencil" />');
		tools1.addClass("jle-toolbox-selected").attr("cid", randomId);
		var tools2 = $('<div class="jle-toolbox eraser" />');
		tools2.attr("cid", randomId);
		$.click(tools1, function() {
			var canvasId = $(this).attr("cid");
			window.jcs[canvasId].switchTopicPen();
			$(".jle-toolbox-selected").removeClass("jle-toolbox-selected");
			$(this).addClass('jle-toolbox-selected');
		});
		$.click(tools2, function() {
			var canvasId = $(this).attr("cid");
			window.jcs[canvasId].switchTopicEraser();
			$(".jle-toolbox-selected").removeClass("jle-toolbox-selected");
			$(this).addClass('jle-toolbox-selected');
		});
		$(topicDiv).append(tools1).append(tools2);
	};
	var simpleCanvas = function(object, options) {
		var instance = this;
		instance.options = options;
		instance.switchTopicPen = function() {
			var ctx = instance.drawMaterials.context;
			instance.topicMode = 1;
			ctx.lineWidth = instance.options.lineWidth;
			ctx.strokeStyle = ctx.fillStyle = instance.options.color;
		};
		instance.switchTopicEraser = function() {
			var ctx = instance.drawMaterials.context;
			instance.topicMode = 2;
			ctx.lineWidth = instance.options.eraserWidth;
			ctx.strokeStyle = "white";
		};
		instance.allowWrite = true;
		instance.canvasMode = 0; // 0-绘画 1-擦除 2-选择
		instance.history = [];
		instance.objects = [];
		instance.initContext = function() {
			var ctx = instance.drawMaterials.context;
			ctx.lineWidth = (options ? options.lineWidth : 1) || 1;
			ctx.strokeStyle = ctx.fillStyle = (options ? options.color : "red") || "red";
			ctx.lineCap = ctx.lineJoin = "round";
			ctx.save();
		};
		instance.addObject = function(id, type, data, rect, center, angle, ctx) {
			instance.objects.push({
				id: id,
				type: type,
				data: data,
				context: ctx,
				rect: rect,
				center: center,
				angle: angle,
				selected: false,
				transform: { // 被动式参数，在非transform时期不使用
					translateX: 0,
					translateY: 0,
					scaleX: 1,
					scaleY: 1,
					rotate: 0
				}
			});
		};
		instance.addImage = function(url) {
			var ctx = instance.drawMaterials.renderContext;
			getNewImage(url).afterLoaded(
				function() {
					var img = this,
						iw = img.width,
						ih = img.height;
					var cw = instance.drawMaterials.canvas.width;
					var ch = instance.drawMaterials.canvas.height;
					if (iw > cw * 0.8 || ih > ch * 0.8) {
						var r1 = iw / (cw * 0.8);
						var r2 = ih / (ch * 0.8);
						var rAvg = Math.max(r1, r2);
						iw /= rAvg, ih /= rAvg;
					}
					var id = rid();
					var type = "img";
					var data = url;
					var rect = {
						left: (cw - iw) / 2,
						top: (ch - ih) / 2,
						width: iw,
						height: ih
					};
					var center = {
						x: rect.left + rect.width / 2,
						y: rect.left + rect.width / 2
					};
					var props = instance.getContext();
					ctx.beginPath();
					ctx.drawImage(img, rect.left, rect.top, rect.width,
						rect.height);
					ctx.closePath();
					instance.addObject(id, type, data, rect, center, 0,
						props);
				});
		};
		var contextProps = ["globalAlpha", "globalCompositeOperation",
			"lineWidth", "strokeStyle", "fillStyle", "lineCap", "lineJoin"
		];
		var drawRendObj = function(ctx, object) {
			if (object.type == "line") {
				var withRotate = (object.transform.rotate != 0);
				ctx.beginPath();
				var from = object.data[0];
				if (object.data.length > 1) {
					if (withRotate) {
						ctx.moveTo(from.x - object.center.x, from.y - object.center.y);
					} else {
						ctx.moveTo(from.x, from.y);
					}

					for (var i = 1; i < object.data.length - 1; i++) {
						var to = object.data[i];
						if (withRotate) {
							ctx.lineTo(to.x - object.center.x, to.y - object.center.y);
						} else {
							ctx.lineTo(to.x, to.y);
						}
					}
					ctx.stroke();
				} else {
					if (instance.topicMode != 2) {
						if (withRotate) {
							ctx.arc(from.x - object.center.x, from.y - object.center.y,
								object.context.lineWidth / 2, 0,
								2 * Math.PI);
						} else {
							ctx.arc(from.x, from.y,
								object.context.lineWidth / 2, 0,
								2 * Math.PI);
						}
						ctx.fill();
					}
				}
				ctx.closePath();
			} else if (object.type == "img") {
				var url = object.data;
				var rect = object.rect;
				getNewImage(object.data).afterLoaded(
					function() {
						ctx.beginPath();
						ctx.drawImage(url, rect.left, rect.top, rect.width,
							rect.height);
						ctx.closePath();
					});
			} else if (object.type == "audio") {
				// TODO
			} else if (object.type == "video") {
				// TODO
			} else {
				// TODO other links
			}
		};
		// 注：在重绘前已彻底解决了平移和缩放，关注instance.transObject(object)方法。
		var setRendObjCtx = function(ctx, object, tempDraw) {
			ctx.save();
			var ctxData = object.context;
			for (var i = 0; i < contextProps.length; i++) {
				var prop = contextProps[i];
				if (ctxData[prop] != null)
					ctx[prop] = ctxData[prop];
			}
			if (!tempDraw) {
				if (object.transform.rotate != 0) {
					ctx.translate(object.center.x, object.center.y);
					ctx.rotate(object.transform.rotate);
				}
			}
			if (object.context.topicMode == 2) {
				ctx.globalCompositeOperation = "destination-out";
			}
		};
		var releaseRendObjCtx = function(ctx) {
			ctx.restore();
		};
		var drawSelected = function(div, object) {
			var rotate = (object.transform.rotate * 180 / Math.PI + 360) % 360;
			var rStyle = {
				transform: "rotate(" + rotate + "deg)",
				oTransform: "rotate(" + rotate + "deg)",
				msTransform: "rotate(" + rotate + "deg)",
				mozTransform: "rotate(" + rotate + "deg)",
				webkitTransform: "rotate(" + rotate + "deg)"
			};
			var rect = object.rect,
				stl = absStyle(rect);
			stl.left -= object.context.lineWidth / 2;
			stl.top -= object.context.lineWidth / 2;
			stl.width += object.context.lineWidth;
			stl.height += object.context.lineWidth;
			var stl2 = {
				width: stl.width,
				height: stl.height
			};
			var can = $(newCanvas).attr(stl2).css(absStyle({
				width: "100%",
				height: "100%"
			}));
			div.attr("id", object.id).css(rStyle);
			div.css(stl).html(can).appendTo("body");
			if (Player.isPlayable(object)) {
				Player.addPlayButton(div);
			}
			var dragOpts = {
				onJlcStart: function() {
					$.jcSync.onJlcStart(instance);
				},
				onJlcMove: function(elLeft, elTop) {
					$.jcSync.onJlcMove(instance, elLeft, elTop);
				},
				onJlcResize: function(elWidth, elHeight) {
					$.jcSync.onJlcResize(instance, elWidth, elHeight);
				},
				onJlcRotate: function(elAngle) {
					$.jcSync.onJlcRotate(instance, elAngle);
				},
				setObjectParams: function(startParams, endParams) {
					var object = instance.selected;
					if (startParams.l + 0.5 * startParams.w != endParams.l + 0.5 * endParams.w) {
						object.transform.translateX = parseInt((endParams.l + 0.5 * endParams.w) - (startParams.l + 0.5 * startParams.w));
					}
					if (startParams.t + 0.5 * startParams.h != endParams.t + 0.5 * endParams.h) {
						var b = parseInt((endParams.t + 0.5 * endParams.h) - (startParams.t + 0.5 * startParams.h));
						object.transform.translateY = b;
					}
					if (startParams.w != endParams.w) {
						var c = endParams.w / startParams.w;
						object.transform.scaleX = c;
					}
					if (startParams.h != endParams.h) {
						var d = endParams.h / startParams.h;
						object.transform.scaleY = d;
					}
					if (startParams.r != endParams.r) {
						var e = endParams.r * Math.PI / 180;
						object.transform.rotate = e;
					}
				},
				afterJlcAction: function() {
					$.jcSync.afterJlcAction(instance);
				},
				afterJlcTransform: function() {
					instance.transObject(instance.selected);
					$.jcSync.afterJlcTransform(instance);
				}
			};
			var mouseOpts = {
				target: "operateBtn",
				onStart: function() {
					$.jcSync.onStartBlockTransform(instance);
				},
				onTransform: function(data) {
					$.jcSync.onBlockTransform(instance, data.startParams,
						data.endParams);
					dragOpts.setObjectParams(data.startParams, data.endParams);
				},
				onFinish: function() {
					$.jcSync.onFinishBlockTransform(instance);
				}
			};
			div.pulbDraggable(dragOpts);
			div.pulbMouseTranform(mouseOpts);
			var ctx = can[0].getContext("2d");
			if (object.type == "line") {
				setRendObjCtx(ctx, object, true);
				if (object.data.length == 0) {
					ctx.beginPath();
					ctx.arc(object.context.lineWidth / 2,
						object.context.lineWidth / 2,
						object.context.lineWidth / 2, 0, 2 * Math.PI);
					ctx.fill();
					ctx.closePath();
				} else {
					var from = object.data[0];
					var x = from.x - stl.left;
					var y = from.y - stl.top;
					ctx.beginPath();
					ctx.moveTo(x, y);
					for (var i = 1; i < object.data.length; i++) {
						var pos = object.data[i];
						x = pos.x - stl.left;
						y = pos.y - stl.top;
						ctx.lineTo(x, y);
					}
					ctx.stroke();
					ctx.closePath();
				}
				releaseRendObjCtx(ctx);
			} else if (object.type == "img") {
				// TODO
			} else if (object.type == "audio") {
				// TODO
			} else if (object.type == "video") {
				// TODO
			} else {
				// TODO
			}
		};
		instance.redrawAll = function() {
			instance.clearScreen(true);
			var dm = instance.drawMaterials;
			for (var i = 0; i < instance.objects.length; i++) {
				var o = instance.objects[i];
				if (o.selected) {
					var d = $(newDiv).addClass(selectedCls).appendTo("body");
					drawSelected(d, o);
				} else {
					setRendObjCtx(dm.renderContext, o, false);
					drawRendObj(dm.renderContext, o);
					releaseRendObjCtx(dm.renderContext);
				}
			}
		};

		var canvas = $(object);
		var render = $("#" + canvas.attr("redrawAt"));
		var context = canvas[0].getContext("2d");
		var renderContext = render[0].getContext("2d");

		var wh = dwh();
		if (!options || (options && !options.preventResizeByJc)) {
			canvas.attr(wh).css(wh).css(noBorder());
			render.attr(wh).css(wh).css(noBorder());
		}
		if (options && options.preventResizeByJc) {
			var resizer = $(options.resizer);
			wh = {
				width: resizer.width(),
				height: resizer.height()
			};
			canvas.attr(wh).css(wh).css(noBorder());
			render.attr(wh).css(wh).css(noBorder());
		}
		instance.drawMaterials = {
			canvas: canvas,
			context: context,
			render: render,
			renderContext: renderContext
		};
		instance.clearScreen = function(keepData) {
			$("." + selectedCls).remove();
			if (!keepData) {
				instance.history = [];
				instance.objects = [];
			}
			context.clearRect(0, 0, canvas[0].width, canvas[0].height);
			renderContext.clearRect(0, 0, render[0].width, render[0].height);
		};
		instance.changePen = function(num) {
			instance.canvasMode = 0;
			if (num == 0)
				context.globalAlpha = 1;
			else
				context.globalAlpha = 0.5;
		};
		instance.selected = null;
		var PointInShapeJudger = {
			getRoatatedXY: function(x, y, ox, oy, sita) {
				var relXY = {
					x: x - ox,
					y: y - oy
				};
				var org = Math.atan2(relXY.y, relXY.x);
				var rad = Math
					.sqrt(Math.pow(relXY.x, 2) + Math.pow(relXY.y, 2));
				return {
					x: rad * Math.cos(org + sita) + ox,
					y: rad * Math.sin(org + sita) + oy
				};
			},
			getJointPointNumber: function(p1, p2, ep) {
				if (p1.y >= ep.y && p2.y >= ep.y) {
					// 包含如下条件：p1.y==p2.y
					return 0;
				}
				if (p1.y < ep.y && p2.y < ep.y) {
					return 0;
				}
				if (p1.x == p2.x && p1.x >= ep.x) {
					return 1;
				} else {
					var slope = (p1.y - p2.y) / (p1.x - p2.x);
					var offset = p1.y - p1.x * slope;
					var joinPoint = {
						x: (ep.y - offset) / slope,
						y: ep.y
					};
					if (joinPoint.x > ep.x) {
						return 1;
					}
					return 0;
				}
			},
			isInRoatatedRect: function(ep, rect, center, sita) {
				var instance = this;
				var fourCorner = {
					p1: {
						x: rect.left,
						y: rect.top
					},
					p2: {
						x: rect.left,
						y: rect.top + rect.height
					},
					p3: {
						x: rect.left + rect.width,
						y: rect.top + rect.height
					},
					p4: {
						x: rect.left + rect.width,
						y: rect.top
					}
				};
				var newFourCorner = {
					p1: instance.getRoatatedXY(fourCorner.p1.x,
						fourCorner.p1.y, center.x, center.y, sita),
					p2: instance.getRoatatedXY(fourCorner.p2.x,
						fourCorner.p2.y, center.x, center.y, sita),
					p3: instance.getRoatatedXY(fourCorner.p3.x,
						fourCorner.p3.y, center.x, center.y, sita),
					p4: instance.getRoatatedXY(fourCorner.p4.x,
						fourCorner.p4.y, center.x, center.y, sita)
				};
				var totalCount = instance.getJointPointNumber(newFourCorner.p1,
					newFourCorner.p2, ep);
				totalCount += instance.getJointPointNumber(newFourCorner.p2,
					newFourCorner.p3, ep);
				totalCount += instance.getJointPointNumber(newFourCorner.p3,
					newFourCorner.p4, ep);
				totalCount += instance.getJointPointNumber(newFourCorner.p4,
					newFourCorner.p1, ep);
				if (totalCount % 2 == 0) {
					return false;
				}
				return true;
			}
		};
		instance.selectObject = function(pos) {
			var sel = false,
				tmpSelected = instance.selected;
			for (var i = 0; i < instance.objects.length; i++) {
				var rect = instance.objects[i].rect;
				var rotate = instance.objects[i].transform.rotate;
				if (rotate == 0) {
					if (pos.x >= rect.left && pos.x <= rect.left + rect.width) {
						if (pos.y >= rect.top && pos.y <= rect.top + rect.height) {
							instance.objects[i].selected = true;
							instance.selected = instance.objects[i];
							sel = true;
							break;
						}
					}
				} else {
					var center = instance.objects[i].center;
					var isInner = PointInShapeJudger.isInRoatatedRect(pos,
						rect, center, rotate);
					if (isInner) {
						instance.objects[i].selected = true;
						instance.selected = instance.objects[i];
						sel = true;
						break;
					}
				}
			}
			if (!sel) {
				instance.deselectAll();
				return 2;
			} else {
				var resultFlag = 1;
				if (!tmpSelected)
					resultFlag = 0;
				if (tmpSelected && tmpSelected.id != instance.selected.id) {
					tmpSelected.selected = false;
					resultFlag = 0;
				}
				if (resultFlag == 0) {
					instance.redrawAll();
					$.jcSync.onSelect(instance, instance.selected.id);
				}
				return resultFlag;
			}
		};
		instance.deselectAll = function() {
			instance.selected = null;
			$("." + selectedCls).remove();
			for (var i = 0; i < instance.objects.length; i++) {
				if (instance.objects[i].selected) {
					instance.objects[i].selected = false;
				}
			}
			instance.redrawAll();
			$.jcSync.onDeselectAll();
		};
		instance.deleteObject = function(pos) {
			for (var i = instance.objects.length - 1; i >= 0; i--) {
				var rect = instance.objects[i].rect;
				if (pos.x >= rect.left && pos.x <= rect.left + rect.width) {
					if (pos.y >= rect.top && pos.y <= rect.top + rect.height) {
						instance.objects.splice(i, 1);
						break;
					}
				}
			}
			instance.redrawAll();
		};
		var printLast = function(arr, num) {
			var i = arr.length - num;
			if (arr.length - num < 0) {
				i = 0;
			}
			for (; i < arr.length; i++) {
				console.log(arr[i]);
			}
		};
		instance.transObject = function(object) {
			if (object.type == "line") {
				var tx = parseFloat(object.transform.translateX);
				var ty = parseFloat(object.transform.translateY);
				var sx = parseFloat(object.transform.scaleX);
				var sy = parseFloat(object.transform.scaleY);

				object.center.x = object.center.x + tx;
				object.center.y = object.center.y + ty;
				object.rect.width = object.rect.width * sx;
				object.rect.height = object.rect.height * sy;
				object.rect.left = object.center.x - object.rect.width / 2;
				object.rect.top = object.center.y - object.rect.height / 2;

				var dataArr = object.data;
				for (var index in dataArr) {
					dataArr[index] = {
						x: (dataArr[index].x + tx - object.center.x) * sx + object.center.x,
						y: (dataArr[index].y + ty - object.center.y) * sy + object.center.y
					};
				}

				object.transform.translateX = 0;
				object.transform.translateY = 0;
				object.transform.scaleX = 1;
				object.transform.scaleY = 1;
			} else if (object.type == "img") {
				var tx = parseFloat(object.transform.translateX);
				var ty = parseFloat(object.transform.translateY);
				var sx = parseFloat(object.transform.scaleX);
				var sy = parseFloat(object.transform.scaleY);

				object.center.x += tx;
				object.center.y += ty;
				object.rect.width *= sx;
				object.rect.height *= sy;
				object.rect.left = object.center.x - object.rect.width / 2;
				object.rect.top = object.center.y - object.rect.height / 2;

				object.transform.translateX = 0;
				object.transform.translateY = 0;
				object.transform.scaleX = 1;
				object.transform.scaleY = 1;
			}
		};
		var drawLine = function(from, to, flag) {
			if (flag) {
				renderContext.save();
				renderContext.globalCompositeOperation = "destination-out";
				renderContext.lineWidth = instance.options.eraserWidth;
				renderContext.lineCap = renderContext.lineJoin = "round";
				renderContext.beginPath();
				renderContext.moveTo(from.x, from.y);
				renderContext.lineTo(to.x, to.y);
				renderContext.stroke();
				renderContext.closePath();
			} else {
				context.save();
				context.beginPath();
				context.moveTo(from.x, from.y);
				context.lineTo(to.x, to.y);
				context.stroke();
				context.closePath();
			}
		};
		var getPos = function(e) {
			var canvas = instance.drawMaterials.canvas;
			var rect = $(canvas)[0].getBoundingClientRect();
			return {
				x: e.originalEvent.pageX - rect.left,
				y: e.originalEvent.pageY - rect.top
			};
		};
		var touchPos = function(e, i) {
			var canvas = instance.drawMaterials.canvas;
			var rect = $(canvas)[0].getBoundingClientRect();
			return {
				x: e.originalEvent.targetTouches[i].pageX - rect.left,
				y: e.originalEvent.targetTouches[i].pageY - rect.top
			};
		};
		var endPos = function(e, i) {
			var canvas = instance.drawMaterials.canvas;
			var rect = $(canvas)[0].getBoundingClientRect();
			return {
				x: e.originalEvent.changedTouches[i].pageX - rect.left,
				y: e.originalEvent.changedTouches[i].pageY - rect.top
			};
		};
		var rid = function() {
			return $.randomStr(5) + Date.now();
		};

		instance.getContext = function() {
			var res = {};
			for (var i = 0; i < contextProps.length; i++) {
				var prop = contextProps[i];
				res[prop] = context[prop];
			}
			res.width = $(instance.drawMaterials.canvas).width();
			res.height = $(instance.drawMaterials.canvas).height();
			res.topicMode = instance.topicMode;
			return res;
		};
		instance.putContext = function(data) {
			for (var i = 0; i < contextProps.length; i++) {
				var prop = contextProps[i];
				if (data[prop]) {
					if (["width", "height", "topicMode"].indexOf(prop) > -1) {
						continue;
					} else if (["lineWidth", "globalAlpha"].indexOf(prop) > -1) {
						context[prop] = parseInt(data[prop]);
					} else {
						context[prop] = data[prop];
					}
				}
			}
		};

		var jce = ".jce";

		var isStart = null;
		var lineId = null;
		var mdown = "mousedown.jce";
		var mmove = "mousemove.jce";
		var mend = "mouseup.jce mouseout.jce";
		var singleDrawLine = function(lineId, fromPos, toPos) {
			if (instance.topicMode == 2) {
				drawLine(fromPos, toPos, true);
			} else {
				drawLine(fromPos, toPos);
			}
			$.jcEvents.onDrawing({
				jc: instance,
				ctx: instance.getContext(),
				id: lineId,
				from: fromPos,
				to: toPos
			});
		};
		var singleFinishLine = function(lineId, lastPos) {
			$.jcEvents.onEndDraw({
				jc: instance,
				ctx: instance.getContext(),
				id: lineId,
				lastPos: lastPos
			});
		};

		var isTStart = {
			flag: false,
			flags: {},
			lineId: {},
			startPos: {},
			lastPos: {}
		};
		var drawingLine = function(id, fromPos, toPos, isTStart) {
			drawLine(fromPos, toPos);
			$.jcEvents.onDrawing({
				jc: instance,
				ctx: instance.getContext(),
				id: id,
				from: fromPos,
				to: toPos
			});
		};
		var finishLine = function(id, pos, flag) {
			$.jcEvents.onEndDraw({
				jc: instance,
				ctx: instance.getContext(),
				id: id,
				lastPos: pos,
				noLine: true
			});
		};
		var tstart = "touchstart.jce";
		var tmove = "touchmove.jce";
		var tcancel = "touchcancel.jce";
		var tend = "touchend.jce";

		// select mode
		var startAt = function(startPos) {
			var i = instance.selectObject(startPos);
			if (i == 2) {
				// deselect all
				return false;
			} else if (i == 0) {
				// change selection
				return false;
			} else {
				// not on canvas object
				return true;
			}
		};

		canvas.unbind(jce).bind(mdown, function(e) {
			if ($.sortAndFoldTuples)
				$.sortAndFoldTuples();
			if (!instance.allowWrite) {
				// 不允许写操作
				$(document).unbind(jce);
				return true;
			}
			if (isTStart.flag) {
				// 不支持touch启动之后的mouse
				$(document).unbind(jce);
				return true;
			}
			lineId = rid();
			isStart = true;
			var position = getPos(e);
			var lastPos = null;
			if (instance.canvasMode == 1) {
				instance.deleteObject(position);
			}
			if (instance.canvasMode == 2) {
				startAt(position);
				return true;
			}
			$(document).unbind(jce).bind(mmove, function(e) {
				if (!isStart)
					return;
				var pos = getPos(e);
				if (!lastPos) {
					if (instance.canvasMode == 0) {
						singleDrawLine(lineId, position, pos);
					} else if (instance.canvasMode == 1) {
						instance.deleteObject(pos);
					} else {
						$(document).unbind(jce);
						return true;
					}
				} else {
					if (instance.canvasMode == 0) {
						singleDrawLine(lineId, lastPos, pos);
					} else if (instance.canvasMode == 1) {
						instance.deleteObject(pos);
					} else {
						$(document).unbind(jce);
						return true;
					}
				}
				lastPos = pos;
			}).bind(mend, function(e) {
				if (!isStart)
					return;
				if (instance.canvasMode == 0) {
					singleFinishLine(lineId, lastPos || position);
				} else {
					$(document).unbind(jce);
				}
				isStart = false;
				position = null;
				lastPos = null;
			});
		}).bind(tstart, function(e) {
			if ($.sortAndFoldTuples)
				$.sortAndFoldTuples();
			if (!instance.allowWrite) {
				// 不允许写操作
				$(document).unbind(jce);
				return true;
			}
			if (isStart == true) {
				// 不支持mouse启动之后的touch
				$(document).unbind(jce);
				return true;
			}
			stopEvent(e);
			isTStart.flag = true;
			var tt = e.originalEvent.targetTouches;
			for (var i = 0; i < tt.length; i++) {
				var pos = touchPos(e, i);
				var id = tt[i].identifier;
				isTStart.lineId[id] = rid() + "_" + id;
				isTStart.flags[id] = true;
				isTStart.startPos[id] = pos;
				if (instance.canvasMode == 0) {
					finishLine(id, pos, true);
				}
				if (instance.canvasMode == 1) {
					instance.deleteObject(pos);
				}
				if (instance.canvasMode == 2) {
					startAt(pos);
					delete isTStart.lineId[id];
					delete isTStart.flags[id];
					delete isTStart.startPos[id];
					delete isTStart.lastPos[id];
					continue;
				}
			}
			$(document).unbind(jce).bind(tmove, function(me) {
				if (!isTStart.flag)
					return true;
				stopEvent(me);
				var dl = drawingLine;
				var tt = me.originalEvent.targetTouches;
				for (var i = 0; i < tt.length; i++) {
					var id = tt[i].identifier;
					if (isTStart.flags[id]) {
						var pos = touchPos(me, i);
						if (!isTStart.lastPos[id]) {
							isTStart.lastPos[id] = pos;
							if (instance.canvasMode == 0) {
								dl(id, isTStart.startPos[id], pos);
							} else if (instance.canvasMode == 1) {
								instance.deleteObject(pos);
							} else {
								delete isTStart.lineId[id];
								delete isTStart.flags[id];
								delete isTStart.startPos[id];
								delete isTStart.lastPos[id];
								continue;
							}

						} else {
							if (instance.canvasMode == 0) {
								dl(id, isTStart.lastPos[id], pos);
							} else if (instance.canvasMode == 1) {
								instance.deleteObject(pos);
							} else {
								delete isTStart.lineId[id];
								delete isTStart.flags[id];
								delete isTStart.startPos[id];
								delete isTStart.lastPos[id];
								continue;
							}
							isTStart.lastPos[id] = pos;
						}
					}
				}
			}).bind(tcancel, function(ce) {
				if (!isTStart.flag)
					return true;
				stopEvent(ce);
				var dl = drawingLine;
				var tt = ce.originalEvent.targetTouches;
				for (var i = 0; i < tt.length; i++) {
					var id = tt[i].identifier;
					if (isTStart.flags[id]) {
						var pos = touchPos(ce, i);
						if (!isTStart.lastPos[id]) {
							isTStart.lastPos[id] = pos;
							if (instance.canvasMode == 0) {
								dl(id, isTStart.startPos[id], pos);
							} else if (instance.canvasMode == 1) {
								instance.deleteObject(pos);
							} else {
								delete isTStart.lineId[id];
								delete isTStart.flags[id];
								delete isTStart.startPos[id];
								delete isTStart.lastPos[id];
								continue;
							}
						} else {
							if (instance.canvasMode == 0) {
								dl(id, isTStart.lastPos[id], pos);
							} else if (instance.canvasMode == 1) {
								instance.deleteObject(pos);
							} else {
								delete isTStart.lineId[id];
								delete isTStart.flags[id];
								delete isTStart.startPos[id];
								delete isTStart.lastPos[id];
								continue;
							}
							isTStart.lastPos[id] = pos;
						}
					}
				}
				var ct = ce.originalEvent.changedTouches;
				for (var i = 0; i < ct.length; i++) {
					var id = ct[i].identifier;
					if (isTStart.flags[id]) {
						var pos = endPos(ce, i);
						if (instance.canvasMode == 0) {
							finishLine(id, pos);
						}
						delete isTStart.lineId[id];
						delete isTStart.flags[id];
						delete isTStart.startPos[id];
						delete isTStart.lastPos[id];
						continue;
					}
				}
			}).bind(tend, function(ee) {
				if (!isTStart.flag)
					return true;
				stopEvent(ee);
				isTStart.flag = false;
				var ct = ee.originalEvent.changedTouches;
				var tt = ee.originalEvent.targetTouches;
				for (var i = 0; i < ct.length; i++) {
					var id = ct[i].identifier;
					if (isTStart.flags[id]) {
						var pos = endPos(ee, i);
						if (instance.canvasMode == 0) {
							finishLine(id, pos);
						}
						delete isTStart.lineId[id];
						delete isTStart.flags[id];
						delete isTStart.startPos[id];
						delete isTStart.lastPos[id];
						continue;
					}
				}
				for (var i = 0; i < tt.length; i++) {
					var id = tt[i].identifier;
					if (isTStart.flags[id]) {
						var pos = touchPos(ee, i);
						if (instance.canvasMode == 0) {
							finishLine(id, pos);
						}
						delete isTStart.lineId[id];
						delete isTStart.flags[id];
						delete isTStart.startPos[id];
						delete isTStart.lastPos[id];
						continue;
					}
				}
			});
		});
	};

	function fitStyle(domObject, toFit) {
		var s = $(domObject).css(toFit).replace("px", "");
		return parseFloat(s);
	}

	function getAngle(dom) {
		if (!dom.style) {
			dom = $(dom)[0];
		}
		var stl = dom.style.webkitTransform;
		if (!stl || stl.indexOf("rotate") == -1)
			return 0;
		var deg = stl.replace(/.*rotate\(/g, "").replace(/deg\).*/g, "");
		return parseFloat(deg);
	}
	$.fn.pulbDraggable = function(options) {
		var dom = this;
		var checkPos = function(oe) {
			var e = oe.originalEvent || oe;
			return (e.targetTouches.length > 0);
		};
		var isOnePos = function(oe) {
			var e = oe.originalEvent || oe;
			return (e.targetTouches.length == 1);
		};
		var getOnePos = function(oe) {
			var e = oe.originalEvent || oe;
			if (e.touches) {
				return {
					x: e.targetTouches[0].pageX,
					y: e.targetTouches[0].pageY
				};
			} else {
				return {
					x: e.pageX,
					y: e.pageY
				};
			}
		};
		var getTwoPos = function(oe, dom) {
			var xDom = $(dom).offsetParent()[0];
			var conRect = xDom.getBoundingClientRect();
			var e = oe.originalEvent || oe;
			return {
				x1: e.targetTouches[0].pageX - conRect.left,
				y1: e.targetTouches[0].pageY - conRect.top,
				x2: e.targetTouches[1].pageX - conRect.left,
				y2: e.targetTouches[1].pageY - conRect.top
			};
		};
		var initHelper = function(helper, dom) {
			helper.startSize = {
				w: fitStyle(dom, "width"),
				h: fitStyle(dom, "height")
			};
			helper.startPosition = {
				l: fitStyle(dom, "left"),
				t: fitStyle(dom, "top")
			};
			helper.startAngle = getAngle(dom);
		};
		var doTranslate = function(dom, helper, pos) {
			var stPos = helper.startEventPos;
			var stl = {
				left: pos.x - stPos.x + helper.startPosition.l,
				top: pos.y - stPos.y + helper.startPosition.t
			};
			$(dom).css(stl);
			if (options && options.onJlcMove) {
				options.onJlcMove.call(null, stl.left, stl.top);
			}
			if (options && options.afterJlcAction) {
				options.afterJlcAction.call();
			}
			if (options && options.setObjectParams) {
				options.setObjectParams.call(null, {
					l: (helper.startPosition.l),
					t: (helper.startPosition.t),
					w: (helper.startSize.w),
					h: (helper.startSize.h),
					r: (helper.startAngle)
				}, {
					l: (stl.left),
					t: (stl.top),
					w: ($(dom).width()),
					h: ($(dom).height()),
					r: (getAngle(dom))
				});
			}
		};
		var doMultiTransform = function(dom, helper, pos, rateLimit) {
			var stPos = helper.startEventPos;
			var stCen = {
				x: (stPos.x1 + stPos.x2) / 2,
				y: (stPos.y1 + stPos.y2) / 2
			};
			var cen = {
				x: (pos.x1 + pos.x2) / 2,
				y: (pos.y1 + pos.y2) / 2
			};
			var stEvtAngle = Math.atan2(stPos.y2 - stPos.y1, stPos.x2 - stPos.x1);
			var evtAngle = Math.atan2(pos.y2 - pos.y1, pos.x2 - pos.x1);
			var stDis = Math.sqrt((stPos.x1 - stPos.x2) * (stPos.x1 - stPos.x2) + (stPos.y1 - stPos.y2) * (stPos.y1 - stPos.y2));
			var dis = Math.sqrt((pos.x1 - pos.x2) * (pos.x1 - pos.x2) + (pos.y1 - pos.y2) * (pos.y1 - pos.y2));
			var rate = dis / stDis;
			if (rateLimit) {
				rate = Math.max(rate, rateLimit.min);
				rate = Math.min(rate, rateLimit.max);
			}
			var newW = helper.startSize.w * rate;
			var newH = helper.startSize.h * rate;
			var newL = cen.x - (stCen.x - helper.startPosition.l) * rate;
			var newT = cen.y - (stCen.y - helper.startPosition.t) * rate;
			var newA = helper.startAngle + (180 / Math.PI) * (evtAngle - stEvtAngle);
			$(dom).css({
				left: newL,
				top: newT,
				width: newW,
				height: newH,
				webkitTransform: "rotate(" + newA + "deg)"
			});
			if (options && options.onJlcMove) {
				options.onJlcMove.call(null, newL, newT);
			}
			if (options && options.onJlcResize) {
				options.onJlcResize.call(null, newW, newH);
			}
			if (options && options.onJlcRotate) {
				options.onJlcRotate.call(null, newA);
			}
			if (options && options.setObjectParams) {
				options.setObjectParams.call(null, {
					l: (helper.startPosition.l),
					t: (helper.startPosition.t),
					w: (helper.startSize.w),
					h: (helper.startSize.h),
					r: (helper.startAngle)
				}, {
					l: (newL),
					t: (newT),
					w: (newW),
					h: (newH),
					r: (newA)
				});
			}
		};
		var $document = $(document);
		var helper = {
			started: false,
			condition: null,
			startEventPos: null,
			startSize: null,
			startPosition: null,
			startAngle: null
		};
		$(dom).bind(
			"mousedown",
			function(downEvent) {
				stopEvent(downEvent);
				if ($(downEvent.target).is(".operateBtn")) {
					return true;
				}
				helper.started = true;
				var domObject = $(dom)[0];
				initHelper(helper, domObject);
				helper.startEventPos = getOnePos(downEvent);
				if (options && options.onJlcStart) {
					options.onJlcStart.call();
				}
				$document.unbind("mousemove").bind("mousemove",
					function(moveEvent) {
						stopEvent(moveEvent);
						if (helper.started) {
							var mep = getOnePos(moveEvent);
							doTranslate(domObject, helper, mep);
						}
					});
				$document.unbind("mouseup").bind("mouseup",
					function(upEvent) {
						stopEvent(upEvent);
						if (helper.started) {
							helper.started = false;
							helper.condition = null;
							helper.startEventPos = null;
							helper.startSize = null;
							helper.startPosition = null;
							if (options && options.afterJlcTransform) {
								options.afterJlcTransform.call();
							}
						}
					});
			});
		$(dom).bind(
			"touchstart",
			function(startEvent) {
				stopEvent(startEvent);
				var domObject = $(dom)[0];
				var parObject = null;
				if ($(startEvent.target).is("." + selectedCls)) {
					parObject = startEvent.target;
				} else {
					parObject = $(startEvent.target).closest(
						"." + selectedCls)[0];
				}
				var rateLimit = $.getScaleLimit(domObject);
				if (domObject == parObject) {
					if (!checkPos(startEvent)) {
						return true;
					}
					helper.started = true;
					initHelper(helper, domObject);
					if (isOnePos(startEvent)) {
						helper.condition = 1;
						helper.startEventPos = getOnePos(startEvent);
					} else {
						helper.condition = 2;
						helper.startEventPos = getTwoPos(startEvent,
							domObject);
					}
					if (options && options.onJlcStart) {
						options.onJlcStart.call();
					}
				}
				$document.unbind("touchmove")
					.bind(
						"touchmove",
						function(moveEvent) {
							stopEvent(moveEvent);
							if (helper.started) {
								if (!checkPos(moveEvent))
									return true;
								if (isOnePos(moveEvent)) {
									var mep = getOnePos(moveEvent);
									if (helper.condition == "1") {
										doTranslate(domObject,
											helper, mep);
									} else {
										initHelper(helper,
											domObject);
										helper.condition = 1;
										helper.startEventPos = mep;
									}
								} else {
									var mep = getTwoPos(moveEvent,
										domObject);
									if (helper.condition == "2") {
										doMultiTransform(domObject,
											helper, mep,
											rateLimit);
									} else {
										initHelper(helper,
											domObject);
										helper.condition = 2;
										helper.startEventPos = mep;
									}
								}
							}
						});
				$document.unbind("touchend").bind("touchend",
					function(endEvent) {
						stopEvent(endEvent);
						if (helper.started) {
							helper.started = false;
							helper.condition = null;
							helper.startEventPos = null;
							helper.startSize = null;
							helper.startPosition = null;
							if (options && options.afterJlcTransform) {
								options.afterJlcTransform.call();
							}
						}
					});
			});
	};
	$.getScaleLimit = function(object) {
		var dwp = document.documentElement.clientWidth - 200;
		var dhp = document.documentElement.clientHeight - 40;
		var w = fitStyle(object, "width");
		var h = fitStyle(object, "height");
		var maxRate = Math.min(dwp / w, dhp / h);
		var minRate = Math.max(200 / w, 200 / h);
		minRate = Math.min(1, minRate);
		return {
			max: maxRate,
			min: minRate
		};
	};
	var minBoxSize = 15;
	var getBtnStr = function(id, dir, stl) {
		return $("<div class='operateBtn' id='" + id + "' style='background:url(../resource/images/arrow_" + dir + ".png);" + stl + "'></div>");
	};
	$.fn.pulbMouseTranform = function(options) {
		var target = $(this);
		var _this = target.find("." + options.target);
		if (_this.size() > 0) {
			_this = $(options.target);
		} else {
			var leftBtn = getBtnStr("leftBtn", "left", "left:0;top:50%;");
			var rightBtn = getBtnStr("rightBtn", "right", "right:0;top:50%");
			var upBtn = getBtnStr("upBtn", "up", "left:50%;top:0;");
			var downBtn = getBtnStr("downBtn", "down", "left:50%;bottom:0;");
			var leftUpBtn = getBtnStr("leftUpBtn", "in", "left:0;top:0;");
			var leftDownBtn = getBtnStr("leftDownBtn", "in", "left:0;bottom:0;");
			var rightUpBtn = getBtnStr("rightUpBtn", "in", "right:0;top:0;");
			var rightDownBtn = getBtnStr("rightDownBtn", "in",
				"right:0;bottom:0;");
			target.append(leftBtn).append(rightBtn).append(upBtn).append(
				downBtn).append(leftUpBtn).append(leftDownBtn).append(
				rightUpBtn).append(rightDownBtn);
			_this = $([leftUpBtn[0], leftDownBtn[0], rightDownBtn[0],
				rightUpBtn[0], leftBtn[0], rightBtn[0], upBtn[0],
				downBtn[0]
			]);
		}
		var isStart = false;
		var center = null;
		var startStl = null;
		var startCo = null;
		var resetAll = function() {
			isStart = false;
			center = null;
			startStl = null;
			startCo = null;
		};
		var getMouseEPos = function(downEvt) {
			var xDom = $(target).offsetParent()[0];
			var rect = xDom.getBoundingClientRect();
			var startEvt = downEvt.originalEvent || downEvt;
			return {
				x: startEvt.pageX - rect.left,
				y: startEvt.pageY - rect.top
			};
		};
		var setInit = function(downEvt) {
			var xleft = fitStyle(target, "left");
			var xtop = fitStyle(target, "top");
			var xwidth = fitStyle(target, "width");
			var xheight = fitStyle(target, "height");
			center = {
				x: xleft + xwidth / 2,
				y: xtop + xheight / 2
			};
			startStl = {
				l: xleft,
				t: xtop,
				w: xwidth,
				h: xheight,
				r: getAngle(target)
			};
			startCo = getMouseEPos(downEvt);
		};
		var relAngle = function(pos, o) {
			var hd = Math.atan2(pos.y - o.y, pos.x - o.x);
			return hd * 180 / Math.PI;
		};
		var relScale = function(a, b, o) {
			var dis1 = Math.sqrt((a.x - o.x) * (a.x - o.x) + (a.y - o.y) * (a.y - o.y));
			var dis2 = Math.sqrt((b.x - o.x) * (b.x - o.x) + (b.y - o.y) * (b.y - o.y));
			return dis2 / dis1;
		};
		var $document = $(document);
		var getDataOpts = function(stl, newW, newH, newA) {
			var nowStl = {
				l: stl.left,
				t: stl.top,
				w: newW,
				h: newH,
				r: newA
			};
			return {
				startParams: startStl,
				endParams: nowStl
			};
		};
		_this.unbind().bind("mousedown", function(downEvt) {
			stopEvent(downEvt);
			isStart = true;
			setInit(downEvt);
			if (options.onStart) {
				options.onStart.call();
			}
			var rateLimit = $.getScaleLimit($(target)[0]);
			$document.unbind("mousemove").bind("mousemove", function(moveEvt) {
				stopEvent(moveEvt);
				if (isStart) {
					var nowCo = getMouseEPos(moveEvt);
					var stEvtAngle = relAngle(startCo, center);
					var evtAngle = relAngle(nowCo, center);
					var newA = evtAngle - stEvtAngle + startStl.r;
					target.css({
						webkitTransform: "rotate(" + newA + "deg)"
					});
					var rate = relScale(startCo, nowCo, center);
					var newW = startStl.w * rate;
					var newH = startStl.h * rate;
					if (newW < minBoxSize || newH < minBoxSize) {
						if (newW > newH) {
							rate = minBoxSize / startStl.h;
						} else {
							rate = minBoxSize / startStl.w;
						}
						if (rateLimit) {
							rate = Math.max(rate, rateLimit.min);
							rate = Math.min(rate, rateLimit.max);
						}
						newW = startStl.w * rate;
						newH = startStl.h * rate;
						target.css({
							width: newW,
							height: newH
						});
						var stl = {
							left: startStl.l - (newW - startStl.w) * 0.5,
							top: startStl.t - (newH - startStl.h) * 0.5
						};
						target.css(stl);
						if (options.onTransform) {
							var data = getDataOpts(stl, newW, newH, newA);
							options.onTransform.call(null, data);
						}
					} else {
						if (rateLimit) {
							rate = Math.max(rate, rateLimit.min);
							rate = Math.min(rate, rateLimit.max);
						}
						newW = startStl.w * rate;
						newH = startStl.h * rate;
						target.css({
							width: newW,
							height: newH
						});
						var stl = {
							left: startStl.l - (newW - startStl.w) * 0.5,
							top: startStl.t - (newH - startStl.h) * 0.5
						};
						target.css(stl);
						if (options.onTransform) {
							var data = getDataOpts(stl, newW, newH, newA);
							options.onTransform.call(null, data);
						}
					}
				}
			}).unbind("mouseup").bind("mouseup", function(upEvt) {
				stopEvent(upEvt);
				if (isStart) {
					resetAll();
					if (options.onFinish) {
						options.onFinish.call();
					}
				}
			});
		});
	};
	$.fn.simpleCanvas = function(opts) {
		return new simpleCanvas(this, opts);
	};
	$(function() {
		if ($("#simThread").size() == 0) {
			var ifm = "<iframe id='simThread' src='../canvas/thread.html'></iframe>";
			$(ifm).hide().appendTo("body");
		}
		$.startScriptThread("../canvas/v2.0/ic-thread.js", false);
	});
})(jQuery);