(function($) {
	function getXYFrom(event) {
		if (!event.touches) {
			return {
				x: event.originalEvent.pageX,
				y: event.originalEvent.pageY
			};
		} else {
			return {
				x: event.originalEvent.targetTouches[0].pageX,
				y: event.originalEvent.targetTouches[0].pageY
			};
		}
	}

	function doScroll(event, scroller, buff) {
		var eventY = getXYFrom(event).y;
		if (!buff.lastY) {
			buff.lastY = eventY;
		}
		var canScroll = $(scroller).is(".can-scroll");
		if (canScroll) {
			var wt = $(scroller)[0].style.webkitTransform;
			if (!wt || wt == "") {
				$(scroller)[0].style.webkitTransform = "translateY(0px)";
			} else {
				var deltaY = eventY - buff.lastY;
				buff.lastY = eventY;
				if (Math.abs(deltaY) > 10) {
					var oldPos = wt.replace(/translateY\(|px\)/g, "");
					var oldY = 0;
					if (oldPos.indexOf("-") == 0) {
						oldY = -parseFloat(oldPos.substring(1));
					}
					var newPos = oldY + deltaY;
					console.log("newPos = " + newPos + ", oldY = " + oldY + ", deltaY = " + deltaY);
					if (newPos > 0) {
						return $(scroller).css({
							webkitTransform: "translateY(0px)"
						});
					} else if (newPos < buff.meHeight - buff.scrollHeight) {
						newPos = buff.meHeight - buff.scrollHeight;
						return $(scroller).css({
							webkitTransform: "translateY(" + newPos + "px)"
						});
					}
					return $(scroller).css({
						webkitTransform: "translateY(" + newPos + "px)"
					});
				}
			}
		}
	}

	function endScroll(event, scroller, buff) {
		var canScroll = $(scroller).is(".can-scroll");
		if (canScroll) {
			$(scroller).removeClass("can-scroll");
		}
	}

	function cancelScroll(event, scroller, buff) {
		var canScroll = $(scroller).is(".can-scroll");
		if (canScroll) {
			$(scroller).removeClass("can-scroll");
		}
	}

	function startScroll(event, scroller) {
		var toScroll = $(scroller).addClass("can-scroll");
		var doc = ($(document).unbind(".scroll")),
			buff = {};
		buff.meHeight = document.documentElement.clientHeight;
		buff.scrollHeight = $(scroller).height();
		doc.bind("mousemove.scroll touchmove.scroll", function(evt) {
			doScroll(evt, scroller, buff);
		});
		doc.bind("mouseup.scroll touchend.scroll", function(evt) {
			endScroll(evt, scroller, buff);
		});
		doc.bind("mouseout.scroll touchcancel.scroll", function(evt) {
			// cancelScroll(evt, scroller, buff);
		});
	}

	$.fn.scroller = function(opts) {
		var wrapper = $(this);
		wrapper.unbind(".scroll").bind("mousedown.scroll touchstart.scroll", function(evt) {
			evt.stopPropagation();
			evt.preventDefault();
			startScroll(evt, this);
		});
	};

	function timerAddItems(idx, box, str, times) {
		var tick = null,
			num = 0;

		function addItem() {
			if (tick)
				window.clearTimeout(tick);
			var xItem = $(str);
			$(box).prepend(xItem);
			xItem.html(times - num);
			num++;
			if (num < times) {
				tick = window.setTimeout(function() {
					if (tick)
						window.clearTimeout(tick);
					addItem();
				}, 1);
			} else {
				$("body").trigger("finished_" + idx);
			}
		};

		addItem();
	}

	function bindBody(eName, idx, box) {
		var clsName = null;
		if (idx % 2 == 0) {
			clsName = "test-item2";
		} else {
			clsName = "test-item";
		}
		$("body").bind(eName + (idx + 1), function() {
			var randomNum = parseInt(Math.random() * 20) + 40;
			timerAddItems(idx, box, "<div class='" + clsName + "'></div>", randomNum);
		});
	}

	function triggerLast(eName, lastIdx) {
		$("body").trigger(eName + lastIdx);
	}

	$(function() {
		$(".test-demo").each(function(i) {
			bindBody("finished_", i, this);
		});
		triggerLast("finished_", $(".test-demo").size());
		$(".sim-body").scroller({
			touchEnabled: true,
			mouseEnabled: true,
			scrollerEnabled: true,
			wheelEnabled: true
		});
	});
})(jQuery);