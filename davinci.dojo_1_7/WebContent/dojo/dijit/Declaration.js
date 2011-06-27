/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/Declaration",["dojo/_base/kernel",".","./_Widget","./_TemplatedMixin","./_WidgetsInTemplateMixin","dojo/_base/NodeList","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/parser","dojo/query"],function(_1,_2){
_1.declare("dijit.Declaration",_2._Widget,{_noScript:true,stopParser:true,widgetClass:"",defaults:null,mixins:[],buildRendering:function(){
var _3=this.srcNodeRef.parentNode.removeChild(this.srcNodeRef),_4=_1.query("> script[type^='dojo/method']",_3).orphan(),_5=_1.query("> script[type^='dojo/connect']",_3).orphan(),_6=_3.nodeName;
var _7=this.defaults||{};
_1.forEach(_4,function(s){
var _8=s.getAttribute("event")||s.getAttribute("data-dojo-event"),_9=_1.parser._functionFromScript(s);
if(_8){
_7[_8]=_9;
}else{
_5.push(s);
}
});
this.mixins=this.mixins.length?_1.map(this.mixins,function(_a){
return _1.getObject(_a);
}):[_2._Widget,_2._TemplatedMixin,_2._WidgetsInTemplateMixin];
_7._skipNodeCache=true;
_7.templateString="<"+_6+" class='"+_3.className+"' dojoAttachPoint='"+(_3.getAttribute("dojoAttachPoint")||"")+"' dojoAttachEvent='"+(_3.getAttribute("dojoAttachEvent")||"")+"' >"+_3.innerHTML.replace(/\%7B/g,"{").replace(/\%7D/g,"}")+"</"+_6+">";
_1.query("[dojoType]",_3).forEach(function(_b){
_b.removeAttribute("dojoType");
});
var wc=_1.declare(this.widgetClass,this.mixins,_7);
_1.forEach(_5,function(s){
var _c=s.getAttribute("event")||s.getAttribute("data-dojo-event")||"postscript",_d=_1.parser._functionFromScript(s);
_1.connect(wc.prototype,_c,_d);
});
}});
return _2.Declaration;
});
