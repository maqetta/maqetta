//>>built
define("dijit/layout/SplitContainer",["dojo/_base/array","dojo/cookie","dojo/_base/declare","dojo/dom","dojo/dom-class","dojo/dom-construct","dojo/dom-geometry","dojo/dom-style","dojo/_base/event","dojo/_base/kernel","dojo/_base/lang","dojo/on","dojo/sniff","../registry","../_WidgetBase","./_LayoutWidget"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,on,_c,_d,_e,_f){
_b.extend(_e,{sizeMin:10,sizeShare:10});
return _3("dijit.layout.SplitContainer",_f,{constructor:function(){
_a.deprecated("dijit.layout.SplitContainer is deprecated","use BorderContainer with splitter instead",2);
},activeSizing:false,sizerWidth:7,orientation:"horizontal",persist:true,baseClass:"dijitSplitContainer",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
this.isHorizontal=(this.orientation=="horizontal");
},postCreate:function(){
this.inherited(arguments);
this.sizers=[];
if(_c("mozilla")){
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
var _10=this.ownerDocument.createElement("div");
this.virtualSizer=_10;
_10.style.position="relative";
_10.style.zIndex=10;
_10.className=this.isHorizontal?"dijitSplitContainerVirtualSizerH":"dijitSplitContainerVirtualSizerV";
this.domNode.appendChild(_10);
_4.setSelectable(_10,false);
},destroy:function(){
delete this.virtualSizer;
if(this._ownconnects){
var h;
while(h=this._ownconnects.pop()){
h.remove();
}
}
this.inherited(arguments);
},startup:function(){
if(this._started){
return;
}
_1.forEach(this.getChildren(),function(_11,i,_12){
this._setupChild(_11);
if(i<_12.length-1){
this._addSizer();
}
},this);
if(this.persist){
this._restoreState();
}
this.inherited(arguments);
},_setupChild:function(_13){
this.inherited(arguments);
_13.domNode.style.position="absolute";
_5.add(_13.domNode,"dijitSplitPane");
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
},_addSizer:function(_14){
_14=_14===undefined?this.sizers.length:_14;
var _15=this.ownerDocument.createElement("div");
_15.id=_d.getUniqueId("dijit_layout_SplitterContainer_Splitter");
this.sizers.splice(_14,0,_15);
this.domNode.appendChild(_15);
_15.className=this.isHorizontal?"dijitSplitContainerSizerH":"dijitSplitContainerSizerV";
var _16=this.ownerDocument.createElement("div");
_16.className="thumb";
_15.appendChild(_16);
this.connect(_15,"onmousedown","_onSizerMouseDown");
_4.setSelectable(_15,false);
},removeChild:function(_17){
if(this.sizers.length){
var i=_1.indexOf(this.getChildren(),_17);
if(i!=-1){
if(i==this.sizers.length){
i--;
}
_6.destroy(this.sizers[i]);
this.sizers.splice(i,1);
}
}
this.inherited(arguments);
if(this._started){
this.layout();
}
},addChild:function(_18,_19){
this.inherited(arguments);
if(this._started){
var _1a=this.getChildren();
if(_1a.length>1){
this._addSizer(_19);
}
this.layout();
}
},layout:function(){
this.paneWidth=this._contentBox.w;
this.paneHeight=this._contentBox.h;
var _1b=this.getChildren();
if(!_1b.length){
return;
}
var _1c=this.isHorizontal?this.paneWidth:this.paneHeight;
if(_1b.length>1){
_1c-=this.sizerWidth*(_1b.length-1);
}
var _1d=0;
_1.forEach(_1b,function(_1e){
_1d+=_1e.sizeShare;
});
var _1f=_1c/_1d;
var _20=0;
_1.forEach(_1b.slice(0,_1b.length-1),function(_21){
var _22=Math.round(_1f*_21.sizeShare);
_21.sizeActual=_22;
_20+=_22;
});
_1b[_1b.length-1].sizeActual=_1c-_20;
this._checkSizes();
var pos=0;
var _23=_1b[0].sizeActual;
this._movePanel(_1b[0],pos,_23);
_1b[0].position=pos;
pos+=_23;
if(!this.sizers){
return;
}
_1.some(_1b.slice(1),function(_24,i){
if(!this.sizers[i]){
return true;
}
this._moveSlider(this.sizers[i],pos,this.sizerWidth);
this.sizers[i].position=pos;
pos+=this.sizerWidth;
_23=_24.sizeActual;
this._movePanel(_24,pos,_23);
_24.position=pos;
pos+=_23;
},this);
},_movePanel:function(_25,pos,_26){
var box;
if(this.isHorizontal){
_25.domNode.style.left=pos+"px";
_25.domNode.style.top=0;
box={w:_26,h:this.paneHeight};
if(_25.resize){
_25.resize(box);
}else{
_7.setMarginBox(_25.domNode,box);
}
}else{
_25.domNode.style.left=0;
_25.domNode.style.top=pos+"px";
box={w:this.paneWidth,h:_26};
if(_25.resize){
_25.resize(box);
}else{
_7.setMarginBox(_25.domNode,box);
}
}
},_moveSlider:function(_27,pos,_28){
if(this.isHorizontal){
_27.style.left=pos+"px";
_27.style.top=0;
_7.setMarginBox(_27,{w:_28,h:this.paneHeight});
}else{
_27.style.left=0;
_27.style.top=pos+"px";
_7.setMarginBox(_27,{w:this.paneWidth,h:_28});
}
},_growPane:function(_29,_2a){
if(_29>0){
if(_2a.sizeActual>_2a.sizeMin){
if((_2a.sizeActual-_2a.sizeMin)>_29){
_2a.sizeActual=_2a.sizeActual-_29;
_29=0;
}else{
_29-=_2a.sizeActual-_2a.sizeMin;
_2a.sizeActual=_2a.sizeMin;
}
}
}
return _29;
},_checkSizes:function(){
var _2b=0;
var _2c=0;
var _2d=this.getChildren();
_1.forEach(_2d,function(_2e){
_2c+=_2e.sizeActual;
_2b+=_2e.sizeMin;
});
if(_2b<=_2c){
var _2f=0;
_1.forEach(_2d,function(_30){
if(_30.sizeActual<_30.sizeMin){
_2f+=_30.sizeMin-_30.sizeActual;
_30.sizeActual=_30.sizeMin;
}
});
if(_2f>0){
var _31=this.isDraggingLeft?_2d.reverse():_2d;
_1.forEach(_31,function(_32){
_2f=this._growPane(_2f,_32);
},this);
}
}else{
_1.forEach(_2d,function(_33){
_33.sizeActual=Math.round(_2c*(_33.sizeMin/_2b));
});
}
},beginSizing:function(e,i){
var _34=this.getChildren();
this.paneBefore=_34[i];
this.paneAfter=_34[i+1];
this.paneBefore.sizeBeforeDrag=this.paneBefore.sizeActual;
this.paneAfter.sizeBeforeDrag=this.paneAfter.sizeActual;
this.paneAfter.positionBeforeDrag=this.paneAfter.position;
this.isSizing=true;
this.sizingSplitter=this.sizers[i];
this.sizingSplitter.positionBeforeDrag=_8.get(this.sizingSplitter,(this.isHorizontal?"left":"top"));
if(!this.cover){
this.cover=_6.create("div",{style:{position:"absolute",zIndex:5,top:0,left:0,width:"100%",height:"100%"}},this.domNode);
}else{
this.cover.style.zIndex=5;
}
this.sizingSplitter.style.zIndex=6;
this.startPoint=this.lastPoint=(this.isHorizontal?e.pageX:e.pageY);
this.maxDelta=this.paneAfter.sizeActual-this.paneAfter.sizeMin;
this.minDelta=-1*(this.paneBefore.sizeActual-this.paneBefore.sizeMin);
if(!this.activeSizing){
this._showSizingLine();
}
this._ownconnects=[on(this.ownerDocument.documentElement,"mousemove",_b.hitch(this,"changeSizing")),on(this.ownerDocument.documentElement,"mouseup",_b.hitch(this,"endSizing"))];
_9.stop(e);
},changeSizing:function(e){
if(!this.isSizing){
return;
}
this.lastPoint=this.isHorizontal?e.pageX:e.pageY;
var _35=Math.max(Math.min(this.lastPoint-this.startPoint,this.maxDelta),this.minDelta);
if(this.activeSizing){
this._updateSize(_35);
}else{
this._moveSizingLine(_35);
}
_9.stop(e);
},endSizing:function(){
if(!this.isSizing){
return;
}
if(this.cover){
this.cover.style.zIndex=-1;
}
if(!this.activeSizing){
this._hideSizingLine();
}
var _36=Math.max(Math.min(this.lastPoint-this.startPoint,this.maxDelta),this.minDelta);
this._updateSize(_36);
this.isSizing=false;
if(this.persist){
this._saveState(this);
}
var h;
while(h=this._ownconnects.pop()){
h.remove();
}
},_updateSize:function(_37){
this.paneBefore.sizeActual=this.paneBefore.sizeBeforeDrag+_37;
this.paneAfter.position=this.paneAfter.positionBeforeDrag+_37;
this.paneAfter.sizeActual=this.paneAfter.sizeBeforeDrag-_37;
_1.forEach(this.getChildren(),function(_38){
_38.sizeShare=_38.sizeActual;
});
if(this._started){
this.layout();
}
},_showSizingLine:function(){
this._moveSizingLine(0);
_7.setMarginBox(this.virtualSizer,this.isHorizontal?{w:this.sizerWidth,h:this.paneHeight}:{w:this.paneWidth,h:this.sizerWidth});
this.virtualSizer.style.display="block";
},_hideSizingLine:function(){
this.virtualSizer.style.display="none";
},_moveSizingLine:function(_39){
var pos=_39+this.sizingSplitter.positionBeforeDrag;
_8.set(this.virtualSizer,(this.isHorizontal?"left":"top"),pos+"px");
},_getCookieName:function(i){
return this.id+"_"+i;
},_restoreState:function(){
_1.forEach(this.getChildren(),function(_3a,i){
var _3b=this._getCookieName(i);
var _3c=_2(_3b);
if(_3c){
var pos=parseInt(_3c);
if(typeof pos=="number"){
_3a.sizeShare=pos;
}
}
},this);
},_saveState:function(){
if(!this.persist){
return;
}
_1.forEach(this.getChildren(),function(_3d,i){
_2(this._getCookieName(i),_3d.sizeShare,{expires:365});
},this);
}});
});
