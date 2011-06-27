/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/widget/Standby",["dojo","dijit","dojox","dojo/window","dojo/fx","dijit/_Widget","dijit/_TemplatedMixin"],function(_1,_2,_3){
_1.experimental("dojox.widget.Standby");
_1.declare("dojox.widget.Standby",[_2._Widget,_2._TemplatedMixin],{templateString:"<div>"+"<div style=\"display: none; opacity: 0; z-index: 9999; "+"position: absolute; cursor:wait;\" dojoAttachPoint=\"_underlayNode\"></div>"+"<img src=\"${image}\" style=\"opacity: 0; display: none; z-index: -10000; "+"position: absolute; top: 0px; left: 0px; cursor:wait;\" "+"dojoAttachPoint=\"_imageNode\">"+"<div style=\"opacity: 0; display: none; z-index: -10000; position: absolute; "+"top: 0px;\" dojoAttachPoint=\"_textNode\"></div>"+"</div>",_underlayNode:null,_imageNode:null,_textNode:null,_centerNode:null,image:_1.moduleUrl("dojox","widget/Standby/images/loading.gif").toString(),imageText:"Please Wait...",text:"Please wait...",centerIndicator:"image",_displayed:false,_resizeCheck:null,target:"",color:"#C0C0C0",duration:500,_started:false,_parent:null,zIndex:"auto",startup:function(_4){
if(!this._started){
if(typeof this.target==="string"){
var w=_2.byId(this.target);
if(w){
this.target=w.domNode;
}else{
this.target=_1.byId(this.target);
}
}
if(this.text){
this._textNode.innerHTML=this.text;
}
if(this.centerIndicator==="image"){
this._centerNode=this._imageNode;
_1.attr(this._imageNode,"src",this.image);
_1.attr(this._imageNode,"alt",this.imageText);
}else{
this._centerNode=this._textNode;
}
_1.style(this._underlayNode,{display:"none",backgroundColor:this.color});
_1.style(this._centerNode,"display","none");
this.connect(this._underlayNode,"onclick","_ignore");
if(this.domNode.parentNode&&this.domNode.parentNode!=_1.body()){
_1.body().appendChild(this.domNode);
}
if(_1.isIE==7){
this._ieFixNode=_1.doc.createElement("div");
_1.style(this._ieFixNode,{opacity:"0",zIndex:"-1000",position:"absolute",top:"-1000px"});
_1.body().appendChild(this._ieFixNode);
}
this.inherited(arguments);
}
},show:function(){
if(!this._displayed){
if(this._anim){
this._anim.stop();
delete this._anim;
}
this._displayed=true;
this._size();
this._disableOverflow();
this._fadeIn();
}
},hide:function(){
if(this._displayed){
if(this._anim){
this._anim.stop();
delete this._anim;
}
this._size();
this._fadeOut();
this._displayed=false;
if(this._resizeCheck!==null){
clearInterval(this._resizeCheck);
this._resizeCheck=null;
}
}
},isVisible:function(){
return this._displayed;
},onShow:function(){
},onHide:function(){
},uninitialize:function(){
this._displayed=false;
if(this._resizeCheck){
clearInterval(this._resizeCheck);
}
_1.style(this._centerNode,"display","none");
_1.style(this._underlayNode,"display","none");
if(_1.isIE==7){
_1.body().removeChild(this._ieFixNode);
delete this._ieFixNode;
}
if(this._anim){
this._anim.stop();
delete this._anim;
}
this.target=null;
this._imageNode=null;
this._textNode=null;
this._centerNode=null;
this.inherited(arguments);
},_size:function(){
if(this._displayed){
var _5=_1.attr(_1.body(),"dir");
if(_5){
_5=_5.toLowerCase();
}
var _6;
var _7=this._scrollerWidths();
var _8=this.target;
var _9=_1.style(this._centerNode,"display");
_1.style(this._centerNode,"display","block");
var _a=_1.position(_8,true);
if(_8===_1.body()||_8===_1.doc){
_a=_1.window.getBox();
_a.x=_a.l;
_a.y=_a.t;
}
var _b=_1.marginBox(this._centerNode);
_1.style(this._centerNode,"display",_9);
if(this._ieFixNode){
_6=-this._ieFixNode.offsetTop/1000;
_a.x=Math.floor((_a.x+0.9)/_6);
_a.y=Math.floor((_a.y+0.9)/_6);
_a.w=Math.floor((_a.w+0.9)/_6);
_a.h=Math.floor((_a.h+0.9)/_6);
}
var zi=_1.style(_8,"zIndex");
var _c=zi;
var _d=zi;
if(this.zIndex==="auto"){
if(zi!="auto"){
_c=parseInt(_c,10)+1;
_d=parseInt(_d,10)+2;
}else{
var _e=_8.parentNode;
var _f=-100000;
while(_e&&_e!==_1.body()){
zi=_1.style(_e,"zIndex");
if(!zi||zi==="auto"){
_e=_e.parentNode;
}else{
var _10=parseInt(zi,10);
if(_f<_10){
_f=_10;
_c=_10+1;
_d=_10+2;
}
_e=_e.parentNode;
}
}
}
}else{
_c=parseInt(this.zIndex,10)+1;
_d=parseInt(this.zIndex,10)+2;
}
_1.style(this._centerNode,"zIndex",_d);
_1.style(this._underlayNode,"zIndex",_c);
var pn=_8.parentNode;
if(pn&&pn!==_1.body()&&_8!==_1.body()&&_8!==_1.doc){
var obh=_a.h;
var obw=_a.w;
var _11=_1.position(pn,true);
if(this._ieFixNode){
_6=-this._ieFixNode.offsetTop/1000;
_11.x=Math.floor((_11.x+0.9)/_6);
_11.y=Math.floor((_11.y+0.9)/_6);
_11.w=Math.floor((_11.w+0.9)/_6);
_11.h=Math.floor((_11.h+0.9)/_6);
}
_11.w-=pn.scrollHeight>pn.clientHeight&&pn.clientHeight>0?_7.v:0;
_11.h-=pn.scrollWidth>pn.clientWidth&&pn.clientWidth>0?_7.h:0;
if(_5==="rtl"){
if(_1.isOpera){
_a.x+=pn.scrollHeight>pn.clientHeight&&pn.clientHeight>0?_7.v:0;
_11.x+=pn.scrollHeight>pn.clientHeight&&pn.clientHeight>0?_7.v:0;
}else{
if(_1.isIE){
_11.x+=pn.scrollHeight>pn.clientHeight&&pn.clientHeight>0?_7.v:0;
}else{
if(_1.isWebKit){
}
}
}
}
if(_11.w<_a.w){
_a.w=_a.w-_11.w;
}
if(_11.h<_a.h){
_a.h=_a.h-_11.h;
}
var _12=_11.y;
var _13=_11.y+_11.h;
var _14=_a.y;
var _15=_a.y+obh;
var _16=_11.x;
var _17=_11.x+_11.w;
var _18=_a.x;
var _19=_a.x+obw;
var _1a;
if(_15>_12&&_14<_12){
_a.y=_11.y;
_1a=_12-_14;
var _1b=obh-_1a;
if(_1b<_11.h){
_a.h=_1b;
}else{
_a.h-=2*(pn.scrollWidth>pn.clientWidth&&pn.clientWidth>0?_7.h:0);
}
}else{
if(_14<_13&&_15>_13){
_a.h=_13-_14;
}else{
if(_15<=_12||_14>=_13){
_a.h=0;
}
}
}
if(_19>_16&&_18<_16){
_a.x=_11.x;
_1a=_16-_18;
var _1c=obw-_1a;
if(_1c<_11.w){
_a.w=_1c;
}else{
_a.w-=2*(pn.scrollHeight>pn.clientHeight&&pn.clientHeight>0?_7.w:0);
}
}else{
if(_18<_17&&_19>_17){
_a.w=_17-_18;
}else{
if(_19<=_16||_18>=_17){
_a.w=0;
}
}
}
}
if(_a.h>0&&_a.w>0){
_1.style(this._underlayNode,{display:"block",width:_a.w+"px",height:_a.h+"px",top:_a.y+"px",left:_a.x+"px"});
var _1d=["borderRadius","borderTopLeftRadius","borderTopRightRadius","borderBottomLeftRadius","borderBottomRightRadius"];
this._cloneStyles(_1d);
if(!_1.isIE){
_1d=["MozBorderRadius","MozBorderRadiusTopleft","MozBorderRadiusTopright","MozBorderRadiusBottomleft","MozBorderRadiusBottomright","WebkitBorderRadius","WebkitBorderTopLeftRadius","WebkitBorderTopRightRadius","WebkitBorderBottomLeftRadius","WebkitBorderBottomRightRadius"];
this._cloneStyles(_1d,this);
}
var _1e=(_a.h/2)-(_b.h/2);
var _1f=(_a.w/2)-(_b.w/2);
if(_a.h>=_b.h&&_a.w>=_b.w){
_1.style(this._centerNode,{top:(_1e+_a.y)+"px",left:(_1f+_a.x)+"px",display:"block"});
}else{
_1.style(this._centerNode,"display","none");
}
}else{
_1.style(this._underlayNode,"display","none");
_1.style(this._centerNode,"display","none");
}
if(this._resizeCheck===null){
var _20=this;
this._resizeCheck=setInterval(function(){
_20._size();
},100);
}
}
},_cloneStyles:function(_21){
_1.forEach(_21,function(_22){
_1.style(this._underlayNode,_22,_1.style(this.target,_22));
},this);
},_fadeIn:function(){
var _23=this;
var _24=_1.animateProperty({duration:_23.duration,node:_23._underlayNode,properties:{opacity:{start:0,end:0.75}}});
var _25=_1.animateProperty({duration:_23.duration,node:_23._centerNode,properties:{opacity:{start:0,end:1}},onEnd:function(){
_23.onShow();
delete _23._anim;
}});
this._anim=_1.fx.combine([_24,_25]);
this._anim.play();
},_fadeOut:function(){
var _26=this;
var _27=_1.animateProperty({duration:_26.duration,node:_26._underlayNode,properties:{opacity:{start:0.75,end:0}},onEnd:function(){
_1.style(this.node,{"display":"none","zIndex":"-1000"});
}});
var _28=_1.animateProperty({duration:_26.duration,node:_26._centerNode,properties:{opacity:{start:1,end:0}},onEnd:function(){
_1.style(this.node,{"display":"none","zIndex":"-1000"});
_26.onHide();
_26._enableOverflow();
delete _26._anim;
}});
this._anim=_1.fx.combine([_27,_28]);
this._anim.play();
},_ignore:function(_29){
if(_29){
_1.stopEvent(_29);
}
},_scrollerWidths:function(){
var div=_1.doc.createElement("div");
_1.style(div,{position:"absolute",opacity:0,overflow:"hidden",width:"50px",height:"50px",zIndex:"-100",top:"-200px",left:"-200px",padding:"0px",margin:"0px"});
var _2a=_1.doc.createElement("div");
_1.style(_2a,{width:"200px",height:"10px"});
div.appendChild(_2a);
_1.body().appendChild(div);
var b=_1.contentBox(div);
_1.style(div,"overflow","scroll");
var a=_1.contentBox(div);
_1.body().removeChild(div);
return {v:b.w-a.w,h:b.h-a.h};
},_setTextAttr:function(_2b){
this._textNode.innerHTML=_2b;
this.text=_2b;
},_setColorAttr:function(c){
_1.style(this._underlayNode,"backgroundColor",c);
this.color=c;
},_setImageTextAttr:function(_2c){
_1.attr(this._imageNode,"alt",_2c);
this.imageText=_2c;
},_setImageAttr:function(url){
_1.attr(this._imageNode,"src",url);
this.image=url;
},_setCenterIndicatorAttr:function(_2d){
this.centerIndicator=_2d;
if(_2d==="image"){
this._centerNode=this._imageNode;
_1.style(this._textNode,"display","none");
}else{
this._centerNode=this._textNode;
_1.style(this._imageNode,"display","none");
}
},_disableOverflow:function(){
if(this.target===_1.body()||this.target===_1.doc){
this._overflowDisabled=true;
var _2e=_1.body();
if(_2e.style&&_2e.style.overflow){
this._oldOverflow=_1.style(_2e,"overflow");
}else{
this._oldOverflow="";
}
if(_1.isIE&&!_1.isQuirks){
if(_2e.parentNode&&_2e.parentNode.style&&_2e.parentNode.style.overflow){
this._oldBodyParentOverflow=_2e.parentNode.style.overflow;
}else{
try{
this._oldBodyParentOverflow=_1.style(_2e.parentNode,"overflow");
}
catch(e){
this._oldBodyParentOverflow="scroll";
}
}
_1.style(_2e.parentNode,"overflow","hidden");
}
_1.style(_2e,"overflow","hidden");
}
},_enableOverflow:function(){
if(this._overflowDisabled){
delete this._overflowDisabled;
var _2f=_1.body();
if(_1.isIE&&!_1.isQuirks){
_2f.parentNode.style.overflow=this._oldBodyParentOverflow;
delete this._oldBodyParentOverflow;
}
_1.style(_2f,"overflow",this._oldOverflow);
if(_1.isWebKit){
var div=_1.create("div",{style:{height:"2px"}});
_2f.appendChild(div);
setTimeout(function(){
_2f.removeChild(div);
},0);
}
delete this._oldOverflow;
}
}});
return _3.widget.Standby;
});
