define(["dojo", "dojox", "dojo/data/ItemFileReadStore" /*"dojo/data/util/simpleFetch"*/, "dojo/io/script", /*"dojo/data/util",*/  "dojo/date/stamp"], function(dojo, dojox) {

dojo.declare("dojox.data.ItemJsonpReadStore", dojo.data.ItemFileReadStore /*null*/,{

	constructor: function(/* Object */ keywordParameters){

/*		if(keywordParameters.jsonpcallback == undefined){
			throw new Error("dojox.data.ItemJsonpReadStore:  Missing required paramater 'jsonpCallback' ");
		}
		this._jsonpCallback = keywordParameters.jsonpcallback;*/
		if(keywordParameters.jsonpcallback){
			this._jsonpCallback = keywordParameters.jsonpcallback;
		}
		
		this.inherited(arguments);
	},
	



	_fetchItems: function(	/* Object */ keywordArgs,
							/* Function */ findCallback,
							/* Function */ errorCallback){
		//	summary:
		//		See dojo.data.util.simpleFetch.fetch()

		if (!this._jsonpCallback) {
			this.inherited(arguments);
		}else {
			var self = this,
			    filter = function(requestArgs, arrayOfItems){
				var items = [],
				    i, key;
				if(requestArgs.query){
					var value,
					    ignoreCase = requestArgs.queryOptions ? requestArgs.queryOptions.ignoreCase : false;
	
					//See if there are any string values that can be regexp parsed first to avoid multiple regexp gens on the
					//same value for each item examined.  Much more efficient.
					var regexpList = {};
					for(key in requestArgs.query){
						value = requestArgs.query[key];
						if(typeof value === "string"){
							regexpList[key] = dojo.data.util.filter.patternToRegExp(value, ignoreCase);
						}else if(value instanceof RegExp){
							regexpList[key] = value;
						}
					}
					for(i = 0; i < arrayOfItems.length; ++i){
						var match = true;
						var candidateItem = arrayOfItems[i];
						if(candidateItem === null){
							match = false;
						}else{
							for(key in requestArgs.query){
								value = requestArgs.query[key];
								if(!self._containsValue(candidateItem, key, value, regexpList[key])){
									match = false;
								}
							}
						}
						if(match){
							items.push(candidateItem);
						}
					}
					findCallback(items, requestArgs);
				}else{
					// We want a copy to pass back in case the parent wishes to sort the array.
					// We shouldn't allow resort of the internal list, so that multiple callers
					// can get lists and sort without affecting each other.  We also need to
					// filter out any null values that have been left as a result of deleteItem()
					// calls in ItemFileWriteStore.
					for(i = 0; i < arrayOfItems.length; ++i){
						var item = arrayOfItems[i];
						if(item !== null){
							items.push(item);
						}
					}
					findCallback(items, requestArgs);
				}
			};
	
			if(this._loadFinished){
				filter(keywordArgs, this._getItemsArray(keywordArgs.queryOptions));
			}else{
				//Do a check on the JsonFileUrl and crosscheck it.
				//If it doesn't match the cross-check, it needs to be updated
				//This allows for either url or _jsonFileUrl to he changed to
				//reset the store load location.  Done this way for backwards
				//compatibility.  People use _jsonFileUrl (even though officially
				//private.
				if(this._jsonFileUrl !== this._ccUrl){
					dojo.deprecated("dojox.data.ItemJsonpReadStore: ",
						"To change the url, set the url property of the store," +
						" not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
					this._ccUrl = this._jsonFileUrl;
					this.url = this._jsonFileUrl;
				}else if(this.url !== this._ccUrl){
					this._jsonFileUrl = this.url;
					this._ccUrl = this.url;
				}
	
				//See if there was any forced reset of data.
				if(this.data != null){
					this._jsonData = this.data;
					this.data = null;
				}
	
				if(this._jsonFileUrl){
					//If fetches come in before the loading has finished, but while
					//a load is in progress, we have to defer the fetching to be
					//invoked in the callback.
					if(this._loadInProgress){
						this._queuedFetches.push({args: keywordArgs, filter: filter});
					}else{
						this._loadInProgress = true;
						/////////////////////////////////////////////////////////////////////////////////////////
						 //The parameters to pass to , the url, how to handle it, and the callbacks.
		                var jsonpArgs = {
		                    url: self._jsonFileUrl, //"http://localhost:8081/test4/TestService",
		                    callbackParamName: this._jsonpCallback, //"callback",
	/*	                    content: {
		                        v: "1.0",
		                        q: "dojo toolkit"
		                    },*/
		                    load: function(data) {
		                        //Set the data from the search into the viewbox in nicely formatted JSON
		                        //targetNode.innerHTML = "<pre>" + dojo.toJson(data, true) + "</pre>";
		                        try{
		                      		self._getItemsFromLoadedData(data);
									self._loadFinished = true;
									self._loadInProgress = false;
	
									filter(keywordArgs, self._getItemsArray(keywordArgs.queryOptions));
									self._handleQueuedFetches();
								}catch(e){
									self._loadFinished = true;
									self._loadInProgress = false;
									errorCallback(e, keywordArgs);
								}
		                    },
		                    error: function(error) {
		                        console.error( "An unexpected error occurred: " + error);
		                        self._loadInProgress = false;
								errorCallback(error, keywordArgs);
		                    }
		                };
		                dojo.io.script.get(jsonpArgs);
						var oldAbort = null;
						if(keywordArgs.abort){
							oldAbort = keywordArgs.abort;
						}
						keywordArgs.abort = function(){
							var df = getHandler;
							if(df && df.fired === -1){
								df.cancel();
								df = null;
							}
							if(oldAbort){
								oldAbort.call(keywordArgs);
							}
						};
					}
				}else{
					errorCallback(new Error("dojox.data.ItemJsonpReadStore: No JSON source data was provided as URL."), keywordArgs);
				}
			}
		}
	},


	fetchItemByIdentity: function(/* Object */ keywordArgs){
		//	summary:
		//		See dojo.data.api.Identity.fetchItemByIdentity()

		if (!this._jsonpCallback) {
			this.inherited(arguments);
		}else {
			// Hasn't loaded yet, we have to trigger the load.
			var item,
			    scope;
			if(!this._loadFinished){
				var self = this;
				//Do a check on the JsonFileUrl and crosscheck it.
				//If it doesn't match the cross-check, it needs to be updated
				//This allows for either url or _jsonFileUrl to he changed to
				//reset the store load location.  Done this way for backwards
				//compatibility.  People use _jsonFileUrl (even though officially
				//private.
				if(this._jsonFileUrl !== this._ccUrl){
					dojo.deprecated("dojox.data.ItemJsonpReadStore: ",
						"To change the url, set the url property of the store," +
						" not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
					this._ccUrl = this._jsonFileUrl;
					this.url = this._jsonFileUrl;
				}else if(this.url !== this._ccUrl){
					this._jsonFileUrl = this.url;
					this._ccUrl = this.url;
				}
	
				//See if there was any forced reset of data.
				if(this.data != null && this._jsonData == null){
					this._jsonData = this.data;
					this.data = null;
				}
	
				if(this._jsonFileUrl){
	
					if(this._loadInProgress){
						this._queuedFetches.push({args: keywordArgs});
					}else{
						this._loadInProgress = true;
						/////////////////////////////////////////////////////////////////////////////////////////
						 //The parameters to pass to , the url, how to handle it, and the callbacks.
		                var jsonpArgs = {
		                    url: self._jsonFileUrl, //"http://localhost:8081/test4/TestService",
		                    callbackParamName: this._jsonpCallback, //"callback",
		                    load: function(data) {
		                        //Set the data from the search into the viewbox in nicely formatted JSON
		                        //targetNode.innerHTML = "<pre>" + dojo.toJson(data, true) + "</pre>";
		                    	var scope = keywordArgs.scope?keywordArgs.scope:dojo.global;
		                        try{
									self._getItemsFromLoadedData(data);
									self._loadFinished = true;
									self._loadInProgress = false;
									item = self._getItemByIdentity(keywordArgs.identity);
									if(keywordArgs.onItem){
										keywordArgs.onItem.call(scope, item);
									}
									self._handleQueuedFetches();
								}catch(e){
									self._loadInProgress = false;
									if(keywordArgs.onError){
										keywordArgs.onError.call(scope, error);
									}
								}
		                    },
		                    error: function(error) {
		                    	self._loadInProgress = false;
								if(keywordArgs.onError){
									var scope = keywordArgs.scope?keywordArgs.scope:dojo.global;
									keywordArgs.onError.call(scope, error);
								}
		                    }
		                };
		                dojo.io.script.get(jsonpArgs);
					}
	
				}
			}else{
				// Already loaded.  We can just look it up and call back.
				item = this._getItemByIdentity(keywordArgs.identity);
				if(keywordArgs.onItem){
					scope = keywordArgs.scope?keywordArgs.scope:dojo.global;
					keywordArgs.onItem.call(scope, item);
				}
			}
		}
	},

	_forceLoad: function(){
		//	summary:
		//		Internal function to force a load of the store if it hasn't occurred yet.  This is required
		//		for specific functions to work properly.
		if (!this._jsonpCallback) {
			this.inherited(arguments);
		}else {
			var self = this;
			//Do a check on the JsonFileUrl and crosscheck it.
			//If it doesn't match the cross-check, it needs to be updated
			//This allows for either url or _jsonFileUrl to he changed to
			//reset the store load location.  Done this way for backwards
			//compatibility.  People use _jsonFileUrl (even though officially
			//private.
			if(this._jsonFileUrl !== this._ccUrl){
				dojo.deprecated("dojox.data.ItemJsonpReadStore: ",
					"To change the url, set the url property of the store," +
					" not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
				this._ccUrl = this._jsonFileUrl;
				this.url = this._jsonFileUrl;
			}else if(this.url !== this._ccUrl){
				this._jsonFileUrl = this.url;
				this._ccUrl = this.url;
			}
	
			//See if there was any forced reset of data.
			if(this.data != null){
				this._jsonData = this.data;
				this.data = null;
			}
			if(this._jsonFileUrl){
			/////////////////////////////////////////////////////////////////////////////////////////
			 //The parameters to pass to , the url, how to handle it, and the callbacks.
			       var jsonpArgs = {
			           url: self._jsonFileUrl, //"http://localhost:8081/test4/TestService",
			           callbackParamName: this._jsonpCallback, //"callback",
			           load: function(data) {
			        	   try{
								//Check to be sure there wasn't another load going on concurrently
								//So we don't clobber data that comes in on it.  If there is a load going on
								//then do not save this data.  It will potentially clobber current data.
								//We mainly wanted to sync/wait here.
								//TODO:  Revisit the loading scheme of this store to improve multi-initial
								//request handling.
								if(self._loadInProgress !== true && !self._loadFinished){
									self._getItemsFromLoadedData(data);
									self._loadFinished = true;
								}else if(self._loadInProgress){
									//Okay, we hit an error state we can't recover from.  A forced load occurred
									//while an async load was occurring.  Since we cannot block at this point, the best
									//that can be managed is to throw an error.
									throw new Error("dojox.data.ItemJsonpReadStore:  Unable to perform a synchronous load, an async load is in progress.");
								}
							}catch(e){
								console.log(e);
								throw e;
							}
			           },
			           error: function(error) {
			        	   throw error;
			           }
			       };
			       dojo.io.script.get(jsonpArgs);
	       ////////////////////////////////////////////////////////////////////////////////////////
	
			}
		}
	}
});


return dojox.data.ItemJsonpReadStore;
});
