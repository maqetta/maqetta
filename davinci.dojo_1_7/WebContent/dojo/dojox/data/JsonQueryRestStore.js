/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/JsonQueryRestStore",["dojo","dojox","dojox/data/JsonRestStore","dojox/data/util/JsonQuery","dojox.data.ClientFilter","dojox.json.query"],function(_1,_2){
_1.declare("dojox.data.JsonQueryRestStore",[_2.data.JsonRestStore,_2.data.util.JsonQuery],{matchesQuery:function(_3,_4){
return _3.__id&&(_3.__id.indexOf("#")==-1)&&this.inherited(arguments);
}});
return _2.data.JsonQueryRestStore;
});
