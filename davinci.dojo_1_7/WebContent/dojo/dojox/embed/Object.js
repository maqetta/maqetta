/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/embed/Object",["dojo","dijit","dojox","dijit/_Widget","dojox/embed/Flash","dojox/embed/Quicktime"],function(_1,_2,_3){
_1.getObject("dojox.embed.Object",1);
_1.experimental("dojox.embed.Object");
_1.declare("dojox.embed.Object",_2._Widget,{width:0,height:0,src:"",movie:null,params:null,reFlash:/\.swf|\.flv/gi,reQtMovie:/\.3gp|\.avi|\.m4v|\.mov|\.mp4|\.mpg|\.mpeg|\.qt/gi,reQtAudio:/\.aiff|\.aif|\.m4a|\.m4b|\.m4p|\.midi|\.mid|\.mp3|\.mpa|\.wav/gi,postCreate:function(){
if(!this.width||!this.height){
var _4=_1.marginBox(this.domNode);
this.width=_4.w,this.height=_4.h;
}
var em=_3.embed.Flash;
if(this.src.match(this.reQtMovie)||this.src.match(this.reQtAudio)){
em=_3.embed.Quicktime;
}
if(!this.params){
this.params={};
if(this.domNode.hasAttributes()){
var _5={dojoType:"",width:"",height:"","class":"",style:"",id:"",src:""};
var _6=this.domNode.attributes;
for(var i=0,l=_6.length;i<l;i++){
if(!_5[_6[i].name]){
this.params[_6[i].name]=_6[i].value;
}
}
}
}
var _7={path:this.src,width:this.width,height:this.height,params:this.params};
this.movie=new (em)(_7,this.domNode);
}});
return _1.getObject("dojox.embed.Object");
});
require(["dojox/embed/Object"]);
