/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gfx/_gfxBidiSupport",["./utils","./shape","dojox/string/BidiEngine"],function(){
dojo.getObject("dojox.gfx._gfxBidiSupport",true);
var g=dojox.gfx;
switch(g.renderer){
case "vml":
g.isVml=true;
break;
case "svg":
g.isSvg=true;
if(g.svg.useSvgWeb){
g.isSvgWeb=true;
}
break;
case "silverlight":
g.isSilverlight=true;
break;
case "canvas":
g.isCanvas=true;
break;
}
var _1={LRM:"‎",LRE:"‪",PDF:"‬",RLM:"‏",RLE:"‫"};
var _2=new dojox.string.BidiEngine();
dojo.extend(dojox.gfx.shape.Surface,{textDir:"",setTextDir:function(_3){
_4(this,_3);
},getTextDir:function(){
return this.textDir;
}});
dojo.extend(dojox.gfx.Group,{textDir:"",setTextDir:function(_5){
_4(this,_5);
},getTextDir:function(){
return this.textDir;
}});
dojo.extend(dojox.gfx.Text,{textDir:"",formatText:function(_6,_7){
if(_7&&_6&&_6.length>1){
var _8="ltr",_9=_7;
if(_9=="auto"){
if(dojox.gfx.isVml){
return _6;
}
_9=_2.checkContextual(_6);
}
if(dojox.gfx.isVml){
_8=_2.checkContextual(_6);
if(_9!=_8){
if(_9=="rtl"){
return !_2.hasBidiChar(_6)?_2.bidiTransform(_6,"IRNNN","ILNNN"):_1.RLM+_1.RLM+_6;
}else{
return _1.LRM+_6;
}
}
return _6;
}
if(dojox.gfx.isSvgWeb){
if(_9=="rtl"){
return _2.bidiTransform(_6,"IRNNN","ILNNN");
}
return _6;
}
if(dojox.gfx.isSilverlight){
return (_9=="rtl")?_2.bidiTransform(_6,"IRNNN","VLYNN"):_2.bidiTransform(_6,"ILNNN","VLYNN");
}
if(dojox.gfx.isCanvas){
return (_9=="rtl")?_1.RLE+_6+_1.PDF:_1.LRE+_6+_1.PDF;
}
if(dojox.gfx.isSvg){
if(dojo.isFF){
return (_9=="rtl")?_2.bidiTransform(_6,"IRYNN","VLNNN"):_2.bidiTransform(_6,"ILYNN","VLNNN");
}
if(dojo.isChrome||dojo.isSafari||dojo.isOpera){
return _1.LRM+(_9=="rtl"?_1.RLE:_1.LRE)+_6+_1.PDF;
}
}
}
return _6;
},bidiPreprocess:function(_a){
return _a;
}});
dojo.extend(dojox.gfx.TextPath,{textDir:"",formatText:function(_b,_c){
if(_c&&_b&&_b.length>1){
var _d="ltr",_e=_c;
if(_e=="auto"){
if(dojox.gfx.isVml){
return _b;
}
_e=_2.checkContextual(_b);
}
if(dojox.gfx.isVml){
_d=_2.checkContextual(_b);
if(_e!=_d){
if(_e=="rtl"){
return !_2.hasBidiChar(_b)?_2.bidiTransform(_b,"IRNNN","ILNNN"):_1.RLM+_1.RLM+_b;
}else{
return _1.LRM+_b;
}
}
return _b;
}
if(dojox.gfx.isSvgWeb){
if(_e=="rtl"){
return _2.bidiTransform(_b,"IRNNN","ILNNN");
}
return _b;
}
if(dojox.gfx.isSvg){
if(dojo.isOpera){
_b=_1.LRM+(_e=="rtl"?_1.RLE:_1.LRE)+_b+_1.PDF;
}else{
_b=(_e=="rtl")?_2.bidiTransform(_b,"IRYNN","VLNNN"):_2.bidiTransform(_b,"ILYNN","VLNNN");
}
}
}
return _b;
},bidiPreprocess:function(_f){
if(_f&&(typeof _f=="string")){
this.origText=_f;
_f=this.formatText(_f,this.textDir);
}
return _f;
}});
var _10=function(_11,_12,_13,_14){
var old=_11.prototype[_12];
_11.prototype[_12]=function(){
var _15;
if(_13){
_15=_13.apply(this,arguments);
}
var r=old.call(this,_15);
if(_14){
r=_14.call(this,r,arguments);
}
return r;
};
};
var _16=function(_17){
if(_17){
if(_17.textDir){
_17.textDir=_18(_17.textDir);
}
if(_17.text&&(_17.text instanceof Array)){
_17.text=_17.text.join(",");
}
}
if(_17&&(_17.text!=undefined||_17.textDir)&&(this.textDir!=_17.textDir||_17.text!=this.origText)){
this.origText=(_17.text!=undefined)?_17.text:this.origText;
if(_17.textDir){
this.textDir=_17.textDir;
}
_17.text=this.formatText(this.origText,this.textDir);
}
return this.bidiPreprocess(_17);
};
_10(dojox.gfx.Text,"setShape",_16,null);
_10(dojox.gfx.TextPath,"setText",_16,null);
var _19=function(_1a){
var obj=dojo.clone(_1a);
if(obj&&this.origText){
obj.text=this.origText;
}
return obj;
};
_10(dojox.gfx.Text,"getShape",null,_19);
_10(dojox.gfx.TextPath,"getText",null,_19);
var _1b=function(_1c,_1d){
var _1e;
if(_1d&&_1d[0]){
_1e=_18(_1d[0]);
}
_1c.setTextDir(_1e?_1e:this.textDir);
return _1c;
};
_10(dojox.gfx.Surface,"createGroup",null,_1b);
_10(dojox.gfx.Group,"createGroup",null,_1b);
var _1f=function(_20){
if(_20){
var _21=_20.textDir?_18(_20.textDir):this.textDir;
if(_21){
_20.textDir=_21;
}
}
return _20;
};
_10(dojox.gfx.Surface,"createText",_1f,null);
_10(dojox.gfx.Surface,"createTextPath",_1f,null);
_10(dojox.gfx.Group,"createText",_1f,null);
_10(dojox.gfx.Group,"createTextPath",_1f,null);
dojox.gfx.createSurface=function(_22,_23,_24,_25){
var s=dojox.gfx[dojox.gfx.renderer].createSurface(_22,_23,_24);
var _26=_18(_25);
if(dojox.gfx.isSvgWeb){
s.textDir=_26?_26:dojo.style(dojo.byId(_22),"direction");
return s;
}
if(dojox.gfx.isVml||dojox.gfx.isSvg||dojox.gfx.isCanvas){
s.textDir=_26?_26:dojo.style(s.rawNode,"direction");
}
if(dojox.gfx.isSilverlight){
s.textDir=_26?_26:dojo.style(s._nodes[1],"direction");
}
return s;
};
function _4(obj,_27){
var _28=_18(_27);
if(_28){
dojox.gfx.utils.forEach(obj,function(e){
if(e instanceof dojox.gfx.Surface||e instanceof dojox.gfx.Group){
e.textDir=_28;
}
if(e instanceof dojox.gfx.Text){
e.setShape({textDir:_28});
}
if(e instanceof dojox.gfx.TextPath){
e.setText({textDir:_28});
}
},obj);
}
return obj;
};
function _18(_29){
var _2a=["ltr","rtl","auto"];
if(_29){
_29=_29.toLowerCase();
if(dojo.indexOf(_2a,_29)<0){
return null;
}
}
return _29;
};
return g;
});
