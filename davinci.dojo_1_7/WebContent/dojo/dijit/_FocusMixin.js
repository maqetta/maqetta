/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_FocusMixin",["dojo/_base/kernel",".","./focus","./_WidgetBase","dojo/_base/declare","dojo/_base/lang"],function(_1,_2,_3){
_1.extend(_2._WidgetBase,{focused:false,onFocus:function(){
},onBlur:function(){
},_onFocus:function(e){
this.onFocus();
},_onBlur:function(){
this.onBlur();
}});
return _1.declare("dijit._FocusMixin",null,{_focusManager:_3});
});
