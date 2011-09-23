package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.user.IUser;

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