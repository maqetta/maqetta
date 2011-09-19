dojo.provide("dojox.date.islamic");

dojo.require("dojox.date.islamic.Date");
dojo.require("dojo.date"); // for compare
	
// Utility methods to do arithmetic calculations with islamic.Dates

	// added for compat to date
dojox.date.islamic.getDaysInMonth = function(/*islamic.Date*/month){
	return month.getDaysInIslamicMonth(month.getMonth(), month.getFullYear());
};

//TODO: define islamic.isLeapYear?  Or should it be invalid, since it has different meaning?

dojox.date.islamic.compare = function(/*islamic.Date*/date1, /*islamic.Date*/date2, /*String?*/portion){
	//	summary:
	//		Compare two islamic date objects by date, time, or both.
	//	description:
	//  	Returns 0 if equal, positive if a > b, else negative.
	//	date1:
	//		islamic.Date object
	//	date2:
	//		islamic.Date object.  If not specified, the current islamic.Date is used.
	//	portion:
	//		A string indicating the "date" or "time" portion of a Date object.
	//		Compares both "date" and "time" by default.  One of the following:
	//		"date", "time", "datetime"

	if(date1 instanceof dojox.date.islamic.Date){
		date1 = date1.toGregorian();
	}
	if(date2 instanceof dojox.date.islamic.Date){
		date2 = date2.toGregorian();
	}
	
	return dojo.date.compare.apply(null, arguments);
};

dojox.date.islamic.add = function(/*dojox.date.islamic.Date*/date, /*String*/interval, /*int*/amount){
	//	based on and similar to dojo.date.add
	//	summary:
	//		Add to a Date in intervals of different size, from milliseconds to years
	//	date: islamic.Date
	//		Date object to start with
	//	interval:
	//		A string representing the interval.  One of the following:
	//			"year", "month", "day", "hour", "minute", "second",
	//			"millisecond", "week", "weekday"
	//	amount:
	//		How much to add to the date.

	var newIslamDate = new dojox.date.islamic.Date(date);

	switch(interval){
		case "day":
			newIslamDate.setDate(date.getDate() + amount);
			break;
		case "weekday":
			var day = date.getDay();
			if(((day + amount) < 5) && ((day + amount) > 0)){
				 newIslamDate.setDate(date.getDate() + amount);
			}else{
				var adddays = 0, /*weekend */
					remdays = 0;
				if(day == 5){//friday
					day = 4;
					remdays = (amount > 0) ?  -1 : 1;
				}else if(day == 6){ //shabat
					day = 4;
					remdays = (amount > 0) ? -2 : 2;
				}
				var add = (amount > 0) ? (5 - day - 1) : -day
				var amountdif = amount - add;
				var div = parseInt(amountdif / 5);
				if(amountdif % 5 != 0){
					adddays = (amount > 0)  ? 2 : -2;
				}
				adddays = adddays + div * 7 + amountdif % 5 + add;
				newIslamDate.setDate(date.getDate() + adddays +  remdays);
			}
			break;
		case "year":
			newIslamDate.setFullYear(date.getFullYear() + amount);
			break;
		case "week":
			amount *= 7;
			newIslamDate.setDate(date.getDate() + amount);
			break;
		case "month":
			var month = date.getMonth();
			newIslamDate.setMonth(month + amount);
			break;
		case "hour":
			newIslamDate.setHours(date.getHours() + amount);
			break;
		case "minute":
			newIslamDate.setMinutes(date.getMinutes() + amount);
			break;
		case "second":
			newIslamDate.setSeconds(date.getSeconds() + amount);
			break;
		case "millisecond":
			newIslamDate.setMilliseconds(date.getMilliseconds() + amount);
			break;
	}

	return newIslamDate; // dojox.date.islamic.Date
};

