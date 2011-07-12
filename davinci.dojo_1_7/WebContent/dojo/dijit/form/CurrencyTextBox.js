/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/CurrencyTextBox",["dojo/_base/kernel","..","dojo/currency","./NumberTextBox","dojo/_base/declare","dojo/_base/lang"],function(_1,_2){
_1.declare("dijit.form.CurrencyTextBox",_2.form.NumberTextBox,{currency:"",baseClass:"dijitTextBox dijitCurrencyTextBox",regExpGen:function(_3){
return "("+(this.focused?this.inherited(arguments,[_1.mixin({},_3,this.editOptions)])+"|":"")+_1.currency.regexp(_3)+")";
},_formatter:_1.currency.format,_parser:_1.currency.parse,parse:function(_4,_5){
var v=this.inherited(arguments);
if(isNaN(v)&&/\d+/.test(_4)){
v=_1.hitch(_1.mixin({},this,{_parser:_2.form.NumberTextBox.prototype._parser}),"inherited")(arguments);
}
return v;
},_setConstraintsAttr:function(_6){
if(!_6.currency&&this.currency){
_6.currency=this.currency;
}
this.inherited(arguments,[_1.currency._mixInDefaults(_1.mixin(_6,{exponent:false}))]);
}});
return _2.form.CurrencyTextBox;
});
