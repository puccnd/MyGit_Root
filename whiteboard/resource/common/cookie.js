/**
 * 读取Cookie，用法：getCookieVal("abc")
 * 
 * @param cookieName
 * @returns {String}
 */
function getCookieVal(cookieName) {
	var search = cookieName + "=";
	var returnvalue = "";
	if (document.cookie.length > 0) {
		offset = document.cookie.indexOf(search);
		if (offset != -1) {
			offset += search.length;
			end = document.cookie.indexOf(";", offset);
			if (end == -1)
				end = document.cookie.length;
			returnvalue = unescape(document.cookie.substring(offset, end));
		}
	}
	return returnvalue;
}

/**
 * 写入Cookie，同一域名下用法：setCookie("abc", "1234567890", 0);
 * 
 * @param name
 * @param value
 * @param expires
 * @param path
 * @param domain
 * @param secure
 */
function setCookie(name, value, expires, path, domain, secure) {
	var today = new Date();
	today.setTime(today.getTime());

	if (expires) {
		expires = expires * 1000 * 60 * 60 * 24;
	}

	var expires_date = new Date(today.getTime() + (expires));

	document.cookie = name + "=" + escape(value)
			+ ((expires) ? ";expires=" + expires_date.toGMTString() : "") + // expires.toGMTString()
			((path) ? ";path=" + path : "")
			+ ((domain) ? ";domain=" + domain : "")
			+ ((secure) ? ";secure" : "");
}

/**
 * Cookie过期设置
 */
function delCookies(name) {
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval = getCookieVal(name);
	if (cval != null)
		document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}