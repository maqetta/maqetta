/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/FixedSplitterPane",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/html","dojo/_base/array","dijit/_WidgetBase","dijit/_Container","dijit/_Contained"],function(_1,_2,_3,_4,_5,_6,_7){
return _1.declare("dojox.mobile.FixedSplitterPane",[dijit._WidgetBase,dijit._Container,dijit._Contained],{buildRendering:function(){
this.inherited(arguments);
_1.addClass(this.domNode,"mblFixedSplitterPane");
},resize:function(){
_1.forEach(this.getChildren(),function(_8){
if(_8.resize){
_8.resize();
}
});
}});
});
