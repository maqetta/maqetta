/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/tag/date",["dojo/_base/kernel","dojo/_base/lang","../_base","../utils/date"],function(_1,_2,dd,_3){
_1.getObject("dtl.tag.date",true,dojox);
dojox.dtl.tag.date.NowNode=function(_4,_5){
this._format=_4;
this.format=new _3.DateFormat(_4);
this.contents=_5;
};
_1.extend(dojox.dtl.tag.date.NowNode,{render:function(_6,_7){
this.contents.set(this.format.format(new Date()));
return this.contents.render(_6,_7);
},unrender:function(_8,_9){
return this.contents.unrender(_8,_9);
},clone:function(_a){
return new this.constructor(this._format,this.contents.clone(_a));
}});
dojox.dtl.tag.date.now=function(_b,_c){
var _d=_c.split_contents();
if(_d.length!=2){
throw new Error("'now' statement takes one argument");
}
return new dojox.dtl.tag.date.NowNode(_d[1].slice(1,-1),_b.create_text_node());
};
return dojox.dtl.tag.date;
});
