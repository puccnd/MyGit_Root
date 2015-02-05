$(function() {
	html2canvas(document.body, {
		allowTaint: true,
		taintTest: false,
		onrendered: function(canvas) {
			canvas.id = "mycanvas";
			//生成base64图片数据  
			var dataUrl = canvas.toDataURL();
			window.open(dataUrl);
		}
	});
});