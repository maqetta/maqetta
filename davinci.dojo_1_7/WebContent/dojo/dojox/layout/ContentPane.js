/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/layout/ContentPane",["dojo","dijit","dojox","dijit/layout/ContentPane","dojox/html/_base"],function(_1,_2,_3){
_1.getObject("dojox.layout.ContentPane",1);
_1.declare("dojox.layout.ContentPane",_2.layout.ContentPane,{adjustPaths:false,cleanContent:false,renderStyles:false,executeScripts:true,scriptHasHooks:false,constructor:function(){
this.ioArgs={};
this.ioMethod=_1.xhrGet;
},onExecError:function(e){
},_setContent:function(_4){
var _5=this._contentSetter;
if(!(_5&&_5 instanceof _3.html._ContentSetter)){
_5=this._contentSetter=new _3.html._ContentSetter({node:this.containerNode,_onError:_1.hitch(this,this._onError),onContentError:_1.hitch(this,function(e){
var _6=this.onContentError(e);
try{
this.containerNode.innerHTML=_6;
}
catch(e){
console.error("Fatal "+this.id+" could not change content due to "+e.message,e);
}
})});
}
this._contentSetterParams={adjustPaths:Boolean(this.adjustPaths&&(this.href||this.referencePath)),referencePath:this.href||this.referencePath,renderStyles:this.renderStyles,executeScripts:this.executeScripts,scriptHasHooks:this.scriptHasHooks,scriptHookReplacement:"dijit.byId('"+this.id+"')"};
this.inherited("_setContent",arguments);
}});
return _1.getObject("dojox.layout.ContentPane");
});
require(["dojox/layout/ContentPane"]);
