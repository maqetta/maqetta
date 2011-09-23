package maqetta.core.server.standalone.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.standalone.Resource;

import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.Command;
import org.maqetta.server.IVResource;

public class FindResource extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        String pathStr = req.getParameter("path");
        String inFolder = req.getParameter("inFolder");
        boolean ignoreCase = "true".equals(req.getParameter("ignoreCase"));
        boolean workspaceOnly = Boolean.parseBoolean(req.getParameter("workspaceOnly"));
      
        IVResource[] foundFiles = null;
        if (inFolder != null) {
        	IPath path = new Path(inFolder).append(pathStr);
            foundFiles = user.findFiles(path.toString(), inFolder, ignoreCase, workspaceOnly);
        } else {
            foundFiles = user.findFiles(pathStr, ignoreCase, workspaceOnly);
        }
        this.responseString = Resource.foundVRsourcesToJson(foundFiles, user);

    }

}
