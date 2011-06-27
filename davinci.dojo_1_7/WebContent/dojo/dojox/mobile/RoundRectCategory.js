/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/RoundRectCategory",["dijit/_WidgetBase","dijit/_Contained"],function(_1,_2){
return dojo.declare("dojox.mobile.RoundRectCategory",[dijit._WidgetBase,dijit._Contained],{label:"",buildRendering:function(){
this.domNode=this.containerNode=this.srcNodeRef||dojo.doc.createElement("H2");
this.domNode.className="mblRoundRectCategory";
if(!this.label){
this.label=this.domNode.innerHTML;
}
},_setLabelAttr:function(_3){
this.label=_3;
this.domNode.innerHTML=this._cv(_3);
}});
});
