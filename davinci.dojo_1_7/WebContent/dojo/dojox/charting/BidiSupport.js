/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/BidiSupport",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/html","dojo/_base/array","dojox/gfx","dojox/gfx/_gfxBidiSupport","./Chart","./axis2d/common","dojox/string/BidiEngine","dojox/lang/functional"],function(_1,_2,_3,_4,g,_5,_6,da,_7,df){
var _8=new dojox.string.BidiEngine();
_1.extend(dojox.charting.Chart,{textDir:"",getTextDir:function(_9){
var _a=this.textDir=="auto"?_8.checkContextual(_9):this.textDir;
if(!_a){
_a=_1.style(this.node,"direction");
}
return _a;
},postscript:function(_b,_c){
var _d=_c?(_c["textDir"]?_e(_c["textDir"]):""):"";
_d=_d?_d:_1.style(this.node,"direction");
this.textDir=_d;
this.surface.textDir=_d;
this.htmlElementsRegistry=[];
this.truncatedLabelsRegistry=[];
},setTextDir:function(_f,obj){
if(_f==this.textDir){
return this;
}
if(_e(_f)!=null){
this.textDir=_f;
this.surface.setTextDir(_f);
if(this.truncatedLabelsRegistry&&_f=="auto"){
_1.forEach(this.truncatedLabelsRegistry,function(_10){
var _11=this.getTextDir(_10["label"]);
if(_10["element"].textDir!=_11){
_10["element"].setShape({textDir:_11});
}
},this);
}
var _12=df.keys(this.axes);
if(_12.length>0){
_1.forEach(_12,function(key,_13,arr){
var _14=this.axes[key];
if(_14.htmlElements[0]){
_14.dirty=true;
_14.render(this.dim,this.offsets);
}
},this);
if(this.title){
var _15=(g.renderer=="canvas"),_16=_15||!_1.isIE&&!_1.isOpera?"html":"gfx",_17=g.normalizedLength(g.splitFontString(this.titleFont).size);
_1.destroy(this.chartTitle);
this.chartTitle=null;
this.chartTitle=da.createText[_16](this,this.surface,this.dim.width/2,this.titlePos=="top"?_17+this.margins.t:this.dim.height-this.margins.b,"middle",this.title,this.titleFont,this.titleFontColor);
}
}else{
_1.forEach(this.htmlElementsRegistry,function(_18,_19,arr){
var _1a=_f=="auto"?this.getTextDir(_18[4]):_f;
if(_18[0].children[0]&&_18[0].children[0].dir!=_1a){
_1.destroy(_18[0].children[0]);
_18[0].children[0]=da.createText["html"](this,this.surface,_18[1],_18[2],_18[3],_18[4],_18[5],_18[6]).children[0];
}
},this);
}
}
},truncateBidi:function(_1b,_1c,_1d){
if(_1d=="gfx"){
this.truncatedLabelsRegistry.push({element:_1b,label:_1c});
if(this.textDir=="auto"){
_1b.setShape({textDir:this.getTextDir(_1c)});
}
}
if(_1d=="html"&&this.textDir=="auto"){
_1b.children[0].dir=this.getTextDir(_1c);
}
}});
var _1e=function(obj,_1f,_20,_21,_22){
if(_20){
var old=obj.prototype[_1f];
obj.prototype[_1f]=function(){
var _23;
if(_21){
_23=_21.apply(this,arguments);
}
var r=old.apply(this,_23);
if(_22){
r=_22.call(this,r,arguments);
}
return r;
};
}else{
var old=_1.clone(obj[_1f]);
obj[_1f]=function(){
var _24;
if(_21){
_24=_21.apply(this,arguments);
}
var r=old.apply(this,arguments);
if(_22){
_22(r,arguments);
}
return r;
};
}
};
var _25=function(_26,_27,_28,_29,_2a,_2b){
var _2c=(_1.style(_27.node,"direction")=="rtl");
var _2d=(_27.getTextDir(_28)=="rtl");
if(_2d&&!_2c){
_28="<span dir='rtl'>"+_28+"</span>";
}
if(!_2d&&_2c){
_28="<span dir='ltr'>"+_28+"</span>";
}
return arguments;
};
if(dojox.charting.axis2d&&dojox.charting.axis2d.Default){
_1e(dojox.charting.axis2d.Default,"labelTooltip",true,_25,null);
}
function _2e(r,_2f){
_2f[0].htmlElementsRegistry.push([r,_2f[2],_2f[3],_2f[4],_2f[5],_2f[6],_2f[7]]);
};
_1e(da.createText,"html",false,null,_2e);
function _e(_30){
return /^(ltr|rtl|auto)$/.test(_30)?_30:null;
};
});
