window.onresize = function() {
	var dw = document.documentElement.clientWidth;
	var dh = document.documentElement.clientHeight - 182;
	$(".content").css({
		opacity : 0.1
	}).css({
		width : dw * 0.9,
		height : dh * 0.9,
		left : dw * 0.05,
		top : dh * 0.05 + 81
	}).each(function() {
		var _this = $(this);
		if (_this.is(".content.part1")) {
			_this.css({
				left : 0,
				width : dw,
				top : 91,
				height : dh - 80,
				opacity : 1
			});
		} else if (_this.is(".content.part2")) {
			_this.css({
				left : (dw - 350) / 2,
				width : 350,
				top : (dh - 78) * 0.4,
				height : 260,
				border : "1px solid white",
				opacity : 1
			});
		} else if (_this.is(".content.part3")) {
			_this.css({
				left : 0,
				width : dw,
				top : dh + 21,
				height : 50,
				opacity : 1
			});
		}
	});
};

$.fn.imageshow = function(opts) {
	var urlList = opts.images;
	var showmsg = opts.msg;
	var container = $(this);
	container.empty().addClass("pu-container");
	container.append('<div class="pu-msg">' + showmsg + '</div>');
	var boxLen = urlList.length;
	for ( var i = 0; i < boxLen; i++) {
		container.append('<div class="pu-imgbox" style="background-image: url('
				+ urlList[i] + ')"></div>');
	}
	container.find(".pu-imgbox").hide();
	var state = 0;
	function toRun() {
		if (state != 0) {
			container.find(".pu-msg").hide();
		}
		opts.tick = window.setTimeout(function() {
			if (opts.tick)
				window.clearTimeout(opts.tick);
			var seq = state % boxLen;
			container.find(".pu-imgbox").each(function(i, e) {
				if (i == seq)
					$(this).hide().fadeIn(1400);
				else if (i == (seq - 1 + boxLen) % boxLen)
					$(this).show().fadeOut();
				else
					$(this).hide();
			});
			state++;
			toRun();
		}, 3000);
	}
	toRun();
};

$(function() {
	document.onselectstart = function() {
		return false;
	};
	$(window).resize();
	$(".gallary").imageshow(
			{
				tick : null,
				msg : "正在加载图片列表……",
				images : [ "images/1.jpg", "images/2.jpg", "images/3.jpg",
						"images/4.jpg" ]
			});
});