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

public class CreateProjectTemplate extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
		Boolean error = false;
		String errorString = "";
		
		String paramsJson = req.getParameter("params");
		if (paramsJson == null || paramsJson.equals("")) {
			errorString = "cmd/createProjectTemplate - No params object";
			error = true;
		}
		JSONObject params = null;
		try{
			params = new JSONObject(paramsJson);
		} catch (JSONException e) {
			errorString = "cmd/createProjectTemplate - json exception";
			error = true;
		}
		IProjectTemplatesManager projectTemplatesManager = ServerManager.getServerManager().getProjectTemplatesManager();
		if(!error){
			errorString = projectTemplatesManager.addProjectTemplate(user, params);
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
			this.responseString = "{\"success\":false, \"error\":\"cmd/createProjectTemplate json exception\"}";
		}
		resp.setContentType("application/json;charset=UTF-8");
	
}

}