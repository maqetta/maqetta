package maqetta.core.server.command;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.json.JSONException;
import org.json.JSONObject;
import org.maqetta.server.Command;
import org.maqetta.server.IProjectTemplatesManager;
import org.maqetta.server.ServerManager;

public class CreateProjectTemplate extends Command {
	static final private Logger theLogger = Logger.getLogger(ServerManager.class.getName());

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
		Boolean error = false;
		String errorString = "";
		
		String paramsJson = req.getParameter("params");
		if (paramsJson == "" || paramsJson == null) {
			errorString = "No params object";
			error = true;
		}
		JSONObject params = null;
		try{
			params = new JSONObject(paramsJson);
		} catch (JSONException e) {
			String desc = "getProjectTemplates - json exception";
			theLogger.log(Level.SEVERE, desc, e);
			throw new Error(desc, e);
		}
		
		IProjectTemplatesManager projectTemplatesManager = ServerManager.getServerManager().getProjectTemplatesManager();
		errorString = projectTemplatesManager.addProjectTemplate(user, params);
		error = (errorString == "" || errorString == null) ? false : true;
    	String successString = error ? "false" : "true";
        this.responseString = "{success:" + successString;
        if(error){
        	// Escape backslashes, single quotes and double-quotes
        	// BTW - Java regexps are horrible! To replace a single backslash with a double backslash, need 4 and 8!
        	this.responseString += ", error:\"" + errorString.replaceAll("\\\\","\\\\\\\\").replaceAll("'","\\\\\\'").replaceAll("\"","\\\\\"") + "\"";
        }
        this.responseString += "}";
        resp.setContentType("application/json;charset=UTF-8");
    }
    
}