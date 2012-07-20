//>>built
define("dojox/mobile/ToolBarButton",["dojo/_base/declare","dojo/_base/lang","dojo/_base/window","dojo/dom-class","dojo/dom-construct","dojo/dom-style","./sniff","./_ItemBase"],function(_1,_2,_3,_4,_5,_6,_7,_8){
var _9={};
return _1("dojox.mobile.ToolBarButton",_8,{selected:false,arrow:"",light:true,defaultColor:"mblColorDefault",selColor:"mblColorDefaultSel",baseClass:"mblToolBarButton",_selStartMethod:"touch",_selEndMethod:"touch",buildRendering:function(){
if(!this.label&&this.srcNodeRef){
this.label=this.srcNodeRef.innerHTML;
}
this.label=_2.trim(this.label);
this.domNode=(this.srcNodeRef&&this.srcNodeRef.tagName==="SPAN")?this.srcNodeRef:_5.create("span");
this.inherited(arguments);
if(this.light&&!this.arrow&&(!this.icon||!this.label)){
this.labelNode=this.tableNode=this.bodyNode=this.iconParentNode=this.domNode;
_4.add(this.domNode,this.defaultColor+" mblToolBarButtonBody"+(this.icon?" mblToolBarButtonLightIcon":" mblToolBarButtonLightText"));
return;
}
this.domNode.innerHTML="";
if(this.arrow==="left"||this.arrow==="right"){
this.arrowNode=_5.create("span",{className:"mblToolBarButtonArrow mblToolBarButton"+(this.arrow==="left"?"Left":"Right")+"Arrow "+this.defaultColor},this.domNode);
_4.add(this.domNode,"mblToolBarButtonHas"+(this.arrow==="left"?"Left":"Right")+"Arrow");
}
this.bodyNode=_5.create("span",{className:"mblToolBarButtonBody"},this.domNode);
this.tableNode=_5.create("table",{cellPadding:"0",cellSpacing:"0",border:"0"},this.bodyNode);
var _a=this.tableNode.insertRow(-1);
this.iconParentNode=_a.insertCell(-1);
this.labelNode=_a.insertCell(-1);
this.iconParentNode.className="mblToolBarButtonIcon";
this.labelNode.className="mblToolBarButtonLabel";
if(this.icon&&this.icon!=="none"&&this.label){
_4.add(this.domNode,"mblToolBarButtonHasIcon");
_4.add(this.bodyNode,"mblToolBarButtonLabeledIcon");
}
_4.add(this.bodyNode,this.defaultColor);
var _b=this;
setTimeout(function(){
_b._updateArrowColor();
},0);
if(!_7("webkit")){
var _c=0;
this._timer=setInterval(function(){
if(_b._updateArrowColor()||_c++>3){
clearInterval(_b._timer);
}
},500);
}
},startup:function(){
if(this._started){
return;
}
this._keydownHandle=this.connect(this.domNode,"onkeydown","_onClick");
this.inherited(arguments);
if(!this._isOnLine){
this._isOnLine=true;
this.set("icon",this.icon);
}
},_updateArrowColor:function(){
if(this.arrowNode&&!_7("ie")){
_6.set(this.arrowNode,"backgroundColor",_6.get(this.bodyNode,"backgroundColor"));
var s=_6.get(this.bodyNode,"backgroundImage");
var _d=_4.contains(this.bodyNode,this.defaultColor)?this.defaultColor:this.selColor;
if(s==="none"||_9[_d]){
return false;
}
var _e=".mblToolBarButtonArrow."+_d+"{background-image:"+s.replace(/\(top,/,"(top left,").replace(/0% 0%, 0% 100%/,"0% 0%, 100% 100%").replace(/50% 0%/,"0% 0%")+";}";
_9[_d]=1;
_5.create("style",{innerHTML:_e},_3.doc.head,"first");
}
return true;
},_onClick:function(e){
if(e&&e.type==="keydown"&&e.keyCode!==13){
return;
}
if(this.onClick(e)===false){
return;
}
this.defaultClickAction(e);
},onClick:function(){
},_setLabelAttr:function(_f){
this.inherited(arguments);
_4.toggle(this.tableNode,"mblToolBarButtonText",_f);
},_setSelectedAttr:function(_10){
this.inherited(arguments);
if(_10){
_4.replace(this.bodyNode,this.selColor,this.defaultColor);
if(this.arrowNode){
_4.replace(this.arrowNode,this.selColor,this.defaultColor);
}
}else{
_4.replace(this.bodyNode,this.defaultColor,this.selColor);
if(this.arrowNode){
_4.replace(this.arrowNode,this.defaultColor,this.selColor);
}
}
_4.toggle(this.domNode,"mblToolBarButtonSelected",_10);
_4.toggle(this.bodyNode,"mblToolBarButtonBodySelected",_10);
this._updateArrowColor();
}});
});
