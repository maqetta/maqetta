/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/annotations/Label",["dojo","../stencil/Text","./Angle"],function(_1){
dojox.drawing.annotations.Label=dojox.drawing.util.oo.declare(dojox.drawing.stencil.Text,function(_2){
this.master=_2.stencil;
this.labelPosition=_2.labelPosition||"BR";
if(_1.isFunction(this.labelPosition)){
this.setLabel=this.setLabelCustom;
}
this.setLabel(_2.text||"");
this.connect(this.master,"onTransform",this,"setLabel");
this.connect(this.master,"destroy",this,"destroy");
if(this.style.labelSameColor){
this.connect(this.master,"attr",this,"beforeAttr");
}
},{_align:"start",drawingType:"label",setLabelCustom:function(_3){
var d=_1.hitch(this.master,this.labelPosition)();
this.setData({x:d.x,y:d.y,width:d.w||this.style.text.minWidth,height:d.h||this._lineHeight});
if(_3&&!_3.split){
_3=this.getText();
}
this.render(this.typesetter(_3));
},setLabel:function(_4){
var x,y,_5=this.master.getBounds();
if(/B/.test(this.labelPosition)){
y=_5.y2-this._lineHeight;
}else{
y=_5.y1;
}
if(/R/.test(this.labelPosition)){
x=_5.x2;
}else{
y=_5.y1;
this._align="end";
}
if(!this.labelWidth||(_4&&_4.split&&_4!=this.getText())){
this.setData({x:x,y:y,height:this._lineHeight,width:this.style.text.minWidth});
this.labelWidth=this.style.text.minWidth;
this.render(this.typesetter(_4));
}else{
this.setData({x:x,y:y,height:this.data.height,width:this.data.width});
this.render();
}
},beforeAttr:function(_6,_7){
if(_7!==undefined){
var k=_6;
_6={};
_6[k]=_7;
}
delete _6.x;
delete _6.y;
delete _6.width;
delete _6.height;
this.attr(_6);
!this.created&&this.render();
}});
return dojox.drawing.annotations.Label;
});
