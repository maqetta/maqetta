/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/manager/_ClassMixin",["dojo","dijit","dojox","dojox/form/manager/_Mixin"],function(_1,_2,_3){
_1.getObject("dojox.form.manager._ClassMixin",1);
(function(){
var fm=_3.form.manager,aa=fm.actionAdapter,ia=fm.inspectorAdapter;
_1.declare("dojox.form.manager._ClassMixin",null,{gatherClassState:function(_4,_5){
var _6=this.inspect(ia(function(_7,_8){
return _1.hasClass(_8,_4);
}),_5);
return _6;
},addClass:function(_9,_a){
this.inspect(aa(function(_b,_c){
_1.addClass(_c,_9);
}),_a);
return this;
},removeClass:function(_d,_e){
this.inspect(aa(function(_f,_10){
_1.removeClass(_10,_d);
}),_e);
return this;
}});
})();
return _1.getObject("dojox.form.manager._ClassMixin");
});
require(["dojox/form/manager/_ClassMixin"]);
