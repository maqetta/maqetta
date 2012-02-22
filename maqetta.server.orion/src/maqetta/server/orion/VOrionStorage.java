package maqetta.server.orion;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Vector;

import maqetta.core.server.util.VResourceUtils;

import org.eclipse.core.filesystem.EFS;
import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.core.runtime.preferences.IScopeContext;
import org.eclipse.orion.server.core.users.OrionScope;
import org.maqetta.server.IStorage;
import org.maqetta.server.IVResource;

public class VOrionStorage implements IStorage{
	IFileStore store;
	protected static final IScopeContext scope = new OrionScope();
	protected IEclipsePreferences prefStore;
	
	String name;
	IFileStore root;
	
	public VOrionStorage(String name, IFileStore store) {
		this.store = store;
		this.root = root;
		this.name = name;
	}
	
	public String getPath() {
		VOrionStorage parent = this.getParentFile();		
		if(parent==null)
    		return this.name;
    	
    	 return new Path(parent.getPath()).append(this.name).toString();
	}

	public boolean readOnly() {
		return this.store.fetchInfo().getAttribute(EFS.ATTRIBUTE_READ_ONLY);
	}

	
	public boolean delete() {
		try {
			store.delete(EFS.NONE, null);
		} catch (CoreException e) {
			e.printStackTrace();
		}
		return true;
	}
	

	public String getName() {
		return this.name;
	}

	public boolean isDirectory() {
		return this.store.fetchInfo().isDirectory();
	}


	public boolean exists() {
		return this.store.fetchInfo().exists();
	}


	public String getAbsolutePath() {
		return this.getPath();
	}


	public boolean mkdirs() {
		// TODO Auto-generated method stub
		try {
			IStorage parent = this.getParentFile();
			if(parent!=null && !parent.exists()){
				parent.mkdirs();
			}
		//	if(this.store.fetchInfo().isDirectory())
			this.store.mkdir(EFS.NONE, null);
		} catch (CoreException e) {
			e.printStackTrace();
			return false;
		}
		return true;
	}
	public IStorage[] listFiles() {
		Vector results = new Vector();
		try {
			String[] children = this.store.childNames(EFS.NONE, null);
			for(int i=0;i<children.length;i++){
				VOrionStorage child = new VOrionStorage(children[i], this.store.getChild(children[i]));
				results.add(child);
			}
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return (IStorage[])results.toArray(new IStorage[results.size()]);
	}

	


	public URI toURI() {
		return this.store.toURI();
	}


	public VOrionStorage getParentFile() {
		IFileStore parentStore = store.getParent();
	
		if(parentStore==null)
			return null;
		
		return new VOrionStorage(parentStore.getName(), parentStore);		
	}


	public OutputStream getOutputStream() throws IOException {
		try {
			return this.store.openOutputStream(EFS.NONE, null);
		} catch (CoreException e) {
			e.printStackTrace();
		}
		return null;
	}


	public InputStream getInputStream() throws IOException {
		try {
			return this.store.openInputStream(EFS.NONE, null);
		} catch (CoreException e) {
			e.printStackTrace();
		}
		return null;
	}


	public void createNewFile() throws IOException {
	
		
	}


	public void mkdir() {
		try {
			this.store.mkdir(EFS.NONE, null);
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}


	public void renameTo(IStorage file) {
		try {
			this.store.move(((VOrionStorage)file).store, EFS.NONE, null);
		} catch (CoreException e) {
			e.printStackTrace();
		}
	}


	public IStorage newInstance(String name) {
		VOrionStorage parent =  this.getParentFile();
		while(parent!=null && parent.getParentFile()!=null){
			parent = parent.getParentFile();
		}
		
		if(parent==null)
			parent = this;
		
	
		IPath path = new Path(name);
		IStorage base = null;
		for(int i=0;i<path.segmentCount();i++){
			parent = (VOrionStorage) parent.create(path.segment(i));
		}
	
		
		return parent;
	}


	private VOrionStorage get(String segment) {
		return new VOrionStorage(segment, this.store.getChild(segment));
	}

	public IStorage newInstance(IStorage parent, String name) {
		return ((VOrionStorage)parent).create(name);
	}


	public IStorage create(String name) {
		IFileStore parentStore = store;
		IPath path = new Path(name);
		for(int i=0;i<path.segmentCount();i++){
			parentStore = parentStore.getChild(path.segment(i));
		}
		return new VOrionStorage(name, parentStore);
	}

	public IStorage newInstance(URI uri) {
		// not used
		return null;
	}


	public Collection findFiles(IStorage parentFolder, String pathStr,	boolean ignoreCase) {
		IStorage[] children = parentFolder.listFiles();
		Collection found = new Vector();
		for(int i=0;i<children.length;i++){
			
			if(VResourceUtils.matches(children[i].getName(), pathStr)){
				found.add(children[i]);
			}
			if(children[i].isDirectory()){
				found.addAll(this.findFiles(children[i], pathStr, ignoreCase));
				
			}
		}
		return found;
	}


	public boolean isFile() {
		return !this.store.fetchInfo().isDirectory();
	}


	public String[] list() {
		try {
			return this.store.childNames(EFS.NONE, null);
		} catch (CoreException e) {
			e.printStackTrace();
		};
		return new String[0];
	}

	public String toString(){
		return this.getPath();
	}
	
	public String getOrionLocation(){
		VOrionStorage parent = this.getParentFile();
		return parent.getOrionLocation() + "/" + name;
	}

}
