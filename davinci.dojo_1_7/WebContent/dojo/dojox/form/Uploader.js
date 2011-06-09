/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox/form/uploader/Base","dijit/form/Button"],function(_1,_2){
_1.experimental("dojox.form.Uploader");
_1.declare("dojox.form.Uploader",[dojox.form.uploader.Base],{uploadOnSelect:false,tabIndex:0,multiple:false,label:"Upload...",url:"",name:"uploadedfile",flashFieldName:"",uploadType:"form",_nameIndex:0,widgetsInTemplate:true,templateString:"<div class=\"dojoxFileInput\"><div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"button\">${label}</div></div>",postMixInProperties:function(){
this._inputs=[];
this._getButtonStyle(this.srcNodeRef);
this.inherited(arguments);
},postCreate:function(){
var _3=false;
var _4=this.domNode.parentNode;
var _5=this._getNodePosition(this.domNode);
if(!this.btnSize.w||!this.btnSize.h){
_1.body().appendChild(this.domNode);
this._getButtonStyle(this.domNode);
_3=true;
}
this._setButtonStyle();
if(_3){
_1.place(this.domNode,_5.node,_5.pos);
}
this.inherited(arguments);
},onChange:function(_6){
},onBegin:function(_7){
},onProgress:function(_8){
},onComplete:function(_9){
this.reset();
},onCancel:function(){
},onAbort:function(){
},onError:function(_a){
},upload:function(_b){
},submit:function(_c){
},reset:function(){
this._disconnectButton();
_1.forEach(this._inputs,_1.destroy,_1);
this._inputs=[];
this._nameIndex=0;
this._createInput();
},getFileList:function(){
var _d=[];
if(this.supports("multiple")){
_1.forEach(this.inputNode.files,function(f,i){
_d.push({index:i,name:f.name,size:f.size,type:f.type});
},this);
}else{
_1.forEach(this._inputs,function(n,i){
_d.push({index:i,name:n.value.substring(n.value.lastIndexOf("\\")+1),size:0,type:n.value.substring(n.value.lastIndexOf(".")+1)});
},this);
}
return _d;
},_getValueAttr:function(){
return this.getFileList();
},_setValueAttr:function(_e){
console.error("Uploader value is read only");
},_getDisabledAttr:function(){
return this._disabled;
},_setDisabledAttr:function(_f){
if(this._disabled==_f){
return;
}
this.button.set("disabled",_f);
_1.style(this.inputNode,"display",_f?"none":"block");
},_getNodePosition:function(_10){
if(_10.previousSibling){
return {node:_10.previousSibling,pos:"after"};
}
return {node:_10.nextSibling,pos:"before"};
},_getButtonStyle:function(_11){
if(!_11){
this.btnSize={w:200,h:25};
}else{
this.btnSize=_1.marginBox(_11);
}
},_setButtonStyle:function(){
var _12=true;
if(!this.domNode.parentNode||!this.domNode.parentNode.tagName){
document.body.appendChild(this.domNode);
_12=false;
}
_1.style(this.domNode,{width:this.btnSize.w+"px",height:(this.btnSize.h+4)+"px",overflow:"hidden",position:"relative"});
this.inputNodeFontSize=Math.max(2,Math.max(Math.ceil(this.btnSize.w/60),Math.ceil(this.btnSize.h/15)));
this._createInput();
_1.style(this.button.domNode,{margin:"0px",display:"block",verticalAlign:"top"});
_1.style(this.button.domNode.firstChild,{margin:"0px",display:"block"});
if(!_12){
document.body.removeChild(this.domNode);
}
},_createInput:function(){
if(this._inputs.length){
_1.style(this.inputNode,{top:"500px"});
this._disconnectButton();
this._nameIndex++;
}
var _13;
if(this.supports("multiple")){
_13=this.name+"s[]";
}else{
_13=this.name+(this.multiple?this._nameIndex:"");
}
this.inputNode=_1.create("input",{type:"file",name:_13,className:"dojoxInputNode"},this.domNode,"first");
if(this.supports("multiple")&&this.multiple){
_1.attr(this.inputNode,"multiple",true);
}
this._inputs.push(this.inputNode);
_1.style(this.inputNode,{fontSize:this.inputNodeFontSize+"em"});
var _14=_1.marginBox(this.inputNode);
_1.style(this.inputNode,{position:"absolute",top:"-2px",left:"-"+(_14.w-this.btnSize.w-2)+"px",opacity:0});
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
var _15=_1.style(this.button.domNode.firstChild,"border");
this._cons.push(_1.connect(this.inputNode,"focus",this,function(){
_1.style(this.button.domNode.firstChild,"border","1px dashed #ccc");
}));
this._cons.push(_1.connect(this.inputNode,"blur",this,function(){
_1.style(this.button.domNode.firstChild,"border",_15);
}));
}
},_disconnectButton:function(){
_1.forEach(this._cons,_1.disconnect,_1);
}});
dojox.form.UploaderOrg=dojox.form.Uploader;
var _16=[dojox.form.UploaderOrg];
dojox.form.addUploaderPlugin=function(_17){
_16.push(_17);
_1.declare("dojox.form.Uploader",_16,{});
};
return dojox.form.Uploader;
});
