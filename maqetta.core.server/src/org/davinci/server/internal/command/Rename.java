package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.VResourceUtils;
import org.davinci.server.user.IUser;

public class Rename extends Command {

    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {

        String oldName = req.getParameter("oldName");
        String newName = req.getParameter("newName");

        IVResource source = user.getResource(oldName);
        IVResource newResource = user.createResource(newName);
        if (source.isDirectory()) {
            newResource.mkdir();
            VResourceUtils.copyDirectory(source, newResource, true);
        } else {
            VResourceUtils.copyFile(source, newResource);
        }
        source.delete();

        this.responseString = "OK";
    }

}
