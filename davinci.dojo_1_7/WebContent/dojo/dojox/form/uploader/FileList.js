/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/uploader/FileList",["dojo","dijit","dojox/form/uploader/Base"],function(_1,_2){
_1.declare("dojox.form.uploader.FileList",[dojox.form.uploader.Base],{uploaderId:"",uploader:null,headerIndex:"#",headerType:"Type",headerFilename:"File Name",headerFilesize:"Size",_upCheckCnt:0,rowAmt:0,templateString:"<div class=\"dojoxUploaderFileList\">"+"<div dojoAttachPoint=\"progressNode\" class=\"dojoxUploaderFileListProgress\"><div dojoAttachPoint=\"percentBarNode\" class=\"dojoxUploaderFileListProgressBar\"></div><div dojoAttachPoint=\"percentTextNode\" class=\"dojoxUploaderFileListPercentText\">0%</div></div>"+"<table class=\"dojoxUploaderFileListTable\">"+"<tr class=\"dojoxUploaderFileListHeader\"><th class=\"dojoxUploaderIndex\">${headerIndex}</th><th class=\"dojoxUploaderIcon\">${headerType}</th><th class=\"dojoxUploaderFileName\">${headerFilename}</th><th class=\"dojoxUploaderFileSize\">${headerFilesize}</th></tr>"+"<tr ><td colSpan=\"4\" class=\"dojoxUploaderFileListContainer\" dojoAttachPoint=\"containerNode\">"+"<table class=\"dojoxUploaderFileListContent\" dojoAttachPoint=\"listNode\"></table>"+"</td><tr>"+"</table>"+"<div>",postCreate:function(){
this.setUploader();
this.hideProgress();
},reset:function(){
for(var i=0;i<this.rowAmt;i++){
this.listNode.deleteRow(0);
}
this.rowAmt=0;
},setUploader:function(){
if(!this.uploaderId&&!this.uploader){
console.warn("uploaderId not passed to UploaderFileList");
}else{
if(this.uploaderId&&!this.uploader){
this.uploader=_2.byId(this.uploaderId);
}else{
if(this._upCheckCnt>4){
console.warn("uploader not found for ID ",this.uploaderId);
return;
}
}
}
if(this.uploader){
this.connect(this.uploader,"onChange","_onUploaderChange");
this.connect(this.uploader,"reset","reset");
this.connect(this.uploader,"onBegin",function(){
this.showProgress(true);
});
this.connect(this.uploader,"onProgress","_progress");
this.connect(this.uploader,"onComplete",function(){
setTimeout(_1.hitch(this,function(){
this.hideProgress(true);
}),1250);
});
}else{
this._upCheckCnt++;
setTimeout(_1.hitch(this,"setUploader"),250);
}
},hideProgress:function(_3){
var o=_3?{ani:true,endDisp:"none",beg:15,end:0}:{endDisp:"none",ani:false};
this._hideShowProgress(o);
},showProgress:function(_4){
var o=_4?{ani:true,endDisp:"block",beg:0,end:15}:{endDisp:"block",ani:false};
this._hideShowProgress(o);
},_progress:function(_5){
this.percentTextNode.innerHTML=_5.percent;
_1.style(this.percentBarNode,"width",_5.percent);
},_hideShowProgress:function(o){
var _6=this.progressNode;
var _7=function(){
_1.style(_6,"display",o.endDisp);
};
if(o.ani){
_1.style(_6,"display","block");
_1.animateProperty({node:_6,properties:{height:{start:o.beg,end:o.end,units:"px"}},onEnd:_7}).play();
}else{
_7();
}
},_onUploaderChange:function(_8){
this.reset();
_1.forEach(_8,function(f,i){
this._addRow(i+1,this.getFileType(f.name),f.name,f.size);
},this);
},_addRow:function(_9,_a,_b,_c){
var c,r=this.listNode.insertRow(-1);
c=r.insertCell(-1);
_1.addClass(c,"dojoxUploaderIndex");
c.innerHTML=_9;
c=r.insertCell(-1);
_1.addClass(c,"dojoxUploaderIcon");
c.innerHTML=_a;
c=r.insertCell(-1);
_1.addClass(c,"dojoxUploaderFileName");
c.innerHTML=_b;
c=r.insertCell(-1);
_1.addClass(c,"dojoxUploaderSize");
c.innerHTML=this.convertBytes(_c).value;
this.rowAmt++;
}});
return dojox.form.uploader.FileList;
});
