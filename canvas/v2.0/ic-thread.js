onmessage = function(event) {
	try {
		var input = event.data.input;
		var output = event.data.output;
		if (!input || !input.type || !output || !output.points) {
			return;
		}
		if (input.type == "line") {
			output.points.push(input.to);
			var xmin = null, xmax = null, ymin = null, ymax = null;
			for ( var i = 0; i < output.points.length; i++) {
				if (xmin == null)
					xmin = output.points[i].x;
				if (xmax == null)
					xmax = output.points[i].x;
				if (ymin == null)
					ymin = output.points[i].y;
				if (ymax == null)
					ymax = output.points[i].y;
				if (output.points[i].x < xmin)
					xmin = output.points[i].x;
				if (output.points[i].x > xmax)
					xmax = output.points[i].x;
				if (output.points[i].y < ymin)
					ymin = output.points[i].y;
				if (output.points[i].y > ymax)
					ymax = output.points[i].y;
			}
			output.rect = {
				left : xmin,
				top : ymin,
				width : xmax - xmin,
				height : ymax - ymin
			};
			output.center = {
				x : (xmin + xmax) / 2,
				y : (ymin + ymax) / 2
			};
			output.finished = true;
			postMessage(output);
		}
	} catch (e) {
		postMessage({
			id : "error",
			msg : e.message
		});
	}
};
