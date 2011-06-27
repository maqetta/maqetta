/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/layout/SplitContainer",["dojo/_base/kernel","..","dojo/cookie","../_WidgetBase","./_LayoutWidget","dojo/_base/array","dojo/_base/connect","dojo/_base/event","dojo/_base/html","dojo/_base/sniff","dojo/_base/window"],function(_1,_2){
_1.declare("dijit.layout.SplitContainer",_2.layout._LayoutWidget,{constructor:function(){
_1.deprecated("dijit.layout.SplitContainer is deprecated","use BorderContainer with splitter instead",2);
},activeSizing:false,sizerWidth:7,orientation:"horizontal",persist:true,baseClass:"dijitSplitContainer",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
this.isHorizontal=(this.orientation=="horizontal");
},postCreate:function(){
this.inherited(arguments);
this.sizers=[];
if(_1.isMozilla){
this.domNode.style.overflow="-moz-scrollbars-none";
}
if(typeof this.sizerWidth=="object"){
try{
this.sizerWidth=parseInt(this.sizerWidth.toString());
}
catch(e){
this.sizerWidth=7;
}
}
var _3=_1.doc.createElement("div");
this.virtualSizer=_3;
_3.style.position="relative";
_3.style.zIndex=10;
_3.className=this.isHorizontal?"dijitSplitContainerVirtualSizerH":"dijitSplitContainerVirtualSizerV";
this.domNode.appendChild(_3);
_1.setSelectable(_3,false);
},destroy:function(){
delete this.virtualSizer;
_1.forEach(this._ownconnects,_1.disconnect);
this.inherited(arguments);
},startup:function(){
if(this._started){
return;
}
_1.forEach(this.getChildren(),function(_4,i,_5){
this._setupChild(_4);
if(i<_5.length-1){
this._addSizer();
}
},this);
if(this.persist){
this._restoreState();
}
this.inherited(arguments);
},_setupChild:function(_6){
this.inherited(arguments);
_6.domNode.style.position="absolute";
_1.addClass(_6.domNode,"dijitSplitPane");
},_onSizerMouseDown:function(e){
if(e.target.id){
for(var i=0;i<this.sizers.length;i++){
if(this.sizers[i].id==e.target.id){
break;
}
}
if(i<this.sizers.length){
this.beginSizing(e,i);
}
}
},_addSizer:function(_7){
_7=_7===undefined?this.sizers.length:_7;
var _8=_1.doc.createElement("div");
_8.id=_2.getUniqueId("dijit_layout_SplitterContainer_Splitter");
this.sizers.splice(_7,0,_8);
this.domNode.appendChild(_8);
_8.className=this.isHorizontal?"dijitSplitContainerSizerH":"dijitSplitContainerSizerV";
var _9=_1.doc.createElement("div");
_9.className="thumb";
_8.appendChild(_9);
this.connect(_8,"onmousedown","_onSizerMouseDown");
_1.setSelectable(_8,false);
},removeChild:function(_a){
if(this.sizers.length){
var i=_1.indexOf(this.getChildren(),_a);
if(i!=-1){
if(i==this.sizers.length){
i--;
}
_1.destroy(this.sizers[i]);
this.sizers.splice(i,1);
}
}
this.inherited(arguments);
if(this._started){
this.layout();
}
},addChild:function(_b,_c){
this.inherited(arguments);
if(this._started){
var _d=this.getChildren();
if(_d.length>1){
this._addSizer(_c);
}
this.layout();
}
},layout:function(){
this.paneWidth=this._contentBox.w;
this.paneHeight=this._contentBox.h;
var _e=this.getChildren();
if(!_e.length){
return;
}
var _f=this.isHorizontal?this.paneWidth:this.paneHeight;
if(_e.length>1){
_f-=this.sizerWidth*(_e.length-1);
}
var _10=0;
_1.forEach(_e,function(_11){
_10+=_11.sizeShare;
});
var _12=_f/_10;
var _13=0;
_1.forEach(_e.slice(0,_e.length-1),function(_14){
var _15=Math.round(_12*_14.sizeShare);
_14.sizeActual=_15;
_13+=_15;
});
_e[_e.length-1].sizeActual=_f-_13;
this._checkSizes();
var pos=0;
var _16=_e[0].sizeActual;
this._movePanel(_e[0],pos,_16);
_e[0].position=pos;
pos+=_16;
if(!this.sizers){
return;
}
_1.some(_e.slice(1),function(_17,i){
if(!this.sizers[i]){
return true;
}
this._moveSlider(this.sizers[i],pos,this.sizerWidth);
this.sizers[i].position=pos;
pos+=this.sizerWidth;
_16=_17.sizeActual;
this._movePanel(_17,pos,_16);
_17.position=pos;
pos+=_16;
},this);
},_movePanel:function(_18,pos,_19){
if(this.isHorizontal){
_18.domNode.style.left=pos+"px";
_18.domNode.style.top=0;
var box={w:_19,h:this.paneHeight};
if(_18.resize){
_18.resize(box);
}else{
_1.marginBox(_18.domNode,box);
}
}else{
_18.domNode.style.left=0;
_18.domNode.style.top=pos+"px";
var box={w:this.paneWidth,h:_19};
if(_18.resize){
_18.resize(box);
}else{
_1.marginBox(_18.domNode,box);
}
}
},_moveSlider:function(_1a,pos,_1b){
if(this.isHorizontal){
_1a.style.left=pos+"px";
_1a.style.top=0;
_1.marginBox(_1a,{w:_1b,h:this.paneHeight});
}else{
_1a.style.left=0;
_1a.style.top=pos+"px";
_1.marginBox(_1a,{w:this.paneWidth,h:_1b});
}
},_growPane:function(_1c,_1d){
if(_1c>0){
if(_1d.sizeActual>_1d.sizeMin){
if((_1d.sizeActual-_1d.sizeMin)>_1c){
_1d.sizeActual=_1d.sizeActual-_1c;
_1c=0;
}else{
_1c-=_1d.sizeActual-_1d.sizeMin;
_1d.sizeActual=_1d.sizeMin;
}
}
}
return _1c;
},_checkSizes:function(){
var _1e=0;
var _1f=0;
var _20=this.getChildren();
_1.forEach(_20,function(_21){
_1f+=_21.sizeActual;
_1e+=_21.sizeMin;
});
if(_1e<=_1f){
var _22=0;
_1.forEach(_20,function(_23){
if(_23.sizeActual<_23.sizeMin){
_22+=_23.sizeMin-_23.sizeActual;
_23.sizeActual=_23.sizeMin;
}
});
if(_22>0){
var _24=this.isDraggingLeft?_20.reverse():_20;
_1.forEach(_24,function(_25){
_22=this._growPane(_22,_25);
},this);
}
}else{
_1.forEach(_20,function(_26){
_26.sizeActual=Math.round(_1f*(_26.sizeMin/_1e));
});
}
},beginSizing:function(e,i){
var _27=this.getChildren();
this.paneBefore=_27[i];
this.paneAfter=_27[i+1];
this.isSizing=true;
this.sizingSplitter=this.sizers[i];
if(!this.cover){
this.cover=_1.create("div",{style:{position:"absolute",zIndex:5,top:0,left:0,width:"100%",height:"100%"}},this.domNode);
}else{
this.cover.style.zIndex=5;
}
this.sizingSplitter.style.zIndex=6;
this.originPos=_1.position(_27[0].domNode,true);
if(this.isHorizontal){
var _28=e.layerX||e.offsetX||0;
var _29=e.pageX;
this.originPos=this.originPos.x;
}else{
var _28=e.layerY||e.offsetY||0;
var _29=e.pageY;
this.originPos=this.originPos.y;
}
this.startPoint=this.lastPoint=_29;
this.screenToClientOffset=_29-_28;
this.dragOffset=this.lastPoint-this.paneBefore.sizeActual-this.originPos-this.paneBefore.position;
if(!this.activeSizing){
this._showSizingLine();
}
this._ownconnects=[];
this._ownconnects.push(_1.connect(_1.doc.documentElement,"onmousemove",this,"changeSizing"));
this._ownconnects.push(_1.connect(_1.doc.documentElement,"onmouseup",this,"endSizing"));
_1.stopEvent(e);
},changeSizing:function(e){
if(!this.isSizing){
return;
}
this.lastPoint=this.isHorizontal?e.pageX:e.pageY;
this.movePoint();
if(this.activeSizing){
this._updateSize();
}else{
this._moveSizingLine();
}
_1.stopEvent(e);
},endSizing:function(e){
if(!this.isSizing){
return;
}
if(this.cover){
this.cover.style.zIndex=-1;
}
if(!this.activeSizing){
this._hideSizingLine();
}
this._updateSize();
this.isSizing=false;
if(this.persist){
this._saveState(this);
}
_1.forEach(this._ownconnects,_1.disconnect);
},movePoint:function(){
var p=this.lastPoint-this.screenToClientOffset;
var a=p-this.dragOffset;
a=this.legaliseSplitPoint(a);
p=a+this.dragOffset;
this.lastPoint=p+this.screenToClientOffset;
},legaliseSplitPoint:function(a){
a+=this.sizingSplitter.position;
this.isDraggingLeft=!!(a>0);
if(!this.activeSizing){
var min=this.paneBefore.position+this.paneBefore.sizeMin;
if(a<min){
a=min;
}
var max=this.paneAfter.position+(this.paneAfter.sizeActual-(this.sizerWidth+this.paneAfter.sizeMin));
if(a>max){
a=max;
}
}
a-=this.sizingSplitter.position;
this._checkSizes();
return a;
},_updateSize:function(){
var pos=this.lastPoint-this.dragOffset-this.originPos;
var _2a=this.paneBefore.position;
var _2b=this.paneAfter.position+this.paneAfter.sizeActual;
this.paneBefore.sizeActual=pos-_2a;
this.paneAfter.position=pos+this.sizerWidth;
this.paneAfter.sizeActual=_2b-this.paneAfter.position;
_1.forEach(this.getChildren(),function(_2c){
_2c.sizeShare=_2c.sizeActual;
});
if(this._started){
this.layout();
}
},_showSizingLine:function(){
this._moveSizingLine();
_1.marginBox(this.virtualSizer,this.isHorizontal?{w:this.sizerWidth,h:this.paneHeight}:{w:this.paneWidth,h:this.sizerWidth});
this.virtualSizer.style.display="block";
},_hideSizingLine:function(){
this.virtualSizer.style.display="none";
},_moveSizingLine:function(){
var pos=(this.lastPoint-this.startPoint)+this.sizingSplitter.position;
_1.style(this.virtualSizer,(this.isHorizontal?"left":"top"),pos+"px");
},_getCookieName:function(i){
return this.id+"_"+i;
},_restoreState:function(){
_1.forEach(this.getChildren(),function(_2d,i){
var _2e=this._getCookieName(i);
var _2f=_1.cookie(_2e);
if(_2f){
var pos=parseInt(_2f);
if(typeof pos=="number"){
_2d.sizeShare=pos;
}
}
},this);
},_saveState:function(){
if(!this.persist){
return;
}
_1.forEach(this.getChildren(),function(_30,i){
_1.cookie(this._getCookieName(i),_30.sizeShare,{expires:365});
},this);
}});
_1.extend(_2._WidgetBase,{sizeMin:10,sizeShare:10});
return _2.layout.SplitContainer;
});
