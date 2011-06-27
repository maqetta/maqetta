/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/ui/Tooltip",["dojo","../util/oo","../manager/_registry","../plugins/_Plugin"],function(_1){
var _2=null;
var _3=dojox.drawing.util.oo.declare(dojox.drawing.plugins._Plugin,function(_4){
this.createDom();
},{show:function(_5,_6){
this.domNode.innerHTML=_6;
var dx=30;
var px=_5.data.x+_5.data.width;
var py=_5.data.y+_5.data.height;
var x=px+this.mouse.origin.x+dx;
var y=py+this.mouse.origin.y+dx;
_1.style(this.domNode,{display:"inline",left:x+"px",top:y+"px"});
var _7=_1.marginBox(this.domNode);
this.createShape(x-this.mouse.origin.x,y-this.mouse.origin.y,_7.w,_7.h);
},createShape:function(x,y,w,h){
this.balloon&&this.balloon.destroy();
var r=5,x2=x+w,y2=y+h,_8=[];
var _9=function(){
for(var i=0;i<arguments.length;i++){
_8.push(arguments[i]);
}
};
_9({x:x,y:y+5},{t:"Q",x:x,y:y},{x:x+r,y:y});
_9({t:"L",x:x2-r,y:y});
_9({t:"Q",x:x2,y:y},{x:x2,y:y+r});
_9({t:"L",x:x2,y:y2-r});
_9({t:"Q",x:x2,y:y2},{x:x2-r,y:y2});
_9({t:"L",x:x+r,y:y2});
_9({t:"Q",x:x,y:y2},{x:x,y:y2-r});
_9({t:"L",x:x,y:y+r});
this.balloon=this.drawing.addUI("path",{points:_8});
},createDom:function(){
this.domNode=_1.create("span",{"class":"drawingTooltip"},document.body);
_1.style(this.domNode,{display:"none",position:"absolute"});
}});
dojox.drawing.ui.Tooltip=dojox.drawing.util.oo.declare(dojox.drawing.plugins._Plugin,function(_a){
if(!_2){
_2=new _3(_a);
}
if(_a.stencil){
}else{
if(this.button){
this.connect(this.button,"onOver",this,"onOver");
this.connect(this.button,"onOut",this,"onOut");
}
}
},{width:300,height:200,onOver:function(){
_2.show(this.button,this.data.text);
},onOut:function(){
}});
dojox.drawing.register({name:"dojox.drawing.ui.Tooltip"},"stencil");
return dojox.drawing.ui.Tooltip;
});
