/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/_ViewManager",["dojo","dojox","./_View"],function(_1,_2){
_1.declare("dojox.grid._ViewManager",null,{constructor:function(_3){
this.grid=_3;
},defaultWidth:200,views:[],resize:function(){
this.onEach("resize");
},render:function(){
this.onEach("render");
},addView:function(_4){
_4.idx=this.views.length;
this.views.push(_4);
},destroyViews:function(){
for(var i=0,v;v=this.views[i];i++){
v.destroy();
}
this.views=[];
},getContentNodes:function(){
var _5=[];
for(var i=0,v;v=this.views[i];i++){
_5.push(v.contentNode);
}
return _5;
},forEach:function(_6){
for(var i=0,v;v=this.views[i];i++){
_6(v,i);
}
},onEach:function(_7,_8){
_8=_8||[];
for(var i=0,v;v=this.views[i];i++){
if(_7 in v){
v[_7].apply(v,_8);
}
}
},normalizeHeaderNodeHeight:function(){
var _9=[];
for(var i=0,v;(v=this.views[i]);i++){
if(v.headerContentNode.firstChild){
_9.push(v.headerContentNode);
}
}
this.normalizeRowNodeHeights(_9);
},normalizeRowNodeHeights:function(_a){
var h=0;
var _b=[];
if(this.grid.rowHeight){
h=this.grid.rowHeight;
}else{
if(_a.length<=1){
return;
}
for(var i=0,n;(n=_a[i]);i++){
if(!_1.hasClass(n,"dojoxGridNonNormalizedCell")){
_b[i]=n.firstChild.offsetHeight;
h=Math.max(h,_b[i]);
}
}
h=(h>=0?h:0);
if(_1.isMoz&&h){
h++;
}
}
for(i=0;(n=_a[i]);i++){
if(_b[i]!=h){
n.firstChild.style.height=h+"px";
}
}
},resetHeaderNodeHeight:function(){
for(var i=0,v,n;(v=this.views[i]);i++){
n=v.headerContentNode.firstChild;
if(n){
n.style.height="";
}
}
},renormalizeRow:function(_c){
var _d=[];
for(var i=0,v,n;(v=this.views[i])&&(n=v.getRowNode(_c));i++){
n.firstChild.style.height="";
_d.push(n);
}
this.normalizeRowNodeHeights(_d);
},getViewWidth:function(_e){
return this.views[_e].getWidth()||this.defaultWidth;
},measureHeader:function(){
this.resetHeaderNodeHeight();
this.forEach(function(_f){
_f.headerContentNode.style.height="";
});
var h=0;
this.forEach(function(_10){
h=Math.max(_10.headerNode.offsetHeight,h);
});
return h;
},measureContent:function(){
var h=0;
this.forEach(function(_11){
h=Math.max(_11.domNode.offsetHeight,h);
});
return h;
},findClient:function(_12){
var c=this.grid.elasticView||-1;
if(c<0){
for(var i=1,v;(v=this.views[i]);i++){
if(v.viewWidth){
for(i=1;(v=this.views[i]);i++){
if(!v.viewWidth){
c=i;
break;
}
}
break;
}
}
}
if(c<0){
c=Math.floor(this.views.length/2);
}
return c;
},arrange:function(l,w){
var i,v,vw,len=this.views.length;
var c=(w<=0?len:this.findClient());
var _13=function(v,l){
var ds=v.domNode.style;
var hs=v.headerNode.style;
if(!_1._isBodyLtr()){
ds.right=l+"px";
if(_1.isMoz){
hs.right=l+v.getScrollbarWidth()+"px";
hs.width=parseInt(hs.width,10)-v.getScrollbarWidth()+"px";
}else{
hs.right=l+"px";
}
}else{
ds.left=l+"px";
hs.left=l+"px";
}
ds.top=0+"px";
hs.top=0;
};
for(i=0;(v=this.views[i])&&(i<c);i++){
vw=this.getViewWidth(i);
v.setSize(vw,0);
_13(v,l);
if(v.headerContentNode&&v.headerContentNode.firstChild){
vw=v.getColumnsWidth()+v.getScrollbarWidth();
}else{
vw=v.domNode.offsetWidth;
}
l+=vw;
}
i++;
var r=w;
for(var j=len-1;(v=this.views[j])&&(i<=j);j--){
vw=this.getViewWidth(j);
v.setSize(vw,0);
vw=v.domNode.offsetWidth;
r-=vw;
_13(v,r);
}
if(c<len){
v=this.views[c];
vw=Math.max(1,r-l);
v.setSize(vw+"px",0);
_13(v,l);
}
return l;
},renderRow:function(_14,_15,_16){
var _17=[];
for(var i=0,v,n,_18;(v=this.views[i])&&(n=_15[i]);i++){
_18=v.renderRow(_14);
n.appendChild(_18);
_17.push(_18);
}
if(!_16){
this.normalizeRowNodeHeights(_17);
}
},rowRemoved:function(_19){
this.onEach("rowRemoved",[_19]);
},updateRow:function(_1a,_1b){
for(var i=0,v;v=this.views[i];i++){
v.updateRow(_1a);
}
if(!_1b){
this.renormalizeRow(_1a);
}
},updateRowStyles:function(_1c){
this.onEach("updateRowStyles",[_1c]);
},setScrollTop:function(_1d){
var top=_1d;
for(var i=0,v;v=this.views[i];i++){
top=v.setScrollTop(_1d);
if(_1.isIE&&v.headerNode&&v.scrollboxNode){
v.headerNode.scrollLeft=v.scrollboxNode.scrollLeft;
}
}
return top;
},getFirstScrollingView:function(){
for(var i=0,v;(v=this.views[i]);i++){
if(v.hasHScrollbar()||v.hasVScrollbar()){
return v;
}
}
return null;
}});
return _2.grid._ViewManager;
});
