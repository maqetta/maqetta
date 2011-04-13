dojo.provide("dojox.gfx");

dojo.require("dojox.gfx.matrix");
dojo.require("dojox.gfx._base");

dojo.loadInit(function(){
	//Since loaderInit can be fired before any dojo.provide/require calls,
	//make sure the dojox.gfx object exists and only run this logic if dojox.gfx.renderer
	//has not been defined yet.
	var gfx = dojo.getObject("dojox.gfx", true), sl, flag, match;
	if(!gfx.renderer){
		//Have a way to force a GFX renderer, if so desired.
		//Useful for being able to serialize GFX data in a particular format.
		if(dojo.config.forceGfxRenderer){
			dojox.gfx.renderer = dojo.config.forceGfxRenderer;
			return;
		}
		var renderers = (typeof dojo.config.gfxRenderer == "string" ?
			dojo.config.gfxRenderer : "svg,vml,silverlight,canvas").split(",");

		// mobile platform detection
		// TODO: move to the base?

		var ua = navigator.userAgent, iPhoneOsBuild = 0, androidVersion = 0;
		if(dojo.isSafari >= 3){
			// detect mobile version of WebKit starting with "version 3"

			//	comprehensive iPhone test.  Have to figure out whether it's SVG or Canvas based on the build.
			//	iPhone OS build numbers from en.wikipedia.org.
			if(ua.indexOf("iPhone") >= 0 || ua.indexOf("iPod") >= 0){
				//	grab the build out of this.  Expression is a little nasty because we want
				//		to be sure we have the whole version string.
				match = ua.match(/Version\/(\d(\.\d)?(\.\d)?)\sMobile\/([^\s]*)\s?/);
				if(match){
					//	grab the build out of the match.  Only use the first three because of specific builds.
					iPhoneOsBuild = parseInt(match[4].substr(0,3), 16);
				}
			}
		}
		if(dojo.isWebKit){
			// Android detection
			if(!iPhoneOsBuild){
				match = ua.match(/Android\s+(\d+\.\d+)/);
				if(match){
					androidVersion = parseFloat(match[1]);
					// Android 1.0-1.1 doesn't support SVG but supports Canvas
				}
			}
		}

		for(var i = 0; i < renderers.length; ++i){
			switch(renderers[i]){
				case "svg":
					//	iPhone OS builds greater than 5F1 should have SVG.
					if(!dojo.isIE && (!iPhoneOsBuild || iPhoneOsBuild >= 0x5f1) && !androidVersion && !dojo.isAIR){
						dojox.gfx.renderer = "svg";
					}
					break;
				case "vml":
					if(dojo.isIE){
						dojox.gfx.renderer = "vml";
					}
					break;
				case "silverlight":
					try{
						if(dojo.isIE){
							sl = new ActiveXObject("AgControl.AgControl");
							if(sl && sl.IsVersionSupported("1.0")){
								flag = true;
							}
						}else{
							if(navigator.plugins["Silverlight Plug-In"]){
								flag = true;
							}
						}
					}catch(e){
						flag = false;
					}finally{
						sl = null;
					}
					if(flag){ dojox.gfx.renderer = "silverlight"; }
					break;
				case "canvas":
					//TODO: need more comprehensive test for Canvas
					if(!dojo.isIE){
						dojox.gfx.renderer = "canvas";
					}
					break;
			}
			if(dojox.gfx.renderer){ break; }
		}
		if(dojo.config.isDebug){
			console.log("gfx renderer = " + dojox.gfx.renderer);
		}
	}
});

// include a renderer conditionally
dojo.requireIf(dojox.gfx.renderer == "svg", "dojox.gfx.svg");
dojo.requireIf(dojox.gfx.renderer == "vml", "dojox.gfx.vml");
dojo.requireIf(dojox.gfx.renderer == "silverlight", "dojox.gfx.silverlight");
dojo.requireIf(dojox.gfx.renderer == "canvas", "dojox.gfx.canvas");
