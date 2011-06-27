/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/manager/_EnableMixin",["dojo","dijit","dojox","dojox/form/manager/_Mixin"],function(_1,_2,_3){
_1.getObject("dojox.form.manager._EnableMixin",1);
(function(){
var fm=_3.form.manager,aa=fm.actionAdapter,ia=fm.inspectorAdapter;
_1.declare("dojox.form.manager._EnableMixin",null,{gatherEnableState:function(_4){
var _5=this.inspectFormWidgets(ia(function(_6,_7){
return !_7.get("disabled");
}),_4);
if(this.inspectFormNodes){
_1.mixin(_5,this.inspectFormNodes(ia(function(_8,_9){
return !_1.attr(_9,"disabled");
}),_4));
}
return _5;
},enable:function(_a,_b){
if(arguments.length<2||_b===undefined){
_b=true;
}
this.inspectFormWidgets(aa(function(_c,_d,_e){
_d.set("disabled",!_e);
}),_a,_b);
if(this.inspectFormNodes){
this.inspectFormNodes(aa(function(_f,_10,_11){
_1.attr(_10,"disabled",!_11);
}),_a,_b);
}
return this;
},disable:function(_12){
var _13=this.gatherEnableState();
this.enable(_12,false);
return _13;
}});
})();
return _1.getObject("dojox.form.manager._EnableMixin");
});
require(["dojox/form/manager/_EnableMixin"]);
