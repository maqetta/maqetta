/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/html/_base",["dojo","dijit","dojox","dojo/html","dojo/_base/url"],function(_1,_2,_3){
_1.getObject("dojox.html._base",1);
(function(){
if(_1.isIE){
var _4=/(AlphaImageLoader\([^)]*?src=(['"]))(?![a-z]+:|\/)([^\r\n;}]+?)(\2[^)]*\)\s*[;}]?)/g;
}
var _5=/(?:(?:@import\s*(['"])(?![a-z]+:|\/)([^\r\n;{]+?)\1)|url\(\s*(['"]?)(?![a-z]+:|\/)([^\r\n;]+?)\3\s*\))([a-z, \s]*[;}]?)/g;
var _6=_3.html._adjustCssPaths=function(_7,_8){
if(!_8||!_7){
return;
}
if(_4){
_8=_8.replace(_4,function(_9,_a,_b,_c,_d){
return _a+(new _1._Url(_7,"./"+_c).toString())+_d;
});
}
return _8.replace(_5,function(_e,_f,_10,_11,_12,_13){
if(_10){
return "@import \""+(new _1._Url(_7,"./"+_10).toString())+"\""+_13;
}else{
return "url("+(new _1._Url(_7,"./"+_12).toString())+")"+_13;
}
});
};
var _14=/(<[a-z][a-z0-9]*\s[^>]*)(?:(href|src)=(['"]?)([^>]*?)\3|style=(['"]?)([^>]*?)\5)([^>]*>)/gi;
var _15=_3.html._adjustHtmlPaths=function(_16,_17){
var url=_16||"./";
return _17.replace(_14,function(tag,_18,_19,_1a,_1b,_1c,_1d,end){
return _18+(_19?(_19+"="+_1a+(new _1._Url(url,_1b).toString())+_1a):("style="+_1c+_6(url,_1d)+_1c))+end;
});
};
var _1e=_3.html._snarfStyles=function(_1f,_20,_21){
_21.attributes=[];
return _20.replace(/(?:<style([^>]*)>([\s\S]*?)<\/style>|<link\s+(?=[^>]*rel=['"]?stylesheet)([^>]*?href=(['"])([^>]*?)\4[^>\/]*)\/?>)/gi,function(_22,_23,_24,_25,_26,_27){
var i,_28=(_23||_25||"").replace(/^\s*([\s\S]*?)\s*$/i,"$1");
if(_24){
i=_21.push(_1f?_6(_1f,_24):_24);
}else{
i=_21.push("@import \""+_27+"\";");
_28=_28.replace(/\s*(?:rel|href)=(['"])?[^\s]*\1\s*/gi,"");
}
if(_28){
_28=_28.split(/\s+/);
var _29={},tmp;
for(var j=0,e=_28.length;j<e;j++){
tmp=_28[j].split("=");
_29[tmp[0]]=tmp[1].replace(/^\s*['"]?([\s\S]*?)['"]?\s*$/,"$1");
}
_21.attributes[i-1]=_29;
}
return "";
});
};
var _2a=_3.html._snarfScripts=function(_2b,_2c){
_2c.code="";
_2b=_2b.replace(/<[!][-][-](.|\s)*?[-][-]>/g,function(_2d){
return _2d.replace(/<(\/?)script\b/ig,"&lt;$1Script");
});
function _2e(src){
if(_2c.downloadRemote){
src=src.replace(/&([a-z0-9#]+);/g,function(m,_2f){
switch(_2f){
case "amp":
return "&";
case "gt":
return ">";
case "lt":
return "<";
default:
return _2f.charAt(0)=="#"?String.fromCharCode(_2f.substring(1)):"&"+_2f+";";
}
});
_1.xhrGet({url:src,sync:true,load:function(_30){
_2c.code+=_30+";";
},error:_2c.errBack});
}
};
return _2b.replace(/<script\s*(?![^>]*type=['"]?(?:dojo\/|text\/html\b))(?:[^>]*?(?:src=(['"]?)([^>]*?)\1[^>]*)?)*>([\s\S]*?)<\/script>/gi,function(_31,_32,src,_33){
if(src){
_2e(src);
}else{
_2c.code+=_33;
}
return "";
});
};
var _34=_3.html.evalInGlobal=function(_35,_36){
_36=_36||_1.doc.body;
var n=_36.ownerDocument.createElement("script");
n.type="text/javascript";
_36.appendChild(n);
n.text=_35;
};
_1.declare("dojox.html._ContentSetter",[_1.html._ContentSetter],{adjustPaths:false,referencePath:".",renderStyles:false,executeScripts:false,scriptHasHooks:false,scriptHookReplacement:null,_renderStyles:function(_37){
this._styleNodes=[];
var st,att,_38,doc=this.node.ownerDocument;
var _39=doc.getElementsByTagName("head")[0];
for(var i=0,e=_37.length;i<e;i++){
_38=_37[i];
att=_37.attributes[i];
st=doc.createElement("style");
st.setAttribute("type","text/css");
for(var x in att){
st.setAttribute(x,att[x]);
}
this._styleNodes.push(st);
_39.appendChild(st);
if(st.styleSheet){
st.styleSheet.cssText=_38;
}else{
st.appendChild(doc.createTextNode(_38));
}
}
},empty:function(){
this.inherited("empty",arguments);
this._styles=[];
},onBegin:function(){
this.inherited("onBegin",arguments);
var _3a=this.content,_3b=this.node;
var _3c=this._styles;
if(_1.isString(_3a)){
if(this.adjustPaths&&this.referencePath){
_3a=_15(this.referencePath,_3a);
}
if(this.renderStyles||this.cleanContent){
_3a=_1e(this.referencePath,_3a,_3c);
}
if(this.executeScripts){
var _3d=this;
var _3e={downloadRemote:true,errBack:function(e){
_3d._onError.call(_3d,"Exec","Error downloading remote script in \""+_3d.id+"\"",e);
}};
_3a=_2a(_3a,_3e);
this._code=_3e.code;
}
}
this.content=_3a;
},onEnd:function(){
var _3f=this._code,_40=this._styles;
if(this._styleNodes&&this._styleNodes.length){
while(this._styleNodes.length){
_1.destroy(this._styleNodes.pop());
}
}
if(this.renderStyles&&_40&&_40.length){
this._renderStyles(_40);
}
if(this.executeScripts&&_3f){
if(this.cleanContent){
_3f=_3f.replace(/(<!--|(?:\/\/)?-->|<!\[CDATA\[|\]\]>)/g,"");
}
if(this.scriptHasHooks){
_3f=_3f.replace(/_container_(?!\s*=[^=])/g,this.scriptHookReplacement);
}
try{
_34(_3f,this.node);
}
catch(e){
this._onError("Exec","Error eval script in "+this.id+", "+e.message,e);
}
}
this.inherited("onEnd",arguments);
},tearDown:function(){
this.inherited(arguments);
delete this._styles;
if(this._styleNodes&&this._styleNodes.length){
while(this._styleNodes.length){
_1.destroy(this._styleNodes.pop());
}
}
delete this._styleNodes;
_1.mixin(this,_1.getObject(this.declaredClass).prototype);
}});
_3.html.set=function(_41,_42,_43){
if(!_43){
return _1.html._setNodeContent(_41,_42,true);
}else{
var op=new _3.html._ContentSetter(_1.mixin(_43,{content:_42,node:_41}));
return op.set();
}
};
})();
return _1.getObject("dojox.html._base");
});
require(["dojox/html/_base"]);
