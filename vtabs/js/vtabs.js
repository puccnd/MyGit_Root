(function($) {
	var tabWidths = [31, 51];
	var getParam = function(param) {
		var a = location.search;
		var r = new RegExp(".*" + param + "=", "g");
		var mode = a.replace(/#.*/g, "").replace(r, "").replace(/&.*/g, "");
		if (!mode || mode == "") {
			return 1;
		} else {
			return mode;
		}
	};
	var tabMode = getParam("mode");
	var randomId = function() {
		return ("vtid_" + Math.random()).replace(".", "");
	};
	var simClick = function(o, f) {
		$(o).unbind(".vtabs").bind("click.vtabs touchstart.vtabs", f);
	};
	var docWH = function() {
		return {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight
		};
	}
	var checkFmParentAnimation = function(vtab, vfms, width) {
		var dwh = docWH();
		vtab.stop().animate({
			right: width
		}, "normal");
		vfms.stop().animate({
			width: width
		}, "normal");
	};
	var checkFmParentAnimation = function(vtab, vfms, width) {
		var dwh = docWH();
		vtab.stop().animate({
			right: width
		}, "normal");
		vfms.stop().animate({
			width: width
		}, "normal");
	};
	var closeFmParentAnimation = function(vtab, vfms) {
		vtab.stop().animate({
			right: 0
		}, "normal");
		vfms.stop().animate({
			width: 0
		}, "normal");
		$(vtab).find(".my-vlabel").removeClass("my-selected");
	};
	var resizeFmParent = function(vtab, vfms) {
		var dwh = docWH();
		var ctt = vtab.find(".my-page-content");
		var h1 = $(vtab.find(".my-page-up")).outerHeight();
		var h2 = $(vtab.find(".my-page-dn")).outerHeight();
		ctt.css({
			height: dwh.height - h1 - h2
		});
	};
	var changeSelected = function(ctt, item) {
		$(ctt).find(".my-vlabel").removeClass("my-selected");
		$(item).find(".my-vlabel").addClass("my-selected");
	};
	var withStrCommand = function(object, command, data) {
		var vtab = $(object).find(".my-vtabs");
		var vfms = $(object).find(".my-vfms");
		switch (command) {
			case "fixWidth":
				checkFmParentAnimation(vtab, vfms, data);
				break;
			case "closeTab":
				closeFmParentAnimation(vtab, vfms);
				break;
			case "resize":
				resizeFmParent(vtab, vfms);
				break;
			case "relogin":
				break;
			default:
				break;
		}
	};
	$.fn.vtabs = function(options, data) {
		if (typeof options == "string") {
			return withStrCommand(this, options, data);
		}
		var dwh = docWH();
		var _this = this;
		$(options.blank).css({
			width: dwh.width - tabWidths[tabMode]
		});
		var vtab = $("<div />").addClass("my-vtabs").appendTo(_this);
		if (tabMode == 1) {
			vtab.addClass("my-vtabs-mode2");
		}
		var vfms = $("<div />").addClass("my-vfms").appendTo(_this);
		if (!$(_this).is("body")) {
			if (!$(_this).css("position") || $(_this).css("position") == "")
				$(_this).css("position", "relative");
		}
		if (options.align == "left") {
			vtab.css({
				left: 0
			});
			vfms.css({
				left: 0
			});
			$(options.blank).css({
				left: 31
			});
		} else if (options.align == "right") {
			vtab.css({
				right: 0
			});
			vfms.css({
				right: 0
			});
		}
		var cHeight = 0;
		if (options.paging) {
			vtab.append("<div id='mypageup' class='my-page-up'>&nbsp;&nbsp;&nbsp;</div>")
				.append("<div id='mypagecontent' class='my-page-content'></div>")
				.append("<div id='mypagedown' class='my-page-dn'>&nbsp;&nbsp;&nbsp;</div>");
			var h1 = $(vtab.find(".my-page-up")).outerHeight();
			var h2 = $(vtab.find(".my-page-dn")).outerHeight();
			cHeight = dwh.height - h1 - h2;
		} else {
			vtab.append("<div id='mypagecontent' class='my-page-content'></div>")
			cHeight = dwh.height;
		}
		var ctt = vtab.find(".my-page-content");
		ctt.css("height", cHeight + "px");
		var list = $("<ul class='my-page-list' />").appendTo(ctt);
		for (var i = 0; i < options.items.length; i++) {
			var item = options.items[i],
				site = item.url,
				width = item.width || 300;
			if (typeof width == "string") {
				width = dwh.width * parseFloat(width.replace("%", "")) / 100;
			}
			var name = "<span class='my-vlabel'>" + item.text + "</span>";
			var o = $("<li class='my-page-option'>" + name + "</li>");
			o.attr({
				width: width,
				id: randomId(),
				url: site
			});
			list.append(o);
			simClick(o, function(e) {
				changeSelected(ctt, this);
				var oid = $(this).attr("id");
				var site = $(this).attr("url");
				var width = $(this).attr("width");
				var fm = _this.find("iframe[fid=" + oid + "]");
				if (fm.size() == 0) {
					vfms.find(".my-fm-view").hide();
					var fm = $("<iframe frameborder='noBorder' src=''></iframe>");
					fm.addClass("my-fm-view").css({
						width: width + "px",
						height: "100%"
					}).attr({
						src: site
					});
					vfms.append(fm);
					withStrCommand(_this, "fixWidth", width);
				} else {
					vfms.find(".my-fm-view").hide();
					fm.show();
					withStrCommand(_this, "fixWidth", width);
				}
			});
		}
		return $(this);
	};
})(jQuery);