/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mvc/Output",["dojo/_base/declare","dojo/_base/lang","dijit/_WidgetBase"],function(_1,_2,_3){
return _1("dojox.mvc.Output",[_3],{templateString:"",postscript:function(_4,_5){
this.srcNodeRef=dojo.byId(_5);
if(this.srcNodeRef){
this.templateString=this.srcNodeRef.innerHTML;
this.srcNodeRef.innerHTML="";
}
this.inherited(arguments);
},set:function(_6,_7){
this.inherited(arguments);
if(_6==="value"){
this._output();
}
},_updateBinding:function(_8,_9,_a){
this.inherited(arguments);
this._output();
},_output:function(){
var _b=this.srcNodeRef||this.domNode;
_b.innerHTML=this.templateString?this._exprRepl(this.templateString):this.value;
},_exprRepl:function(_c){
var _d=this,_e=function(_f,key){
if(!_f){
return "";
}
var exp=_f.substr(2);
exp=exp.substr(0,exp.length-1);
return eval(exp,_d)||"";
};
_e=_2.hitch(this,_e);
return _c.replace(/\$\{.*?\}/g,function(_10,key,_11){
return _e(_10,key).toString();
});
}});
});
