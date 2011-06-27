/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/app/_Widget",["dojo","dijit","dojox","dijit/_WidgetBase"],function(_1,_2,_3){
_1.getObject("dojox.mobile.app._Widget",1);
_1.experimental("dojox.mobile.app._Widget");
_1.declare("dojox.mobile.app._Widget",_2._WidgetBase,{getScroll:function(){
return {x:_1.global.scrollX,y:_1.global.scrollY};
},connect:function(_4,_5,fn){
if(_5.toLowerCase()=="dblclick"||_5.toLowerCase()=="ondblclick"){
if(_1.global["Mojo"]){
return this.connect(_4,Mojo.Event.tap,fn);
}
}
return this.inherited(arguments);
}});
return _1.getObject("dojox.mobile.app._Widget");
});
require(["dojox/mobile/app/_Widget"]);
