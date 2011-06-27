/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/BackgroundIframe",["require","dojo/_base/kernel",".","dojo/_base/connect","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window"],function(_1,_2,_3){
var _4=new function(){
var _5=[];
this.pop=function(){
var _6;
if(_5.length){
_6=_5.pop();
_6.style.display="";
}else{
if(_2.isIE<9){
var _7=_2.config["dojoBlankHtmlUrl"]||_1.toUrl("dojo/resources/blank.html")||"javascript:\"\"";
var _8="<iframe src='"+_7+"' role='presentation'"+" style='position: absolute; left: 0px; top: 0px;"+"z-index: -1; filter:Alpha(Opacity=\"0\");'>";
_6=_2.doc.createElement(_8);
}else{
_6=_2.create("iframe");
_6.src="javascript:\"\"";
_6.className="dijitBackgroundIframe";
_6.setAttribute("role","presentation");
_2.style(_6,"opacity",0.1);
}
_6.tabIndex=-1;
}
return _6;
};
this.push=function(_9){
_9.style.display="none";
_5.push(_9);
};
}();
_3.BackgroundIframe=function(_a){
if(!_a.id){
throw new Error("no id");
}
if(_2.isIE||_2.isMoz){
var _b=(this.iframe=_4.pop());
_a.appendChild(_b);
if(_2.isIE<7||_2.isQuirks){
this.resize(_a);
this._conn=_2.connect(_a,"onresize",this,function(){
this.resize(_a);
});
}else{
_2.style(_b,{width:"100%",height:"100%"});
}
}
};
_2.extend(_3.BackgroundIframe,{resize:function(_c){
if(this.iframe){
_2.style(this.iframe,{width:_c.offsetWidth+"px",height:_c.offsetHeight+"px"});
}
},destroy:function(){
if(this._conn){
_2.disconnect(this._conn);
this._conn=null;
}
if(this.iframe){
_4.push(this.iframe);
delete this.iframe;
}
}});
return _3.BackgroundIframe;
});
