/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*global define eclipse window handleAuthenticationError localStorage*/
 /*
	Authentication and authorization error handling. Adds methods that handle 401 and 403 responses for 
	XHR calls.

	To handle 401 and 403 error add the following line to 'error' function in your service request,
		handleAuthenticationError(error, <optional retry function>)

 */

define([], function() {


	/**
	 * Handles authentication problems coming from remote xhr service calls.
	 * @param error The error object returned by xhr
	 * @param retry A function to invoke after authentication to retry the server request.
	 */
	function handleAuthenticationError(error, retry) {
		if (error.status === 403) { 
			
		} else if (error.status === 401) { 
		
		} else{
		}
		
	}
	return {
		handleAuthenticationError : handleAuthenticationError
	};

});