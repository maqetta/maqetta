/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/widget/CalendarFx",["dojo","dijit","dojox","dojox/widget/FisheyeLite"],function(_1,_2,_3){
_1.getObject("dojox.widget.CalendarFx",1);
_1.declare("dojox.widget._FisheyeFX",null,{addFx:function(_4,_5){
_1.query(_4,_5).forEach(function(_6){
new _3.widget.FisheyeLite({properties:{fontSize:1.1}},_6);
});
}});
_1.declare("dojox.widget.CalendarFisheye",[_3.widget.Calendar,_3.widget._FisheyeFX],{});
return _1.getObject("dojox.widget.CalendarFx");
});
require(["dojox/widget/CalendarFx"]);
