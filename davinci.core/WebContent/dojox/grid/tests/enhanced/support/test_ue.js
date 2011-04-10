//Customized sorters only for testing, as all testing data are not in the native format, and performance is bad if dojo.date.locale.parse is used.
//in a real case, data should be stored as native format

dojo.addOnLoad(function(){
	if (csvStore1) {
		csvStore1.comparatorMap = {};
		csvStore1.comparatorMap['Length'] = function(dateStr1, dateStr2){
			var date1 = _getDate(dateStr1);
			var date2 = _getDate(dateStr2);
			//console.log('in=',dateStr1, ' ', dateStr2, " | out=", date1, ' ', date2);
			return (date1 > date2) ? 1 : (date1 < date2 ? -1 : 0);
		};
		
		csvStore1.comparatorMap['Track'] = function(numStr1, numStr2){
			var num1 = new Number(numStr1);
			var num2 = new Number(numStr2);
			return (num1 > num2) ? 1 : (num1 < num2 ? -1 : 0);
		};
	}
	
	_getDate = function(dateStr){
		//item should be in HH:mm or HH:mm:ss so that dojo.date.stamp.fromISOString can parse it
		var items = dateStr.split(':');
		dojo.forEach(items, function(item, index, items){
			item.length < 2 && (items[index] = '0' + item);
		});
		return dojo.date.stamp.fromISOString('T' + items.join(':'));
	}
});
