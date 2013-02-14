package maqetta.server.orion;

import java.net.URI;

import javax.servlet.http.HttpServletRequest;

import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.eclipse.orion.internal.server.core.IWebResourceDecorator;
import org.eclipse.orion.internal.server.servlets.workspace.WebProject;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.maqetta.server.IDavinciServerConstants;

@SuppressWarnings("restriction")
public class MaqettaProjectDecorator implements IWebResourceDecorator {

	/*
	 * This class is a filter which is allowed to add elements to the JSON data returned to the client.
	 * 
	 * It waits for a /workspace/ID command (which returns the children of a workspace), and checks if each childs
	 * is a maqetta based project (ie. /project/.settings/libs.settings exists).  If so the JSON data is
	 * augmented.  This data can be checked in the plugin for conditional functionality.
	 * 	
	 */
	public void addAtributesFor(HttpServletRequest request, URI resource,JSONObject representation) {
		IPath resourcePath = new Path(request.getServletPath() + (request.getPathInfo() == null ? "" : request.getPathInfo()));
		
		if ("/workspace".equals(request.getServletPath()) && resourcePath.segmentCount() == 2) {
			try {
				JSONArray projObjects = representation.getJSONArray("Children");
				for (int i = 0; i < projObjects.length(); i++) {
					JSONObject projectObject = (JSONObject) projObjects.get(i);
					if (checkMaqettaProject(projectObject)){
						projectObject.put(IDavinciServerConstants.MAQETTA_PROJECT, true);
					}else{
						projectObject.put("maqettaProject", false);
					}
				}
			} catch (JSONException e) {
				try {
					if(checkMaqettaProject(representation))
						representation.put(IDavinciServerConstants.MAQETTA_PROJECT, true);
					else
						representation.put("rootFolder", true);
				} catch (JSONException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				} catch (CoreException e2) {
					// TODO Auto-generated catch block
					e2.printStackTrace();
				}
			} catch (CoreException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} 
		}else if("/file".equals(request.getServletPath()) ){
			try {
				
				/* if we get here, we're getting file contents from workspace. so need a way to check if its already a project
				 * 
				 */
				
			
				JSONArray projObjects = representation.getJSONArray("Children");
				for (int i = 0; i < projObjects.length(); i++) {
					JSONObject projectObject = (JSONObject) projObjects.get(i);
					if(projectObject.getBoolean("Directory"))
						projectObject.put("maqettaProject", false);
				
				}
				
			} catch (JSONException e) {
				try {
				
						representation.put(IDavinciServerConstants.MAQETTA_PROJECT, true);
					
				} catch (JSONException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				} 
			} 
		}
			
		

	}
	private boolean checkMaqettaProject(JSONObject projectObject) throws JSONException, CoreException{
		WebProject project = WebProject.fromId(projectObject.getString("Id"));
		IFileStore settings;
		settings = project.getProjectStore().getChild(IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
		if (settings == null)
			return false;
			IFileStore libFile = settings.getChild(IDavinciServerConstants.LIBS_FILE);
		if (libFile != null && libFile.fetchInfo().exists())
			return true;
		return false;
	}
}
