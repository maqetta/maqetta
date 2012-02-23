define([
	"dojo/_base/declare",
	"dojo/date/locale",
], function(declare, locale) {

var util = declare("davinci.review.util", null, {
	/*
	 * Transform the date passed to a relative time against current time on server.
	 * E.g. current time is 2010-12-28 4:24:00, time passed: 2010-12-28 4:20:00, then
	 * the relative time is "4 mins ago".
	 */
	//TODO: i18n
	toRelativeTime : function(date, baseDate, threshhold) {
		if ( !date || !baseDate )
			return '';

		var diff = date.getTime() - baseDate.getTime();
		var direction = ( diff < 0 ? "ago" : "later" );
		var day, hour, min, second;

		diff = Math.floor( Math.abs( diff ) / 1000 );

		if(diff <= 60) return "just now";

		if ( threshhold && diff > threshhold )
			return locale.format(date, {formatLength:'short',selector:'date'});

		second = diff % 60;
		diff = Math.floor( diff / 60 ); 
		min = diff % 60;
		diff = Math.floor( diff / 60 );
		hour = diff % 24;
		diff = Math.floor( diff / 24 );
		day = diff;

		var timeStr = day ? day + " days ": hour ? hour + " hours ":min ? min + " mins ":'';
		return timeStr + direction;
	},

	toGmt0Time : function(localDate) {
		if ( !localDate )
			return null;

		var localOffset = localDate.getTimezoneOffset() * 60000;
		return new Date( localDate.getTime() + localOffset );
	},

	toLocalTime : function( dateInGmt0 ) {
		if ( !dateInGmt0 )
			return null;

		var date = new Date();
		var diff = date.getTime() - this.toGmt0Time( date ).getTime();
		var direction = diff < 0 ? -1 : 1;
		diff = Math.floor( Math.abs(diff) / 3600000 );

		return new Date( dateInGmt0.getTime() + direction * diff * 3600000  ); 
	},

	getNewGuid: function() {
		var guid = "";
		for (var i = 1; i <= 32; i++){
			var n = Math.floor(Math.random()*16.0).toString(16);
			guid += n;
			if((i==8)||(i==12)||(i==16)||(i==20)){
				guid += "-";
			}
		}
		return guid;    
	}
});

return dojo.setObject("davinci.review.util", new util());

});
