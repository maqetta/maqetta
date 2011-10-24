dojo.provide("system.model.Resource");

dojo.require("davinci.model.Model");


if(!system){
	system = {};
}

if(!system.model){
	system.model = {};
}

/**  
 * @class system.model.Resource.Resource
   * @constructor 
   * @extends system.model.Model
 */
system.model.Resource.Resource= function(){
	this.inherits( davinci.model.Model);  
	this.elementType="Resource";
	this.name="";
	this.parent=null;
}

 davinci.Inherits(system.model.Resource.Resource,davinci.model.Model);
 system.model.Resource.Resource.prototype.getName= function(){
	 return this.name;
}
 
 system.model.Resource.Resource.prototype.getPath= function()
 {
	 if (this.parent)
		 return this.parent.getPath()+"/"+this.name;
	 return this.name;
 }
// system.model.Resource.Resource.prototype.getURL = function(){
//	
//    var locationPath=new system.model.Path(location.href);
//    var path=locationPath.getParentPath().append('wsfile').append(this.getPath()).toString();
//	 while(path.indexOf(".")==0 || path.indexOf("/")==0){
//		 path = path.substring(1,path.length);
//	 }
//
//    
//	 return path;
//	 
// }
system.model.Resource.Resource.prototype.getURL = function(){
	 var path = this.getPath();
	 while(path.indexOf(".")==0 || path.indexOf("/")==0){
		 path = path.substring(1,path.length);
	 }
	    var loc=davinci.Workbench.location();;
	    if (loc.charAt(loc.length-1)=='/')
	    	loc=loc.substring(0,loc.length-1);

	 return loc+'/user/'+davinci.Runtime.userName+'/ws/workspace/'+ path;
	 
}

system.model.Resource.Resource.prototype.rename = function(newName){
		
		var path = new davinci.model.Path(this.getPath()).removeLastSegments();
		var newPath = path.append(newName);
		
		var response = davinci.Runtime.serverJSONRequest({url:"./cmd/rename", 
														  handleAs:"text", 
														  sync:true,
														  content:{'oldName':this.getPath(), 'newName' : newPath.toString()} 
															});
		this.name = newName;
		dojo.publish("/davinci/resource/resourceChanged",["renamed",this]);
	
},
 
 system.model.Resource.Resource.prototype.getParentFolder = function(){
	 
	 if (this.elementType=="File")
		 return this.parent;
	 return this;
	 
 }

system.model.Resource.Resource.prototype.isVirtual = function(){
	 return (this.libraryId!=null)
	 
}

 system.model.Resource.Resource.prototype.visit= function(visitor,dontLoad){
	 var dontVisitChildren=visitor.visit(this);
	
	 if(!this._isLoaded && this.elementType=="Folder" && !dontLoad){
		this.getChildren(dojo.hitch(this,function(){ 
							dojo.forEach(this.children, function(child){child.visit(visitor,dontLoad)});
						 }));
	 }else if (this.children && !dontVisitChildren){
		 dojo.forEach(this.children, function(child){
			 child.visit(visitor,dontLoad);
		 });
	 }
 }
 

 system.model.Resource.Resource.prototype.deleteResource= function(localOnly)
 {
	 var response="OK";
	 if (!localOnly) {
		 response = davinci.Runtime.serverJSONRequest({
			 url: "cmd/deleteResource", handleAs: "text",
			 content: {path: this.getPath()}, sync: true});
	 }
	 if (response=="OK") {
		 var i = this.parent.children.indexOf(this);
		 this.parent.children.splice(i, 1);
		 dojo.publish("/davinci/resource/resourceChanged",["deleted",this]);
	 } else {
		 //TODO: refresh the resource in the tree if it is a dir -- delete may have been partial.
		 alert(response);
	 }
 }
 
 /**  
  * @class system.model.Resource.Folder
    * @constructor 
    * @extends system.model.Resource.Resource
  */
system.model.Resource.Folder= function(name,parent){
 	this.inherits( system.model.Resource.Resource);  
 	this.elementType="Folder";
 	this.name=name;
 	this.parent=parent;
}
davinci.Inherits(system.model.Resource.Folder,system.model.Resource.Resource);

system.model.Resource.Folder.prototype.reload= function(){
	// mark this folder as dirty and reload it next time
	this._isLoaded = false;
}

