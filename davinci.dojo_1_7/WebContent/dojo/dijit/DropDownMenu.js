/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/templates/Menu.html"]="<table class=\"dijit dijitMenu dijitMenuPassive dijitReset dijitMenuTable\" role=\"menu\" tabIndex=\"${tabIndex}\" dojoAttachEvent=\"onkeypress:_onKeyPress\" cellspacing=\"0\">\n\t<tbody class=\"dijitReset\" dojoAttachPoint=\"containerNode\"></tbody>\n</table>\n";
define("dijit/DropDownMenu",["dojo/_base/kernel",".","dojo/text!./templates/Menu.html","./_OnDijitClickMixin","./_MenuBase","dojo/_base/connect","dojo/_base/declare","dojo/_base/event"],function(_1,_2,_3){
_1.declare("dijit.DropDownMenu",[_2._MenuBase,_2._OnDijitClickMixin],{templateString:_3,baseClass:"dijitMenu",postCreate:function(){
var k=_1.keys,l=this.isLeftToRight();
this._openSubMenuKey=l?k.RIGHT_ARROW:k.LEFT_ARROW;
this._closeSubMenuKey=l?k.LEFT_ARROW:k.RIGHT_ARROW;
this.connectKeyNavHandlers([k.UP_ARROW],[k.DOWN_ARROW]);
},_onKeyPress:function(_4){
if(_4.ctrlKey||_4.altKey){
return;
}
switch(_4.charOrCode){
case this._openSubMenuKey:
this._moveToPopup(_4);
_1.stopEvent(_4);
break;
case this._closeSubMenuKey:
if(this.parentMenu){
if(this.parentMenu._isMenuBar){
this.parentMenu.focusPrev();
}else{
this.onCancel(false);
}
}else{
_1.stopEvent(_4);
}
break;
}
}});
return _2.DropDownMenu;
});
