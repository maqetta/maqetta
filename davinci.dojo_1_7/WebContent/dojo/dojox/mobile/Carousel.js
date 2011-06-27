/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/Carousel",["dijit/_WidgetBase","dijit/_Container","dijit/_Contained","./PageIndicator","./SwapView"],function(_1,_2,_3,_4,_5){
dojo.experimental("dojox.mobile.Carousel");
return dojo.declare("dojox.mobile.Carousel",[dijit._WidgetBase,dijit._Container,dijit._Contained],{numVisible:3,title:"",pageIndicator:true,navButton:false,height:"300px",store:null,query:null,queryOptions:null,buildRendering:function(){
this.inherited(arguments);
this.domNode.className="mblCarousel";
var h;
if(this.height==="inherit"){
if(this.domNode.offsetParent){
h=this.domNode.offsetParent.offsetHeight+"px";
}
}else{
if(this.height){
h=this.height;
}
}
this.domNode.style.height=h;
this.headerNode=dojo.create("DIV",{className:"mblCarouselHeaderBar"},this.domNode);
if(this.navButton){
this.btnContainerNode=dojo.create("DIV",{className:"mblCarouselBtnContainer"},this.headerNode);
dojo.style(this.btnContainerNode,"float","right");
this.prevBtnNode=dojo.create("BUTTON",{className:"mblCarouselBtn",title:"Previous",innerHTML:"&lt;"},this.btnContainerNode);
this.nextBtnNode=dojo.create("BUTTON",{className:"mblCarouselBtn",title:"Next",innerHTML:"&gt;"},this.btnContainerNode);
this.connect(this.prevBtnNode,"onclick","onPrevBtnClick");
this.connect(this.nextBtnNode,"onclick","onNextBtnClick");
}
if(this.pageIndicator){
if(!this.title){
this.title="&nbsp;";
}
this.piw=new dojox.mobile.PageIndicator();
dojo.style(this.piw,"float","right");
this.headerNode.appendChild(this.piw.domNode);
}
this.titleNode=dojo.create("DIV",{className:"mblCarouselTitle"},this.headerNode);
this.containerNode=dojo.create("DIV",{className:"mblCarouselPages"},this.domNode);
dojo.subscribe("/dojox/mobile/viewChanged",this,"handleViewChanged");
},startup:function(){
if(this._started){
return;
}
if(this.store){
var _6=this.store;
this.store=null;
this.setStore(_6,this.query,this.queryOptions);
}
this.inherited(arguments);
},setStore:function(_7,_8,_9){
if(_7===this.store){
return;
}
this.store=_7;
this.query=_8;
this.queryOptions=_9;
this.refresh();
},refresh:function(){
if(!this.store){
return;
}
this.store.fetch({query:this.query,queryOptions:this.queryOptions,onComplete:dojo.hitch(this,"generate"),onError:dojo.hitch(this,"onError")});
},generate:function(_a,_b){
dojo.forEach(this.getChildren(),function(_c){
if(_c instanceof dojox.mobile.SwapView){
_c.destroyRecursive();
}
});
this.items=_a;
this.swapViews=[];
this.images=[];
var _d=Math.ceil(_a.length/this.numVisible);
var h=this.domNode.offsetHeight-this.headerNode.offsetHeight;
for(var i=0;i<_d;i++){
var w=new dojox.mobile.SwapView({height:h+"px"});
this.addChild(w);
this.swapViews.push(w);
w._carouselImages=[];
if(i===0&&this.piw){
this.piw.refId=w.id;
}
for(var j=0;j<this.numVisible;j++){
var _e=i*this.numVisible+j;
var _f=_e<_a.length?_a[_e]:{src:dojo.moduleUrl("dojo","resources/blank.gif"),height:"1px"};
var _10=w.domNode.style.display;
w.domNode.style.display="";
var box=this.createBox(_f,h);
w.containerNode.appendChild(box);
box.appendChild(this.createHeaderText(_f));
var img=this.createContent(_f,_e);
box.appendChild(img);
box.appendChild(this.createFooterText(_f));
this.resizeContent(_f,box,img);
w.domNode.style.display=_10;
if(_f.height!=="1px"){
this.images.push(img);
w._carouselImages.push(img);
}
}
}
if(this.swapViews[0]){
this.loadImages(this.swapViews[0]);
}
if(this.swapViews[1]){
this.loadImages(this.swapViews[1]);
}
this.currentView=this.swapViews[0];
if(this.piw){
this.piw.reset();
}
},createBox:function(_11,h){
var _12=_11.width||(90/this.numVisible+"%");
var _13=_11.height||h+"px";
var m=dojo.isIE?5/this.numVisible-1:5/this.numVisible;
var _14=_11.margin||(m+"%");
var box=dojo.create("DIV",{className:"mblCarouselBox"});
dojo.style(box,{margin:"0px "+_14,width:_12,height:_13});
return box;
},createHeaderText:function(_15){
this.headerTextNode=dojo.create("DIV",{className:"mblCarouselImgHeaderText",innerHTML:_15.headerText?_15.headerText:"&nbsp;"});
return this.headerTextNode;
},createContent:function(_16,idx){
var _17={alt:_16.alt||"",tabIndex:"0",className:"mblCarouselImg"};
var img=dojo.create("IMG",_17);
img._idx=idx;
if(_16.height!=="1px"){
this.connect(img,"onclick","onClick");
this.connect(img,"onkeydown","onClick");
dojo.connect(img,"ondragstart",dojo.stopEvent);
}else{
img.style.visibility="hidden";
}
return img;
},createFooterText:function(_18){
this.footerTextNode=dojo.create("DIV",{className:"mblCarouselImgFooterText",innerHTML:_18.footerText?_18.footerText:"&nbsp;"});
return this.footerTextNode;
},resizeContent:function(_19,box,img){
if(_19.height!=="1px"){
img.style.height=(box.offsetHeight-this.headerTextNode.offsetHeight-this.footerTextNode.offsetHeight)+"px";
}
},onError:function(_1a){
},onPrevBtnClick:function(e){
if(this.currentView){
this.currentView.goTo(-1);
}
},onNextBtnClick:function(e){
if(this.currentView){
this.currentView.goTo(1);
}
},onClick:function(e){
if(e&&e.type==="keydown"&&e.keyCode!==13){
return;
}
var img=e.currentTarget;
for(var i=0;i<this.images.length;i++){
if(this.images[i]===img){
dojo.addClass(img,"mblCarouselImgSelected");
}else{
dojo.removeClass(this.images[i],"mblCarouselImgSelected");
}
}
dojo.style(img,"opacity",0.4);
setTimeout(function(){
dojo.style(img,"opacity",1);
},1000);
dojo.publish("/dojox/mobile/carouselSelect",[this,img,this.items[img._idx],img._idx]);
},loadImages:function(_1b){
if(!_1b){
return;
}
var _1c=_1b._carouselImages;
dojo.forEach(_1c,function(img){
if(!img.src){
var _1d=this.items[img._idx];
img.src=_1d.src;
}
},this);
},handleViewChanged:function(_1e){
if(_1e.getParent()!==this){
return;
}
this.currentView=_1e;
this.loadImages(_1e.nextView(_1e.domNode));
},_setTitleAttr:function(_1f){
this.title=_1f;
this.titleNode.innerHTML=_1f;
}});
});
