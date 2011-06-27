/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/Toolbar",["dojo/_base/kernel",".","require","./_Widget","./_KeyNavContainer","./_TemplatedMixin","dojo/_base/connect","dojo/_base/declare"],function(_1,_2,_3){
_1.declare("dijit.Toolbar",[_2._Widget,_2._TemplatedMixin,_2._KeyNavContainer],{templateString:"<div class=\"dijit\" role=\"toolbar\" tabIndex=\"${tabIndex}\" dojoAttachPoint=\"containerNode\">"+"</div>",baseClass:"dijitToolbar",postCreate:function(){
this.inherited(arguments);
this.connectKeyNavHandlers(this.isLeftToRight()?[_1.keys.LEFT_ARROW]:[_1.keys.RIGHT_ARROW],this.isLeftToRight()?[_1.keys.RIGHT_ARROW]:[_1.keys.LEFT_ARROW]);
}});
if(!_1.isAsync){
_1.ready(0,function(){
var _4=["dijit/ToolbarSeparator"];
_3(_4);
});
}
return _2.Toolbar;
});
