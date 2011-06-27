/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/layout/ext-dijit/layout/StackContainer-touch",["dojo","dijit","dojox","dijit/layout/StackContainer"],function(_1,_2,_3){
_1.getObject("dojox.layout.ext-dijit.layout.StackContainer-touch",1);
_1.experimental("dojox.layout.ext-dijit.layout.StackContainer-touch");
_1.connect(_2.layout.StackContainer.prototype,"postCreate",function(){
this.axis=(this.baseClass=="dijitAccordionContainer")?"Y":"X";
_1.forEach(["touchstart","touchmove","touchend","touchcancel"],function(p){
this.connect(this.domNode,p,function(e){
switch(e.type){
case "touchmove":
e.preventDefault();
if(this.touchPosition){
var _4=e.touches[0]["page"+this.axis]-this.touchPosition;
if(Math.abs(_4)>100){
if(this.axis=="Y"){
_4*=-1;
}
delete this.touchPosition;
if(_4>0){
!this.selectedChildWidget.isLastChild&&this.forward();
}else{
!this.selectedChildWidget.isFirstChild&&this.back();
}
}
}
break;
case "touchstart":
if(e.touches.length==1){
this.touchPosition=e.touches[0]["page"+this.axis];
break;
}
case "touchend":
case "touchcancel":
delete this.touchPosition;
}
});
},this);
});
return _1.getObject("dojox.layout.ext-dijit.layout.StackContainer-touch");
});
require(["dojox/layout/ext-dijit/layout/StackContainer-touch"]);
