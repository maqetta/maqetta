dojo.provide("dojox.dtl.filter.dates");

dojo.require("dojox.dtl.utils.date");

(function(){
	var ddfd = dojox.dtl.filter.dates;

	dojo.mixin(ddfd, {
		_toDate: function(value){
			if(value instanceof Date){
				return value;
			}
			value = new Date(value);
			if(value.getTime() == new Date(0).getTime()){
				return "";
			}
			return value;
		},
		date: function(value, arg){
			// summary: Formats a date according to the given format
			value = ddfd._toDate(value);
			if(!value){
				return "";
			}
			arg = arg || "N j, Y";
			return dojox.dtl.utils.date.format(value, arg);
		},
		time: function(value, arg){
			// summary: Formats a time according to the given format
			value = ddfd._toDate(value);
			if(!value){
				return "";
			}
			arg = arg || "P";
			return dojox.dtl.utils.date.format(value, arg);
		},
		timesince: function(value, arg){
			// summary: Formats a date as the time since that date (i.e. "4 days, 6 hours")
			value = ddfd._toDate(value);
			if(!value){
				return "";
			}
			var timesince = dojox.dtl.utils.date.timesince;
			if(arg){
				return timesince(arg, value);
			}
			return timesince(value);
		},
		timeuntil: function(value, arg){
			// summary: Formats a date as the time until that date (i.e. "4 days, 6 hours")
			value = ddfd._toDate(value);
			if(!value){
				return "";
			}
			var timesince = dojox.dtl.utils.date.timesince;
			if(arg){
				return timesince(arg, value);
			}
			return timesince(new Date(), value);
		}
	});
})();