define([], function() {

	var REGX_DECODE = /&\w+;|&#(\d+);/g;

	var DECODE = {
		"&lt;" : "<",
		"&gt;" : ">",
		"&amp;" : "&",
		"&nbsp;" : " ",
		"&quot;" : "\""
		// Add more
	};

	String.prototype.xssDecode = function(s) {
		s = (s != undefined) ? s : this.toString();
		return (typeof s != "string") ? s : s.replace(REGX_DECODE,
				function($0, $1) {
					var c = DECODE[$0];
					if (c == undefined) {
						if (!isNaN($1)) {
							c = String.fromCharCode(($1 == 160) ? 32 : $1);
						} else {
							c = $0;
						}
					}
					return c;
				});
	};
});