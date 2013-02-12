package maqetta.server.orion.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.server.orion.user.OrionUser;

import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.CoreException;
import org.maqetta.server.Command;

public class ConfigProject extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	
        String projectName = req.getParameter("project");
        String orionProject = req.getParameter("orionProject");
        boolean configOnly = "true".equals(req.getParameter("configOnly"));
        String context = req.getContextPath();

        if (orionProject != null) {
            OrionUser u = (OrionUser) user;
            try {
                projectName = u.computeMaqettaPath(orionProject, context);
            } catch (CoreException e) {
                throw new IOException(e);
            }
        }
        
    	user.createProject(projectName);

    	this.responseString = "OK";
    	if (configOnly) {
    		resp.sendRedirect(context + "/maqetta/");
    	} else {
    		resp.sendRedirect(context + "/maqetta/?project=" + projectName);
    	}
    }

}
