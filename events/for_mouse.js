(function(_w) {
	_w.$p = function(pulbSelector) {
		return new PulbObject({
			selector: pulbSelector,
			desciption: "pulb object"
		});
	};
	var dataMap = {};
	var PuUtil = {
		getSelectedDOM: function(selector) {
			// TODO
		},
		checkPuID: function(domObject) {
			var poID = domObject.getAttribute("pulb_object_id");
			var randomId = function() {
				var data = ("pulb_" + Math.random()).replace(".", "");
				return data + "@" + Date.now();
			};
			if (!poID) {
				poID = randomId();
				domObject.setAttribute("pulb_object_id", poID);
			}
			return poID;
		},
		isString: function(data) {
			return (typeof data == "string");
		},
		isBasicType: function(data) {
			if (this.isString(data))
				return true;
			var basicTypes = ["undefined", "function", "boolean", "number"];
			var typeDesc = (typeof data);
			if (basicTypes.indexOf(typeDesc) > -1)
				return true;
			var constructorNames = ["Date", "RegExp", "Array"];
			var constructorMe = data.constructor.name;
			if (constructorNames.indexOf(constructorMe) > -1)
				return true;
			// DOM对象不处理
			return false;
		}
	};
	var PulbObject = function(rawItem) {
		this.ID = PuUtil.checkPuID(rawItem.selector);
	};
	PulbObject.prototype = {
		each: function() {
			//
		},
		extend: function(param1, param2) {
			if (!param1 && !param2) {
				// new Object
				return {};
			} else if (!param1 && param2) {
				// clone Object
				var newObject = {};
				if (!PuUtil.isBasicType(param2)) {
					for (var prop in param2) {
						newObject[prop] = param2[prop];
					}
				}
				return newObject;
			} else if (param1 && !param2) {
				// extend this
				if (!PuUtil.isBasicType(param1)) {
					for (var prop in param1) {
						this[prop] = param1[prop];
					}
				}
				return this;
			} else {
				// extend this
				if (PuUtil.isString(param1)) {
					this[param1] = param2;
				} else {
					for (var i = 0; i < arguments.length; i++) {
						var p = arguments[i];
						if (!PuUtil.isBasicType(p))
							for (var prop in p) {
								this[prop] = p[prop];
							}
					}
				}
			}
			return this;
		}
	};

})(window);