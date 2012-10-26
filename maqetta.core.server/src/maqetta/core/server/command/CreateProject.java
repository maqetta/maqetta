package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IVResource;

public class CreateProject extends Command {

   
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        String projectName = req.getParameter("name");
        boolean initContents = "true".equalsIgnoreCase(req.getParameter("initContents"));
        boolean eclipseProject = "true".equalsIgnoreCase(req.getParameter("eclipseSupport"));
        if(eclipseProject){
        	IVResource newFile = user.createEclipseProject(projectName);
        }else{
        
        	IVResource newFile = user.createProject(projectName);
        }
        responseString = "OK";

    }

}