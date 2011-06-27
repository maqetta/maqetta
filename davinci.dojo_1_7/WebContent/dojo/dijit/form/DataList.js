/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/DataList",["dojo/_base/kernel","..","dojo/store/Memory","dojo/_base/NodeList","dojo/_base/declare","dojo/_base/html","dojo/_base/lang","dojo/query"],function(_1,_2){
function _3(_4){
return {id:_4.value,value:_4.value,name:_1.trim(_4.innerText||_4.textContent||"")};
};
_1.declare("dijit.form.DataList",_1.store.Memory,{constructor:function(_5,_6){
this.domNode=_1.byId(_6);
_1._mixin(this,_5);
if(this.id){
_2.registry.add(this);
}
this.domNode.style.display="none";
this.inherited(arguments,[{data:_1.query("option",this.domNode).map(_3)}]);
},destroy:function(){
_2.registry.remove(this.id);
},fetchSelectedItem:function(){
var _7=_1.query("> option[selected]",this.domNode)[0]||_1.query("> option",this.domNode)[0];
return _7&&_3(_7);
}});
return _2.form.DataList;
});
