/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/NumberSpinner",["dojo/_base/kernel","..","./_Spinner","./NumberTextBox","dojo/_base/connect","dojo/_base/event"],function(_1,_2){
_1.declare("dijit.form.NumberSpinner",[_2.form._Spinner,_2.form.NumberTextBoxMixin],{adjust:function(_3,_4){
var tc=this.constraints,v=isNaN(_3),_5=!isNaN(tc.max),_6=!isNaN(tc.min);
if(v&&_4!=0){
_3=(_4>0)?_6?tc.min:_5?tc.max:0:_5?this.constraints.max:_6?tc.min:0;
}
var _7=_3+_4;
if(v||isNaN(_7)){
return _3;
}
if(_5&&(_7>tc.max)){
_7=tc.max;
}
if(_6&&(_7<tc.min)){
_7=tc.min;
}
return _7;
},_onKeyPress:function(e){
if((e.charOrCode==_1.keys.HOME||e.charOrCode==_1.keys.END)&&!(e.ctrlKey||e.altKey||e.metaKey)&&typeof this.get("value")!="undefined"){
var _8=this.constraints[(e.charOrCode==_1.keys.HOME?"min":"max")];
if(typeof _8=="number"){
this._setValueAttr(_8,false);
}
_1.stopEvent(e);
}
}});
return _2.form.NumberSpinner;
});
