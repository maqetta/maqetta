/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*global define eclipse document*/

define(["orion/xhr", "orion/plugin", "domReady!"], function(xhr, PluginProvider) {
	var provider = new PluginProvider();

	function qualifyURL(url) {
		var a = document.createElement('a');
		a.href = url; // set string url
		return a.href;
	}

//	function fullPath(item){
//		var path = "";
//		var parent = item[0];
//		var first = true;
//		
//		while(parent!=null && !parent.hasOwnProperty("Projects")){
//			path = parent.Name + (first?"":"/") + path;
//			first = false;
//			parent = parent.parent;
//		}
//		return path;
//	}

	/* this needs to change to registerService with newer versions of orion */
	provider.registerServiceProvider('orion.navigate.command', null, {
		uriTemplate: "{OrionHome}/maqetta/cmd/configProject?orionProject={Location}",
		id: 'orion.maqetta.launch',
		name: 'Open in Maqetta',
		tooltip: 'Open this folder in Maqetta',
		validationProperties: [{source: "Directory", match: true}],
		forceSingleItem: true
	});
	provider.connect();
});