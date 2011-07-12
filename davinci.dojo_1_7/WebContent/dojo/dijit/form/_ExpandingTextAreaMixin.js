/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/_ExpandingTextAreaMixin",["dojo/_base/kernel","..","dojo/_base/declare","dojo/_base/html","dojo/_base/lang","dojo/_base/window"],function(_1,_2){
var _3;
_1.declare("dijit.form._ExpandingTextAreaMixin",null,{_setValueAttr:function(){
this.inherited(arguments);
this.resize();
},postCreate:function(){
this.inherited(arguments);
var _4=this.textbox;
if(_3==undefined){
var te=_1.create("textarea",{rows:"5",cols:"20",value:" ",style:{zoom:1,overflow:"hidden",visibility:"hidden",position:"absolute",border:"0px solid black",padding:"0px"}},_1.body(),"last");
_3=te.scrollHeight>=te.clientHeight;
_1.body().removeChild(te);
}
this.connect(_4,"onscroll","_resizeLater");
this.connect(_4,"onresize","_resizeLater");
this.connect(_4,"onfocus","_resizeLater");
_4.style.overflowY="hidden";
this._estimateHeight();
this._resizeLater();
},_onInput:function(e){
this.inherited(arguments);
this.resize();
},_estimateHeight:function(){
var _5=this.textbox;
_5.style.height="auto";
_5.rows=(_5.value.match(/\n/g)||[]).length+2;
},_resizeLater:function(){
setTimeout(_1.hitch(this,"resize"),0);
},resize:function(){
function _6(){
var _7=false;
if(_8.value===""){
_8.value=" ";
_7=true;
}
var sh=_8.scrollHeight;
if(_7){
_8.value="";
}
return sh;
};
var _8=this.textbox;
if(_8.style.overflowY=="hidden"){
_8.scrollTop=0;
}
if(this.resizeTimer){
clearTimeout(this.resizeTimer);
}
this.resizeTimer=null;
if(this.busyResizing){
return;
}
this.busyResizing=true;
if(_6()||_8.offsetHeight){
var _9=_8.style.height;
if(!(/px/.test(_9))){
_9=_6();
_8.rows=1;
_8.style.height=_9+"px";
}
var _a=Math.max(parseInt(_9)-_8.clientHeight,0)+_6();
var _b=_a+"px";
if(_b!=_8.style.height){
_8.rows=1;
_8.style.height=_b;
}
if(_3){
var _c=_6();
_8.style.height="auto";
if(_6()<_c){
_b=_a-_c+_6()+"px";
}
_8.style.height=_b;
}
_8.style.overflowY=_6()>_8.clientHeight?"auto":"hidden";
}else{
this._estimateHeight();
}
this.busyResizing=false;
},destroy:function(){
if(this.resizeTimer){
clearTimeout(this.resizeTimer);
}
if(this.shrinkTimer){
clearTimeout(this.shrinkTimer);
}
this.inherited(arguments);
}});
return _2.form._ExpandingTextAreaMixin;
});
