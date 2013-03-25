package org.maqetta.server;

import java.io.IOException;

import org.davinci.server.user.IUser;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;

public interface IProjectTemplatesManager {

	// Manage project templates folder here
	
	
	public JSONObject getProjectTemplatesIndex() throws IOException;
	public JSONArray getProjectTemplates();
	public JSONArray getProjectTemplates(IUser user);
	public String addProjectTemplate(IUser user, JSONObject params);

}