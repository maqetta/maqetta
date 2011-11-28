dojo.provide("davinci.review.model.Resource");

dojo.require("davinci.model.Model");
dojo.require("dojo.date.locale");

dojo.mixin(davinci.review.model.Resource,	{

	root:null,
	
	getRoot : function()
	{
		if (!this.root)
		{
			this.root=new davinci.review.model.Resource.root();
		}
		return this.root;
	},
	dateSortFilter : {
	     filterList : function(list)
	    {
		    return list.sort(function (file1,file2)
		    	{return file1.timeStamp>file2.timeStamp ? -1 : file1.timeStamp<file2.timeStamp ? 1 : 0});
	    }
	
	}
});

dojo.declare("davinci.review.model.Resource.Empty",
		davinci.model.Resource.Resource,{
	constructor: function(args){
		this.elementType="Folder";
	 	this.name="root";
	 	this.parent=null;
 	},
 	
 	getChildren: function(){
 		return this.children;
 	}

});

dojo.declare("davinci.review.model.Resource.root",
		davinci.model.Resource.Resource,{
	constructor: function(args){
		this.elementType="ReviewRoot";
	 	this.name="root";
	 	this.parent=null;
	},
	
	findFile: function(version,fileName){
		var children;
		var result=null;
		this.getChildren(function(c){children= c;}, true);
		var node;
		dojo.forEach(children,function(item){
			if(item.timeStamp==version)
				node = item;
		});
		if(node!=null){
			node.getChildren(function(c){children= c;}, true);
			dojo.forEach(children,function(item){
				if(item.name==fileName)
					result = item;
			});
		}
		return result;
	},
	
	findVersion: function(version){
		var node;
		dojo.forEach(this.children,function(item){
			if(item.timeStamp==version)
				node =item;
		});
		return node;
	},

	getChildren: function(onComplete,sync){
		if (!this._isLoaded)
		  {
			  if (this._loading)
			  {
				  this._loading.push(onComplete);
				  return;
			  }
			  this._loading=[];
			  this._loading.push(onComplete);
			  var designerName = davinci.Runtime.commenting_designerName||"";
			  davinci.Runtime.serverJSONRequest({
				   url:"davinci/cmd/listVersions",
			          content:{'designer':designerName},
			            sync:sync,
						load : dojo.hitch(this, function(responseObject, ioArgs) {
							this.children=[];
							for (var i=0;i<responseObject.length;i++)
							{
								var child=new davinci.review.model.Resource.Folder(dojo.mixin({
									name:responseObject[i].versionTitle,
									parent:this
								},responseObject[i]));
						        this.children.push(child);
							}
							this._isLoaded=true;
							dojo.forEach(this._loading,function(item){
								 (item)(this.children);
							},this);
							delete this._loading;
			            })
		  	  });
			  return;
		  }
		onComplete(this.children);
	},
	
	getPath: function(){
		 return ".review/snapshot";
	 }
	
});
 	
dojo.declare("davinci.review.model.Resource.Folder",
		davinci.model.Resource.Resource,{
	isDraft:false,
	closed: false,
	width:0,
	height:0,
	constructor: function(proc){
		this.elementType="ReviewVersion";
	 	dojo.mixin(this,proc);
	 	this.dueDate = this.dueDate=="infinite"?this.dueDate:dojo.date.locale.parse(this.dueDate,{selector:'date',
			formatLength:'long',
            datePattern:'MM/dd/yyyy', 
            timePattern:'HH:mm:ss'});
	},
	getChildren: function(onComplete,sync)
	{
		  if (!this._isLoaded)
		  {
			  if (this._loading)
			  {
				  this._loading.push(onComplete);
				  return;
			  }
			  this._loading=[];
			  this._loading.push(onComplete);
			  var designerName = davinci.Runtime.commenting_designerName||"";
			  davinci.Runtime.serverJSONRequest({
				   url:"davinci/cmd/listReviewFiles",
			          content:{
						  	'designer':designerName,
						  	'version':this.timeStamp
			  			},
			            sync:sync,
						load : dojo.hitch(this, function(responseObject, ioArgs) {
							this.children=[];
							for (var i=0;i<responseObject.length;i++)
							{
								var child =new davinci.review.model.Resource.File(responseObject[i].path,this);
							    this.children.push(child);
			          	         
							}
							this._isLoaded=true;
							dojo.forEach(this._loading,function(item){
								 (item)(this.children);
							},this);
							delete this._loading;
			            })
		  	  });
			  return;
		  }
	     onComplete(this.children);
	 },
	 
	 
	 getPath: function(){
		 if (this.parent)
			 return this.parent.getPath()+"/"+this.timeStamp;
		 return this.timeStamp;
	 }
});

dojo.declare("davinci.review.model.Resource.File",
		davinci.model.Resource.File,{
	constructor: function(name,parent){
		this.elementType="ReviewFile";
	  	this.name=name;
	  	this.parent=parent;
		this.extension="rev";
	},
	
	getLabel: function(){
		var path = new davinci.model.Path(this.name);
		var segments = path.getSegments();
		return label = segments[segments.length-1]+".rev";
		
	},
	getText: function(){
		return "";
	},
	removeWorkingCopy: function(){
		return;
	}

	
	
});

davinci.review.model.Resource.root=new davinci.review.model.Resource.root();

 