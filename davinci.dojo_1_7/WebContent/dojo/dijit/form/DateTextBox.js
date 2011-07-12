/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/DateTextBox",["dojo/_base/kernel","..","../Calendar","./_DateTimeTextBox","dojo/_base/declare"],function(_1,_2){
_1.declare("dijit.form.DateTextBox",_2.form._DateTimeTextBox,{baseClass:"dijitTextBox dijitComboBox dijitDateTextBox",popupClass:"dijit.Calendar",_selector:"date",value:new Date("")});
return _2.form.DateTextBox;
});
