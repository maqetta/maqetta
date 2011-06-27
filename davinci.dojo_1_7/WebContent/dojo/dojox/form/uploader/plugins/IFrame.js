/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/uploader/plugins/IFrame",["dojo","dojo/io/iframe","dojox/form/uploader/plugins/HTML5"],function(_1){
_1.declare("dojox.form.uploader.plugins.IFrame",[],{force:"",postMixInProperties:function(){
this.inherited(arguments);
if(!this.supports("multiple")||this.force=="iframe"){
this.uploadType="iframe";
this.upload=this.uploadIFrame;
this.submit=this.submitIFrame;
}
},submitIFrame:function(_2){
this.uploadIFrame(_2);
},uploadIFrame:function(_3){
var _4,_5=false;
if(!this.getForm()){
_4=_1.create("form",{enctype:"multipart/form-data",method:"post"},this.domNode);
_1.forEach(this._inputs,function(n,i){
if(n.value){
_4.appendChild(n);
}
},this);
_5=true;
}else{
_4=this.form;
}
var _6=this.getUrl();
var _7=_1.io.iframe.send({url:_6,form:_4,handleAs:"json",error:_1.hitch(this,function(_8){
if(_5){
_1.destroy(_4);
}
this.onError(_8);
}),load:_1.hitch(this,function(_9,_a,_b){
if(_5){
_1.destroy(_4);
}
if(_9["ERROR"]||_9["error"]){
this.onError(_9);
}else{
this.onComplete(_9);
}
})});
}});
dojox.form.addUploaderPlugin(dojox.form.uploader.plugins.IFrame);
return dojox.form.uploader.plugins.IFrame;
});
