(function(w, $) {
	var comTick = null;
	w.PU = $.PU = {
		withWindow: function(win, itemId, itemText) {
			switch (itemId) {
				case "texts1":
					win.find(".page").attr({
						src: "basicui/index.html"
					});
					break;
				case "texts2":
					win.find(".page").attr({
						src: "basicui/validate.html"
					});
					break;
				case "loginDemo":
					win.find(".page").attr({
						src: "login/index.html"
					});
					break;
				case "whiteboard":
					win.find(".page").attr({
						src: "whiteboard/index.html"
					});
					break;
				case "buttons":
					win.find(".page").attr({
						src: "buttons/index.html"
					});
					break;
				case "hOptions":
					win.find(".page").attr({
						src: "options/horizon.html"
					});
					break;
				case "vOptions":
					win.find(".page").attr({
						src: "options/vertical.html"
					});
					break;
				case "previews":
					win.find(".page").attr({
						src: "preview/index.html"
					});
					break;
				case "borderLayout":
					win.find(".page").attr({
						src: "layout/border.html"
					});
					break;
				case "rowLayout":
					win.find(".page").attr({
						src: "layout/rows.html"
					});
					break;
				case "vList":
					win.find(".page").attr({
						src: "list/vertical.html"
					});
					break;
				case "hList":
					win.find(".page").attr({
						src: "list/horizon.html"
					});
					break;
				case "flowIconList":
					win.find(".page").attr({
						src: "list/flow-icons.html"
					});
					break;
				case "pagedIconList":
					win.find(".page").attr({
						src: "list/paged-icons.html"
					});
					break;
				case "popMenu":
					win.find(".page").attr({
						src: "menu/popup.html"
					});
					break;
				case "popInformation":
					win.find(".page").attr({
						src: "msg/index.html"
					});
					break;
				case "operatableGrid":
					win.find(".page").attr({
						src: "grid/index.html"
					});
					break;
				case "pagedGrid":
					win.find(".page").attr({
						src: "grid/paged.html"
					});
					break;
				case "windows":
					win.find(".page").attr({
						src: "http://www.baidu.com"
					});
					break;
				case "dialogs":
					win.find(".page").attr({
						src: "http://www.baidu.com"
					});
					break;
				case "calendars":
					win.find(".page").attr({
						src: "http://www.baidu.com"
					});
					break;
				case "trees":
					win.find(".page").attr({
						src: "http://www.baidu.com"
					});
					break;
				case "combos":
					win.find(".page").attr({
						src: "http://www.baidu.com"
					});
					break;
				case "progresses":
					win.find(".page").attr({
						src: "http://www.baidu.com"
					});
					break;
				case "colors":
					win.find(".page").attr({
						src: "http://www.baidu.com"
					});
					break;
				case "fineTuning":
					win.find(".page").attr({
						src: "http://www.baidu.com"
					});
					break;
				case "scroller":
					win.find(".page").attr({
						src: "pageScroller/index.html"
					});
					break;
				case "bookPage":
					win.find(".page").attr({
						src: "http://www.baidu.com"
					});
					break;
				case "codeStyle":
					win.find(".page").attr({
						src: "http://www.baidu.com"
					});
					break;
				case "imageSlider":
					win.find(".page").attr({
						src: "http://www.baidu.com"
					});
					break;
				case "galleryPlayer":
					win.find(".page").attr({
						src: "http://www.baidu.com"
					});
					break;
				case "musicPlayer":
					win.find(".page").attr({
						src: "http://www.baidu.com"
					});
					break;
				case "videoPlayer":
					win.find(".page").attr({
						src: "http://www.baidu.com"
					});
					break;
				case "simpleAnimate":
					win.find(".page").attr({
						src: "http://www.baidu.com"
					});
					break;
				default:
					break;
			}
		},
		unselectable: function() {
			document.onselectstart = function() {
				return false;
			};
		},
		click: function(obj, callback) {
			$(obj).unbind("click touchstart").bind("click touchstart", function(evt) {
				callback.call(this, evt);
			});
		},
		canDraw: function(can) {
			$(can).fitDocSize();
			this.jlc = new jc(can).start();
		},
		uiComLeft: function() {
			var cellWidth = $(".my-cell").width();
			var listWidth = $(".my-list").find("li").size() * 107 + 7;
			var stl = $(".my-list").attr("style");
			var currentPos = 0;
			if (stl) {
				currentPos = stl.replace(/.*translateX\(|px\).*/ig, "");
				try {
					currentPos = parseFloat(currentPos);
					if (currentPos == NaN) return;
				} catch (e) {
					return;
				}
			}
			var pos = currentPos - cellWidth;
			if (pos < cellWidth - listWidth) {
				pos = cellWidth - listWidth;
			}
			var stlStr = "translateX(" + pos + "px)";
			$(".my-list").meAni({
				webkitTransform: stlStr
			}, "fast");
		},
		uiComRight: function() {
			var cellWidth = $(".my-cell").width();
			var listWidth = $(".my-list").find("li").size() * 107 + 7;
			var stl = $(".my-list").attr("style");
			var currentPos = 0;
			if (stl) {
				currentPos = stl.replace(/.*translateX\(|px\).*/ig, "");
				try {
					currentPos = parseFloat(currentPos);
					if (currentPos == NaN) return;
				} catch (e) {
					return;
				}
			}
			var pos = currentPos + cellWidth;
			if (pos > 0) {
				pos = 0;
			}
			var stlStr = "translateX(" + pos + "px)";
			$(".my-list").meAni({
				webkitTransform: stlStr
			}, "fast");
		},
		timeoutMask: function(timeout, str) {
			var _this = this;
			_this.openMask(str);
			var jj = null;
			jj = window.setTimeout(function() {
				_this.closeMask();
			}, timeout || 1000);
		},
		openMask: function(str) {
			var mask = $("<div />").addClass("my-global-mask").appendTo("body");
			$("<div />").html(str).css({
				position: "absolute",
				top: "30%",
				height: 40,
				lineHeight: "40px",
				width: "100%",
				textAlign: "center",
				fontSize: "30px",
				fontWeight: "bold",
				color: "white"
			}).appendTo(mask);
		},
		closeMask: function() {
			$(".my-global-mask").remove();
		}
	};
	$(function() {
		PU.unselectable();
		PU.click(".my-turn-right", function() {
			PU.timeoutMask(800, "正在运行，请稍等……");
			if (comTick)
				window.clearTimeout(comTick);
			comTick = window.setTimeout(PU.uiComLeft, 100);
		});
		PU.click(".my-turn-left", function() {
			PU.timeoutMask(800, "正在运行，请稍等……");
			if (comTick)
				window.clearTimeout(comTick);
			comTick = window.setTimeout(PU.uiComRight, 100);
		});
		PU.click(".my-list-item", function() {
			var itemId = this.id;
			var itemText = this.innerHTML;
			var win = $("<div />").iWindow({
				id: "ifm_" + itemId,
				title: itemText,
				leftMargin: 0,
				rightMargin: 0,
				topMargin: 0,
				bottomMargin: 142,
				width: "80%",
				height: "80%",
				hasIframe: true,
				modal: true,
				buttonPanel: false,
				winSize: "max"
			});
			PU.withWindow(win, itemId, itemText);
		});
		PU.canDraw("#myCanvas");
	})
})(window, jQuery);