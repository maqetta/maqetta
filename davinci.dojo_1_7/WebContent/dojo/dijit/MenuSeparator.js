/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/templates/MenuSeparator.html"]="<tr class=\"dijitMenuSeparator\">\n\t<td class=\"dijitMenuSeparatorIconCell\">\n\t\t<div class=\"dijitMenuSeparatorTop\"></div>\n\t\t<div class=\"dijitMenuSeparatorBottom\"></div>\n\t</td>\n\t<td colspan=\"3\" class=\"dijitMenuSeparatorLabelCell\">\n\t\t<div class=\"dijitMenuSeparatorTop dijitMenuSeparatorLabel\"></div>\n\t\t<div class=\"dijitMenuSeparatorBottom\"></div>\n\t</td>\n</tr>";
define("dijit/MenuSeparator",["dojo/_base/kernel",".","dojo/text!./templates/MenuSeparator.html","./_WidgetBase","./_TemplatedMixin","./_Contained","dojo/_base/declare","dojo/_base/html"],function(_1,_2,_3){
_1.declare("dijit.MenuSeparator",[_2._WidgetBase,_2._TemplatedMixin,_2._Contained],{templateString:_3,buildRendering:function(){
this.inherited(arguments);
_1.setSelectable(this.domNode,false);
},isFocusable:function(){
return false;
}});
return _2.MenuSeparator;
});
