export const FormatFuncs = {
	switch: function(value, defaultV = null, ...pairs) {
		for(const p of pairs) {
			if(Array.isArray(p) && p.length === 2 && value === p[0]) {
				return p[1];
			}
		}
		return defaultV;
	},
	str: function(value) {
		return String(value);
	},
	'str.slice': function(value, start = 0, end = null) {
		if(typeof start === 'number') {
			if(typeof end === 'number') {
				return String(value).slice(start, end);
			} else {
				return String(value).slice(start);
			}
		}
		return null;
	},
	'str.part': function(value, start = 0, length = null) {
		if(typeof start === 'number') {
			if(typeof length === 'number') {
				return String(value).substring(start, start + length);
			} else {
				return String(value).substring(start);
			}
		}
		return null;
	},
	'str.trim': function(value) {
		return String(value).trim();
	},
	'str.trim.l': function(value) {
		return String(value).trimStart();
	},
	'str.trim.r': function(value) {
		return String(value).trimEnd();
	},
	'str.pad.l': function(value, maxLength, padWith = ' ') {
		return String(value).padStart(maxLength, padWith);
	},
	'str.pad.r': function(value, maxLength, padWith = ' ') {
		return String(value).padEnd(maxLength, padWith);
	},
	'str.upper': function(value) {
		return String(value).toUpperCase();
	},
	'str.lower': function(value) {
		return String(value).toLowerCase();
	},
	'str.title': function(value) {
		return String(value).replace(/\w\S*/g, txt => `${txt.charAt(0).toUpperCase()}${txt.slice(1).toLowerCase()}`);
	},
	'str.replace': function(value, search='', withStr='') {
		return String(value).replaceAll(search, withStr);
	},
	'str.at': function(value, index=0) {
		return String(value).at(index);
	},
	num: function(value) {
		return Number(value);
	},
	'num.add': function(value, secondNumber = 0) {
		return Number(value) + Number(secondNumber);
	},
	'num.sub': function(value, secondNumber = 0) {
		return Number(value) - Number(secondNumber);
	},
	'num.mul': function(value, secondNumber = 1) {
		return Number(value) * Number(secondNumber);
	},
	'num.div': function(value, secondNumber = 1) {
		secondNumber = Number(secondNumber);
		if(secondNumber !== 0) {
			return Number(value) / secondNumber;
		}
		return null;
	},
	'num.mod': function(value, secondNumber = 2) {
		secondNumber = Number(secondNumber);
		if(secondNumber !== 0) {
			return Number(value) % secondNumber;
		}
		return null;
	},
	'num.exp': function(value, secondNumber = 1) {
		return Number(value) ** Number(secondNumber);
	},
	'num.round': function(value, size = 2) {
		return Number(value).toFixed(Number(size));
	},
	"num.in_range": function(value, min = null, max = null) {
		value = Number(value);
		if(typeof min === 'number' && value < min) {
			return false;
		}
		if(typeof max === 'number' && value > max) {
			return false;
		}
		return true;
	},
	'bool': function(value) {
		return Boolean(value);
	}
};