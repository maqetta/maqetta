/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gfx/renderer",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/sniff"],function(_1){
var _2=null;
return {load:function(id,_3,_4){
if(_2&&id!="force"){
_4(_2);
return;
}
var _5=_1.config.forceGfxRenderer,_6=!_5&&(_1.isString(_1.config.gfxRenderer)?_1.config.gfxRenderer:"svg,vml,canvas,silverlight").split(","),_7,_8;
while(!_5&&_6.length){
switch(_6.shift()){
case "svg":
if("SVGAngle" in _1.global){
_5="svg";
}
break;
case "vml":
if(_1.isIE){
_5="vml";
}
break;
case "silverlight":
try{
if(_1.isIE){
_7=new ActiveXObject("AgControl.AgControl");
if(_7&&_7.IsVersionSupported("1.0")){
_8=true;
}
}else{
if(navigator.plugins["Silverlight Plug-In"]){
_8=true;
}
}
}
catch(e){
_8=false;
}
finally{
_7=null;
}
if(_8){
_5="silverlight";
}
break;
case "canvas":
if(_1.global.CanvasRenderingContext2D){
_5="canvas";
}
break;
}
}
if(_5==="canvas"&&_1.config.canvasEvent!==false){
_5="canvasWithEvents";
}
if(_1.config.isDebug){
}
function _9(){
_3(["dojox/gfx/"+_5],function(_a){
dojox.gfx.renderer=_5;
_2=_a;
_4(_a);
});
};
if(_5=="svg"&&typeof window.svgweb!="undefined"){
window.svgweb.addOnLoad(_9);
}else{
_9();
}
}};
});
