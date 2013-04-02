package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;

public class CreateProject extends Command {

    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        String projectName = req.getParameter("name");
        if (projectName == null || projectName.equals("")) {
        	errorString = "No project name specified";
        }
        String projectToClone = req.getParameter("projectToClone");
        String projectTemplateName = req.getParameter("projectTemplate");

        boolean eclipseProject = "true".equalsIgnoreCase(req.getParameter("eclipseSupport"));
        if (eclipseProject) {
        	user.createEclipseProject(projectName, projectToClone, projectTemplateName);
        } else {
        	user.createProject(projectName, projectToClone, projectTemplateName);
        }
        responseString = "OK";
    }

}