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

import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.core.runtime.preferences.IScopeContext;
import org.eclipse.orion.internal.server.servlets.ProtocolConstants;
import org.eclipse.orion.internal.server.servlets.workspace.WebProject;
import org.eclipse.orion.internal.server.servlets.workspace.WebWorkspace;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.maqetta.server.IStorage;
import org.maqetta.server.IVResource;
import org.osgi.service.prefs.BackingStoreException;


public class VOrionWorkspace implements IVResource{

	VOrionWorkspaceStorage store;
	
    public VOrionWorkspace(VOrionWorkspaceStorage storage) {
    	this.store=storage;
	}

	public URLConnection openConnection() throws MalformedURLException,
			IOException {
		// TODO Auto-generated method stub
		return null;
	}
	
	public boolean exists() {
		return true;
	}

	public boolean isVirtual() {
		return false;
	}

	public String getPath() {
		return ".";
	}

	public void setParent(IVResource parent) {}

	public boolean readOnly() {
		return false;
	}

	public void createNewInstance() throws IOException {}

	public boolean delete() {
		return false;
	}

	public OutputStream getOutputStreem() throws FileNotFoundException, IOException {
		return null;
	}

	public InputStream getInputStreem() throws IOException {
		return null;
	}

	public IVResource[] listFiles() {
		IStorage[] files = this.store.listFiles();
		IVResource[] returns = new IVResource[files.length];
		for(int i=0;i<files.length;i++){
			returns[i] = new VOrionResource(files[i], this, files[i].getName());
		}
		return returns;
	}

	public String getName() {
		return ".";
	}

	public boolean isDirectory() {
		return true;
	}

	public boolean isNew() {
		return false;
	}

	public void removeWorkingCopy() {}

	public void flushWorkingCopy() {}

	public URI getURI() throws URISyntaxException {
		return null;
	}

	public IVResource[] find(String path) {
		return null;
	}

	public boolean mkdir() {
		return false;
	}

	public boolean isDirty() {
		return false;
	}

	public IVResource[] getParents() {
		return null;
	}

	public IVResource getParent() {
		return null;
	}

	public IVResource get(String childName) {
		IStorage[] files = this.store.listFiles();
		for(int i=0;i<files.length;i++){
			
			if(files[i].getName().compareTo(childName)==0)
			return new VOrionResource(files[i], this, files[i].getName());
		}
		return null;
	}

	public IVResource[] findChildren(String childName) {
		// TODO Auto-generated method stub
		return null;
	}

	public void add(IVResource v) {
		// TODO Auto-generated method stub
		
	}

	public IVResource create(String path) {
		IStorage file = this.store.create(path);
		return new VOrionResource(file, this, path);
	}
	
}
