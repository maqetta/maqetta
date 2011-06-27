/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/MultiComboBox",["dojo","dijit","dojox","dijit/form/ComboBox","dijit/form/ValidationTextBox"],function(_1,_2,_3){
_1.getObject("dojox.form.MultiComboBox",1);
_1.experimental("dojox.form.MultiComboBox");
_1.declare("dojox.form.MultiComboBox",[_2.form.ValidationTextBox,_2.form.ComboBoxMixin],{delimiter:",",_previousMatches:false,_setValueAttr:function(_4){
if(this.delimiter&&_4.length!=0){
_4=_4+this.delimiter+" ";
arguments[0]=this._addPreviousMatches(_4);
}
this.inherited(arguments);
},_addPreviousMatches:function(_5){
if(this._previousMatches){
if(!_5.match(new RegExp("^"+this._previousMatches))){
_5=this._previousMatches+_5;
}
_5=this._cleanupDelimiters(_5);
}
return _5;
},_cleanupDelimiters:function(_6){
if(this.delimiter){
_6=_6.replace(new RegExp("  +")," ");
_6=_6.replace(new RegExp("^ *"+this.delimiter+"* *"),"");
_6=_6.replace(new RegExp(this.delimiter+" *"+this.delimiter),this.delimiter);
}
return _6;
},_autoCompleteText:function(_7){
arguments[0]=this._addPreviousMatches(_7);
this.inherited(arguments);
},_startSearch:function(_8){
_8=this._cleanupDelimiters(_8);
var re=new RegExp("^.*"+this.delimiter+" *");
if((this._previousMatches=_8.match(re))){
arguments[0]=_8.replace(re,"");
}
this.inherited(arguments);
}});
return _1.getObject("dojox.form.MultiComboBox");
});
require(["dojox/form/MultiComboBox"]);
