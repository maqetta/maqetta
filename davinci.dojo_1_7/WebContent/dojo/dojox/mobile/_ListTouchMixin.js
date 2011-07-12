/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/_ListTouchMixin",["dijit/form/_ListBase"],function(_1){
return dojo.declare("dojox.mobile._ListTouchMixin",dijit.form._ListBase,{postCreate:function(){
this.inherited(arguments);
this.connect(this.domNode,"onclick","_onClick");
},_onClick:function(_2){
dojo.stopEvent(_2);
var _3=this._getTarget(_2);
if(_3){
this._setSelectedAttr(_3);
this.onClick(_3);
}
}});
});
