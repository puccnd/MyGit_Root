/**
 * 预览页面的处理
 *
 * @param {Object} $
 *
 * @author Libo.Pu
 */
(function($) {
	var defaults = {
		previewPages: [],
		currentPreview: 0,
		marginPreserved: 50,
		paddingPreserved: 10
	};
	$.previews = {
		defaults: defaults
	};
	$.savePreviousContent = function(page) {
		//TODO
	};
	$.loadCurrentContent = function(page) {
		//TODO
	};
	$.addPreview = function() {
		var prevPage = $(".my-preview-item.my-selected");
		if (prevPage) {
			// TODO
		}
	};
	$.delPreview = function() {
		var prevPage = $(".my-preview-item.my-selected");
		if (prevPage) {
			// TODO
		}
	};
	$.prevPreview = function() {
		var prevPage = $(".my-preview-item.my-selected");
		if (prevPage) {
			// TODO
		}
	};
	$.nextPreview = function() {
		var prevPage = $(".my-preview-item.my-selected");
		if (prevPage) {
			// TODO
		}
	};
	$.resizePreview = function() {
		var mask = $(".my-previews-mask");
		var total = parseInt(mask.attr("totalPages"));
		var content = mask.data("content");
		var size = getDocSize();
		var m2 = defaults.marginPreserved * 2;
		var destVal = Math.min(size.width - m2, size.height - m2);
		var destBoxVal = (destVal - 4 * defaults.paddingPreserved) / 3;
		var styleMe = {
			left: (size.width - destVal) / 2,
			top: (size.height - destVal) / 2,
			width: destVal,
			height: destVal,
			maxWidth: destVal,
			maxHeight: destVal
		};
		content.css(styleMe);
		mask.data("styleMe", styleMe);
		content.find(".my-preview-item").css({
			width: destBoxVal,
			height: destBoxVal
		});
		content.find(".my-previews-page").css({
			maxWidth: destVal
		});
		var stl = {
			width: destBoxVal,
			height: destBoxVal - 30
		};
		content.find(".my-previews-img").each(function() {
			var w = this.width;
			var h = this.height;
			var r = Math.min(stl.width / w, stl.height / h);
			w *= r;
			h *= r;
			$(this).css({
				maxWidth: stl.width,
				maxHeight: stl.height,
				marginLeft: 0.5 * (stl.width - w),
				marginTop: 0.5 * (stl.height - h)
			});
		});
		var currPage = parseInt(content.find(".my-previews-container").attr("currentPage"));
		content.find(".my-previews-container").css({
			maxHeight: destVal,
			width: total * destVal,
			webkitTransform: "translateX(" + (-styleMe.width * currPage) + "px)"
		});
	};
	var getDocSize = function() {
		return {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight
		};
	};
	var makeClick = function(obj, call) {
		$(obj).unbind(".preview").bind("click.preview touchstart.preview", call);
	};
	var fitBoxWithImage = function(picBox, stl, url, isBlank) {
		var image = new Image();
		image.onload = function() {
			var w = this.width;
			var h = this.height;
			var r = Math.min(stl.width / w, stl.height / h);
			w *= r;
			h *= r;
			$(this).addClass("my-previews-img").css({
				maxWidth: stl.width,
				maxHeight: stl.height,
				marginLeft: 0.5 * (stl.width - w),
				marginTop: 0.5 * (stl.height - h)
			}).appendTo(picBox);
			if (isBlank)
				$(this).addClass("my-transparent");
		};
		try {
			image.onerror = function() {
				fitBoxWithImage(picBox, stl, "img/error.jpg");
			};
		} catch (e) {}
		image.src = url;
	};
	var simpleClosableMask = function(mask) {
		var close = $("<div class='my-close'>×</div>").appendTo(mask);
		makeClick(close, function() {
			var mask = $(this).closest(".my-previews-mask");
			var content = mask.data("content");
			var prev = mask.data("prev");
			var next = mask.data("next");
			mask.remove();
			content.remove();
			prev.remove();
			next.remove();
		});
	};
	var startEyeHealthMask = function() {
		$("<div class='my-eye-heath-mask' />").appendTo("body");
	};
	var stopEyeHealthMask = function() {
		$(".my-eye-heath-mask").remove();
	};
	$.fn.tranformAnimate = function(opts) {
		var _this = this;
		if (!opts.timeout)
			opts.timeout = 80;
		var timeSlice = 1;
		var time = 0,
			total = opts.timeout / timeSlice;
		var transformAniTick = null;
		var act = function() {
			var sx = opts.fromX;
			var sy = opts.fromY;
			if ((opts.toY == 0 || opts.toY) && (opts.toX == 0 || opts.toX)) {
				var tx = opts.fromX + (time / total) * (opts.toX - opts.fromX);
				var ty = opts.fromY + (time / total) * (opts.toY - opts.fromY);
				$(_this).css({
					webkitTransform: "translate(" + tx + "px," + ty + "px)"
				});
			} else if ((opts.toX == 0 || opts.toX) && !opts.toY) {
				var tx = opts.fromX + (time / total) * (opts.toX - opts.fromX);
				$(_this).css({
					webkitTransform: "translateX(" + tx + "px)"
				});
			} else if ((opts.toY == 0 || opts.toY) && !opts.toX) {
				var ty = opts.fromY + (time / total) * (opts.toY - opts.fromY);
				$(_this).css({
					webkitTransform: "translateY(" + ty + "px)"
				});
			}
			if (time >= total) {
				if (transformAniTick)
					window.clearTimeout(transformAniTick);
				stopEyeHealthMask();
				return;
			} else {
				time += 1;
				transformAniTick = window.setTimeout(function() {
					if (transformAniTick)
						window.clearTimeout(transformAniTick);
					act();
				}, timeSlice);
				return;
			}
		};
		startEyeHealthMask();
		act();
	};
	$.fn.canClickPreview = function() {
		var _this = this;
		makeClick(_this, function() {
			if (_this.find(".my-previews-img").is(".my-transparent"))
				return;
			var prevPage = $(".my-preview-item.my-selected");
			if ($.savePreviousContent) {
				$.savePreviousContent(prevPage);
			}
			if (prevPage.attr("seq") == $(_this).attr("seq"))
				return;
			defaults.currentPreview = parseInt($(_this).attr("seq"));
			prevPage.removeClass("my-selected");
			$(_this).addClass("my-selected");
			if ($.loadCurrentContent) {
				$.loadCurrentContent($(_this));
			}
		});
		return $(this);
	};
	$.fn.previewGoPrev = function() {
		makeClick(this, function() {
			var pages = $(".my-previews-page");
			var currPage = $(".my-previews-container").attr("currentPage");
			var currPageNo = parseInt(currPage);
			if (pages.length == 1) {
				$.messager.show({
					msg: "只有一页，无法翻动。",
					timeout: 2000,
					cond: 2
				});
			} else if (currPageNo == 0) {
				$.messager.show({
					msg: "已经到了第一页，无法翻动。",
					timeout: 2000,
					cond: 2
				});
			} else {
				var styleMe = $(".my-previews-mask").data("styleMe");
				var next = currPageNo - 1;
				$(".my-previews-container").attr("currentPage", next);
				$(".my-previews-container").tranformAnimate({
					fromX: (-styleMe.width * currPageNo),
					toX: (-styleMe.width * next)
				});
			}
		});
		return $(this);
	};
	$.fn.previewGoNext = function() {
		makeClick(this, function() {
			var pages = $(".my-previews-page");
			var currPage = $(".my-previews-container").attr("currentPage");
			var currPageNo = parseInt(currPage);
			var num = pages.size() - 1;
			if (pages.length == 1) {
				$.messager.show({
					msg: "只有一页，无法翻动。",
					timeout: 2000,
					cond: 2
				});
			} else if (currPageNo == num) {
				$.messager.show({
					msg: "已经到了最后一页，无法翻动。",
					timeout: 2000,
					cond: 2
				});
			} else {
				var styleMe = $(".my-previews-mask").data("styleMe");
				var next = currPageNo + 1;
				$(".my-previews-container").attr("currentPage", next);
				$(".my-previews-container").tranformAnimate({
					fromX: (-styleMe.width * currPageNo),
					toX: (-styleMe.width * next)
				});
			}
		});
		return $(this);
	};
	var pages = [];
	$.fn.previews = function(opts) {
		$(this).addClass("my-previews");
		var size = getDocSize();
		var mask = $("<div class='my-previews-mask' />").appendTo("body");
		simpleClosableMask(mask);
		var prev = $("<div class='my-previews-prev' />").appendTo("body");
		var next = $("<div class='my-previews-next' />").appendTo("body");
		var previews = $(this).appendTo("body");
		var m2 = defaults.marginPreserved * 2;
		var destVal = Math.min(size.width - m2, size.height - m2);
		var destBoxVal = (destVal - 4 * defaults.paddingPreserved) / 3;
		var styleMe = {
			left: (size.width - destVal) / 2,
			top: (size.height - destVal) / 2,
			width: destVal,
			height: destVal,
			maxWidth: destVal,
			maxHeight: destVal
		};
		mask.data({
			content: $(this),
			prev: prev,
			next: next,
			opts: opts,
			styleMe: styleMe
		});
		previews.css(styleMe);
		var x = (styleMe.left - 50) / 2;
		x < 10 ? (x = 10) : null;
		prev.html("&lt;").css({
			left: x
		}).previewGoPrev();
		next.html("&gt;").css({
			right: x
		}).previewGoNext();
		var defaultPage = [null, null, null, null, null, null, null, null, null];
		defaults.previewPages = opts.previews;
		if (!opts || !opts.previews) {
			opts = {
				previews: defaultPage
			};
		} else if (opts.previews.length % 9 != 0) {
			var x = 9 - opts.previews.length % 9;
			for (var i = 0; i < x; i++) {
				opts.previews.push(null);
			}
		}
		var total = Math.ceil(opts.previews.length / 9);
		mask.attr("totalPages", total);
		var currPage = Math.floor(defaults.currentPreview / 9);
		pages = [];
		var container = $("<div class='my-previews-container' />").appendTo(previews);
		container.css({
			maxHeight: destVal,
			width: total * destVal,
			webkitTransform: "translateX(" + (-styleMe.width * currPage) + "px)"
		}).attr("currentPage", currPage);
		for (var i = 0; i < total; i++) {
			var page = $("<div class='my-previews-page' />").appendTo(container);
			page.attr("page", i).css(
				"max-width", styleMe.width + "px");
			pages.push(page);
		}
		for (var i = 0; i < opts.previews.length; i++) {
			var idx = Math.floor(i / 9);
			var img = opts.previews[i];
			var box = $("<div class='my-preview-item' />").appendTo(pages[idx]);
			if (i == defaults.currentPreview)
				box.addClass("my-selected");
			box.attr("seq", i).css({
				width: destBoxVal,
				height: destBoxVal
			}).canClickPreview();
			var pic = $("<div class='my-picture-box' />").appendTo(box);
			pic.attr("seq", i).css({
				height: destBoxVal - 30
			});
			fitBoxWithImage(pic, {
				width: destBoxVal,
				height: destBoxVal - 30
			}, (img == null ? "img/blank.png" : img), (img == null ? true : false));
			var desc = $("<div class='my-picture-desc' />").appendTo(box);
			desc.html("第" + (i + 1) + "页");
		}
		return $(this);
	};
})(jQuery);