dojox.date.islamic.difference = function(/*dojox.date.islamic.Date*/date1, /*dojox.date.islamic.Date?*/date2, /*String?*/interval){
	//	based on and similar to dojo.date.difference
	//	summary:
	//        date1 - date2
	//	 date2 is islamic.Date object.  If not specified, the current islamic.Date is used.
	//	interval:
	//		A string representing the interval.  One of the following:
	//			"year", "month", "day", "hour", "minute", "second",
	//			"millisecond",  "week", "weekday"
	//		Defaults to "day".

	date2 = date2 || new dojox.date.islamic.Date();
	interval = interval || "day";
	var yearDiff = date1.getFullYear() - date2.getFullYear();
	var delta = 1; // Integer return value
	switch(interval){
		case "weekday":
			var days = Math.round(dojox.date.islamic.difference(date1, date2, "day"));
			var weeks = parseInt(dojox.date.islamic.difference(date1, date2, "week"));
			var mod = days % 7;

			// Even number of weeks
			if(mod == 0){
				days = weeks*5;
			}else{
				// Weeks plus spare change (< 7 days)
				var adj = 0;
				var aDay = date2.getDay();
				var bDay = date1.getDay();
	
				weeks = parseInt(days/7);
				mod = days % 7;
				// Mark the date advanced by the number of
				// round weeks (may be zero)
				var dtMark = new dojox.date.islamic.Date(date2);
				dtMark.setDate(dtMark.getDate()+(weeks*7));
				var dayMark = dtMark.getDay();
	
				// Spare change days -- 6 or less
				if(days > 0){
					switch(true){
						// Range starts on Fri
						case aDay == 5:
							adj = -1;
							break;
						// Range starts on Sat
						case aDay == 6:
							adj = 0;
							break;
						// Range ends on Fri
						case bDay == 5:
							adj = -1;
							break;
						// Range ends on Sat
						case bDay == 6:
							adj = -2;
							break;
						// Range contains weekend
						case (dayMark + mod) > 5:
							adj = -2;
					}
				}else if(days < 0){
					switch(true){
						// Range starts on Fri
						case aDay == 5:
							adj = 0;
							break;
						// Range starts on Sat
						case aDay == 6:
							adj = 1;
							break;
						// Range ends on Fri
						case bDay == 5:
							adj = 2;
							break;
						// Range ends on Sat
						case bDay == 6:
							adj = 1;
							break;
						// Range contains weekend
						case (dayMark + mod) < 0:
							adj = 2;
					}
				}
				days += adj;
				days -= (weeks*2);
			}
			delta = days;
			break;
		case "year":
			delta = yearDiff;
			break;
		case "month":
			var startdate =  (date1.toGregorian() > date2.toGregorian()) ? date1 : date2; // more
			var enddate = (date1.toGregorian() > date2.toGregorian()) ? date2 : date1;
			
			var month1 = startdate.getMonth();
			var month2 = enddate.getMonth();
			
			if (yearDiff == 0){
				delta = startdate.getMonth() - enddate.getMonth() ;
			}else{
				delta = 12-month2;
				delta +=  month1;
				var i = enddate.getFullYear()+1;
				var e = startdate.getFullYear();
				for (i;   i < e;  i++){
					delta += 12;
				}
			}
			if (date1.toGregorian() < date2.toGregorian()){
				delta = -delta;
			}
			break;
		case "week":
			// Truncate instead of rounding
			// Don't use Math.floor -- value may be negative
			delta = parseInt(dojox.date.islamic.difference(date1, date2, "day")/7);
			break;
		case "day":
			delta /= 24;
			// fallthrough
		case "hour":
			delta /= 60;
			// fallthrough
		case "minute":
			delta /= 60;
			// fallthrough
		case "second":
			delta /= 1000;
			// fallthrough
		case "millisecond":
			delta *= date1.toGregorian().getTime()- date2.toGregorian().getTime();
	}

	// Round for fractional values and DST leaps
	return Math.round(delta); // Number (integer)
};
