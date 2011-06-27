/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/ProgressIndicator",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/html"],function(_1,_2,_3){
_1.declare("dojox.mobile.ProgressIndicator",null,{interval:100,colors:["#C0C0C0","#C0C0C0","#C0C0C0","#C0C0C0","#C0C0C0","#C0C0C0","#B8B9B8","#AEAFAE","#A4A5A4","#9A9A9A","#8E8E8E","#838383"],_bars:[],constructor:function(){
this.domNode=_1.create("DIV");
this.domNode.className="mblProgContainer";
if(_1.config["mblAndroidWorkaround"]!==false&&_1.isAndroid>=2.2&&_1.isAndroid<3){
_1.style(this.domNode,"webkitTransform","translate3d(0,0,0)");
}
this.spinnerNode=_1.create("DIV",null,this.domNode);
for(var i=0;i<this.colors.length;i++){
var _4=_1.create("DIV",{className:"mblProg mblProg"+i},this.spinnerNode);
this._bars.push(_4);
}
},start:function(){
if(this.imageNode){
var _5=this.imageNode;
var l=Math.round((this.domNode.offsetWidth-_5.offsetWidth)/2);
var t=Math.round((this.domNode.offsetHeight-_5.offsetHeight)/2);
_5.style.margin=t+"px "+l+"px";
return;
}
var _6=0;
var _7=this;
var n=this.colors.length;
this.timer=setInterval(function(){
_6--;
_6=_6<0?n-1:_6;
var c=_7.colors;
for(var i=0;i<n;i++){
var _8=(_6+i)%n;
_7._bars[i].style.backgroundColor=c[_8];
}
},this.interval);
},stop:function(){
if(this.timer){
clearInterval(this.timer);
}
this.timer=null;
if(this.domNode.parentNode){
this.domNode.parentNode.removeChild(this.domNode);
}
},setImage:function(_9){
if(_9){
this.imageNode=_1.create("IMG",{src:_9},this.domNode);
this.spinnerNode.style.display="none";
}else{
if(this.imageNode){
this.domNode.removeChild(this.imageNode);
this.imageNode=null;
}
this.spinnerNode.style.display="";
}
}});
dojox.mobile.ProgressIndicator._instance=null;
dojox.mobile.ProgressIndicator.getInstance=function(){
if(!dojox.mobile.ProgressIndicator._instance){
dojox.mobile.ProgressIndicator._instance=new dojox.mobile.ProgressIndicator();
}
return dojox.mobile.ProgressIndicator._instance;
};
return dojox.mobile.ProgressIndicator;
});
