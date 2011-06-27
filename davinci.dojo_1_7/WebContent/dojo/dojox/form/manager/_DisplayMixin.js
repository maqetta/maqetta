/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/manager/_DisplayMixin",["dojo","dijit","dojox"],function(_1,_2,_3){
_1.getObject("dojox.form.manager._DisplayMixin",1);
_1.declare("dojox.form.manager._DisplayMixin",null,{gatherDisplayState:function(_4){
var _5=this.inspectAttachedPoints(function(_6,_7){
return _1.style(_7,"display")!="none";
},_4);
return _5;
},show:function(_8,_9){
if(arguments.length<2){
_9=true;
}
this.inspectAttachedPoints(function(_a,_b,_c){
_1.style(_b,"display",_c?"":"none");
},_8,_9);
return this;
},hide:function(_d){
return this.show(_d,false);
}});
return _1.getObject("dojox.form.manager._DisplayMixin");
});
require(["dojox/form/manager/_DisplayMixin"]);