system.model.Resource.Folder.prototype.createResource= function(name, isFolder, localOnly){
	
	 var file;
	 
	 if(name!=null){
		 file = isFolder ?   new system.model.Resource.Folder(name,this) :  new system.model.Resource.File(name,this);
  	 }else{
		 
		 file = this;
		 isFolder = this.elementType=="Folder";
	 }
	 
	 var response= (!localOnly) ? davinci.Runtime.serverJSONRequest({
		   url:"./cmd/createResource", handleAs:"text",
	       content:{'path':file.getPath(), 'isFolder': isFolder},sync:true  }): "OK";
	  if (response=="OK" && name!=null){
		  this.children.push(file);
		  dojo.publish("/davinci/resource/resourceChanged",["created",file]);
		  return file;
	  } else if (response!="OK"){
		  alert(response);
	  }else{
		  this.libraryId = this.libVersion = null;
		  return this;
	  }
	  
  }
  
  system.model.Resource.Folder.prototype.getChildren= function(onComplete,sync)
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
		  davinci.Runtime.serverJSONRequest({
			   url:"./cmd/listFiles",
		          content:{'path':this.getPath()},
		            sync:sync,
					load : dojo.hitch(this, function(responseObject, ioArgs) {
						this._addFiles(responseObject);
						dojo.forEach(this._loading,function(item){
							
							 (item)(this.children);
						},this);
						delete this._loading;
		            })
	  	  });
		  return;
	  }
      onComplete(this.children);
  }
  
  
  /*
   * add files recreates the children 
   * should refactor the naming.
   * 
   */
  system.model.Resource.Folder.prototype._addFiles= function(responseObject){
	  this.children=[];
	  this._appendFiles(responseObject);
  }
  
  system.model.Resource.Folder.prototype._appendFiles= function(responseObject){
	
	  
		for (var i=0;i<responseObject.length;i++){
			var child = this.getChild(responseObject[i].name);
			var hasChild = (child!=null);
			
			if (responseObject[i].isDir || responseObject[i].isLib) {
				if(!hasChild)
					child=new system.model.Resource.Folder(responseObject[i].name,this);
			    
				if (responseObject[i].isLib) {
			        child.isLibrary = true;
			    }
			} else {
				if(!hasChild)
					child=new system.model.Resource.File(responseObject[i].name,this);
			}
          
            child.link=responseObject[i].link;
            child.isNew = responseObject[i].isNew;
            child.readOnly = responseObject[i].readOnly;
            if(responseObject[i].libraryId){
            	child.libraryId = responseObject[i].libraryId;
            	child.libVersion = responseObject[i].libVersion;
            }
            if(!hasChild)
            	this.children.push(child);
		}
		this._isLoaded=true;
	  
  }
  system.model.Resource.Folder.prototype.getMarkers= function(markerTypes,allChildren)
  {
	  var result=[];
	  this.visit({visit:function (resource){
		  if (resource.elementType=="File")
		  {
			  markers=resource.getMarkers(markerTypes);
			  result.concat(markers);
		  }
		  else if (!allChildren)
			  return true;
	  }},true);
	  return result;
  }

  /* time to make this public */
  system.model.Resource.Folder.prototype.getChild= function(name){
	  if(!this._isLoaded){
		  this.getChildren(function(item){this.children=item}, true)
	  }
	  return this._getChild(name);
	  
  }
  
  system.model.Resource.Folder.prototype._getChild= function(name){
	  
	  if (!this.__CASE_SENSITIVE){
		  name=name.toLowerCase();
	  }
		for (var j=0;j<this.children.length;j++){
			if ( (this.__CASE_SENSITIVE && this.children[j].getName()==name) ||
				  (!this.__CASE_SENSITIVE && this.children[j].getName().toLowerCase()==name)  ){
			  return this.children[j];
		  }
		}
		return null;
  }
  
  /**  
   * @class system.model.Resource.File
     * @constructor 
     * @extends system.model.Resource.Resource
   */
  system.model.Resource.File= function(name,parent)
  {
  	this.inherits( system.model.Resource.Resource);  
  	this.elementType="File";
  	this.name=name;
  	this.parent=parent;
   this.markers=[];
	this.extension=name.substr(name.lastIndexOf('.')+1);

  }
   davinci.Inherits(system.model.Resource.File,system.model.Resource.Resource);

   system.model.Resource.File.prototype.getExtension= function()
   {
   	return this.extension;
   }

   
   system.model.Resource.File.prototype.clearMarkers = function()
   {
	   this.markers=[];
   }

   system.model.Resource.File.prototype.addMarker = function(type,line,text)
   {
	   var marker=new system.model.Resource.Marker(this,type,line,text);
	   this.markers.push(marker);
   }

   system.model.Resource.File.prototype.getMarkers = function(markerTypes)
   {
	   var result=[];
	   if (this.markers)
		   for (var i=0;i<this.markers.length; i++)
		   {
			   var marker=this.markers[i];
			   if (!markerTypes)
				   result.push(marker);
				else if (typeof markerTypes == 'string')
				{ 
					if (marker.type==markerTypes)
					   result.push(marker);
				}
				else
					dojo.forEach(markerTypes,function (type){if (type==marker.type) result.push(marker)});
		   }
	   return result;
   }

   system.model.Resource.File.prototype.setContents = function(content, isWorkingCopy){
	   var workingCopy=isWorkingCopy ? "true":"false";
	   if (this.isNew && !isWorkingCopy){
		   this.isNew=false;
	   }
	   var workingCopyExtension = isWorkingCopy?".workingcopy":"";
	   var path=encodeURIComponent(this.getPath() + workingCopyExtension);
    	davinci.Runtime.serverPut(
				{
					url: path,
					putData: content,
					handleAs:"text",
					contentType:"text/html"
				});	
		dojo.publish("/davinci/resource/resourceChanged",["modified",this]);
   }

   system.model.Resource.File.prototype.getText= function(){
	   	 
 		  var contents=davinci.Runtime.serverJSONRequest({
 			   url:this.getURL(), handleAs:"text", sync:true
 	  	  });
 		  return contents;
   }


   system.model.Resource.File.prototype.removeWorkingCopy= function()
   {
 		 davinci.Runtime.serverJSONRequest({
 			   url:"./cmd/removeWorkingCopy", handleAs:"text",
 		          content:{'path':this.getPath()}, sync:true
 	  	  });
 		 if (this.isNew)
 			 this.deleteResource(true);
   }



   /**  
    * @class system.model.Resource.Marker
      * @constructor 
    */
   system.model.Resource.Marker= function(resource,type,line,text)
   {
   	this.resource=resource;
   	this.type=type;
   	this.line=line;
   	this.text=text;
   }
   

system.model.Resource.root=new system.model.Resource.Folder(".",null);

