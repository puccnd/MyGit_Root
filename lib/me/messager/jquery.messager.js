/**
 * 模拟jQuery的EasyUI实现messager对象的alert及show方法
 *
 * 待实现：confirm
 */
(function($) {
	var getDiv = function(clsName) {
		if (!clsName)
			return $("<div />");
		return $("<div />").addClass(clsName);
	};
	var getButton = function(str) {
		return $("<button>" + str + "</button>");
	};
	var getStyle = function(id, content) {
		var stl = $("<style type='text/css'></style>");
		stl.attr("id", id).append(content);
		return stl;
	};
	var makeClick = function(obj, call) {
		$(obj).unbind(".messager").bind("click.messager touchstart.messager", call);
	};
	var timeoutClose = function(win, timeout) {
		var tickMsg = null,
			tickMsg2 = null;
		tickMsg = window.setTimeout(function() {
			$(win).prev(".my-popwin-mask").fadeOut();
			$(win).fadeOut();
			if (tickMsg)
				window.clearTimeout(tickMsg);
			tickMsg2 = window.setTimeout(function() {
				$(win).prev(".my-popwin-mask").remove();
				$(win).remove();
				if (tickMsg2)
					window.clearTimeout(tickMsg2);
			}, 800);
		}, timeout);
	};
	var withSilverBorder = function(div, isShow) {
		if (isShow)
			w = 300
		else
			w = 400;
		$(div).css({
			position: "absolute",
			lineHeight: "30px",
			minWidth: w,
			backgroundColor: "white",
			padding: 5,
			boxShadow: "1px 0px 3px silver, -1px 0px 3px silver, 0px 1px 3px silver, 0px -1px 3px silver"
		});
	};
	/**
	[DEMO] 
	$.messager.alert({
		msg: "只有一页，无法翻动。",
		modal: true,
		noCancel: true
	});
	**/
	var popCenterWin = function(titleStr, msgStr, timeout, modal, noOk, noCancel, okHandler, cancelHandler) {
		if (modal) {
			var mask = getDiv("my-popwin-mask").appendTo("body");
			mask.css({
				position: "absolute",
				left: 0,
				top: 0,
				width: "100%",
				height: "100%",
				backgroundColor: "rgba(50,50,50,0.7)"
			});
		}
		if (!titleStr)
			titleStr = "提示信息";
		var win = getDiv("my-popwin").appendTo("body");
		withSilverBorder(win);
		var title = getDiv("my-popwin-title").html(titleStr).appendTo(win);
		title.css({
			lineHeight: "30px",
			fontSize: "10pt",
			fontWeight: "bold",
			borderBottom: "1px dashed rgba(140,140,140,0.5)"
		});
		var msg = getDiv("my-popwin-msg").html(msgStr).appendTo(win);
		msg.css({
			fontSize: "9pt",
			lineHeight: "25px",
			minHeight: 100
		});
		var close = getDiv("my-popwin-close").html("×").appendTo(win);
		close.css({
			position: "absolute",
			top: 5,
			right: 5,
			fontSize: 25,
			cursor: "pointer"
		});
		makeClick(close, function() {
			var pwin = $(this).closest(".my-popwin");
			pwin.prev(".my-popwin-mask").remove();
			pwin.remove();
		});
		$("style#winBtn").remove();
		var sdStr = "text-shadow:1px 0px 1px silver,-1px 0px 1px silver, 0px 1px 1px silver, 0px -1px 1px silver";
		getStyle("winCloseBtn", ".my-popwin-close:hover{" + sdStr + "}").appendTo(win);
		var btns = getDiv("my-popwin-btns").appendTo(win);
		btns.css("text-align", "center");
		var btnCls = {
			margin: "0px 5px",
			padding: "0px 10px",
			lineHeight: "20px",
			color: "#333",
			minWidth: 100,
			minHeight: 27
		};
		if (!noOk) {
			var okBtn = getButton("确定").css(btnCls);
			btns.append(okBtn);
			makeClick(okBtn, function() {
				var pwin = $(this).closest(".my-popwin");
				pwin.prev(".my-popwin-mask").remove();
				pwin.remove();
				if (okHandler) {
					okHandler.call();
				}
			});
		}
		if (!noCancel) {
			var cancelBtn = getButton("取消").css(btnCls);
			btns.append(cancelBtn);
			makeClick(cancelBtn, function() {
				var pwin = $(this).closest(".my-popwin");
				pwin.prev(".my-popwin-mask").remove();
				pwin.remove();
				if (cancelHandler) {
					cancelHandler.call();
				}
			});
		}
		var w = win.width();
		var h = win.height();
		var dw = document.documentElement.clientWidth;
		var dh = document.documentElement.clientHeight;
		win.css({
			left: (dw - w) / 2,
			top: (dh - h) / 3,
			width: w,
			height: h
		});

		if (timeout) {
			timeoutClose(win, timeout);
		}
	};
	// show 1
	/**
	[DEMO] 
	$.messager.show({
		msg: "只有一页，无法翻动。",
		timeout: 2000
	});
	**/
	var popTopCenterWin = function(titleStr, msgStr, timeout, oflow) {
		if (!titleStr)
			titleStr = "提示信息";
		var win = getDiv("my-showwin").appendTo("body");
		withSilverBorder(win, true);
		var title = getDiv("my-showwin-title").html(titleStr).appendTo(win);
		title.css({
			lineHeight: "30px",
			fontSize: "10pt",
			fontWeight: "bold",
			borderBottom: "1px dashed rgba(140,140,140,0.5)"
		});
		var msg = getDiv("my-showwin-msg").html(msgStr).appendTo(win);
		msg.css({
			fontSize: "9pt",
			lineHeight: "25px",
			minHeight: 100
		});
		var close = getDiv("my-showwin-close").html("×").appendTo(win);
		close.css({
			position: "absolute",
			top: 5,
			right: 5,
			fontSize: 25,
			cursor: "pointer"
		});
		makeClick(close, function() {
			var pwin = $(this).closest(".my-showwin");
			pwin.remove();
		});
		var dw = document.documentElement.clientWidth;
		var w = win.width();
		var h = win.height();
		$(win).css({
			left: 0.5 * (dw - w),
			top: -h,
			opacity: 0.5
		}).stop().animate({
			top: 0,
			opacity: 1
		}, "slow");
		if (timeout) {
			timeoutClose(win, timeout);
		}
	};
	// show 2
	/**
	[DEMO] 
	$.messager.show({
		msg: "只有一页，无法翻动。",
		timeout: 2000,
		cond: 2
	});
	 */
	var popRightDownWin = function(titleStr, msgStr, timeout, oflow) {
		if (!titleStr)
			titleStr = "提示信息";
		var win = getDiv("my-showwin").appendTo("body");
		withSilverBorder(win, true);
		var title = getDiv("my-showwin-title").html(titleStr).appendTo(win);
		title.css({
			lineHeight: "30px",
			fontSize: "10pt",
			fontWeight: "bold",
			borderBottom: "1px dashed rgba(140,140,140,0.5)"
		});
		var msg = getDiv("my-showwin-msg").html(msgStr).appendTo(win);
		msg.css({
			fontSize: "9pt",
			lineHeight: "25px",
			minHeight: 100
		});
		var close = getDiv("my-showwin-close").html("×").appendTo(win);
		close.css({
			position: "absolute",
			top: 5,
			right: 5,
			fontSize: 25,
			cursor: "pointer"
		});
		makeClick(close, function() {
			var pwin = $(this).closest(".my-showwin");
			pwin.remove();
		});
		var h = win.height();
		$(win).css({
			right: 0,
			bottom: -h,
			opacity: 0.5
		}).stop().animate({
			bottom: 0,
			opacity: 1
		}, "slow");
		var bdTick = null;
		bdTick = window.setTimeout(function() {
			$("body").css("overflow", oflow);
			if (bdTick)
				window.clearTimeout(bdTick);
		}, 800);
		if (timeout) {
			timeoutClose(win, timeout);
		}
	};
	$.messager = {
		alert: function(opts) {
			popCenterWin(opts.title, opts.msg, opts.timeout, opts.modal, opts.noOk, opts.noCancel, opts.okHandler, opts.cancelHandler);
		},
		show: function(opts) {
			var oflow = $("body").css("overflow");
			$("body").css({
				margin: 0,
				overflow: "hidden"
			});
			if (!opts.cond)
				opts.cond = 1;
			if (!opts.timeout)
				opts.timeout = 5000;
			if (opts.cond == 1) {
				popTopCenterWin(opts.title, opts.msg, opts.timeout, oflow);
			} else {
				popRightDownWin(opts.title, opts.msg, opts.timeout, oflow);
			}
		}
	};
})(jQuery);