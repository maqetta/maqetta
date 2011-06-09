/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dijit/BackgroundIframe",["dojo/_base/kernel",".","dojo/_base/connect","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/url","dojo/_base/window"],function(_1,_2){
var _3=new function(){
var _4=[];
this.pop=function(){
var _5;
if(_4.length){
_5=_4.pop();
_5.style.display="";
}else{
if(_1.isIE<9){
var _6=_1.config["dojoBlankHtmlUrl"]||(_1.moduleUrl("dojo","resources/blank.html")+"")||"javascript:\"\"";
var _7="<iframe src='"+_6+"' role='presentation'"+" style='position: absolute; left: 0px; top: 0px;"+"z-index: -1; filter:Alpha(Opacity=\"0\");'>";
_5=_1.doc.createElement(_7);
}else{
_5=_1.create("iframe");
_5.src="javascript:\"\"";
_5.className="dijitBackgroundIframe";
_5.setAttribute("role","presentation");
_1.style(_5,"opacity",0.1);
}
_5.tabIndex=-1;
}
return _5;
};
this.push=function(_8){
_8.style.display="none";
_4.push(_8);
};
}();
_2.BackgroundIframe=function(_9){
if(!_9.id){
throw new Error("no id");
}
if(_1.isIE||_1.isMoz){
var _a=(this.iframe=_3.pop());
_9.appendChild(_a);
if(_1.isIE<7||_1.isQuirks){
this.resize(_9);
this._conn=_1.connect(_9,"onresize",this,function(){
this.resize(_9);
});
}else{
_1.style(_a,{width:"100%",height:"100%"});
}
}
};
_1.extend(_2.BackgroundIframe,{resize:function(_b){
if(this.iframe){
_1.style(this.iframe,{width:_b.offsetWidth+"px",height:_b.offsetHeight+"px"});
}
},destroy:function(){
if(this._conn){
_1.disconnect(this._conn);
this._conn=null;
}
if(this.iframe){
_3.push(this.iframe);
delete this.iframe;
}
}});
return _2.BackgroundIframe;
});
