package maqetta.core.server.command;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.json.JSONException;
import org.json.JSONObject;
import org.maqetta.server.Command;
import org.maqetta.server.IVResource;

public class GetThemes extends Command {

	static final private Logger theLogger = Logger.getLogger(GetThemes.class.getName());

	@Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	// SECURITY, VALIDATION
    	//   'path': XXX not validated
    	//   'inFolder': XXX not validated
    	//   'ignoreCase': validated by Boolean.parseBoolean()
    	//   'workspaceOnly': validated by Boolean.parseBoolean()

        String pathStr = req.getParameter("path");
        String inFolder = req.getParameter("inFolder");
        boolean ignoreCase = Boolean.parseBoolean(req.getParameter("ignoreCase"));
        boolean workspaceOnly = Boolean.parseBoolean(req.getParameter("workspaceOnly"));
      
        IVResource[] foundFiles = null;
        if (inFolder != null) {
            foundFiles = user.findFiles(pathStr, inFolder, ignoreCase, workspaceOnly);
        } else {
            foundFiles = user.findFiles(pathStr, ignoreCase, workspaceOnly);
        }
        String ret = "[";
        String delem = " ";
        for (int i = 0; i < foundFiles.length; i++) {
    		IVResource f = foundFiles[i];
        	InputStream in = null;
        	try {
            	in = f.getInputStreem();
            	String output = this.fromStream(in);
        		JSONObject j = new JSONObject(output);
        		j.append("path", f.getPath());
        		ret = ret + delem + j.toString();
        		delem = ", ";
    		}
    		catch(JSONException ex) {
				theLogger.logp(Level.SEVERE, GetThemes.class.getName(), "handleCommand", f.getPath() + " not valid json", ex);
    		} finally {
				if (in != null)
					in.close();
    		}
        }
        ret = ret + "]";
        this.responseString =  ret; //Resource.foundVRsourcesToJson(foundFiles, user);
        resp.setContentType("application/json;charset=UTF-8");
    }
    
    private String fromStream(InputStream in) throws IOException
    {
        BufferedReader reader = new BufferedReader(new InputStreamReader(in));
        StringBuilder out = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            out.append(line);
        }
        return out.toString();
    }
}
