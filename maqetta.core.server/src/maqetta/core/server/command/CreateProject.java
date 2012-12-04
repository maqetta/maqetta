package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;

public class CreateProject extends Command {

    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        String projectName = req.getParameter("name");
        if (projectName == "" || projectName == null) {
        	errorString = "No project name specified";
        }

        boolean eclipseProject = "true".equalsIgnoreCase(req.getParameter("eclipseSupport"));
        if (eclipseProject) {
        	user.createEclipseProject(projectName);
        } else {
        	user.createProject(projectName);
        }
        responseString = "OK";
    }

}