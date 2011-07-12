/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/ToggleButton",["dojo/_base/kernel","..","./Button","./_ToggleButtonMixin","dojo/_base/declare"],function(_1,_2){
_1.declare("dijit.form.ToggleButton",[_2.form.Button,_2.form._ToggleButtonMixin],{baseClass:"dijitToggleButton",setChecked:function(_3){
_1.deprecated("setChecked("+_3+") is deprecated. Use set('checked',"+_3+") instead.","","2.0");
this.set("checked",_3);
}});
return _2.form.ToggleButton;
});
