/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/widget/Wizard",["dojo","dijit","dojox","dijit/layout/StackContainer","dijit/layout/ContentPane","dijit/form/Button","dojo/i18n","dojo/i18n","dijit/nls/common","dojo/i18n","dojox/widget/nls/Wizard"],function(_1,_2,_3){
_1.getObject("dojox.widget.Wizard",1);
_1.requireLocalization("dijit","common");
_1.requireLocalization("dojox.widget","Wizard");
_1.declare("dojox.widget.Wizard",[_2.layout.StackContainer,_2._Templated],{widgetsInTemplate:true,templateString:_1.cache("dojox.widget","Wizard/Wizard.html","<div class=\"dojoxWizard\" dojoAttachPoint=\"wizardNode\">\n    <div class=\"dojoxWizardContainer\" dojoAttachPoint=\"containerNode\"></div>\n    <div class=\"dojoxWizardButtons\" dojoAttachPoint=\"wizardNav\">\n        <button dojoType=\"dijit.form.Button\" type=\"button\" dojoAttachPoint=\"previousButton\">${previousButtonLabel}</button>\n        <button dojoType=\"dijit.form.Button\" type=\"button\" dojoAttachPoint=\"nextButton\">${nextButtonLabel}</button>\n        <button dojoType=\"dijit.form.Button\" type=\"button\" dojoAttachPoint=\"doneButton\" style=\"display:none\">${doneButtonLabel}</button>\n        <button dojoType=\"dijit.form.Button\" type=\"button\" dojoAttachPoint=\"cancelButton\">${cancelButtonLabel}</button>\n    </div>\n</div>\n"),nextButtonLabel:"",previousButtonLabel:"",cancelButtonLabel:"",doneButtonLabel:"",cancelFunction:null,hideDisabled:false,postMixInProperties:function(){
this.inherited(arguments);
var _4=_1.mixin({cancel:_1.i18n.getLocalization("dijit","common",this.lang).buttonCancel},_1.i18n.getLocalization("dojox.widget","Wizard",this.lang));
var _5;
for(_5 in _4){
if(!this[_5+"ButtonLabel"]){
this[_5+"ButtonLabel"]=_4[_5];
}
}
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
this.connect(this.nextButton,"onClick","_forward");
this.connect(this.previousButton,"onClick","back");
if(this.cancelFunction){
if(_1.isString(this.cancelFunction)){
this.cancelFunction=_1.getObject(this.cancelFunction);
}
this.connect(this.cancelButton,"onClick",this.cancelFunction);
}else{
this.cancelButton.domNode.style.display="none";
}
this.connect(this.doneButton,"onClick","done");
this._subscription=_1.subscribe(this.id+"-selectChild",_1.hitch(this,"_checkButtons"));
this._started=true;
},resize:function(){
this.inherited(arguments);
this._checkButtons();
},_checkButtons:function(){
var sw=this.selectedChildWidget;
var _6=sw.isLastChild;
this.nextButton.set("disabled",_6);
this._setButtonClass(this.nextButton);
if(sw.doneFunction){
this.doneButton.domNode.style.display="";
if(_6){
this.nextButton.domNode.style.display="none";
}
}else{
this.doneButton.domNode.style.display="none";
}
this.previousButton.set("disabled",!this.selectedChildWidget.canGoBack);
this._setButtonClass(this.previousButton);
},_setButtonClass:function(_7){
_7.domNode.style.display=(this.hideDisabled&&_7.disabled)?"none":"";
},_forward:function(){
if(this.selectedChildWidget._checkPass()){
this.forward();
}
},done:function(){
this.selectedChildWidget.done();
},destroy:function(){
_1.unsubscribe(this._subscription);
this.inherited(arguments);
}});
_1.declare("dojox.widget.WizardPane",_2.layout.ContentPane,{canGoBack:true,passFunction:null,doneFunction:null,startup:function(){
this.inherited(arguments);
if(this.isFirstChild){
this.canGoBack=false;
}
if(_1.isString(this.passFunction)){
this.passFunction=_1.getObject(this.passFunction);
}
if(_1.isString(this.doneFunction)&&this.doneFunction){
this.doneFunction=_1.getObject(this.doneFunction);
}
},_onShow:function(){
if(this.isFirstChild){
this.canGoBack=false;
}
this.inherited(arguments);
},_checkPass:function(){
var r=true;
if(this.passFunction&&_1.isFunction(this.passFunction)){
var _8=this.passFunction();
switch(typeof _8){
case "boolean":
r=_8;
break;
case "string":
alert(_8);
r=false;
break;
}
}
return r;
},done:function(){
if(this.doneFunction&&_1.isFunction(this.doneFunction)){
this.doneFunction();
}
}});
return _1.getObject("dojox.widget.Wizard");
});
require(["dojox/widget/Wizard"]);
