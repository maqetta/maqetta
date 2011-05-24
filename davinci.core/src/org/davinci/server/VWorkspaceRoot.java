package org.davinci.server;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Hashtable;

import org.davinci.server.user.User;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;

public class VWorkspaceRoot extends VDirectory {
	// abstracted file/resource class
	File file = null;
	User user;
	
	public VWorkspaceRoot(File file,  User user){
		super();
		this.file = file;
		this.user = user;
		
	}
	
	public boolean exists(){
		return this.file.exists();
	}
	
	public boolean isDirty(){
		return true;
	}
	
	public String toString(){
		return this.getPath();
	}
	public URLConnection openConnection() throws MalformedURLException, IOException{
		return this.file.toURL().openConnection();
	}
/*
	public String getPath() {
		if(this.virtualPath== null)
			return null;
		if(this.parent==null)
			return ".";
		
		String cleanPath = this.parent.getPath() + IVResource.SEPERATOR + this.virtualPath;
		
		if(cleanPath.length() > 0 && cleanPath.charAt(0)=='.'){
			cleanPath = cleanPath.substring(1);
		}
		if(cleanPath.length() > 0 && cleanPath.charAt(0)=='/'){
			cleanPath = cleanPath.substring(1);
		}
		return cleanPath;
	}
*/
	public String getPath() {
		return ".";
			
		
	}
	public void createNewInstance() throws IOException {
		
	// noop
		
	}
	
	public boolean delete() {
		//noop
		return false;
	}

	public OutputStream getOutputStreem() throws IOException {
		
		
		return new FileOutputStream(this.file);
	}
	
	public InputStream getInputStreem() throws IOException {
		return new FileInputStream(this.file);
	}

	public IVResource[] listFiles() {
		File[] realFiles = this.file.listFiles();
		Hashtable results = new Hashtable();
		for(int i=0;i<realFiles.length;i++){
			IVResource r1 = new VFile(realFiles[i],this, realFiles[i].getName());
			results.put(r1.getPath(), r1);
		}
		for(int i=0;i<this.children.size();i++){
			results.put(((IVResource)this.children.get(i)).getPath(), this.children.get(i));
		}
		
			Collection c = results.values();
			return (IVResource[])c.toArray(new IVResource[c.size()]);
	}

	public String getName() {
		
		return ".";
	}

	/*
	public VResource getOriginal(){
		
		String fileName = this.getName();
		if (fileName.endsWith(IDavinciServerConstants.WORKING_COPY_EXTENSION)){
			File f =  new File(file.getParent(),fileName.substring(0,fileName.length()-IDavinciServerConstants.WORKING_COPY_EXTENSION.length()));
			return new VFile(f, false);
		}
		return null;
	}
	*/
	public boolean isDirectory() {
		return this.file.isDirectory();
	}

	public URI getURI() throws URISyntaxException {
		return this.file.toURI();
	}

	@Override
	public boolean mkdir() {
		return this.file.mkdir();
		
	}
	
	public IVResource[] find(String path){
		IVResource[] found = this.findInFileSystem(path);
		if(found==null)
			return findInLib(path);
		
		return found;
	}
	

	
	private IVResource[] findInLib(String path){
		String[] split = path.split("/");
		IVResource parent = this;
		for(int i=0;parent!=null && i<split.length;i++){
			
			if(split[i].indexOf("*")>-1 || split[i].indexOf("?")>-1)
				return parent.findChildren(split[i]);
				
			parent = parent.get(split[i]);
		}
		return new IVResource[]{parent};
	}
	
	private IVResource[] findInFileSystem(String path) {
		if(!this.isDirectory()) return null;
		
		IPath a = new Path(this.file.getAbsolutePath()).append(path);
		/* security check, dont want to return a resource BELOW the workspace root */
		IPath workspaceRoot = new Path(this.file.getAbsolutePath());
		if(a.matchingFirstSegments(workspaceRoot)!= workspaceRoot.segmentCount()) return null;
		
		
		File f1 = new File(a.toOSString());
		
		if(!f1.exists()){
			
			IPath a2 = new Path(this.file.getAbsolutePath()).append(path + IDavinciServerConstants.WORKING_COPY_EXTENSION);
			File workingCopy= new File(a2.toOSString());
			if(!workingCopy.exists())return null;
		}
		String[] segments = a.segments();
		IPath me = new Path(this.file.getAbsolutePath());
		IVResource parent = this;
		for(int i = me.matchingFirstSegments(a) ;i<segments.length;i++){
			int segsToEnd = segments.length - i - 1;
			String s = a.removeLastSegments(segsToEnd).toOSString();
			File f= new File(s);
			parent = new VFile(f, parent, segments[i]);
		}
		return new IVResource[]{parent};
		
	}
	
	public IVResource create(String path) {
		if(!this.isDirectory()) return null;
		
		IPath a = new Path(this.file.getAbsolutePath()).append(path);
		File f1 = new File(a.toOSString());
		
		
		String[] segments = a.segments();
		IPath me = new Path(this.file.getAbsolutePath());
		IVResource parent = this;
		for(int i = me.matchingFirstSegments(a) ;i<segments.length;i++){
			int segsToEnd = segments.length - i - 1;
			File f= new File(a.removeLastSegments(segsToEnd).toOSString());
			parent = new VFile(f, parent, segments[i]);
		}
		return parent;
		
	}
	
	public boolean isFile() {
		return this.file.isFile();
	}
	public void flushWorkingCopy() {
		// noop
	}

	private void copyfile(File source, File destination){
	    try{
	        InputStream in = new FileInputStream(source);
	        OutputStream out = new FileOutputStream(destination);
	        byte[] buf = new byte[1024];
	        int len;
	        while ((len = in.read(buf)) > 0){
	          out.write(buf, 0, len);
	        }
	        in.close();
	        out.close();
	      }catch(Exception ex){
	        System.out.println(ex.getMessage());
	        
	      }
	}
	
	public void removeWorkingCopy() {
		//noop
	}


	public IVResource[] getParents() {
		return new IVResource[0];
	}
	public IVResource getParent() {
		// TODO Auto-generated method stub
		return null;
	}
	public boolean readOnly() {
		return false;
	}
}
