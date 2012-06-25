/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/promise/CancelError",[],function(){function _1(_2){Error.captureStackTrace&&Error.captureStackTrace(this,_1);this.message=_2||"The deferred was cancelled.";this.name="CancelError";};_1.prototype=new Error;_1.prototype.constructor=_1;return _1;});