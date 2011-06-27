/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/ToolbarSeparator",["dojo/_base/kernel",".","./_Widget","./_TemplatedMixin","dojo/_base/declare","dojo/_base/html"],function(_1,_2){
_1.declare("dijit.ToolbarSeparator",[_2._Widget,_2._TemplatedMixin],{templateString:"<div class=\"dijitToolbarSeparator dijitInline\" role=\"presentation\"></div>",buildRendering:function(){
this.inherited(arguments);
_1.setSelectable(this.domNode,false);
},isFocusable:function(){
return false;
}});
return _2.ToolbarSeparator;
});
