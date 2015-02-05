/**
 * 未经过任何取点算法优化的动画处理器
 *
 * @author Libo.Pu
 */
(function($) {
	function randomId(n) {
		var org = "abcdefghijklmnopqrstuvwxyz";
		var num = "0123456789";
		var start = org[Math.floor(Math.random() * org.length)];
		var fuza = org + num;
		for (var i = 1; i < n; i++) {
			start += fuza[Math.floor(Math.random() * fuza.length)];
		}
		return start;
	}

	function getMeAniId(obj) {
		var meAniId = $(obj).attr("meAniId");
		if (!meAniId) {
			meAniId = randomId(16);
			$(obj).attr("meAniId", meAniId);
		}
		return meAniId;
	}

	function getCalced(splited2, splited, index, devision) {
		if (splited2) {
			var dest = parseFloat(splited[index]);
			var from = parseFloat(splited2[index]);
			var devided = from + (dest - from) * devision;
			if (Math.abs(devided - dest) < 5) {
				return dest;
			}
			return devided;
		} else {
			return parseFloat(splited[index]) * devision;
		}
	}

	function devideProp(str, stlStr, devision) {
		var re = /([^-\d]+)/gi;
		var splited = str.split(re);
		var splited2 = null;
		if (stlStr) splited2 = stlStr.split(re);
		var other = [];
		for (var i = 0; i < splited.length; i++) {
			if (splited[i] == "")
				continue;
			if (re.test(splited[i])) {
				other.push(splited[i]);
			} else {
				var x = getCalced(splited2, splited, i, devision);
				other.push(x);
			}
		}
		return other.join("");
	}

	function singleStyle(obj, name) {
		// chrome only
		var style = $(obj).get(0).style;
		return style[name];
	}

	function getPartedStyle(obj, css, devision) {
		var newOpts = {};
		for (var prop in css) {
			var stlStr = singleStyle(obj, prop);
			if (css[prop] == stlStr)
				continue;
			newOpts[prop] = devideProp(css[prop], stlStr, devision);
		}
		return newOpts;
	}

	var aniTick = {},
		itemPeriod = 1;

	function doSteps(obj, opts, i, maxInt, during) {
		var meAniId = getMeAniId(obj);
		if (aniTick[meAniId])
			window.clearTimeout(aniTick[meAniId]);
		aniTick[meAniId] = window.setTimeout(function() {
			if (i == maxInt - 1) {
				$(obj).css(opts);
				if (aniTick[meAniId])
					window.clearTimeout(aniTick[meAniId]);
				return;
			}
			$(obj).css(getPartedStyle(obj, opts, (i + 1) / maxInt));
			if (aniTick[meAniId])
				window.clearTimeout(aniTick[meAniId]);
			if (i < maxInt - 1)
				doSteps(obj, opts, i + 1, maxInt, during);
		}, during);
	}

	$.fn.meAni = function(opts, speed) {
		var period = 500;
		if (speed == "fast") period = 500;
		else if (speed == "normal") period = 800;
		else if (speed == "slow") period = 1000;
		else period = speed;
		var totalTimes = period / itemPeriod;
		doSteps(this, opts, 0, totalTimes, itemPeriod);
	};
})(jQuery);