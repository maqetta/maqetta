//>>built
define("dojox/mobile/ListItem",["dojo/_base/array","dojo/_base/declare","dojo/_base/lang","dojo/dom-class","dojo/dom-construct","dojo/dom-style","dijit/registry","./iconUtils","./_ItemBase","./ProgressIndicator"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a){
_3.extend(dijit._WidgetBase,{layout:"",preventTouch:false});
return _2("dojox.mobile.ListItem",_9,{rightText:"",rightIcon:"",rightIcon2:"",deleteIcon:"",anchorLabel:false,noArrow:false,checked:false,arrowClass:"",checkClass:"",uncheckClass:"",variableHeight:false,rightIconTitle:"",rightIcon2Title:"",header:false,tag:"li",busy:false,progStyle:"",paramsToInherit:"variableHeight,transition,deleteIcon,icon,rightIcon,rightIcon2,uncheckIcon,arrowClass,checkClass,uncheckClass,deleteIconTitle,deleteIconRole",baseClass:"mblListItem",_selStartMethod:"touch",_selEndMethod:"timer",_delayedSelection:true,_selClass:"mblListItemSelected",buildRendering:function(){
this.domNode=this.containerNode=this.srcNodeRef||_5.create(this.tag);
this.inherited(arguments);
if(this.selected){
_4.add(this.domNode,this._selClass);
}
if(this.header){
_4.replace(this.domNode,"mblEdgeToEdgeCategory",this.baseClass);
}
this.labelNode=_5.create("div",{className:"mblListItemLabel"});
var _b=this.srcNodeRef;
if(_b&&_b.childNodes.length===1&&_b.firstChild.nodeType===3){
this.labelNode.appendChild(_b.firstChild);
}
this.domNode.appendChild(this.labelNode);
if(this.anchorLabel){
this.labelNode.style.display="inline";
this.labelNode.style.cursor="pointer";
this._anchorClickHandle=this.connect(this.labelNode,"onclick","_onClick");
this.onTouchStart=function(e){
return (e.target!==this.labelNode);
};
}
this._layoutChildren=[];
},startup:function(){
if(this._started){
return;
}
var _c=this.getParent();
var _d=this.getTransOpts();
if(_d.moveTo||_d.href||_d.url||this.clickable||(_c&&_c.select)){
this._keydownHandle=this.connect(this.domNode,"onkeydown","_onClick");
}else{
this._handleClick=false;
}
this.inherited(arguments);
if(_4.contains(this.domNode,"mblVariableHeight")){
this.variableHeight=true;
}
if(this.variableHeight){
_4.add(this.domNode,"mblVariableHeight");
this.defer(_3.hitch(this,"layoutVariableHeight"),0);
}
if(!this._isOnLine){
this._isOnLine=true;
this.set({icon:this.icon,deleteIcon:this.deleteIcon,rightIcon:this.rightIcon,rightIcon2:this.rightIcon2});
}
if(_c&&_c.select){
this.set("checked",this.checked);
}
this.setArrow();
this.layoutChildren();
},layoutChildren:function(){
var _e;
_1.forEach(this.domNode.childNodes,function(n){
if(n.nodeType!==1){
return;
}
var _f=n.getAttribute("layout")||(_7.byNode(n)||{}).layout;
if(_f){
_4.add(n,"mblListItemLayout"+_f.charAt(0).toUpperCase()+_f.substring(1));
this._layoutChildren.push(n);
if(_f==="center"){
_e=n;
}
}
},this);
if(_e){
this.domNode.insertBefore(_e,this.domNode.firstChild);
}
},resize:function(){
if(this.variableHeight){
this.layoutVariableHeight();
}
this.labelNode.style.display=this.labelNode.firstChild?"block":"inline";
},_onTouchStart:function(e){
if(e.target.getAttribute("preventTouch")||(_7.getEnclosingWidget(e.target)||{}).preventTouch){
return;
}
this.inherited(arguments);
},_onClick:function(e){
if(this.getParent().isEditing||e&&e.type==="keydown"&&e.keyCode!==13){
return;
}
if(this.onClick(e)===false){
return;
}
var n=this.labelNode;
if(this.anchorLabel&&e.currentTarget===n){
_4.add(n,"mblListItemLabelSelected");
setTimeout(function(){
_4.remove(n,"mblListItemLabelSelected");
},this._duration);
this.onAnchorLabelClicked(e);
return;
}
var _10=this.getParent();
if(_10.select){
if(_10.select==="single"){
if(!this.checked){
this.set("checked",true);
}
}else{
if(_10.select==="multiple"){
this.set("checked",!this.checked);
}
}
}
this.defaultClickAction(e);
},onClick:function(){
},onAnchorLabelClicked:function(e){
},layoutVariableHeight:function(){
var h=this.domNode.offsetHeight;
if(h===this.domNodeHeight){
return;
}
this.domNodeHeight=h;
_1.forEach(this._layoutChildren.concat([this.rightTextNode,this.rightIcon2Node,this.rightIconNode,this.uncheckIconNode,this.iconNode,this.deleteIconNode,this.knobIconNode]),function(n){
if(n){
var _11=this.domNode;
var f=function(){
var t=Math.round((_11.offsetHeight-n.offsetHeight)/2)-_6.get(_11,"paddingTop");
n.style.marginTop=t+"px";
};
if(n.offsetHeight===0&&n.tagName==="IMG"){
n.onload=f;
}else{
f();
}
}
},this);
},setArrow:function(){
if(this.checked){
return;
}
var c="";
var _12=this.getParent();
var _13=this.getTransOpts();
if(_13.moveTo||_13.href||_13.url||this.clickable){
if(!this.noArrow&&!(_12&&_12.selectOne)){
c=this.arrowClass||"mblDomButtonArrow";
}
}
if(c){
this._setRightIconAttr(c);
}
},_findRef:function(_14){
var i,_15,_16=["deleteIcon","icon","rightIcon","uncheckIcon","rightIcon2","rightText"];
for(i=_1.indexOf(_16,_14)+1;i<_16.length;i++){
_15=this[_16[i]+"Node"];
if(_15){
return _15;
}
}
for(i=_16.length-1;i>=0;i--){
_15=this[_16[i]+"Node"];
if(_15){
return _15.nextSibling;
}
}
return this.domNode.firstChild;
},_setIcon:function(_17,_18){
if(!this._isOnLine){
return;
}
this._set(_18,_17);
this[_18+"Node"]=_8.setIcon(_17,this[_18+"Pos"],this[_18+"Node"],this[_18+"Title"]||this.alt,this.domNode,this._findRef(_18),"before");
if(this[_18+"Node"]){
var cap=_18.charAt(0).toUpperCase()+_18.substring(1);
_4.add(this[_18+"Node"],"mblListItem"+cap);
}
var _19=this[_18+"Role"];
if(_19){
this[_18+"Node"].setAttribute("role",_19);
}
},_setDeleteIconAttr:function(_1a){
this._setIcon(_1a,"deleteIcon");
},_setIconAttr:function(_1b){
this._setIcon(_1b,"icon");
},_setRightTextAttr:function(_1c){
if(!this.rightTextNode){
this.rightTextNode=_5.create("div",{className:"mblListItemRightText"},this.labelNode,"before");
}
this.rightText=_1c;
this.rightTextNode.innerHTML=this._cv?this._cv(_1c):_1c;
},_setRightIconAttr:function(_1d){
this._setIcon(_1d,"rightIcon");
},_setUncheckIconAttr:function(_1e){
this._setIcon(_1e,"uncheckIcon");
},_setRightIcon2Attr:function(_1f){
this._setIcon(_1f,"rightIcon2");
},_setCheckedAttr:function(_20){
if(!this._isOnLine){
return;
}
var _21=this.getParent();
if(_21&&_21.select==="single"&&_20){
_1.forEach(_21.getChildren(),function(_22){
_22!==this&&_22.checked&&_22.set("checked",false);
},this);
}
this._setRightIconAttr(this.checkClass||"mblDomButtonCheck");
this._setUncheckIconAttr(this.uncheckClass);
_4.toggle(this.domNode,"mblListItemChecked",_20);
_4.toggle(this.domNode,"mblListItemUnchecked",!_20);
_4.toggle(this.domNode,"mblListItemHasUncheck",!!this.uncheckIconNode);
this.rightIconNode.style.position=(this.uncheckIconNode&&!_20)?"absolute":"";
if(_21&&this.checked!==_20){
_21.onCheckStateChanged(this,_20);
}
this._set("checked",_20);
},_setBusyAttr:function(_23){
var _24=this._prog;
if(_23){
if(!this._progNode){
this._progNode=_5.create("div",{className:"mblListItemIcon"});
_24=this._prog=new _a({size:25,center:false});
_4.add(_24.domNode,this.progStyle);
this._progNode.appendChild(_24.domNode);
}
if(this.iconNode){
this.domNode.replaceChild(this._progNode,this.iconNode);
}else{
_5.place(this._progNode,this._findRef("icon"),"before");
}
_24.start();
}else{
if(this.iconNode){
this.domNode.replaceChild(this.iconNode,this._progNode);
}else{
this.domNode.removeChild(this._progNode);
}
_24.stop();
}
this._set("busy",_23);
},_setSelectedAttr:function(_25){
this.inherited(arguments);
_4.toggle(this.domNode,this._selClass,_25);
}});
});
