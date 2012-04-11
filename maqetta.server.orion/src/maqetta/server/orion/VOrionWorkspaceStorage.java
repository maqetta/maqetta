package maqetta.server.orion;

import java.net.URISyntaxException;
import java.util.Vector;

import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.orion.internal.server.servlets.Activator;
import org.eclipse.orion.internal.server.servlets.ProtocolConstants;
import org.eclipse.orion.internal.server.servlets.workspace.WebProject;
import org.eclipse.orion.internal.server.servlets.workspace.WebWorkspace;
import org.eclipse.orion.internal.server.servlets.workspace.WorkspaceResourceHandler;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.maqetta.server.IStorage;
import org.osgi.service.prefs.BackingStoreException;

public class VOrionWorkspaceStorage extends VOrionProjectStorage{

	WebWorkspace webWorkspace = null;
	String PROJECT_NODE_NAME = "Project";
	String userName = null;
	public VOrionWorkspaceStorage(WebWorkspace webWorkspace, String userName) {
		super(".", null, null);
		this.webWorkspace = webWorkspace;
	}
	
	public String getPath(){
		return this.name;
	}

	public IStorage create(String name){
			IPath path = new Path(name);
			VOrionStorage parent = (VOrionStorage)this.createProj(path.segment(0));
			if(path.segmentCount() > 1)
				return parent.create(path.removeFirstSegments(1).toString());
			
			return parent;
	}
	
	public IStorage createProj(String name){
		IStorage existing = this.get(name);
		if(existing!=null)
			return existing;
		
		String	id = WebProject.nextProjectId();
		WebProject project = WebProject.fromId(id);
		
		project.setName(name);
		
		try {
			WorkspaceResourceHandler.computeProjectLocation(project, null, userName, true);
		} catch (URISyntaxException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		} catch (CoreException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		 
		//If all went well, add project to workspace
		webWorkspace.addProject(project);

		//save the workspace and project metadata
		try {
			project.save();
			webWorkspace.save();
		} catch (CoreException e) {
			e.printStackTrace();				
		}
		
		Activator.getDefault().registerProjectLocation(project);
		
		try {
			return new VOrionProjectStorage(name, project.getProjectStore(),project,this);
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	
		return null;
	}


	public IStorage get(String name){
		IStorage[] projects = this.listFiles();
		for(int i=0;i<projects.length;i++){
			if(projects[i].getName().compareTo(name)==0)
				return projects[i];
		}
		return null;
	}
	
	public IStorage[] listFiles(){
		
		JSONArray allProjects;
		Vector projects = new Vector();
		try {
			allProjects = webWorkspace.getProjectsJSON();
			for(int i=0;i<allProjects.length();i++){
				JSONObject projObj = (JSONObject)allProjects.opt(i);
				String id = projObj.getString("Id");
				IEclipsePreferences ep = (IEclipsePreferences) scope.getNode(PROJECT_NODE_NAME).node(id);
				
				WebProject result = WebProject.fromId(id);
			
				String name = result.getName();
				try {
					projects.add(new VOrionProjectStorage(name, result.getProjectStore(), result, this));
				} catch (CoreException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				
			}
		} catch (JSONException e) {
			//someone messed with the backing store and inserted something invalid- just wipe it out
			allProjects = new JSONArray();
		}
		return (VOrionProjectStorage[])projects.toArray(new VOrionProjectStorage[projects.size()]);
		
	}
}
