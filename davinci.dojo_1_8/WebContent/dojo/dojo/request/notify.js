/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/request/notify",["../topic"],function(_1){var _2=0;var _3={send:function(_4){if(!_2){_1.publish("/dojo/request/start");}_2++;_1.publish("/dojo/request/send",_4);},load:function(_5){_1.publish("/dojo/request/load",_5);_3.done(_5);},error:function(_6){_1.publish("/dojo/request/error",_6);_3.done(_6);},done:function(_7){_1.publish("/dojo/request/done",_7);_2--;if(_2<=0){_2=0;_1.publish("/dojo/request/stop");}}};return _3;});