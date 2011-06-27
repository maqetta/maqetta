/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/RoundRectList",["dijit/_WidgetBase","dijit/_Container","dijit/_Contained"],function(_1,_2,_3){
return dojo.declare("dojox.mobile.RoundRectList",[dijit._WidgetBase,dijit._Container,dijit._Contained],{transition:"slide",iconBase:"",iconPos:"",select:"",stateful:false,buildRendering:function(){
this.domNode=this.containerNode=this.srcNodeRef||dojo.doc.createElement("UL");
this.domNode.className="mblRoundRectList";
},onCheckStateChanged:function(_4,_5){
},_setStatefulAttr:function(_6){
this.stateful=_6;
dojo.forEach(this.getChildren(),function(_7){
_7.setArrow&&_7.setArrow();
});
},deselectItem:function(_8){
_8.deselectItem();
},deselectAll:function(){
dojo.forEach(this.getChildren(),function(_9){
_9.deselect&&_9.deselect();
});
},selectItem:function(_a){
_a.select();
}});
});
