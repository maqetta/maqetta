package org.davinci.ajaxLibrary;

import java.net.URI;

import org.eclipse.core.runtime.IPath;

public class FileInfo {
	
		URI realURI;
		IPath path;
		
		public FileInfo (URI filePointer, IPath path){
			this.realURI = filePointer;
			this.path = path;
		}
		public URI getURI(){
			return this.realURI;
		}
		public void setURI(URI filePointer){
			this.realURI = filePointer;
		}
		public IPath getPath(){
			return this.path;
		}
		public void setPath(IPath path){
			
			this.path = path;
		}
		
		public String toString(){
			return this.path.toString();
		}
		
}
