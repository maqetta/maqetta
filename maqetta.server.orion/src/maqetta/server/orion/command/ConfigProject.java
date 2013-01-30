package maqetta.server.orion.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.server.orion.user.OrionUser;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;

public class ConfigProject extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	
        String projectName = req.getParameter("project");
        String orionProject = req.getParameter("orionProject");
        if (orionProject!=null) {
        	OrionUser u = (OrionUser) user;
        	projectName = u.computeMaqettaPath(orionProject);
        }
        
        boolean configOnly = "true".equals(req.getParameter("configOnly"));
        String context = req.getContextPath();
        
    	user.createProject(projectName);

    	this.responseString = "OK";
    	if (configOnly) {
    		resp.sendRedirect(context + "/maqetta/");
    	} else {
    		resp.sendRedirect(context + "/maqetta/?project=" + projectName);
    	}
    }

}
