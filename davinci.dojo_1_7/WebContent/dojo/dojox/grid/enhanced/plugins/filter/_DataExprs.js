define(["dojo", "dojox", "dojo/date/locale", "./_ConditionExpr"], function(dojo, dojox){

(function(){
	var fns = dojo.getObject("grid.enhanced.plugins.filter", true, dojox);

	dojo.declare("dojox.grid.enhanced.plugins.filter.BooleanExpr", fns._DataExpr, {
		// summary:
		//		A condition expression wrapper for boolean values
		_name: "bool",
		_convertData: function(/* anything */dataValue){
			// summary:
			//		override from _DataExpr
			return !!dataValue;	//Boolean
		}
	});
	dojo.declare("dojox.grid.enhanced.plugins.filter.StringExpr", fns._DataExpr, {
		// summary:
		//		A condition expression wrapper for string values
		_name: "string",
		_convertData: function(/* anything */dataValue){
			// summary:
			//		override from _DataExpr
			return String(dataValue);	//String
		}
	});
	dojo.declare("dojox.grid.enhanced.plugins.filter.NumberExpr", fns._DataExpr, {
		// summary:
		//		A condition expression wrapper for number values
		_name: "number",
		_convertDataToExpr: function(/* anything */dataValue){
			// summary:
			//		override from _DataExpr
			return parseFloat(dataValue);	//Number
		}
	});
	dojo.declare("dojox.grid.enhanced.plugins.filter.DateExpr", fns._DataExpr, {
		// summary:
		//		A condition expression wrapper for date values
		_name: "date",
		_convertData: function(/* anything */dataValue){
			// summary:
			//		override from _DataExpr
			if(dataValue instanceof Date){
				return dataValue;
			}else if(typeof dataValue == "number"){
				return new Date(dataValue);
			}else{
				var res = dojo.date.locale.parse(String(dataValue), dojo.mixin({selector: this._name}, this._convertArgs));
				if(!res){
					throw new Error("Datetime parse failed: " + dataValue);
				}
				return res;
			}
		},
		toObject: function(){
			// summary:
			//		Overrided from _DataExpr.toObject
			if(this._value instanceof Date){
				var tmp = this._value;
				this._value = this._value.valueOf();
				var res = this.inherited(arguments);
				this._value = tmp;
				return res;
			}else{
				return this.inherited(arguments);
			}
		}
	});
	dojo.declare("dojox.grid.enhanced.plugins.filter.TimeExpr", fns.DateExpr, {
		// summary:
		//		A condition expression wrapper for time values
		_name: "time"
	});
})();

return dojox.grid.enhanced.plugins.filter._DataExprs;

});