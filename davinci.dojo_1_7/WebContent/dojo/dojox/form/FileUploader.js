/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/FileUploader",["dojo","dijit","dojo/io/iframe","dijit/_Widget","dijit/_TemplatedMixin","dijit/_Contained","dojox/embed/Flash","dojox/embed/flashVars","dojox/html/styles"],function(_1,_2){
_1.deprecated("dojox.form.FileUploader","Use dojox.form.Uploader","2.0");
_1.declare("dojox.form.FileUploader",[_2._Widget,_2._TemplatedMixin,_2._Contained],{swfPath:_1.config.uploaderPath||_1.moduleUrl("dojox.form","resources/fileuploader.swf"),templateString:"<div><div dojoAttachPoint=\"progNode\"><div dojoAttachPoint=\"progTextNode\"></div></div><div dojoAttachPoint=\"insideNode\" class=\"uploaderInsideNode\"></div></div>",uploadUrl:"",isDebug:false,devMode:false,baseClass:"dojoxUploaderNorm",hoverClass:"dojoxUploaderHover",activeClass:"dojoxUploaderActive",disabledClass:"dojoxUploaderDisabled",force:"",uploaderType:"",flashObject:null,flashMovie:null,insideNode:null,deferredUploading:1,fileListId:"",uploadOnChange:false,selectMultipleFiles:true,htmlFieldName:"uploadedfile",flashFieldName:"flashUploadFiles",fileMask:null,minFlashVersion:9,tabIndex:-1,showProgress:false,progressMessage:"Loading",progressBackgroundUrl:_1.moduleUrl("dijit","themes/tundra/images/buttonActive.png"),progressBackgroundColor:"#ededed",progressWidgetId:"",skipServerCheck:false,serverTimeout:5000,log:function(){
if(this.isDebug){
console["log"](Array.prototype.slice.call(arguments).join(" "));
}
},constructor:function(){
this._subs=[];
},postMixInProperties:function(){
this.fileList=[];
this._cons=[];
this.fileMask=this.fileMask||[];
this.fileInputs=[];
this.fileCount=0;
this.flashReady=false;
this._disabled=false;
this.force=this.force.toLowerCase();
this.uploaderType=((dojox.embed.Flash.available>=this.minFlashVersion||this.force=="flash")&&this.force!="html")?"flash":"html";
this.deferredUploading=this.deferredUploading===true?1:this.deferredUploading;
this._refNode=this.srcNodeRef;
this.getButtonStyle();
},startup:function(){
},postCreate:function(){
this.inherited(arguments);
this.setButtonStyle();
var _3;
if(this.uploaderType=="flash"){
_3="createFlashUploader";
}else{
this.uploaderType="html";
_3="createHtmlUploader";
}
this[_3]();
if(this.fileListId){
this.connect(_1.byId(this.fileListId),"click",function(_4){
var p=_4.target.parentNode.parentNode.parentNode;
if(p.id&&p.id.indexOf("file_")>-1){
this.removeFile(p.id.split("file_")[1]);
}
});
}
_1.addOnUnload(this,this.destroy);
},getHiddenNode:function(_5){
if(!_5){
return null;
}
var _6=null;
var p=_5.parentNode;
while(p&&p.tagName.toLowerCase()!="body"){
var d=_1.style(p,"display");
if(d=="none"){
_6=p;
break;
}
p=p.parentNode;
}
return _6;
},getButtonStyle:function(){
var _7=this.srcNodeRef;
this._hiddenNode=this.getHiddenNode(_7);
if(this._hiddenNode){
_1.style(this._hiddenNode,"display","block");
}
if(!_7&&this.button&&this.button.domNode){
var _8=true;
var _9=this.button.domNode.className+" dijitButtonNode";
var _a=this.getText(_1.query(".dijitButtonText",this.button.domNode)[0]);
var _b="<button id=\""+this.button.id+"\" class=\""+_9+"\">"+_a+"</button>";
_7=_1.place(_b,this.button.domNode,"after");
this.srcNodeRef=_7;
this.button.destroy();
this.baseClass="dijitButton";
this.hoverClass="dijitButtonHover";
this.pressClass="dijitButtonActive";
this.disabledClass="dijitButtonDisabled";
}else{
if(!this.srcNodeRef&&this.button){
_7=this.button;
}
}
if(_1.attr(_7,"class")){
this.baseClass+=" "+_1.attr(_7,"class");
}
_1.attr(_7,"class",this.baseClass);
this.norm=this.getStyle(_7);
this.width=this.norm.w;
this.height=this.norm.h;
if(this.uploaderType=="flash"){
this.over=this.getTempNodeStyle(_7,this.baseClass+" "+this.hoverClass,_8);
this.down=this.getTempNodeStyle(_7,this.baseClass+" "+this.activeClass,_8);
this.dsbl=this.getTempNodeStyle(_7,this.baseClass+" "+this.disabledClass,_8);
this.fhtml={cn:this.getText(_7),nr:this.norm,ov:this.over,dn:this.down,ds:this.dsbl};
}else{
this.fhtml={cn:this.getText(_7),nr:this.norm};
if(this.norm.va=="middle"){
this.norm.lh=this.norm.h;
}
}
if(this.devMode){
this.log("classes - base:",this.baseClass," hover:",this.hoverClass,"active:",this.activeClass);
this.log("fhtml:",this.fhtml);
this.log("norm:",this.norm);
this.log("over:",this.over);
this.log("down:",this.down);
}
},setButtonStyle:function(){
_1.style(this.domNode,{width:this.fhtml.nr.w+"px",height:(this.fhtml.nr.h)+"px",padding:"0px",lineHeight:"normal",position:"relative"});
if(this.uploaderType=="html"&&this.norm.va=="middle"){
_1.style(this.domNode,"lineHeight",this.norm.lh+"px");
}
if(this.showProgress){
this.progTextNode.innerHTML=this.progressMessage;
_1.style(this.progTextNode,{width:this.fhtml.nr.w+"px",height:(this.fhtml.nr.h+0)+"px",padding:"0px",margin:"0px",left:"0px",lineHeight:(this.fhtml.nr.h+0)+"px",position:"absolute"});
_1.style(this.progNode,{width:this.fhtml.nr.w+"px",height:(this.fhtml.nr.h+0)+"px",padding:"0px",margin:"0px",left:"0px",position:"absolute",display:"none",backgroundImage:"url("+this.progressBackgroundUrl+")",backgroundPosition:"bottom",backgroundRepeat:"repeat-x",backgroundColor:this.progressBackgroundColor});
}else{
_1.destroy(this.progNode);
}
_1.style(this.insideNode,{position:"absolute",top:"0px",left:"0px",display:""});
_1.addClass(this.domNode,this.srcNodeRef.className);
if(this.fhtml.nr.d.indexOf("inline")>-1){
_1.addClass(this.domNode,"dijitInline");
}
try{
this.insideNode.innerHTML=this.fhtml.cn;
}
catch(e){
if(this.uploaderType=="flash"){
this.insideNode=this.insideNode.parentNode.removeChild(this.insideNode);
_1.body().appendChild(this.insideNode);
this.insideNode.innerHTML=this.fhtml.cn;
var c=_1.connect(this,"onReady",this,function(){
_1.disconnect(c);
this.insideNode=this.insideNode.parentNode.removeChild(this.insideNode);
this.domNode.appendChild(this.insideNode);
});
}else{
this.insideNode.appendChild(document.createTextNode(this.fhtml.cn));
}
}
if(this._hiddenNode){
_1.style(this._hiddenNode,"display","none");
}
},onChange:function(_c){
},onProgress:function(_d){
},onComplete:function(_e){
},onCancel:function(){
},onError:function(_f){
},onReady:function(_10){
},onLoad:function(_11){
},submit:function(_12){
var _13=_12?_1.formToObject(_12):null;
this.upload(_13);
return false;
},upload:function(_14){
if(!this.fileList.length){
return false;
}
if(!this.uploadUrl){
console.warn("uploadUrl not provided. Aborting.");
return false;
}
if(!this.showProgress){
this.set("disabled",true);
}
if(this.progressWidgetId){
var _15=_2.byId(this.progressWidgetId).domNode;
if(_1.style(_15,"display")=="none"){
this.restoreProgDisplay="none";
_1.style(_15,"display","block");
}
if(_1.style(_15,"visibility")=="hidden"){
this.restoreProgDisplay="hidden";
_1.style(_15,"visibility","visible");
}
}
if(_14&&!_14.target){
this.postData=_14;
}
this.log("upload type:",this.uploaderType," - postData:",this.postData);
for(var i=0;i<this.fileList.length;i++){
var f=this.fileList[i];
f.bytesLoaded=0;
f.bytesTotal=f.size||100000;
f.percent=0;
}
if(this.uploaderType=="flash"){
this.uploadFlash();
}else{
this.uploadHTML();
}
return false;
},removeFile:function(_16,_17){
var i;
for(i=0;i<this.fileList.length;i++){
if(this.fileList[i].name==_16){
if(!_17){
this.fileList.splice(i,1);
}
break;
}
}
if(this.uploaderType=="flash"){
this.flashMovie.removeFile(_16);
}else{
if(!_17){
_1.destroy(this.fileInputs[i]);
this.fileInputs.splice(i,1);
this._renumberInputs();
}
}
if(this.fileListId){
_1.destroy("file_"+_16);
}
},destroy:function(){
if(this.uploaderType=="flash"&&!this.flashMovie){
this._cons.push(_1.connect(this,"onLoad",this,"destroy"));
return;
}
_1.forEach(this._subs,_1.unsubscribe,_1);
_1.forEach(this._cons,_1.disconnect,_1);
if(this.scrollConnect){
_1.disconnect(this.scrollConnect);
}
if(this.uploaderType=="flash"){
this.flashObject.destroy();
delete this.flashObject;
}else{
_1.destroy(this._fileInput);
_1.destroy(this._formNode);
}
this.inherited(arguments);
},_displayProgress:function(_18){
if(_18===true){
if(this.uploaderType=="flash"){
_1.style(this.insideNode,"top","-2500px");
}else{
_1.style(this.insideNode,"display","none");
}
_1.style(this.progNode,"display","");
}else{
if(_18===false){
_1.style(this.insideNode,{display:"",top:"0"});
_1.style(this.progNode,"display","none");
}else{
var w=_18*this.fhtml.nr.w;
_1.style(this.progNode,"width",w+"px");
}
}
},_animateProgress:function(){
this._displayProgress(true);
var _19=false;
var c=_1.connect(this,"_complete",function(){
_1.disconnect(c);
_19=true;
});
var w=0;
var _1a=setInterval(_1.hitch(this,function(){
w+=5;
if(w>this.fhtml.nr.w){
w=0;
_19=true;
}
this._displayProgress(w/this.fhtml.nr.w);
if(_19){
clearInterval(_1a);
setTimeout(_1.hitch(this,function(){
this._displayProgress(false);
}),500);
}
}),50);
},_error:function(evt){
if(typeof (evt)=="string"){
evt=new Error(evt);
}
this.onError(evt);
},_addToFileList:function(){
if(this.fileListId){
var str="";
_1.forEach(this.fileList,function(d){
str+="<table id=\"file_"+d.name+"\" class=\"fileToUpload\"><tr><td class=\"fileToUploadClose\"></td><td class=\"fileToUploadName\">"+d.name+"</td><td class=\"fileToUploadSize\">"+(d.size?Math.ceil(d.size*0.001)+"kb":"")+"</td></tr></table>";
},this);
_1.byId(this.fileListId).innerHTML=str;
}
},_change:function(_1b){
if(_1.isIE){
_1.forEach(_1b,function(f){
f.name=f.name.split("\\")[f.name.split("\\").length-1];
});
}
if(this.selectMultipleFiles){
this.fileList=this.fileList.concat(_1b);
}else{
if(this.fileList[0]){
this.removeFile(this.fileList[0].name,true);
}
this.fileList=_1b;
}
this._addToFileList();
this.onChange(_1b);
if(this.uploadOnChange){
if(this.uploaderType=="html"){
this._buildFileInput();
}
this.upload();
}else{
if(this.uploaderType=="html"&&this.selectMultipleFiles){
this._buildFileInput();
this._connectInput();
}
}
},_complete:function(_1c){
_1c=_1.isArray(_1c)?_1c:[_1c];
_1.forEach(_1c,function(f){
if(f.ERROR){
this._error(f.ERROR);
}
},this);
_1.forEach(this.fileList,function(f){
f.bytesLoaded=1;
f.bytesTotal=1;
f.percent=100;
this._progress(f);
},this);
_1.forEach(this.fileList,function(f){
this.removeFile(f.name,true);
},this);
this.onComplete(_1c);
this.fileList=[];
this._resetHTML();
this.set("disabled",false);
if(this.restoreProgDisplay){
setTimeout(_1.hitch(this,function(){
_1.style(_2.byId(this.progressWidgetId).domNode,this.restoreProgDisplay=="none"?"display":"visibility",this.restoreProgDisplay);
}),500);
}
},_progress:function(_1d){
var _1e=0;
var _1f=0;
for(var i=0;i<this.fileList.length;i++){
var f=this.fileList[i];
if(f.name==_1d.name){
f.bytesLoaded=_1d.bytesLoaded;
f.bytesTotal=_1d.bytesTotal;
f.percent=Math.ceil(f.bytesLoaded/f.bytesTotal*100);
this.log(f.name,"percent:",f.percent);
}
_1f+=Math.ceil(0.001*f.bytesLoaded);
_1e+=Math.ceil(0.001*f.bytesTotal);
}
var _20=Math.ceil(_1f/_1e*100);
if(this.progressWidgetId){
_2.byId(this.progressWidgetId).update({progress:_20+"%"});
}
if(this.showProgress){
this._displayProgress(_20*0.01);
}
this.onProgress(this.fileList);
},_getDisabledAttr:function(){
return this._disabled;
},_setDisabledAttr:function(_21){
if(this._disabled==_21){
return;
}
if(this.uploaderType=="flash"){
if(!this.flashReady){
var _22=_1.connect(this,"onLoad",this,function(){
_1.disconnect(_22);
this._setDisabledAttr(_21);
});
return;
}
this._disabled=_21;
this.flashMovie.doDisable(_21);
}else{
this._disabled=_21;
_1.style(this._fileInput,"display",this._disabled?"none":"");
}
_1.toggleClass(this.domNode,this.disabledClass,_21);
},_onFlashBlur:function(){
this.flashMovie.blur();
if(!this.nextFocusObject&&this.tabIndex){
var _23=_1.query("[tabIndex]");
for(var i=0;i<_23.length;i++){
if(_23[i].tabIndex>=Number(this.tabIndex)+1){
this.nextFocusObject=_23[i];
break;
}
}
}
this.nextFocusObject.focus();
},_disconnect:function(){
_1.forEach(this._cons,_1.disconnect,_1);
},uploadHTML:function(){
if(this.selectMultipleFiles){
_1.destroy(this._fileInput);
}
this._setHtmlPostData();
if(this.showProgress){
this._animateProgress();
}
var dfd=_1.io.iframe.send({url:this.uploadUrl.toString(),form:this._formNode,handleAs:"json",error:_1.hitch(this,function(err){
this._error("HTML Upload Error:"+err.message);
}),load:_1.hitch(this,function(_24,_25,_26){
this._complete(_24);
})});
},createHtmlUploader:function(){
this._buildForm();
this._setFormStyle();
this._buildFileInput();
this._connectInput();
this._styleContent();
_1.style(this.insideNode,"visibility","visible");
this.onReady();
},_connectInput:function(){
this._disconnect();
this._cons.push(_1.connect(this._fileInput,"mouseover",this,function(evt){
_1.addClass(this.domNode,this.hoverClass);
this.onMouseOver(evt);
}));
this._cons.push(_1.connect(this._fileInput,"mouseout",this,function(evt){
setTimeout(_1.hitch(this,function(){
_1.removeClass(this.domNode,this.activeClass);
_1.removeClass(this.domNode,this.hoverClass);
this.onMouseOut(evt);
this._checkHtmlCancel("off");
}),0);
}));
this._cons.push(_1.connect(this._fileInput,"mousedown",this,function(evt){
_1.addClass(this.domNode,this.activeClass);
_1.removeClass(this.domNode,this.hoverClass);
this.onMouseDown(evt);
}));
this._cons.push(_1.connect(this._fileInput,"mouseup",this,function(evt){
_1.removeClass(this.domNode,this.activeClass);
this.onMouseUp(evt);
this.onClick(evt);
this._checkHtmlCancel("up");
}));
this._cons.push(_1.connect(this._fileInput,"change",this,function(){
this._checkHtmlCancel("change");
this._change([{name:this._fileInput.value,type:"",size:0}]);
}));
if(this.tabIndex>=0){
_1.attr(this.domNode,"tabIndex",this.tabIndex);
}
},_checkHtmlCancel:function(_27){
if(_27=="change"){
this.dialogIsOpen=false;
}
if(_27=="up"){
this.dialogIsOpen=true;
}
if(_27=="off"){
if(this.dialogIsOpen){
this.onCancel();
}
this.dialogIsOpen=false;
}
},_styleContent:function(){
var o=this.fhtml.nr;
_1.style(this.insideNode,{width:o.w+"px",height:o.va=="middle"?o.h+"px":"auto",textAlign:o.ta,paddingTop:o.p[0]+"px",paddingRight:o.p[1]+"px",paddingBottom:o.p[2]+"px",paddingLeft:o.p[3]+"px"});
try{
_1.style(this.insideNode,"lineHeight","inherit");
}
catch(e){
}
},_resetHTML:function(){
if(this.uploaderType=="html"&&this._formNode){
this.fileInputs=[];
_1.query("*",this._formNode).forEach(function(n){
_1.destroy(n);
});
this.fileCount=0;
this._buildFileInput();
this._connectInput();
}
},_buildForm:function(){
if(this._formNode){
return;
}
if(_1.isIE<9||(_1.isIE&&_1.isQuirks)){
this._formNode=document.createElement("<form enctype=\"multipart/form-data\" method=\"post\">");
this._formNode.encoding="multipart/form-data";
this._formNode.id=_2.getUniqueId("FileUploaderForm");
this.domNode.appendChild(this._formNode);
}else{
this._formNode=_1.create("form",{enctype:"multipart/form-data",method:"post",id:_2.getUniqueId("FileUploaderForm")},this.domNode);
}
},_buildFileInput:function(){
if(this._fileInput){
this._disconnect();
this._fileInput.id=this._fileInput.id+this.fileCount;
_1.style(this._fileInput,"display","none");
}
this._fileInput=document.createElement("input");
this.fileInputs.push(this._fileInput);
var nm=this.htmlFieldName;
var _28=this.id;
if(this.selectMultipleFiles){
nm+=this.fileCount;
_28+=this.fileCount;
this.fileCount++;
}
_1.attr(this._fileInput,{id:this.id,name:nm,type:"file"});
_1.addClass(this._fileInput,"dijitFileInputReal");
this._formNode.appendChild(this._fileInput);
var _29=_1.marginBox(this._fileInput);
_1.style(this._fileInput,{position:"relative",left:(this.fhtml.nr.w-_29.w)+"px",opacity:0});
},_renumberInputs:function(){
if(!this.selectMultipleFiles){
return;
}
var nm;
this.fileCount=0;
_1.forEach(this.fileInputs,function(inp){
nm=this.htmlFieldName+this.fileCount;
this.fileCount++;
_1.attr(inp,"name",nm);
},this);
},_setFormStyle:function(){
var _2a=Math.max(2,Math.max(Math.ceil(this.fhtml.nr.w/60),Math.ceil(this.fhtml.nr.h/15)));
dojox.html.insertCssRule("#"+this._formNode.id+" input","font-size:"+_2a+"em");
_1.style(this.domNode,{overflow:"hidden",position:"relative"});
_1.style(this.insideNode,"position","absolute");
},_setHtmlPostData:function(){
if(this.postData){
for(var nm in this.postData){
_1.create("input",{type:"hidden",name:nm,value:this.postData[nm]},this._formNode);
}
}
},uploadFlash:function(){
try{
if(this.showProgress){
this._displayProgress(true);
var c=_1.connect(this,"_complete",this,function(){
_1.disconnect(c);
this._displayProgress(false);
});
}
var o={};
for(var nm in this.postData){
o[nm]=this.postData[nm];
}
this.flashMovie.doUpload(o);
}
catch(err){
this._error("FileUploader - Sorry, the SWF failed to initialize."+err);
}
},createFlashUploader:function(){
this.uploadUrl=this.uploadUrl.toString();
if(this.uploadUrl){
if(this.uploadUrl.toLowerCase().indexOf("http")<0&&this.uploadUrl.indexOf("/")!=0){
var loc=window.location.href.split("/");
loc.pop();
loc=loc.join("/")+"/";
this.uploadUrl=loc+this.uploadUrl;
this.log("SWF Fixed - Relative loc:",loc," abs loc:",this.uploadUrl);
}else{
this.log("SWF URL unmodified:",this.uploadUrl);
}
}else{
console.warn("Warning: no uploadUrl provided.");
}
var w=this.fhtml.nr.w;
var h=this.fhtml.nr.h;
var _2b={expressInstall:true,path:this.swfPath.uri||this.swfPath,width:w,height:h,allowScriptAccess:"always",allowNetworking:"all",vars:{uploadDataFieldName:this.flashFieldName,uploadUrl:this.uploadUrl,uploadOnSelect:this.uploadOnChange,deferredUploading:this.deferredUploading||0,selectMultipleFiles:this.selectMultipleFiles,id:this.id,isDebug:this.isDebug,devMode:this.devMode,flashButton:dojox.embed.flashVars.serialize("fh",this.fhtml),fileMask:dojox.embed.flashVars.serialize("fm",this.fileMask),noReturnCheck:this.skipServerCheck,serverTimeout:this.serverTimeout},params:{scale:"noscale",wmode:"opaque",allowScriptAccess:"always",allowNetworking:"all"}};
this.flashObject=new dojox.embed.Flash(_2b,this.insideNode);
this.flashObject.onError=_1.hitch(function(msg){
this._error("Flash Error: "+msg);
});
this.flashObject.onReady=_1.hitch(this,function(){
_1.style(this.insideNode,"visibility","visible");
this.log("FileUploader flash object ready");
this.onReady(this);
});
this.flashObject.onLoad=_1.hitch(this,function(mov){
this.flashMovie=mov;
this.flashReady=true;
this.onLoad(this);
});
this._connectFlash();
},_connectFlash:function(){
this._doSub("/filesSelected","_change");
this._doSub("/filesUploaded","_complete");
this._doSub("/filesProgress","_progress");
this._doSub("/filesError","_error");
this._doSub("/filesCanceled","onCancel");
this._doSub("/stageBlur","_onFlashBlur");
this._doSub("/up","onMouseUp");
this._doSub("/down","onMouseDown");
this._doSub("/over","onMouseOver");
this._doSub("/out","onMouseOut");
this.connect(this.domNode,"focus",function(){
this.flashMovie.focus();
this.flashMovie.doFocus();
});
if(this.tabIndex>=0){
_1.attr(this.domNode,"tabIndex",this.tabIndex);
}
},_doSub:function(_2c,_2d){
this._subs.push(_1.subscribe(this.id+_2c,this,_2d));
},urlencode:function(url){
if(!url||url=="none"){
return false;
}
return url.replace(/:/g,"||").replace(/\./g,"^^").replace("url(","").replace(")","").replace(/'/g,"").replace(/"/g,"");
},isButton:function(_2e){
var tn=_2e.tagName.toLowerCase();
return tn=="button"||tn=="input";
},getTextStyle:function(_2f){
var o={};
o.ff=_1.style(_2f,"fontFamily");
if(o.ff){
o.ff=o.ff.replace(", ",",");
o.ff=o.ff.replace(/\"|\'/g,"");
o.ff=o.ff=="sans-serif"?"Arial":o.ff;
o.fw=_1.style(_2f,"fontWeight");
o.fi=_1.style(_2f,"fontStyle");
o.fs=parseInt(_1.style(_2f,"fontSize"),10);
if(_1.style(_2f,"fontSize").indexOf("%")>-1){
var n=_2f;
while(n.tagName){
if(_1.style(n,"fontSize").indexOf("%")==-1){
o.fs=parseInt(_1.style(n,"fontSize"),10);
break;
}
if(n.tagName.toLowerCase()=="body"){
o.fs=16*0.01*parseInt(_1.style(n,"fontSize"),10);
}
n=n.parentNode;
}
}
o.fc=new _1.Color(_1.style(_2f,"color")).toHex();
o.fc=parseInt(o.fc.substring(1,Infinity),16);
}
o.lh=_1.style(_2f,"lineHeight");
o.ta=_1.style(_2f,"textAlign");
o.ta=o.ta=="start"||!o.ta?"left":o.ta;
o.va=this.isButton(_2f)?"middle":o.lh==o.h?"middle":_1.style(_2f,"verticalAlign");
return o;
},getText:function(_30){
var cn=_1.trim(_30.innerHTML);
if(cn.indexOf("<")>-1){
cn=escape(cn);
}
return cn;
},getStyle:function(_31){
var o={};
var dim=_1.contentBox(_31);
var pad=_1._getPadExtents(_31);
o.p=[pad.t,pad.w-pad.l,pad.h-pad.t,pad.l];
o.w=dim.w+pad.w;
o.h=dim.h+pad.h;
o.d=_1.style(_31,"display");
var clr=new _1.Color(_1.style(_31,"backgroundColor"));
o.bc=clr.a==0?"#ffffff":clr.toHex();
o.bc=parseInt(o.bc.substring(1,Infinity),16);
var url=this.urlencode(_1.style(_31,"backgroundImage"));
if(url){
o.bi={url:url,rp:_1.style(_31,"backgroundRepeat"),pos:escape(_1.style(_31,"backgroundPosition"))};
if(!o.bi.pos){
var rx=_1.style(_31,"backgroundPositionX");
var ry=_1.style(_31,"backgroundPositionY");
rx=(rx=="left")?"0%":(rx=="right")?"100%":rx;
ry=(ry=="top")?"0%":(ry=="bottom")?"100%":ry;
o.bi.pos=escape(rx+" "+ry);
}
}
return _1.mixin(o,this.getTextStyle(_31));
},getTempNodeStyle:function(_32,_33,_34){
var _35,_36;
if(_34){
_35=_1.place("<"+_32.tagName+"><span>"+_32.innerHTML+"</span></"+_32.tagName+">",_32.parentNode);
var _37=_35.firstChild;
_1.addClass(_37,_32.className);
_1.addClass(_35,_33);
_36=this.getStyle(_37);
}else{
_35=_1.place("<"+_32.tagName+">"+_32.innerHTML+"</"+_32.tagName+">",_32.parentNode);
_1.addClass(_35,_32.className);
_1.addClass(_35,_33);
_35.id=_32.id;
_36=this.getStyle(_35);
}
_1.destroy(_35);
return _36;
}});
return dojox.form.FileUploader;
});
