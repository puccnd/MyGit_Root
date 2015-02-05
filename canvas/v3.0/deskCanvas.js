/**
 * 根据一个容器参数产生一个canvas对象
 *
 * @author Libo.Pu
 */
var deskUtil = {
	newCanvasHTML: "<canvas></canvas>",
	dom: {
		getDivRect: function(div) {
			return $(div)[0].getBoundingClientRect();
		},
		getDivSize: function(div) {
			var size = {
				left: $(div).position().left,
				top: $(div).position().top,
				width: $(div).width(),
				height: $(div).height()
			};
			var size2 = {
				width: size.width,
				height: size.height
			};
			return [size, size2];
		}
	},
	extendCanvas: function() {
		return {
			enableModes: function(mode) {
				// a,b,c
				// 1,2,3
				this.mode = mode;
				var mode1 = mode.charAt(0);
				var mode2 = mode.charAt(1);
				switch (mode1) {
					case "a":
						break;
					case "b":
						break;
					case "c":
						break;
				}
				this.dragBox;
				this.drawMode;
			}
		};
	}
};

function deskCanvas(div) {
	this.parent = div;
	var kernal = $(div).find("canvas.kernal-canvas");
	if (kernal.size() == 0) {
		kernal = $(deskUtil.newCanvasHTML).appendTo(div);
		var dSize = deskUtil.dom.getDivSize();
		kernal.attr(dSize[1]).css(dSize[1]);
	}
	this.canvas = kernal;
	this.enableModes();
};

deskCanvas.prototype = deskUtil.extendCanvas();