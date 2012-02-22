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
import org.maqetta.server.VWorkspaceRoot;
import org.osgi.service.prefs.BackingStoreException;


public class VOrionWorkspace extends VWorkspaceRoot{

	VOrionWorkspaceStorage store;
	
    public VOrionWorkspace(VOrionWorkspaceStorage storage) {
    	this.store=storage;
	}

    /*
	public IVResource[] listFiles() {
		IVResource[] addedFiles = super.listFiles();
		
		IStorage[] files = this.store.listFiles();
		IVResource[] returns = new IVResource[files.length + addedFiles.length];
		for(int i=0;i<files.length;i++){
			returns[i] = new VOrionResource(files[i], this, files[i].getName());
		}
		
		for(int i=0;i<addedFiles.length;i++){
			int index = files.length + i;
			returns[index] = addedFiles[i];
		}
		
		return returns;
	}


	public IVResource get(String childName) {
		IStorage[] files = this.store.listFiles();
		for(int i=0;i<files.length;i++){
			
			if(files[i].getName().compareTo(childName)==0)
			return new VOrionResource(files[i], this, files[i].getName());
		}
		
		return super.get(childName);
	}
	
	public IVResource[] findChildren(String childName) {
		return null;
	}
	*/
	public IVResource create(String path) {
		IStorage file = this.store.create(path);
		return new VOrionResource(file, this, path);
	}

}
