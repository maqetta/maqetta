/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/xml/widgetParser",["dojo/_base/window","dojo/query","dojox/xml/parser","dojo/parser","dojo/_base/sniff"],function(_1,_2,_3,_4){
_1.getObject("xml.widgetParser",true,dojox);
dojox.xml.widgetParser=new function(){
var d=_1;
this.parseNode=function(_5){
var _6=[];
d.query("script[type='text/xml']",_5).forEach(function(_7){
_6.push.apply(_6,this._processScript(_7));
},this).orphan();
return d.parser.instantiate(_6);
};
this._processScript=function(_8){
var _9=_8.src?d._getText(_8.src):_8.innerHTML||_8.firstChild.nodeValue;
var _a=this.toHTML(dojox.xml.parser.parse(_9).firstChild);
var _b=d.query("[dojoType]",_a);
_2(">",_a).place(_8,"before");
_8.parentNode.removeChild(_8);
return _b;
};
this.toHTML=function(_c){
var _d;
var _e=_c.nodeName;
var dd=_1.doc;
var _f=_c.nodeType;
if(_f>=3){
return dd.createTextNode((_f==3||_f==4)?_c.nodeValue:"");
}
var _10=_c.localName||_e.split(":").pop();
var _11=_c.namespaceURI||(_c.getNamespaceUri?_c.getNamespaceUri():"");
if(_11=="html"){
_d=dd.createElement(_10);
}else{
var _12=_11+"."+_10;
_d=_d||dd.createElement((_12=="dijit.form.ComboBox")?"select":"div");
_d.setAttribute("dojoType",_12);
}
d.forEach(_c.attributes,function(_13){
var _14=_13.name||_13.nodeName;
var _15=_13.value||_13.nodeValue;
if(_14.indexOf("xmlns")!=0){
if(_1.isIE&&_14=="style"){
_d.style.setAttribute("cssText",_15);
}else{
_d.setAttribute(_14,_15);
}
}
});
d.forEach(_c.childNodes,function(cn){
var _16=this.toHTML(cn);
if(_10=="script"){
_d.text+=_16.nodeValue;
}else{
_d.appendChild(_16);
}
},this);
return _d;
};
}();
return dojox.xml.widgetParser;
});
