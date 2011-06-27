/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/uploader/plugins/HTML5",["dojo"],function(_1){
_1.declare("dojox.form.uploader.plugins.HTML5",[],{errMsg:"Error uploading files. Try checking permissions",uploadType:"html5",postCreate:function(){
this.connectForm();
this.inherited(arguments);
if(this.uploadOnSelect){
this.connect(this,"onChange","upload");
}
},upload:function(_2){
this.onBegin(this.getFileList());
if(this.supports("FormData")){
this.uploadWithFormData(_2);
}else{
if(this.supports("sendAsBinary")){
this.sendAsBinary(_2);
}
}
},submit:function(_3){
_3=!!_3?_3.tagName?_3:this.getForm():this.getForm();
var _4=_1.formToObject(_3);
this.upload(_4);
},sendAsBinary:function(_5){
if(!this.getUrl()){
console.error("No upload url found.",this);
return;
}
var _6="---------------------------"+(new Date).getTime();
var _7=this.createXhr();
_7.setRequestHeader("Content-Type","multipart/form-data; boundary="+_6);
var _8=this._buildRequestBody(_5,_6);
if(!_8){
this.onError(this.errMsg);
}else{
_7.sendAsBinary(_8);
}
},uploadWithFormData:function(_9){
if(!this.getUrl()){
console.error("No upload url found.",this);
return;
}
var fd=new FormData();
_1.forEach(this.inputNode.files,function(f,i){
fd.append(this.name+"s[]",f);
},this);
if(_9){
for(var nm in _9){
fd.append(nm,_9[nm]);
}
}
var _a=this.createXhr();
_a.send(fd);
},_xhrProgress:function(_b){
if(_b.lengthComputable){
var o={bytesLoaded:_b.loaded,bytesTotal:_b.total,type:_b.type,timeStamp:_b.timeStamp};
if(_b.type=="load"){
o.percent="100%",o.decimal=1;
}else{
o.decimal=_b.loaded/_b.total;
o.percent=Math.ceil((_b.loaded/_b.total)*100)+"%";
}
this.onProgress(o);
}
},createXhr:function(){
var _c=new XMLHttpRequest();
var _d;
_c.upload.addEventListener("progress",_1.hitch(this,"_xhrProgress"),false);
_c.addEventListener("load",_1.hitch(this,"_xhrProgress"),false);
_c.addEventListener("error",_1.hitch(this,function(_e){
this.onError(_e);
clearInterval(_d);
}),false);
_c.addEventListener("abort",_1.hitch(this,function(_f){
this.onAbort(_f);
clearInterval(_d);
}),false);
_c.onreadystatechange=_1.hitch(this,function(){
if(_c.readyState===4){
clearInterval(_d);
this.onComplete(JSON.parse(_c.responseText));
}
});
_c.open("POST",this.getUrl());
_d=setInterval(_1.hitch(this,function(){
try{
if(typeof (_c.statusText)){
}
}
catch(e){
clearInterval(_d);
}
}),250);
return _c;
},_buildRequestBody:function(_10,_11){
var EOL="\r\n";
var _12="";
_11="--"+_11;
var _13=[];
_1.forEach(this.inputNode.files,function(f,i){
var _14=this.name+"s[]";
var _15=this.inputNode.files[i].fileName;
var _16;
try{
_16=this.inputNode.files[i].getAsBinary()+EOL;
_12+=_11+EOL;
_12+="Content-Disposition: form-data; ";
_12+="name=\""+_14+"\"; ";
_12+="filename=\""+_15+"\""+EOL;
_12+="Content-Type: "+this.getMimeType()+EOL+EOL;
_12+=_16;
}
catch(e){
_13.push({index:i,name:_15});
}
},this);
if(_13.length){
if(_13.length>=this.inputNode.files.length){
this.onError({message:this.errMsg,filesInError:_13});
_12=false;
}
}
if(!_12){
return false;
}
if(_10){
for(var nm in _10){
_12+=_11+EOL;
_12+="Content-Disposition: form-data; ";
_12+="name=\""+nm+"\""+EOL+EOL;
_12+=_10[nm]+EOL;
}
}
_12+=_11+"--"+EOL;
return _12;
}});
dojox.form.addUploaderPlugin(dojox.form.uploader.plugins.HTML5);
return dojox.form.uploader.plugins.HTML5;
});
