//>>built
define("dojox/mobile/ToolBarButton",["dojo/_base/declare","dojo/_base/lang","dojo/dom-class","dojo/dom-construct","dojo/dom-style","./sniff","./_ItemBase"],function(_1,_2,_3,_4,_5,_6,_7){
return _1("dojox.mobile.ToolBarButton",_7,{selected:false,arrow:"",light:true,baseClass:"mblToolBarButton",defaultColor:"mblColorDefault",selColor:"mblColorDefaultSel",_selStartMethod:"touch",_selEndMethod:"touch",buildRendering:function(){
if(!this.label&&this.srcNodeRef){
this.label=this.srcNodeRef.innerHTML;
}
this.label=_2.trim(this.label);
this.domNode=(this.srcNodeRef&&this.srcNodeRef.tagName==="SPAN")?this.srcNodeRef:_4.create("span");
this.inherited(arguments);
if(this.light&&!this.arrow&&(!this.icon||!this.label)){
this.labelNode=this.tableNode=this.bodyNode=this.iconParentNode=this.domNode;
_3.add(this.domNode,this.defaultColor+" mblToolBarButtonBody"+(this.icon?" mblToolBarButtonLightIcon":" mblToolBarButtonLightText"));
return;
}
this.domNode.innerHTML="";
if(this.arrow==="left"||this.arrow==="right"){
this.arrowNode=_4.create("span",{className:"mblToolBarButtonArrow mblToolBarButton"+(this.arrow==="left"?"Left":"Right")+"Arrow"},this.domNode);
_3.add(this.domNode,"mblToolBarButtonHas"+(this.arrow==="left"?"Left":"Right")+"Arrow");
}
this.bodyNode=_4.create("span",{className:"mblToolBarButtonBody"},this.domNode);
this.tableNode=_4.create("table",{cellPadding:"0",cellSpacing:"0",border:"0"},this.bodyNode);
var _8=this.tableNode.insertRow(-1);
this.iconParentNode=_8.insertCell(-1);
this.labelNode=_8.insertCell(-1);
this.iconParentNode.className="mblToolBarButtonIcon";
this.labelNode.className="mblToolBarButtonLabel";
if(this.icon&&this.icon!=="none"&&this.label){
_3.add(this.domNode,"mblToolBarButtonHasIcon");
_3.add(this.bodyNode,"mblToolBarButtonLabeledIcon");
}
_3.add(this.bodyNode,this.defaultColor);
var _9=this;
setTimeout(function(){
_9._updateArrowColor();
},0);
if(!_6("webkit")){
var _a=0;
this._timer=setInterval(function(){
if(_9._updateArrowColor()||_a++>3){
clearInterval(_9._timer);
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
if(this.arrowNode&&!_6("ie")){
_5.set(this.arrowNode,"backgroundColor",_5.get(this.bodyNode,"backgroundColor"));
var s=_5.get(this.bodyNode,"backgroundImage");
if(s==="none"){
return false;
}
_5.set(this.arrowNode,"backgroundImage",s.replace(/\(top,/,"(top left,").replace(/0% 0%, 0% 100%/,"0% 0%, 100% 100%").replace(/50% 0%/,"0% 0%"));
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
},_setLabelAttr:function(_b){
this.inherited(arguments);
_3.toggle(this.tableNode,"mblToolBarButtonText",_b);
},_setSelectedAttr:function(_c){
this.inherited(arguments);
if(_c){
_3.replace(this.bodyNode,this.selColor,this.defaultColor);
}else{
_3.replace(this.bodyNode,this.defaultColor,this.selColor);
}
_3.toggle(this.domNode,"mblToolBarButtonSelected",_c);
_3.toggle(this.bodyNode,"mblToolBarButtonBodySelected",_c);
this._updateArrowColor();
}});
});
