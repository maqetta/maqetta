/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/ui/dom/Toolbar",["dojo"],function(_1){
_1.deprecated("dojox.drawing.ui.dom.Toolbar","It may not even make it to the 1.4 release.",1.4);
_1.declare("dojox.drawing.ui.dom.Toolbar",[],{baseClass:"drawingToolbar",buttonClass:"drawingButton",iconClass:"icon",constructor:function(_2,_3){
_1.addOnLoad(this,function(){
this.domNode=_1.byId(_3);
_1.addClass(this.domNode,this.baseClass);
this.parse();
});
},createIcon:function(_4,_5){
var _6=_5&&_5.setup?_5.setup:{};
if(_6.iconClass){
var _7=_6.iconClass?_6.iconClass:"iconNone";
var _8=_6.tooltip?_6.tooltip:"Tool";
var _9=_1.create("div",{title:_8},_4);
_1.addClass(_9,this.iconClass);
_1.addClass(_9,_7);
_1.connect(_4,"mouseup",function(_a){
_1.stopEvent(_a);
_1.removeClass(_4,"active");
});
_1.connect(_4,"mouseover",function(_b){
_1.stopEvent(_b);
_1.addClass(_4,"hover");
});
_1.connect(_4,"mousedown",this,function(_c){
_1.stopEvent(_c);
_1.addClass(_4,"active");
});
_1.connect(_4,"mouseout",this,function(_d){
_1.stopEvent(_d);
_1.removeClass(_4,"hover");
});
}
},createTool:function(_e){
_e.innerHTML="";
var _f=_1.attr(_e,"tool");
this.toolNodes[_f]=_e;
_1.attr(_e,"tabIndex",1);
var _10=_1.getObject(_f);
this.createIcon(_e,_10);
this.drawing.registerTool(_f,_10);
_1.connect(_e,"mouseup",this,function(evt){
_1.stopEvent(evt);
_1.removeClass(_e,"active");
this.onClick(_f);
});
_1.connect(_e,"mouseover",function(evt){
_1.stopEvent(evt);
_1.addClass(_e,"hover");
});
_1.connect(_e,"mousedown",this,function(evt){
_1.stopEvent(evt);
_1.addClass(_e,"active");
});
_1.connect(_e,"mouseout",this,function(evt){
_1.stopEvent(evt);
_1.removeClass(_e,"hover");
});
},parse:function(){
var _11=_1.attr(this.domNode,"drawingId");
this.drawing=dojox.drawing.util.common.byId(_11);
!this.drawing&&console.error("Drawing not found based on 'drawingId' in Toolbar. ");
this.toolNodes={};
var _12;
_1.query(">",this.domNode).forEach(function(_13,i){
_13.className=this.buttonClass;
var _14=_1.attr(_13,"tool");
var _15=_1.attr(_13,"action");
var _16=_1.attr(_13,"plugin");
if(_14){
if(i==0||_1.attr(_13,"selected")=="true"){
_12=_14;
}
this.createTool(_13);
}else{
if(_16){
var p={name:_16,options:{}},opt=_1.attr(_13,"options");
if(opt){
p.options=eval("("+opt+")");
}
p.options.node=_13;
_13.innerHTML="";
this.drawing.addPlugin(p);
this.createIcon(_13,_1.getObject(_1.attr(_13,"plugin")));
}
}
},this);
this.drawing.initPlugins();
_1.connect(this.drawing,"setTool",this,"onSetTool");
this.drawing.setTool(_12);
},onClick:function(_17){
this.drawing.setTool(_17);
},onSetTool:function(_18){
for(var n in this.toolNodes){
if(n==_18){
_1.addClass(this.toolNodes[_18],"selected");
this.toolNodes[_18].blur();
}else{
_1.removeClass(this.toolNodes[n],"selected");
}
}
}});
return dojox.drawing.ui.dom.Toolbar;
});
