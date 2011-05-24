dojo.provide("dojox.grid.enhanced.plugins.filter.FilterBuilder");
dojo.require("dojox.grid.enhanced.plugins.filter._FilterExpr");

(function(){
var fns = dojox.grid.enhanced.plugins.filter,
	bdr = function(opCls){
		return dojo.partial(function(cls,operands){
			return new fns[cls](operands);
		},opCls);
	},
	bdr_not = function(opCls){
		return dojo.partial(function(cls,operands){
			return new fns.LogicNOT(new fns[cls](operands));
		},opCls);
	};
dojo.declare("dojox.grid.enhanced.plugins.filter.FilterBuilder", null, {
	// summary:
	//		Create filter expression from a JSON object.
	buildExpression: function(def){
		if("op" in def){
			return this.supportedOps[def.op.toLowerCase()](dojo.map(def.data, this.buildExpression, this));
		}else{
			var args = dojo.mixin(this.defaultArgs[def.datatype], def.args || {});
			return new this.supportedTypes[def.datatype](def.data, def.isColumn, args);
		}
	},
	supportedOps: {
	// summary:
	//		The builders of all supported operations
		"equalto": bdr("EqualTo"),
		"lessthan": bdr("LessThan"),
		"lessthanorequalto": bdr("LessThanOrEqualTo"),
		"largerthan": bdr("LargerThan"),
		"largerthanorequalto": bdr("LargerThanOrEqualTo"),
		"contains": bdr("Contains"),
		"startswith": bdr("StartsWith"),
		"endswith": bdr("EndsWith"),
		"notequalto": bdr_not("EqualTo"),
		"notcontains": bdr_not("Contains"),
		"notstartswith": bdr_not("StartsWith"),
		"notendswith": bdr_not("EndsWith"),
		"isempty": bdr("IsEmpty"),
		"range": function(operands){
			return new fns.LogicALL(
				new fns.LargerThanOrEqualTo(operands.slice(0,2)),
				new fns.LessThanOrEqualTo(operands[0], operands[2])
			);
		},
		"logicany": bdr("LogicANY"),
		"logicall": bdr("LogicALL")
	},
	supportedTypes: {
		"number": fns.NumberExpr,
		"string": fns.StringExpr,
		"boolean": fns.BooleanExpr,
		"date": fns.DateExpr,
		"time": fns.TimeExpr
	},
	defaultArgs: {
		"boolean": {
			"falseValue": "false",
			"convert": function(dataValue, args){
				var falseValue = args.falseValue;
				var trueValue = args.trueValue;
				if(dojo.isString(dataValue)){
					if(trueValue && dataValue.toLowerCase() == trueValue){
						return true;
					}
					if(falseValue && dataValue.toLowerCase() == falseValue){
						return false;
					}
				}
				return !!dataValue;
			}
		}
	}
});
})();
