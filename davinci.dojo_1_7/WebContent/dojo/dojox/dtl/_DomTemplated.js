/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/_DomTemplated",["dojo/_base/kernel","dojo/_base/html",".","./contrib/dijit","./render/dom","dojo/cache","dijit/_Templated"],function(_1,_2,_3,_4,_5){
_3._DomTemplated=function(){
};
_3._DomTemplated.prototype={_dijitTemplateCompat:false,buildRendering:function(){
this.domNode=this.srcNodeRef;
if(!this._render){
var _6=_4.widgetsInTemplate;
_4.widgetsInTemplate=this.widgetsInTemplate;
this.template=this.template||this._getCachedTemplate(this.templatePath,this.templateString);
this._render=new _5.Render(this.domNode,this.template);
_4.widgetsInTemplate=_6;
}
var _7=this._getContext();
if(!this._created){
delete _7._getter;
}
this.render(_7);
this.domNode=this.template.getRootNode();
if(this.srcNodeRef&&this.srcNodeRef.parentNode){
_1.destroy(this.srcNodeRef);
delete this.srcNodeRef;
}
},setTemplate:function(_8,_9){
if(dojox.dtl.text._isTemplate(_8)){
this.template=this._getCachedTemplate(null,_8);
}else{
this.template=this._getCachedTemplate(_8);
}
this.render(_9);
},render:function(_a,_b){
if(_b){
this.template=_b;
}
this._render.render(this._getContext(_a),this.template);
},_getContext:function(_c){
if(!(_c instanceof dojox.dtl.Context)){
_c=false;
}
_c=_c||new dojox.dtl.Context(this);
_c.setThis(this);
return _c;
},_getCachedTemplate:function(_d,_e){
if(!this._templates){
this._templates={};
}
if(!_e){
_e=_1.cache(_d,{sanitize:true});
}
var _f=_e;
var _10=this._templates;
if(_10[_f]){
return _10[_f];
}
return (_10[_f]=new dojox.dtl.DomTemplate(dijit._TemplatedMixin.getCachedTemplate(_e,true)));
}};
return dojox.dtl._DomTemplated;
});
