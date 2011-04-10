dojo.provide("FlickrImageThumbViewAssistant");
dojo.require("dojox.mobile.app.SceneAssistant");

dojo.declare("FlickrImageThumbViewAssistant", dojox.mobile.app.SceneAssistant, {
  
	apiKey: "8c6803164dbc395fb7131c9d54843627",
	
	setup: function(){
	
		// Instantiate widgets in the template HTML.
		this.controller.parse();
		
		this.handlePhotoLoad = dojo.hitch(this, this.handlePhotoLoad);
		this.search = dojo.hitch(this, this.search);
		
		this.textWidget = dijit.byId("searchTextThumbInput");
		
		var viewer = this.viewer = dijit.byId("flickrImageThumbView");
		
		console.log("widget flickrImageThumbView = ", viewer);
		
		var _this = this;
		
		this.connect(viewer, "onSelect", function(item, index){
			console.log("selected ", item, index);
			
			_this.controller.stageController.pushScene("flickr-image-view",{
				type: "data",
				images: _this.urls,
				index: index
			});
		});

		this.connect(this.textWidget, "onChange", function(value){
			if(!value || value.length == 0){
				_this.viewer.attr("items", []);
				return;
			}
			
			if(!_this.timer){
				_this.timer = setTimeout(_this.search, 1000);
			}
		});
	},
  
	activate: function(options){
		
		// If this is the first time this view is activated, then do the initial
		// load of images
		if (!this.dataType) {
		
			this.dataType = (options ? options.type : "interesting");

			switch (this.dataType) {
				case "interesting":
					// Hide the search text box
					dojo.style(this.textWidget.domNode, "display", "none");
					this.loadInteresting();
					break;
				case "text":
					dojo.style(this.textWidget.domNode, "visibility", "visible");
					this.loadText(this.textWidget.attr("value"));
					break;
				case "tag":
					// Another scene has passed in a list of images
					// and an initial index
					dojo.style(this.textWidget.domNode, "visibility", "visible");
					this.loadTags(this.textWidget.attr("value"));
					break;
				default:
					console.log("unknown type " + this.dataType, options);
			}
		}
	},
	
	search: function(){
		if(this.timer){
			clearTimeout(this.timer);
			this.timer = null;
		}
		
		var searchText = this.textWidget.attr("value");
		
		if(!searchText || dojo.trim(searchText).length < 1){
			this.viewer.attr("items", []);
			
			console.log("NOT SEARCHING");
			return;
		}
		
		console.log("search", searchText);
		switch(this.dataType){
			case "text":
				this.loadText(searchText);
				break;
			case "tag":
				// Another scene has passed in a list of images
				// and an initial index
				this.loadTags(searchText);
				break;
		}
	},
  
	loadInteresting: function(){
		console.log("loading interesting");
		var _this = this;
		
		var url = "http://api.flickr.com/services/rest/?method=" +
					"flickr.interestingness.getList";

		var deferred = dojo.io.script.get({
			url: url,
			content: { 
				api_key: this.apiKey,
				format: "json",
				per_page: 20
			},
			jsonp: "jsoncallback"
		});
		deferred.addBoth(this.handlePhotoLoad);
	},

	loadText: function(text){
		console.log("loading text ", text);
		var _this = this;
		
		var url = "http://api.flickr.com/services/rest/?method=" +
					"flickr.photos.search";

		var deferred = dojo.io.script.get({
			url: url,
			content: { 
				api_key: this.apiKey,
				format: "json",
				text: text,
				per_page: 20
			},
			jsonp: "jsoncallback"
		});
		deferred.addBoth(this.handlePhotoLoad);
	},

	loadTags: function(text){
		console.log("loading tags ", text);
		var _this = this;
		
		var url = "http://api.flickr.com/services/rest/?method=" +
					"flickr.photos.search";

		var deferred = dojo.io.script.get({
			url: url,
			content: { 
				api_key: this.apiKey,
				format: "json",
				tags: text,
				per_page: 20
			},
			jsonp: "jsoncallback"
		});
		deferred.addBoth(this.handlePhotoLoad);
	},

	handlePhotoLoad: function(res){
		console.log("got photos", res);
		if(res && res.photos && res.photos.photo){
			var images = this.images = res.photos.photo;
			
			var urls = [];
			
			var baseUrl;
			
			for(var i = 0; i < images.length; i++){
				baseUrl = "http://farm" 
							+ images[i].farm 
							+ ".static.flickr.com/"
							+ images[i].server
							+ "/"
							+ images[i].id
							+ "_"
							+ images[i].secret;
				urls.push({
					large: baseUrl + ".jpg",
					small: baseUrl + "_t.jpg",
					thumb: baseUrl + "_s.jpg",
					title: images[i].title
				});
			}
			this.urls = urls;
			this.index = 0;
			
			this.viewer.attr("items", urls);
		}else{
			this.viewer.attr("items", []);
			console.log("didn't get photos");
		}
	}
  
});