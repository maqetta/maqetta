//>>built
define("dojox/html/_base",["dojo/_base/declare","dojo/Deferred","dojo/dom-construct","dojo/html","dojo/_base/kernel","dojo/_base/lang","dojo/ready","dojo/_base/sniff","dojo/_base/url","dojo/_base/xhr","dojo/_base/window"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b){
var _c=_5.getObject("dojox.html",true);
if(_8("ie")){
var _d=/(AlphaImageLoader\([^)]*?src=(['"]))(?![a-z]+:|\/)([^\r\n;}]+?)(\2[^)]*\)\s*[;}]?)/g;
}
var _e=/(?:(?:@import\s*(['"])(?![a-z]+:|\/)([^\r\n;{]+?)\1)|url\(\s*(['"]?)(?![a-z]+:|\/)([^\r\n;]+?)\3\s*\))([a-z, \s]*[;}]?)/g;
var _f=_c._adjustCssPaths=function(_10,_11){
if(!_11||!_10){
return;
}
if(_d){
_11=_11.replace(_d,function(_12,pre,_13,url,_14){
return pre+(new _9(_10,"./"+url).toString())+_14;
});
}
return _11.replace(_e,function(_15,_16,_17,_18,_19,_1a){
if(_17){
return "@import \""+(new _9(_10,"./"+_17).toString())+"\""+_1a;
}else{
return "url("+(new _9(_10,"./"+_19).toString())+")"+_1a;
}
});
};
var _1b=/(<[a-z][a-z0-9]*\s[^>]*)(?:(href|src)=(['"]?)([^>]*?)\3|style=(['"]?)([^>]*?)\5)([^>]*>)/gi;
var _1c=_c._adjustHtmlPaths=function(_1d,_1e){
var url=_1d||"./";
return _1e.replace(_1b,function(tag,_1f,_20,_21,_22,_23,_24,end){
return _1f+(_20?(_20+"="+_21+(new _9(url,_22).toString())+_21):("style="+_23+_f(url,_24)+_23))+end;
});
};
var _25=_c._snarfStyles=function(_26,_27,_28){
_28.attributes=[];
return _27.replace(/(?:<style([^>]*)>([\s\S]*?)<\/style>|<link\s+(?=[^>]*rel=['"]?stylesheet)([^>]*?href=(['"])([^>]*?)\4[^>\/]*)\/?>)/gi,function(_29,_2a,_2b,_2c,_2d,_2e){
var i,_2f=(_2a||_2c||"").replace(/^\s*([\s\S]*?)\s*$/i,"$1");
if(_2b){
i=_28.push(_26?_f(_26,_2b):_2b);
}else{
i=_28.push("@import \""+_2e+"\";");
_2f=_2f.replace(/\s*(?:rel|href)=(['"])?[^\s]*\1\s*/gi,"");
}
if(_2f){
_2f=_2f.split(/\s+/);
var _30={},tmp;
for(var j=0,e=_2f.length;j<e;j++){
tmp=_2f[j].split("=");
_30[tmp[0]]=tmp[1].replace(/^\s*['"]?([\s\S]*?)['"]?\s*$/,"$1");
}
_28.attributes[i-1]=_30;
}
return "";
});
};
var _31=_c._snarfScripts=function(_32,_33){
_33.code="";
_32=_32.replace(/<[!][-][-](.|\s)*?[-][-]>/g,function(_34){
return _34.replace(/<(\/?)script\b/ig,"&lt;$1Script");
});
function _35(src){
if(_33.downloadRemote){
src=src.replace(/&([a-z0-9#]+);/g,function(m,_36){
switch(_36){
case "amp":
return "&";
case "gt":
return ">";
case "lt":
return "<";
default:
return _36.charAt(0)=="#"?String.fromCharCode(_36.substring(1)):"&"+_36+";";
}
});
_a.get({url:src,sync:true,load:function(_37){
_33.code+=_37+";";
},error:_33.errBack});
}
};
return _32.replace(/<script\s*(?![^>]*type=['"]?(?:dojo\/|text\/html\b))[^>]*?(?:src=(['"]?)([^>]*?)\1[^>]*)?>([\s\S]*?)<\/script>/gi,function(_38,_39,src,_3a){
if(src){
_35(src);
}else{
_33.code+=_3a;
}
return "";
});
};
var _3b=_c.evalInGlobal=function(_3c,_3d){
_3d=_3d||_b.doc.body;
var n=_3d.ownerDocument.createElement("script");
n.type="text/javascript";
_3d.appendChild(n);
n.text=_3c;
};
_c._ContentSetter=_1(_4._ContentSetter,{adjustPaths:false,referencePath:".",renderStyles:false,executeScripts:false,scriptHasHooks:false,scriptHookReplacement:null,_renderStyles:function(_3e){
this._styleNodes=[];
var st,att,_3f,doc=this.node.ownerDocument;
var _40=doc.getElementsByTagName("head")[0];
for(var i=0,e=_3e.length;i<e;i++){
_3f=_3e[i];
att=_3e.attributes[i];
st=doc.createElement("style");
st.setAttribute("type","text/css");
for(var x in att){
st.setAttribute(x,att[x]);
}
this._styleNodes.push(st);
_40.appendChild(st);
if(st.styleSheet){
st.styleSheet.cssText=_3f;
}else{
st.appendChild(doc.createTextNode(_3f));
}
}
},empty:function(){
this.inherited("empty",arguments);
this._styles=[];
},onBegin:function(){
this.inherited("onBegin",arguments);
var _41=this.content,_42=this.node;
var _43=this._styles;
if(_6.isString(_41)){
if(this.adjustPaths&&this.referencePath){
_41=_1c(this.referencePath,_41);
}
if(this.renderStyles||this.cleanContent){
_41=_25(this.referencePath,_41,_43);
}
if(this.executeScripts){
var _44=this;
var _45={downloadRemote:true,errBack:function(e){
_44._onError.call(_44,"Exec","Error downloading remote script in \""+_44.id+"\"",e);
}};
_41=_31(_41,_45);
this._code=_45.code;
}
}
this.content=_41;
},onEnd:function(){
var _46=this._code,_47=this._styles;
if(this._styleNodes&&this._styleNodes.length){
while(this._styleNodes.length){
_3.destroy(this._styleNodes.pop());
}
}
if(this.renderStyles&&_47&&_47.length){
this._renderStyles(_47);
}
if(this.executeScripts&&_46){
if(this.cleanContent){
_46=_46.replace(/(<!--|(?:\/\/)?-->|<!\[CDATA\[|\]\]>)/g,"");
}
if(this.scriptHasHooks){
_46=_46.replace(/_container_(?!\s*=[^=])/g,this.scriptHookReplacement);
}
try{
_3b(_46,this.node);
}
catch(e){
this._onError("Exec","Error eval script in "+this.id+", "+e.message,e);
}
}
var _48=this.getInherited(arguments),_49=arguments,d=new _2();
_7(_6.hitch(this,function(){
_48.apply(this,_49);
this.parseDeferred.then(function(){
d.resolve();
});
}));
return d.promise;
},tearDown:function(){
this.inherited(arguments);
delete this._styles;
if(this._styleNodes&&this._styleNodes.length){
while(this._styleNodes.length){
_3.destroy(this._styleNodes.pop());
}
}
delete this._styleNodes;
_6.mixin(this,_c._ContentSetter.prototype);
}});
_c.set=function(_4a,_4b,_4c){
if(!_4c){
return _4._setNodeContent(_4a,_4b,true);
}else{
var op=new _c._ContentSetter(_6.mixin(_4c,{content:_4b,node:_4a}));
return op.set();
}
};
return _c;
});
