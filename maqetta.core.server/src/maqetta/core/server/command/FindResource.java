package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.util.Resource;

import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.Command;
import org.maqetta.server.IVResource;

public class FindResource extends Command {

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
        this.responseString = Resource.foundVRsourcesToJson(foundFiles, user);
        resp.setContentType("application/json;charset=UTF-8");
    }
}
