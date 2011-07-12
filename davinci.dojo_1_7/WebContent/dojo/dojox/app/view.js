/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/app/view",["dojo","dijit","dojox","dijit/_WidgetBase","dijit/_Container","dijit/_Contained","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin"],function(_1,_2,_3,_4,_5,_6,_7,_8){
return _1.declare("dojox.app.view",[_4,_7,_5,_6,_8],{selected:false,keepScrollPosition:true,baseClass:"applicationView mblView",config:null,widgetsInTemplate:true,templateString:"<div></div>",toString:function(){
return this.id;
},activate:function(){
},deactivate:function(){
},getParent:function(){
return null;
}});
});
