package maqetta.server.orion;

import java.net.URI;
import java.net.URISyntaxException;

import javax.servlet.http.HttpServletRequest;

import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.eclipse.orion.internal.server.core.IWebResourceDecorator;
import org.eclipse.orion.internal.server.servlets.ProtocolConstants;
import org.eclipse.orion.internal.server.servlets.workspace.WebProject;
import org.eclipse.orion.server.core.LogHelper;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.maqetta.server.IDavinciServerConstants;

public class MaqettaProjectDecorator implements IWebResourceDecorator {

	/*
	 * This class is a filter which is allowed to add elements to the JSON data returned to the client.
	 * 
	 * It waits for a /workspace/ID command (which returns the children of a workspace), and checks if each childs
	 * is a maqetta based project (ie. /project/.settings/libs.settings exists).  If so the JSON data is
	 * augmented.  This data can be checked in the plugin for conditional functionality.
	 * 	
	 */
	public void addAtributesFor(HttpServletRequest request, URI resource,
			JSONObject representation) {
		IPath resourcePath = new Path(resource.getPath());
		
		if (!"/workspace".equals(request.getServletPath())) //$NON-NLS-1$
			return;
		if (resourcePath.segmentCount() != 2)
			return;
		try {
			JSONArray projObjects = representation.getJSONArray("Children");
			for (int i = 0; i < projObjects.length(); i++) {

				JSONObject projectObject = (JSONObject) projObjects.get(i);
				WebProject project = WebProject.fromId(projectObject.getString("Id"));
				IFileStore settings;

				settings = project.getProjectStore().getChild(IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
				if (settings == null)
					return;

				IFileStore libFile = settings.getChild(IDavinciServerConstants.LIBS_FILE);
				if (libFile != null && libFile.fetchInfo().exists()){
					projectObject.put(IDavinciServerConstants.MAQETTA_PROJECT, true);
				}else{
					projectObject.put("potentialMaqettaProject", true);
				}
			}
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	
}
