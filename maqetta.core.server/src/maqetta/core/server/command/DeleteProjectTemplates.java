package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;
import org.maqetta.server.Command;
import org.maqetta.server.IProjectTemplatesManager;
import org.maqetta.server.ServerManager;

public class DeleteProjectTemplates extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
		Boolean error = false;
		String errorString = "";
		
		String paramsJson = req.getParameter("params");
		if (paramsJson == null || paramsJson.equals("")) {
			errorString = "cmd/DeleteProjectTemplates - No params object";
			error = true;
		}
		JSONArray params = null;
		try{
			params = new JSONArray(paramsJson);
		} catch (JSONException e) {
			errorString = "cmd/DeleteProjectTemplates - json exception";
			error = true;
		}
		IProjectTemplatesManager projectTemplatesManager = ServerManager.getServerManager().getProjectTemplatesManager();
		if(!error){
			errorString = projectTemplatesManager.deleteProjectTemplates(user, params);
			error = (errorString == null || errorString.equals("")) ? false : true;
		}
		JSONObject responseObject = new JSONObject();
		try{
			responseObject.put("success", !error);
			if(error){
				responseObject.put("error", errorString);
			}
			this.responseString = responseObject.toString(2);
		} catch (JSONException e) {
			this.responseString = "{\"success\":false, \"error\":\"cmd/DeleteProjectTemplates json exception\"}";
		}
		resp.setContentType("application/json;charset=UTF-8");
	
}

}