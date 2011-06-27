/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/ListInput",["dojo","dijit","dojox","dijit/_Widget","dijit/_Templated","dijit/form/_FormWidget","dijit/form/ValidationTextBox","dijit/InlineEditBox","dojo/i18n","dijit/nls/common"],function(_1,_2,_3){
_1.getObject("dojox.form.ListInput",1);
_1.experimental("dojox.form.ListInput");
_1.requireLocalization("dijit","common");
_1.declare("dojox.form.ListInput",[_2.form._FormValueWidget],{constructor:function(){
this._items=[];
if(!_1.isArray(this.delimiter)){
this.delimiter=[this.delimiter];
}
var r="("+this.delimiter.join("|")+")?";
this.regExp="^"+this.regExp+r+"$";
},inputClass:"dojox.form._ListInputInputBox",inputHandler:"onChange",inputProperties:{minWidth:50},submitOnlyValidValue:true,useOnBlur:true,readOnlyInput:false,maxItems:null,showCloseButtonWhenValid:true,showCloseButtonWhenInvalid:true,regExp:".*",delimiter:",",constraints:{},baseClass:"dojoxListInput",type:"select",value:"",templateString:"<div dojoAttachPoint=\"focusNode\" class=\"dijit dijitReset dijitLeft dojoxListInput\"><select dojoAttachpoint=\"_selectNode\" multiple=\"multiple\" class=\"dijitHidden\" ${!nameAttrSetting}></select><ul dojoAttachPoint=\"_listInput\"><li dojoAttachEvent=\"onclick: _onClick\" class=\"dijitInputField dojoxListInputNode dijitHidden\" dojoAttachPoint=\"_inputNode\"></li></ul></div>",useAnim:true,duration:500,easingIn:null,easingOut:null,readOnlyItem:false,useArrowForEdit:true,_items:null,_lastAddedItem:null,_currentItem:null,_input:null,_count:0,postCreate:function(){
this.inherited(arguments);
this._createInputBox();
},_setReadOnlyInputAttr:function(_4){
if(!this._started){
return this._createInputBox();
}
this.readOnlyInput=_4;
this._createInputBox();
},_setReadOnlyItemAttr:function(_5){
if(!this._started){
return;
}
for(var i in this._items){
this._items[i].set("readOnlyItem",_5);
}
},_createInputBox:function(){
_1.toggleClass(this._inputNode,"dijitHidden",this.readOnlyInput);
if(this.readOnlyInput){
return;
}
if(this._input){
return;
}
if(this.inputHandler===null){
console.warn("you must add some handler to connect to input field");
return false;
}
if(_1.isString(this.inputHandler)){
this.inputHandler=this.inputHandler.split(",");
}
if(_1.isString(this.inputProperties)){
this.inputProperties=_1.fromJson(this.inputProperties);
}
var _6=_1.getObject(this.inputClass,false);
this.inputProperties.regExp=this.regExpGen(this.constraints);
this._input=new _6(this.inputProperties);
this._input.startup();
this._inputNode.appendChild(this._input.domNode);
_1.forEach(this.inputHandler,function(_7){
this.connect(this._input,_1.string.trim(_7),"_onHandler");
},this);
this.connect(this._input,"onKeyDown","_inputOnKeyDown");
this.connect(this._input,"onBlur","_inputOnBlur");
},compare:function(_8,_9){
_8=_8.join(",");
_9=_9.join(",");
if(_8>_9){
return 1;
}else{
if(_8<_9){
return -1;
}else{
return 0;
}
}
},add:function(_a){
if(this._count>=this.maxItems&&this.maxItems!==null){
return;
}
this._lastValueReported=this._getValues();
if(!_1.isArray(_a)){
_a=[_a];
}
for(var i in _a){
var _b=_a[i];
if(_b===""||typeof _b!="string"){
continue;
}
this._count++;
var re=new RegExp(this.regExpGen(this.constraints));
this._lastAddedItem=new _3.form._ListInputInputItem({"index":this._items.length,readOnlyItem:this.readOnlyItem,value:_b,regExp:this.regExpGen(this.constraints)});
this._lastAddedItem.startup();
this._testItem(this._lastAddedItem,_b);
this._lastAddedItem.onClose=_1.hitch(this,"_onItemClose",this._lastAddedItem);
this._lastAddedItem.onChange=_1.hitch(this,"_onItemChange",this._lastAddedItem);
this._lastAddedItem.onEdit=_1.hitch(this,"_onItemEdit",this._lastAddedItem);
this._lastAddedItem.onKeyDown=_1.hitch(this,"_onItemKeyDown",this._lastAddedItem);
if(this.useAnim){
_1.style(this._lastAddedItem.domNode,{opacity:0,display:""});
}
this._placeItem(this._lastAddedItem.domNode);
if(this.useAnim){
var _c=_1.fadeIn({node:this._lastAddedItem.domNode,duration:this.duration,easing:this.easingIn}).play();
}
this._items[this._lastAddedItem.index]=this._lastAddedItem;
if(this._onChangeActive&&this.intermediateChanges){
this.onChange(_b);
}
if(this._count>=this.maxItems&&this.maxItems!==null){
break;
}
}
this._updateValues();
if(this._lastValueReported.length==0){
this._lastValueReported=this.value;
}
if(!this.readOnlyInput){
this._input.set("value","");
}
if(this._onChangeActive){
this.onChange(this.value);
}
this._setReadOnlyWhenMaxItemsReached();
},_setReadOnlyWhenMaxItemsReached:function(){
this.set("readOnlyInput",(this._count>=this.maxItems&&this.maxItems!==null));
},_setSelectNode:function(){
this._selectNode.options.length=0;
var _d=this.submitOnlyValidValue?this.get("MatchedValue"):this.value;
if(!_1.isArray(_d)){
return;
}
_1.forEach(_d,function(_e){
this._selectNode.options[this._selectNode.options.length]=new Option(_e,_e,true,true);
},this);
},_placeItem:function(_f){
_1.place(_f,this._inputNode,"before");
},_getCursorPos:function(_10){
if(typeof _10.selectionStart!="undefined"){
return _10.selectionStart;
}
try{
_10.focus();
}
catch(e){
}
var _11=_10.createTextRange();
_11.moveToBookmark(_1.doc.selection.createRange().getBookmark());
_11.moveEnd("character",_10.value.length);
try{
return _10.value.length-_11.text.length;
}
finally{
_11=null;
}
},_onItemClose:function(_12){
if(this.disabled){
return;
}
if(this.useAnim){
var _13=_1.fadeOut({node:_12.domNode,duration:this.duration,easing:this.easingOut,onEnd:_1.hitch(this,"_destroyItem",_12)}).play();
}else{
this._destroyItem(_12);
}
},_onItemKeyDown:function(_14,e){
if(this.readOnlyItem||!this.useArrowForEdit){
return;
}
if(e.keyCode==_1.keys.LEFT_ARROW&&this._getCursorPos(e.target)==0){
this._editBefore(_14);
}else{
if(e.keyCode==_1.keys.RIGHT_ARROW&&this._getCursorPos(e.target)==e.target.value.length){
this._editAfter(_14);
}
}
},_editBefore:function(_15){
this._currentItem=this._getPreviousItem(_15);
if(this._currentItem!==null){
this._currentItem.edit();
}
},_editAfter:function(_16){
this._currentItem=this._getNextItem(_16);
if(this._currentItem!==null){
this._currentItem.edit();
}
if(!this.readOnlyInput){
if(this._currentItem===null){
this._focusInput();
}
}
},_onItemChange:function(_17,_18){
_18=_18||_17.get("value");
this._testItem(_17,_18);
this._updateValues();
},_onItemEdit:function(_19){
_1.removeClass(_19.domNode,["dijitError",this.baseClass+"Match",this.baseClass+"Mismatch"]);
},_testItem:function(_1a,_1b){
var re=new RegExp(this.regExpGen(this.constraints));
var _1c=_1b.match(re);
_1.removeClass(_1a.domNode,this.baseClass+(!_1c?"Match":"Mismatch"));
_1.addClass(_1a.domNode,this.baseClass+(_1c?"Match":"Mismatch"));
_1.toggleClass(_1a.domNode,"dijitError",!_1c);
if((this.showCloseButtonWhenValid&&_1c)||(this.showCloseButtonWhenInvalid&&!_1c)){
_1.addClass(_1a.domNode,this.baseClass+"Closable");
}else{
_1.removeClass(_1a.domNode,this.baseClass+"Closable");
}
},_getValueAttr:function(){
return this.value;
},_setValueAttr:function(_1d){
this._destroyAllItems();
this.add(this._parseValue(_1d));
},_parseValue:function(_1e){
if(typeof _1e=="string"){
if(_1.isString(this.delimiter)){
this.delimiter=[this.delimiter];
}
var re=new RegExp("^.*("+this.delimiter.join("|")+").*");
if(_1e.match(re)){
re=new RegExp(this.delimiter.join("|"));
return _1e.split(re);
}
}
return _1e;
},regExpGen:function(_1f){
return this.regExp;
},_setDisabledAttr:function(_20){
if(!this.readOnlyItem){
for(var i in this._items){
this._items[i].set("disabled",_20);
}
}
if(!this.readOnlyInput){
this._input.set("disabled",_20);
}
this.inherited(arguments);
},_onHandler:function(_21){
var _22=this._parseValue(_21);
if(_1.isArray(_22)){
this.add(_22);
}
},_onClick:function(e){
this._focusInput();
},_focusInput:function(){
if(!this.readOnlyInput&&this._input.focus){
this._input.focus();
}
},_inputOnKeyDown:function(e){
this._currentItem=null;
var val=this._input.get("value");
if(e.keyCode==_1.keys.BACKSPACE&&val==""&&this.get("lastItem")){
this._destroyItem(this.get("lastItem"));
}else{
if(e.keyCode==_1.keys.ENTER&&val!=""){
this.add(val);
}else{
if(e.keyCode==_1.keys.LEFT_ARROW&&this._getCursorPos(this._input.focusNode)==0&&!this.readOnlyItem&&this.useArrowForEdit){
this._editBefore();
}
}
}
},_inputOnBlur:function(){
var val=this._input.get("value");
if(this.useOnBlur&&val!=""){
this.add(val);
}
},_getMatchedValueAttr:function(){
return this._getValues(_1.hitch(this,this._matchValidator));
},_getMismatchedValueAttr:function(){
return this._getValues(_1.hitch(this,this._mismatchValidator));
},_getValues:function(_23){
var _24=[];
_23=_23||this._nullValidator;
for(var i in this._items){
var _25=this._items[i];
if(_25===null){
continue;
}
var _26=_25.get("value");
if(_23(_26)){
_24.push(_26);
}
}
return _24;
},_nullValidator:function(_27){
return true;
},_matchValidator:function(_28){
var re=new RegExp(this.regExpGen(this.constraints));
return _28.match(re);
},_mismatchValidator:function(_29){
var re=new RegExp(this.regExpGen(this.constraints));
return !(_29.match(re));
},_getLastItemAttr:function(){
return this._getSomeItem();
},_getSomeItem:function(_2a,_2b){
_2a=_2a||false;
_2b=_2b||"last";
var _2c=null;
var _2d=-1;
for(var i in this._items){
if(this._items[i]===null){
continue;
}
if(_2b=="before"&&this._items[i]===_2a){
break;
}
_2c=this._items[i];
if(_2b=="first"||_2d==0){
_2d=1;
break;
}
if(_2b=="after"&&this._items[i]===_2a){
_2d=0;
}
}
if(_2b=="after"&&_2d==0){
_2c=null;
}
return _2c;
},_getPreviousItem:function(_2e){
return this._getSomeItem(_2e,"before");
},_getNextItem:function(_2f){
return this._getSomeItem(_2f,"after");
},_destroyItem:function(_30,_31){
this._items[_30.index]=null;
_30.destroy();
this._count--;
if(_31!==false){
this._updateValues();
this._setReadOnlyWhenMaxItemsReached();
}
},_updateValues:function(){
this.value=this._getValues();
this._setSelectNode();
},_destroyAllItems:function(){
for(var i in this._items){
if(this._items[i]==null){
continue;
}
this._destroyItem(this._items[i],false);
}
this._items=[];
this._count=0;
this.value=null;
this._setSelectNode();
this._setReadOnlyWhenMaxItemsReached();
},destroy:function(){
this._destroyAllItems();
this._lastAddedItem=null;
if(!this._input){
this._input.destroy();
}
this.inherited(arguments);
}});
_1.declare("dojox.form._ListInputInputItem",[_2._Widget,_2._Templated],{templateString:"<li class=\"dijit dijitReset dijitLeft dojoxListInputItem\" dojoAttachEvent=\"onclick: onClick\" ><span dojoAttachPoint=\"labelNode\"></span></li>",closeButtonNode:null,readOnlyItem:true,baseClass:"dojoxListInputItem",value:"",regExp:".*",_editBox:null,_handleKeyDown:null,attributeMap:{value:{node:"labelNode",type:"innerHTML"}},postMixInProperties:function(){
var _32=_1.i18n.getLocalization("dijit","common");
_1.mixin(this,_32);
this.inherited(arguments);
},postCreate:function(){
this.inherited(arguments);
this.closeButtonNode=_1.create("span",{"class":"dijitButtonNode dijitDialogCloseIcon",title:this.itemClose,onclick:_1.hitch(this,"onClose"),onmouseenter:_1.hitch(this,"_onCloseEnter"),onmouseleave:_1.hitch(this,"_onCloseLeave")},this.domNode);
_1.create("span",{"class":"closeText",title:this.itemClose,innerHTML:"x"},this.closeButtonNode);
},startup:function(){
this.inherited(arguments);
this._createInlineEditBox();
},_setReadOnlyItemAttr:function(_33){
this.readOnlyItem=_33;
if(!_33){
this._createInlineEditBox();
}else{
if(this._editBox){
this._editBox.set("disabled",true);
}
}
},_createInlineEditBox:function(){
if(this.readOnlyItem){
return;
}
if(!this._started){
return;
}
if(this._editBox){
this._editBox.set("disabled",false);
return;
}
this._editBox=new _2.InlineEditBox({value:this.value,editor:"dijit.form.ValidationTextBox",editorParams:{regExp:this.regExp}},this.labelNode);
this.connect(this._editBox,"edit","_onEdit");
this.connect(this._editBox,"onChange","_onCloseEdit");
this.connect(this._editBox,"onCancel","_onCloseEdit");
},edit:function(){
if(!this.readOnlyItem){
this._editBox.edit();
}
},_onCloseEdit:function(_34){
_1.removeClass(this.closeButtonNode,this.baseClass+"Edited");
_1.disconnect(this._handleKeyDown);
this.onChange(_34);
},_onEdit:function(){
_1.addClass(this.closeButtonNode,this.baseClass+"Edited");
this._handleKeyDown=_1.connect(this._editBox.editWidget,"_onKeyPress",this,"onKeyDown");
this.onEdit();
},_setDisabledAttr:function(_35){
if(!this.readOnlyItem){
this._editBox.set("disabled",_35);
}
},_getValueAttr:function(){
return (!this.readOnlyItem&&this._started?this._editBox.get("value"):this.value);
},destroy:function(){
if(this._editBox){
this._editBox.destroy();
}
this.inherited(arguments);
},_onCloseEnter:function(){
_1.addClass(this.closeButtonNode,"dijitDialogCloseIcon-hover");
},_onCloseLeave:function(){
_1.removeClass(this.closeButtonNode,"dijitDialogCloseIcon-hover");
},onClose:function(){
},onEdit:function(){
},onClick:function(){
},onChange:function(_36){
},onKeyDown:function(_37){
}});
_1.declare("dojox.form._ListInputInputBox",[_2.form.ValidationTextBox],{minWidth:50,intermediateChanges:true,regExp:".*",_sizer:null,onChange:function(_38){
this.inherited(arguments);
if(this._sizer===null){
this._sizer=_1.create("div",{style:{position:"absolute",left:"-10000px",top:"-10000px"}},_1.body());
}
this._sizer.innerHTML=_38;
var w=_1.contentBox(this._sizer).w+this.minWidth;
_1.contentBox(this.domNode,{w:w});
},destroy:function(){
_1.destroy(this._sizer);
this.inherited(arguments);
}});
return _1.getObject("dojox.form.ListInput");
});
require(["dojox/form/ListInput"]);
