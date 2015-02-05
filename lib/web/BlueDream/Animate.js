function Animate(el, prop, opts) {
	this.el = el;
	this.prop = prop;
	this.from = opts.from;
	this.to = opts.to;
	this.time = opts.time;
	this.callback = opts.callback;
	this.animDiff = this.to - this.from;
}

Animate.prototype._setStyle = function(val) {
	switch (this.prop) {
		case 'opacity':
			this.el.style[this.prop] = val;
			this.el.style.filter = 'alpha(opacity=' + val * 100 + ')';
			break;
		default:
			this.el.style[this.prop] = val + 'px';
			break;
	}
}

Animate.prototype._animate = function() {
	var that = this;
	this.now = new Date();
	this.diff = this.now - this.startTime;

	if (this.diff > this.time) {
		this._setStyle(this.to);

		if (this.callback) {
			this.callback.call(this);
		}
		clearInterval(this.timer);
		return;
	}

	this.percentage = (Math.floor((this.diff / this.time) * 100) / 100);
	this.val = (this.animDiff * this.percentage) + this.from;
	this._setStyle(this.val);
}

Animate.prototype.start = function() {
	var that = this;
	this.startTime = new Date();
	clearInterval(this.timer);
	this.timer = setInterval(function() {
		that._animate.call(that);
	}, 4);
}

Animate.canTransition = function() {
	var el = document.createElement('foo');
	el.style.cssText = '-webkit-transition: all .5s linear;';
	return !!el.style.webkitTransitionProperty;
}();