/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/templates/MenuBarItem.html"]="<div class=\"dijitReset dijitInline dijitMenuItem dijitMenuItemLabel\" dojoAttachPoint=\"focusNode\" role=\"menuitem\" tabIndex=\"-1\"\n\t\tdojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">\n\t<span dojoAttachPoint=\"containerNode\"></span>\n</div>\n";
define("dijit/MenuBarItem",["dojo/_base/kernel",".","dojo/text!./templates/MenuBarItem.html","./MenuItem","dojo/_base/declare"],function(_1,_2,_3){
_1.declare("dijit._MenuBarItemMixin",null,{templateString:_3,_setIconClassAttr:null});
_1.declare("dijit.MenuBarItem",[_2.MenuItem,_2._MenuBarItemMixin],{});
return _2.MenuBarItem;
});
