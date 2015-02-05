(function($){
	function _a0(object){
		var closeBtn = $("<div class='jle-btn-close'>×</div>");
		closeBtn.unbind().bind("click touchstart", function(){
			$(object).remove();
		});
		$(object).append(closeBtn);
	}
	function _a1(n){
		var _d1 = "" + Date.now();
		var _d2 = ["abcdefghijklmnopqrstuvwxyz", "abcdefghijklmnopqrstuvwxyz0123456789", 26, 36];
		_d1 = _d2[0].charAt(parseInt(Math.random() * _d2[2])) + _d1;
		for(var i=0;i<n;i++){
			_d1 += _d2[1].charAt(parseInt(Math.random() * _d2[3]));
		}
		return _d1;
	}
	function _a2(object, opts){
		var _d1 = document.documentElement;
		var _d2 = {
			width : _d1.clientWidth,
			height : _d1.clientHeight
		};
		var tipId = $(object).attr("tipId");
		if($("#" + tipId).size() > 0)
			return;
		if($(".jle-tooltip[id!=" + tipId + "]").size() > 0)
			$(".jle-tooltip[id!=" + tipId + "]").remove();
		var tip = $("<div class='jle-tooltip' />").appendTo("body");
		tip.append(opts.content).attr("id", tipId);
		if(opts.maxSize){
			tip.find(".jle-img").css({
				maxWidth : opts.maxSize,
				maxHeight : opts.maxSize
			});
		}
		var targetSize = {
			width : tip.width() + opts.padding * 2 + 2,
			height :tip.height() + opts.padding * 2 + 2
		};
		var rect = object.getBoundingClientRect();
		var stageCss = {
			padding : opts.padding
		};
		var r=null,c=null;
		if(rect.top + rect.height/2 < _d2.height/3){
			r = 0;
		} else if(rect.top + rect.height/2 > 2*_d2.height/3){
			r = 2;
		} else {
			r = 1;
		}
		if(rect.left + rect.width/2 < _d2.width/3) {
			c = 0;
		} else if(rect.left + rect.width/2 > 2*_d2.width/3) {
			c = 2
		} else {
			c = 1
		}
		var offX = document.body.scrollLeft, offY = document.body.scrollTop;
		var ext = (opts.showArrow ? 20 : 0);
		var lt = [
			[[rect.left+offX,rect.bottom+ext+offY], 
			 [rect.left - (targetSize.width - rect.width) / 2+offX,rect.bottom+ext+offY], 
			 [rect.right - targetSize.width+offX,rect.bottom+ext+offY]],
			[[rect.right+ext+offX,rect.top-(targetSize.height - rect.height)/2+offY],
			 [rect.left - (targetSize.width - rect.width) / 2+offX,rect.bottom+ext+offY],
			 [rect.left-targetSize.width-ext+offX,rect.top-(targetSize.height - rect.height)/2+offY]],
			[[rect.left+offX,rect.top-targetSize.height-ext+offY], 
			 [rect.left - (targetSize.width - rect.width)/2+offX,rect.top-targetSize.height-ext+offY], 
			 [rect.right - targetSize.width+offX,rect.top-targetSize.height-ext+offY]]
		];
		var destCss = {
			left : lt[r][c][0],
			top : lt[r][c][1]
		};
		tip.addClass("jle-panel").css(stageCss).css(destCss);
		if(opts.closable)
			_a0(tip);
		if(opts.showArrow)
			_a6(tip, r, c, _a5(destCss, targetSize), rect);
	}
	function _a3(object){
		var tipId = $(object).attr("tipId");
		$(".jle-tooltip[id=" + tipId + "]").remove();
	}
	function _a4(object, opts){
		var tipId = $(object).attr("tipId");
		if($("#"+tipId).size() == 0){
			_a2(object, opts);
		} else {
			_a3(object);
		}
	}
	function _a5(position, size) {
		var res = {};
		res.left = position.left;
		res.top = position.top;
		res.width = size.width;
		res.height = size.height;
		return res;
	}
	function _a6(tip, r, c, rect, btn){
		var arrow = $("<canvas class='jle-arrow'></canvas>");
		tip.append(arrow);
		if(r == 0) {
			arrow.attr({
				width : rect.width,
				height : 20
			}).css({
				left : 0,
				top : -20,
				width : rect.width,
				height : 21
			});
			_a7(arrow[0], c, btn, true);
		} else if(r == 2) {
			arrow.attr({
				width : rect.width,
				height : 21
			}).css({
				left : 0,
				bottom : -20,
				width : rect.width,
				height : 21
			});
			_a7(arrow[0], c, btn, false);
		} else if(c == 0) {
			arrow.attr({
				width : 21,
				height : rect.height
			}).css({
				left : -20,
				top : 0,
				width : 21,
				height : rect.height
			});
			_a8(arrow[0], c, btn, true);
		} else if(c == 1) {
			arrow.attr({
				width : rect.width,
				height : 21
			}).css({
				left : 0,
				top : -20,
				width : rect.width,
				height : 21
			});
			_a7(arrow[0], c, btn, true);
		} else {
			arrow.attr({
				width : 21,
				height : rect.height
			}).css({
				right : -20,
				top : 0,
				width : 21,
				height : rect.height
			});
			_a8(arrow[0], c, btn, false);
		}
	}
	function _a7(c, i, btn, zFlag) {
		var ctx = c.getContext("2d");
		ctx.strokeStyle = "silver";
		ctx.fillStyle = "#f9f9c3";
		ctx.shadowColor = "silver";
		ctx.save();
		var a = 1, b = c.height - 1;
		ctx.shadowOffsetY = 2;
		if(zFlag) {
			a = c.height - 1;
			b = 1;
			ctx.shadowOffsetY = -2;
		}
		if(i == 0){
			ctx.beginPath();
			ctx.moveTo(btn.width/2 - 6, a);
			ctx.lineTo(btn.width/2, b);
			ctx.lineTo(btn.width/2 + 6, a);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			ctx.restore();
		} else if(i == 2){
			ctx.beginPath();
			ctx.moveTo(c.width - btn.width/2 - 6, a);
			ctx.lineTo(c.width - btn.width/2, b);
			ctx.lineTo(c.width - btn.width/2 + 6, a);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			ctx.restore();			
		} else {
			ctx.beginPath();
			ctx.moveTo(c.width/2 - 6, a);
			ctx.lineTo(c.width/2, b);
			ctx.lineTo(c.width/2 + 6, a);
			ctx.stroke();
			ctx.fill();
			ctx.closePath();
			ctx.restore();
		}
	}
	function _a8(c, i, btn, zFlag) {
		var ctx = c.getContext("2d");
		ctx.strokeStyle = "silver";
		ctx.fillStyle = "#f9f9c3";
		ctx.shadowColor = "silver";
		ctx.save();
		var a = 1, b = c.width - 1;
		ctx.shadowOffsetX = 2;
		if(zFlag) {
			a = c.width - 1;
			b = 1;
			ctx.shadowOffsetX = -2;
		}
		ctx.beginPath();
		ctx.moveTo(a, c.height/2 - 6);
		ctx.lineTo(b, c.height/2);
		ctx.lineTo(a, c.height/2 + 6);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		ctx.restore();	
	}
	$.fn.tooltip = function(opts) {
		var object = $(this);
		object.each(function(){
			if(!$(this).attr("tipId"))
				$(this).attr("tipId", _a1(5));
			$(this).unbind("click touchstart").bind("click touchstart", function(event){
				_a4(this, opts);
			});
			if(!opts.clickOnly){
			$(this).unbind("mouseover mouseout").bind("mouseover", function(event){
				_a2(this, opts);
			}).bind("mouseout", function(event){
				if(!opts.closable) {
					_a3(this);
				}
			});
			}
		});
	};
})(jQuery)