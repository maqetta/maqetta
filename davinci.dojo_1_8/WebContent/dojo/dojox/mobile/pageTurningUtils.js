//>>built
define("dojox/mobile/pageTurningUtils",["dojo/_base/kernel","dojo/_base/array","dojo/_base/connect","dojo/_base/event","dojo/dom-class","dojo/dom-construct","dojo/dom-style"],function(_1,_2,_3,_4,_5,_6,_7){
_1.experimental("dojox.mobile.pageTurningUtils");
return function(){
this.w=0;
this.h=0;
this.turnfrom="top";
this.page=1;
this.dogear=1;
this.duration=2;
this.alwaysDogeared=false;
this._styleParams={};
this._catalogNode=null;
this._currentPageNode=null;
this._transitionEndHandle=null;
this.init=function(w,h,_8,_9,_a,_b,_c){
this.w=w;
this.h=h;
this.turnfrom=_8?_8:this.turnfrom;
this.page=_9?_9:this.page;
this.dogear=typeof _a!=="undefined"?_a:this.dogear;
this.duration=typeof _b!=="undefined"?_b:this.duration;
this.alwaysDogeared=typeof _c!=="undefined"?_c:this.alwaysDogeared;
if(this.turnfrom==="bottom"){
this.alwaysDogeared=true;
}
this._calcStyleParams();
};
this._calcStyleParams=function(){
var _d=Math.tan(58*Math.PI/180),_e=Math.cos(32*Math.PI/180),_f=Math.sin(32*Math.PI/180),_10=Math.tan(32*Math.PI/180),w=this.w,h=this.h;
page=this.page,turnfrom=this.turnfrom,params=this._styleParams;
var Q=fold=w*_d,fw=Q*_f+Q*_e*_d,fh=fold+w+w/_d,dw=w*0.11*this.dogear,pw=w-dw,_11=pw*_e,cx,cy,dx,dy,fy;
switch(this.turnfrom){
case "top":
cx=fw-_11;
cy=_11*_d;
dx=fw-dw;
dy=cy+pw/_d-7;
fy=cy/_e;
params.init={page:{top:-fy+"px",left:(-fw+(page===2?w:0))+"px",width:fw+"px",height:fh+"px",webkitTransformOrigin:"100% 0%"},front:{width:w+"px",height:h+"px",webkitBoxShadow:"0 0"},back:{width:w+"px",height:h+"px",webkitBoxShadow:"0 0"},shadow:{display:"",left:fw+"px",height:h*1.5+"px"}};
params.turnForward={page:{webkitTransform:"rotate(0deg)"},front:{webkitTransform:"translate("+fw+"px,"+fy+"px) rotate(0deg)",webkitTransformOrigin:"-110px -18px"},back:{webkitTransform:"translate("+(fw-w)+"px,"+fy+"px) rotate(0deg)",webkitTransformOrigin:"0px 0px"}};
params.turnBackward={page:{webkitTransform:"rotate(-32deg)"},front:{webkitTransform:"translate("+cx+"px,"+cy+"px) rotate(32deg)",webkitTransformOrigin:"0px 0px"},back:{webkitTransform:"translate("+dx+"px,"+dy+"px) rotate(-32deg)",webkitTransformOrigin:"0px 0px"}};
break;
case "bottom":
cx=fw-(h*_f+w*_e)-2;
cy=fh-(h+w/_10)*_e;
dx=fw;
dy=fh-w/_f-h;
fy=fh-w/_10-h;
params.init={page:{top:(-fy+50)+"px",left:(-fw+(page===2?w:0))+"px",width:fw+"px",height:fh+"px",webkitTransformOrigin:"100% 100%"},front:{width:w+"px",height:h+"px",webkitBoxShadow:"0 0"},back:{width:w+"px",height:h+"px",webkitBoxShadow:"0 0"},shadow:{display:"none"}};
params.turnForward={page:{webkitTransform:"rotate(0deg)"},front:{webkitTransform:"translate("+fw+"px,"+fy+"px) rotate(0deg)",webkitTransformOrigin:"-220px 35px"},back:{webkitTransform:"translate("+(w*2)+"px,"+fy+"px) rotate(0deg)",webkitTransformOrigin:"0px 0px"}};
params.turnBackward={page:{webkitTransform:"rotate(32deg)"},front:{webkitTransform:"translate("+cx+"px,"+cy+"px) rotate(-32deg)",webkitTransformOrigin:"0px 0px"},back:{webkitTransform:"translate("+dx+"px,"+dy+"px) rotate(0deg)",webkitTransformOrigin:"0px 0px"}};
break;
case "left":
cx=-w;
cy=pw/_10-2;
dx=-pw;
dy=fy=pw/_f+dw*_f;
params.init={page:{top:-cy+"px",left:w+"px",width:fw+"px",height:fh+"px",webkitTransformOrigin:"0% 0%"},front:{width:w+"px",height:h+"px",webkitBoxShadow:"0 0"},back:{width:w+"px",height:h+"px",webkitBoxShadow:"0 0"},shadow:{display:"",left:"-4px",height:((page===2?h*1.5:h)+50)+"px"}};
params.turnForward={page:{webkitTransform:"rotate(0deg)"},front:{webkitTransform:"translate("+cx+"px,"+cy+"px) rotate(0deg)",webkitTransformOrigin:"160px 68px"},back:{webkitTransform:"translate(0px,"+cy+"px) rotate(0deg)",webkitTransformOrigin:"0px 0px"}};
params.turnBackward={page:{webkitTransform:"rotate(32deg)"},front:{webkitTransform:"translate("+(-dw)+"px,"+dy+"px) rotate(-32deg)",webkitTransformOrigin:"0px 0px"},back:{webkitTransform:"translate("+dx+"px,"+dy+"px) rotate(32deg)",webkitTransformOrigin:"top right"}};
break;
}
params.init.catalog={width:(page===2?w*2:w)+"px",height:((page===2?h*1.5:h)+(turnfrom=="top"?0:50))+"px"};
};
this.getChildren=function(_12){
return _2.filter(_12.childNodes,function(n){
return n.nodeType===1;
});
};
this.getPages=function(){
return this._catalogNode?this.getChildren(this._catalogNode):null;
};
this.getCurrentPage=function(){
return this._currentPageNode;
};
this.getIndexOfPage=function(_13,_14){
if(!_14){
_14=this.getPages();
}
for(var i=0;i<_14.length;i++){
if(_13===_14[i]){
return i;
}
}
return -1;
};
this.getNextPage=function(_15){
for(var n=_15.nextSibling;n;n=n.nextSibling){
if(n.nodeType===1){
return n;
}
}
return null;
};
this.getPreviousPage=function(_16){
for(var n=_16.previousSibling;n;n=n.previousSibling){
if(n.nodeType===1){
return n;
}
}
return null;
};
this.isPageTurned=function(_17){
return _17.style.webkitTransform=="rotate(0deg)";
};
this._onPageTurned=function(e){
_4.stop(e);
if(_5.contains(e.target,"mblPageTurningPage")){
this.onPageTurned(e.target);
}
};
this.onPageTurned=function(){
};
this.initCatalog=function(_18){
if(this._catalogNode!=_18){
if(this._transitionEndHandle){
_3.disconnect(this._transitionEndHandle);
}
this._transitionEndHandle=_3.connect(_18,"webkitTransitionEnd",this,"_onPageTurned");
this._catalogNode=_18;
}
_5.add(_18,"mblPageTurningCatalog");
_7.set(_18,this._styleParams.init.catalog);
var _19=this.getPages();
_2.forEach(_19,function(_1a){
this.initPage(_1a);
},this);
this.resetCatalog();
};
this._getBaseZIndex=function(){
return this._catalogNode.style.zIndex||0;
};
this.resetCatalog=function(){
var _1b=this.getPages(),len=_1b.length,_1c=this._getBaseZIndex();
for(var i=len-1;i>=0;i--){
var _1d=_1b[i];
this.showDogear(_1d);
if(this.isPageTurned(_1d)){
_1d.style.zIndex=_1c+len+1;
}else{
_1d.style.zIndex=_1c+len-i;
!this.alwaysDogeared&&this.hideDogear(_1d);
this._currentPageNode=_1d;
}
}
if(!this.alwaysDogeared&&this._currentPageNode!=_1b[len-1]){
this.showDogear(this._currentPageNode);
}
};
this.initPage=function(_1e,dir){
var _1f=this.getChildren(_1e);
while(_1f.length<3){
_1e.appendChild(_6.create("div",null));
_1f=this.getChildren(_1e);
}
var _20=!_5.contains(_1e,"mblPageTurningPage");
_5.add(_1e,"mblPageTurningPage");
_5.add(_1f[0],"mblPageTurningFront");
_5.add(_1f[1],"mblPageTurningBack");
_5.add(_1f[2],"mblPageTurningShadow");
var p=this._styleParams.init;
_7.set(_1e,p.page);
_7.set(_1f[0],p.front);
_7.set(_1f[1],p.back);
p.shadow&&_7.set(_1f[2],p.shadow);
if(!dir){
if(_20&&this._currentPageNode){
var _21=this.getPages();
dir=this.getIndexOfPage(_1e)<this.getIndexOfPage(this._currentPageNode)?1:-1;
}else{
dir=this.isPageTurned(_1e)?1:-1;
}
}
this._turnPage(_1e,dir,0);
};
this.turnToNext=function(_22){
var _23=this.getNextPage(this._currentPageNode);
if(_23){
this._turnPage(this._currentPageNode,1,_22);
this._currentPageNode=_23;
}
};
this.turnToPrev=function(_24){
var _25=this.getPreviousPage(this._currentPageNode);
if(_25){
this._turnPage(_25,-1,_24);
this._currentPageNode=_25;
}
};
this.goTo=function(_26){
var _27=this.getPages();
if(this._currentPageNode===_27[_26]||_27.length<=_26){
return;
}
var _28=_26<this.getIndexOfPage(this._currentPageNode,_27);
while(this._currentPageNode!==_27[_26]){
_28?this.turnToPrev(0):this.turnToNext(0);
}
};
this._turnPage=function(_29,dir,_2a){
var _2b=this.getChildren(_29),d=((typeof _2a!=="undefined")?_2a:this.duration)+"s",p=(dir===1)?this._styleParams.turnForward:this._styleParams.turnBackward;
p.page.webkitTransitionDuration=d;
_7.set(_29,p.page);
p.front.webkitTransitionDuration=d;
_7.set(_2b[0],p.front);
p.back.webkitTransitionDuration=d;
_7.set(_2b[1],p.back);
var _2c=this.getPages(),_2d=this.getNextPage(_29),len=_2c.length,_2e=this._getBaseZIndex();
if(dir===1){
_29.style.zIndex=_2e+len+1;
if(!this.alwaysDogeared&&_2d&&this.getNextPage(_2d)){
this.showDogear(_2d);
}
}else{
if(_2d){
_2d.style.zIndex=_2e+len-this.getIndexOfPage(_2d,_2c);
!this.alwaysDogeared&&this.hideDogear(_2d);
}
}
};
this.showDogear=function(_2f){
var _30=this.getChildren(_2f);
_7.set(_2f,"overflow","");
_30[1]&&_7.set(_30[1],"display","");
_30[2]&&_7.set(_30[2],"display",this.turnfrom==="bottom"?"none":"");
};
this.hideDogear=function(_31){
if(this.turnfrom==="bottom"){
return;
}
var _32=this.getChildren(_31);
_7.set(_31,"overflow","visible");
_32[1]&&_7.set(_32[1],"display","none");
_32[2]&&_7.set(_32[2],"display","none");
};
};
});
