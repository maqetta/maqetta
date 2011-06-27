/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/Textarea",["dojo/_base/kernel","..","./SimpleTextarea","./_ExpandingTextAreaMixin","dojo/_base/html"],function(_1,_2){
_1.declare("dijit.form.Textarea",[_2.form.SimpleTextarea,_2.form._ExpandingTextAreaMixin],{baseClass:"dijitTextBox dijitTextArea dijitExpandingTextArea",cols:"",buildRendering:function(){
this.inherited(arguments);
_1.style(this.textbox,{overflowY:"hidden",overflowX:"auto",boxSizing:"border-box",MsBoxSizing:"border-box",WebkitBoxSizing:"border-box",MozBoxSizing:"border-box"});
}});
return _2.form.Textarea;
});
