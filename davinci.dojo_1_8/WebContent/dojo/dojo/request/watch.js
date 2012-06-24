/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/request/watch",["./util","../_base/array","../_base/window","../has!host-browser?dom-addeventlistener?:../on:"],function(_1,_2,_3,on){var _4=null,_5=[];function _6(){var _7=+(new Date);for(var i=0,_8;i<_5.length&&(_8=_5[i]);i++){var _9=_8.response,_a=_9.options;if(_8.canceled||(_8.isCancelled&&_8.isCanceled())||(_8.isValid&&!_8.isValid(_9))){_5.splice(i--,1);_b._onAction&&_b._onAction();}else{if(_8.isReady&&_8.isReady(_9)){_5.splice(i--,1);_8.handleResponse(_9);_b._onAction&&_b._onAction();}else{if(_8.startTime){if(_8.startTime+(_a.timeout||0)<_7){_5.splice(i--,1);_9.error=new Error("timeout exceeded");_9.error.dojoType="timeout";_8.cancel();_b._onAction&&_b._onAction();}}}}}_b._onInFlight&&_b._onInFlight(_8);if(!_5.length){clearInterval(_4);_4=null;}};function _b(_c){if(_c.response.options.timeout){_c.startTime=+(new Date);}_5.push(_c);if(!_4){_4=setInterval(_6,50);}if(_c.response.options.sync){_6();}};_b.cancelAll=function cancelAll(){try{_2.forEach(_5,function(_d){try{_d.cancel();}catch(e){}});}catch(e){}};if(_3&&on&&_3.doc.attachEvent){on(_3.global,"unload",function(){_b.cancelAll();});}return _b;});