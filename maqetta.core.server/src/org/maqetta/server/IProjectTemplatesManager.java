package org.maqetta.server;

import java.io.IOException;

import org.davinci.server.user.IUser;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;

public interface IProjectTemplatesManager {

	// Manage project templates folder here
	
	
	public JSONObject getProjectTemplatesIndex() throws IOException;
	public JSONObject getProjectTemplatesIndex(IUser user) throws IOException;
	public Boolean getEnableProjectSharingAll();
	public String addProjectTemplate(IUser user, JSONObject params);
	public String deleteProjectTemplates(IUser user, JSONArray params);
	public String modifyProjectTemplates(IUser user, JSONArray params);
	public IStorage getProjectTemplatesDirectory() throws IOException;

}