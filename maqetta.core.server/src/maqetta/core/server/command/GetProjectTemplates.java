package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import java.text.Collator;

import org.davinci.server.user.IUser;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;
import org.maqetta.server.Command;
import org.maqetta.server.IProjectTemplatesManager;
import org.maqetta.server.ServerManager;
import org.maqetta.server.IDavinciServerConstants;

public class GetProjectTemplates extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
		Boolean error = false;
		String errorString = "";
		String searchString = "";
		String searchStringLC = "";
		int limit = 100; // User request can increase this, but only up to server max
		int offset = 0;
		
		String paramsJson = req.getParameter("params");
		if (paramsJson != null && !paramsJson.equals("")) {
			JSONObject params = null;
			try{
				params = new JSONObject(paramsJson);
				if(params.has("searchString")){
					searchString = params.getString("searchString");
					searchStringLC = searchString.toLowerCase();
				}
				if(params.has("limit")){
					limit = params.getInt("limit");
					// Don't let client request a number great than server-defined max
					if(limit > IDavinciServerConstants.PROJECT_TEMPLATES_MAX){
						limit = IDavinciServerConstants.PROJECT_TEMPLATES_MAX;
					}
				}
				if(params.has("offset")){
					offset = params.getInt("offset");
				}
			} catch (JSONException e) {
				errorString = "cmd/DeleteProjectTemplates - json exception";
				error = true;
			}
		}

		IProjectTemplatesManager projectTemplatesManager = ServerManager.getServerManager().getProjectTemplatesManager();
		JSONObject projectTemplatesObject = projectTemplatesManager.getProjectTemplatesIndex(user);
		Boolean enableProjectSharingAll = projectTemplatesManager.getEnableProjectSharingAll();
		try{
			JSONArray allUserTemplates = projectTemplatesObject.getJSONArray("templates");
			
			int countList = allUserTemplates.length();
			List<JSONObject> ls=new ArrayList<JSONObject>();
			for(int i=0; i< countList; i++){
				JSONObject template = allUserTemplates.getJSONObject(i);
				ls.add(template);
			}
			Collections.sort(ls, new JSONObjectComparable());
			JSONArray sortedUserTemplates = new JSONArray();
	        for (JSONObject t : ls) {
	        	sortedUserTemplates.put(t);
	        }

			projectTemplatesObject.remove("templates");
			JSONObject responseObject = new JSONObject();
			responseObject.put("success", !error);
			if(error){
				responseObject.put("error", errorString);
			}else{
				JSONArray returnTemplates = new JSONArray();
				int countAll = sortedUserTemplates.length();
				responseObject.put("searchString", searchString);
				responseObject.put("offset", offset);
				responseObject.put("limit", limit);
				responseObject.put("totalNumProjectTemplates", countAll);
				responseObject.put("enableProjectSharingAll", enableProjectSharingAll);
				int numFound = 0;
				int numAdded = 0;
				for(int i=0; i< countAll; i++){
					JSONObject template = sortedUserTemplates.getJSONObject(i);
					Boolean matches;
					if(searchStringLC.equals("")){
						matches = true;
					}else{
						matches = (match(template, "name", searchStringLC) ||
								match(template, "description", searchStringLC) ||
								match(template, "authorEmail", searchStringLC));
					}
					if(matches){
						if(numFound >= offset){
							returnTemplates.put(template);
							numAdded++;
						}
						numFound++;
						if(numAdded >= limit){
							break;
						}
					}
				}
				projectTemplatesObject.put("projectTemplates", returnTemplates);
				responseObject.put("projectTemplatesObject", projectTemplatesObject);
			}
			this.responseString = responseObject.toString(2);
		} catch (JSONException e) {
			this.responseString = "{\"success\":false, \"error\":\"cmd/DeleteProjectTemplates json exception\"}";
		}
		resp.setContentType("application/json;charset=UTF-8");
	}
	
	// Sees is searchString (assumed to be already converted to lowercase)
	// can be found in property "prop" within the given JSONObject (after converting to lowercase) 
	private Boolean match(JSONObject template, String propname, String searchString){
		try{
			if(template.has(propname)){
				String value = template.getString(propname);
				String valueLC = value.toLowerCase();
				return (valueLC.indexOf(searchString)>=0);
			}else{
				return false;
			}
		} catch (JSONException e) {
		}
		// Should never get here
		return false;
	}
	
	public class JSONObjectComparable extends JSONObject implements Comparator<JSONObject>{
		 
		public int compare(JSONObject o1, JSONObject o2) {
			try{
				Collator collator = Collator.getInstance();
				String thisName = o1.getString("name");
				String compareName = o2.getString("name");
				if(!thisName.equals(compareName)){
					int retval = collator.compare(thisName, compareName);
					return retval;
				}else{
					String thisAuthorEmail = o1.getString("authorEmail");
					String compareAuthorEmail = o2.getString("authorEmail");
					int retval = collator.compare(thisAuthorEmail, compareAuthorEmail);
					return retval;
				}
			} catch (JSONException e) {
			}
		return 0;
		}
	}

}