package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.Resource;
import org.davinci.server.user.User;

public class FindResource extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException {
        String pathStr = req.getParameter("path");
        String inFolder = req.getParameter("inFolder");
        boolean ignoreCase = "true".equals(req.getParameter("ignoreCase"));
        boolean workspaceOnly = Boolean.parseBoolean(req.getParameter("workspaceOnly"));
      
        IVResource[] foundFiles = null;
        if (inFolder != null) {
            foundFiles = user.findFiles(pathStr, inFolder, ignoreCase, workspaceOnly);
        } else {
            foundFiles = user.findFiles(pathStr, ignoreCase, workspaceOnly);
        }
        this.responseString = Resource.foundVRsourcesToJson(foundFiles, user);

    }

}
