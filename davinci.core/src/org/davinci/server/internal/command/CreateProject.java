package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.user.User;

public class CreateProject extends Command {

   
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException {
        String projectName = req.getParameter("name");
        boolean isFolder = "true".equalsIgnoreCase(req.getParameter("initContents"));
        IVResource newFile = user.createProject(projectName);
        if (isFolder) {
            if (newFile.exists()) {
                responseString = "Folder already exists";
            } else {
                if (newFile.mkdir()) {
                    responseString = "OK";
                }
            }

        } else {
            if (newFile.exists()) {
                responseString = "File already exists";
            } else {
                newFile.createNewInstance();
                responseString = "OK";

            }
        }

    }

}