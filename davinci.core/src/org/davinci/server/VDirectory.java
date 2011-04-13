package org.davinci.server;
 
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLConnection;
import java.util.HashMap;
import java.util.Vector;

import org.eclipse.core.runtime.Path;

public class VDirectory implements IVResource{

	Vector children;
	IVResource parent;
	String name;
	public VDirectory(IVResource parent, String name){
		this.parent = parent;
		this.name = name;
		this.children = new Vector();
	}
	
	protected VDirectory() {
		// TODO Auto-generated constructor stub
		this.children = new Vector();
	}

	public void addChild(IVResource child){
		this.children.add(child);
	}
	
	public IVResource create(String path) {
		// TODO Auto-generated method stub
		return null;
	}

	public void createNewInstance() throws IOException {
		// TODO Auto-generated method stub
		
	}

	public boolean delete() {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean exists() {
		// TODO Auto-generated method stub
		return false;
	}

	public IVResource find(String path) {
		// TODO Auto-generated method stub
		return null;
	}

	public void flushWorkingCopy() {
		// TODO Auto-generated method stub
		
	}

	public InputStream getInputStreem() throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	public String getName() {
		// TODO Auto-generated method stub
		String name =  this.name;
		
		if(name!=null && name.length() > 0 && name.charAt(name.length()-1) == '/')
			name = name.substring(0,name.length()-1);
		if(name!=null && name.length() > 0 && name.charAt(0) == '.')
			name = name.substring(1);
		if(name!=null && name.length() > 0 && name.charAt(0) == '/')
			name = name.substring(1);
		
		return name;
	}

	public OutputStream getOutputStreem() throws FileNotFoundException,
			IOException {
		// TODO Auto-generated method stub
		return null;
	}

	public IVResource getParent() {
		// TODO Auto-generated method stub
		return this.parent;
	}

	public IVResource[] getParents() {
		// TODO Auto-generated method stub
		return null;
	}

	public String getPath() {
		// TODO Auto-generated method stub
		if(parent==null)
			return this.name;
		return new Path(this.parent.getPath()).append(this.name).toString();
		
	}

	public URI getURI() throws URISyntaxException {
		// TODO Auto-generated method stub
		return null;
	}

	public boolean isDirectory() {
		// TODO Auto-generated method stub
		return true;
	}

	public boolean isDirty() {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean isFile() {
		// TODO Auto-generated method stub
		return false;
	}

	public IVResource[] listFiles() {
		// TODO Auto-generated method stub
		return (IVResource[])this.children.toArray(new IVResource[this.children.size()]);
	}

	public boolean mkdir() {
		// TODO Auto-generated method stub
		return false;
	}

	public URLConnection openConnection() throws MalformedURLException,
			IOException {
		// TODO Auto-generated method stub
		return null;
	}

	public void removeWorkingCopy() {
		// TODO Auto-generated method stub
		
	}

	public void add(IVResource v) {
		this.children.add(v);
		
	}

	public IVResource get(String childName) {
		for(int i=0;i<this.children.size();i++){
			IVResource child = (IVResource)children.get(i);
			if (child!=null && child.getName().equals(childName))
				return (IVResource) children.get(i);
		}
		return null;
	}
	public String toString (){
		return this.getPath();
	}

	public boolean committed() {
		return true;
	}
}
