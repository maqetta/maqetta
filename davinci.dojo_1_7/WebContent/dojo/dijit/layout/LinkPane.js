/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/layout/LinkPane",["dojo/_base/kernel","..","./ContentPane","../_TemplatedMixin","dojo/_base/declare"],function(_1,_2){
_1.declare("dijit.layout.LinkPane",[_2.layout.ContentPane,_2._TemplatedMixin],{templateString:"<div class=\"dijitLinkPane\" dojoAttachPoint=\"containerNode\"></div>",postMixInProperties:function(){
if(this.srcNodeRef){
this.title+=this.srcNodeRef.innerHTML;
}
this.inherited(arguments);
},_fillContent:function(_3){
}});
return _2.layout.LinkPane;
});
