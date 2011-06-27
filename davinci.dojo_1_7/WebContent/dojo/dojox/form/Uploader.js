/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/Uploader",["dojo","dijit","dojox/form/uploader/Base","dijit/form/Button","dojo/i18n!./nls/Uploader"],function(_1,_2,_3,_4,_5){
_1.experimental("dojox.form.Uploader");
_1.declare("dojox.form.Uploader",[dojox.form.uploader.Base],{uploadOnSelect:false,tabIndex:0,multiple:false,label:_5.label,url:"",name:"uploadedfile",flashFieldName:"",uploadType:"form",_nameIndex:0,widgetsInTemplate:true,templateString:"<div><div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"button\">${label}</div></div>",postMixInProperties:function(){
this._inputs=[];
this._getButtonStyle(this.srcNodeRef);
this.inherited(arguments);
},postCreate:function(){
var _6=false;
var _7=this.domNode.parentNode;
var _8=this._getNodePosition(this.domNode);
if(!this.btnSize.w||!this.btnSize.h){
_1.body().appendChild(this.domNode);
this._getButtonStyle(this.domNode);
_6=true;
}
this._setButtonStyle();
if(_6){
_1.place(this.domNode,_8.node,_8.pos);
}
this.inherited(arguments);
},onChange:function(_9){
},onBegin:function(_a){
},onProgress:function(_b){
},onComplete:function(_c){
this.reset();
},onCancel:function(){
},onAbort:function(){
},onError:function(_d){
},upload:function(_e){
},submit:function(_f){
},reset:function(){
this._disconnectButton();
_1.forEach(this._inputs,_1.destroy,_1);
this._inputs=[];
this._nameIndex=0;
this._createInput();
},getFileList:function(){
var _10=[];
if(this.supports("multiple")){
_1.forEach(this.inputNode.files,function(f,i){
_10.push({index:i,name:f.name,size:f.size,type:f.type});
},this);
}else{
_1.forEach(this._inputs,function(n,i){
_10.push({index:i,name:n.value.substring(n.value.lastIndexOf("\\")+1),size:0,type:n.value.substring(n.value.lastIndexOf(".")+1)});
},this);
}
return _10;
},_getValueAttr:function(){
return this.getFileList();
},_setValueAttr:function(_11){
console.error("Uploader value is read only");
},_getDisabledAttr:function(){
return this._disabled;
},_setDisabledAttr:function(_12){
if(this._disabled==_12){
return;
}
this.button.set("disabled",_12);
_1.style(this.inputNode,"display",_12?"none":"block");
},_getNodePosition:function(_13){
if(_13.previousSibling){
return {node:_13.previousSibling,pos:"after"};
}
return {node:_13.nextSibling,pos:"before"};
},_getButtonStyle:function(_14){
if(!_14){
this.btnSize={w:200,h:25};
}else{
this.btnSize=_1.marginBox(_14);
}
},_setButtonStyle:function(){
var _15=true;
if(!this.domNode.parentNode||!this.domNode.parentNode.tagName){
document.body.appendChild(this.domNode);
_15=false;
}
_1.style(this.domNode,{width:this.btnSize.w+"px",height:(this.btnSize.h+4)+"px",overflow:"hidden",position:"relative"});
this.inputNodeFontSize=Math.max(2,Math.max(Math.ceil(this.btnSize.w/60),Math.ceil(this.btnSize.h/15)));
this._createInput();
_1.style(this.button.domNode,{margin:"0px",display:"block",verticalAlign:"top"});
_1.style(this.button.domNode.firstChild,{margin:"0px",display:"block"});
if(!_15){
document.body.removeChild(this.domNode);
}
},_createInput:function(){
if(this._inputs.length){
_1.style(this.inputNode,{top:"500px"});
this._disconnectButton();
this._nameIndex++;
}
var _16;
if(this.supports("multiple")){
_16=this.name+"s[]";
}else{
_16=this.name+(this.multiple?this._nameIndex:"");
}
this.inputNode=_1.create("input",{type:"file",name:_16},this.domNode,"first");
if(this.supports("multiple")&&this.multiple){
_1.attr(this.inputNode,"multiple",true);
}
this._inputs.push(this.inputNode);
_1.style(this.inputNode,{fontSize:this.inputNodeFontSize+"em"});
var _17=_1.marginBox(this.inputNode);
_1.style(this.inputNode,{position:"absolute",top:"-2px",left:"-"+(_17.w-this.btnSize.w-2)+"px",opacity:0});
this._connectButton();
},_connectButton:function(){
this._cons=[];
var cs=_1.hitch(this,function(nm){
this._cons.push(_1.connect(this.inputNode,nm,this,function(evt){
this.button._cssMouseEvent({type:nm});
}));
});
cs("mouseover");
cs("mouseout");
cs("mousedown");
this._cons.push(_1.connect(this.inputNode,"change",this,function(evt){
this.onChange(this.getFileList(evt));
if(!this.supports("multiple")&&this.multiple){
this._createInput();
}
}));
this.button.set("tabIndex",-1);
if(this.tabIndex>-1){
this.inputNode.tabIndex=this.tabIndex;
var _18=_1.style(this.button.domNode.firstChild,"border");
this._cons.push(_1.connect(this.inputNode,"focus",this,function(){
_1.style(this.button.domNode.firstChild,"border","1px dashed #ccc");
}));
this._cons.push(_1.connect(this.inputNode,"blur",this,function(){
_1.style(this.button.domNode.firstChild,"border",_18);
}));
}
},_disconnectButton:function(){
_1.forEach(this._cons,_1.disconnect,_1);
}});
dojox.form.UploaderOrg=dojox.form.Uploader;
var _19=[dojox.form.UploaderOrg];
dojox.form.addUploaderPlugin=function(_1a){
_19.push(_1a);
_1.declare("dojox.form.Uploader",_19,{});
};
return dojox.form.Uploader;
});
