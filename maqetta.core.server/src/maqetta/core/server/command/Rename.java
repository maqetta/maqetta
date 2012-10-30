package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.util.VResourceUtils;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IVResource;

public class Rename extends Command {

    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	// SECURITY, VALIDATION
    	//   'oldName': checked by User.getResource()
    	//   'newName': checked by User.createResource()

        String oldName = req.getParameter("oldName");
        String newName = req.getParameter("newName");

        IVResource source = user.getResource(oldName);
        IVResource newResource = user.createResource(newName, source.isDirectory());
        if (source.isDirectory()) {
            newResource.mkdir();
            VResourceUtils.copyDirectory(source, newResource, true);
        } else {
            VResourceUtils.copyFile(source, newResource);
        }
        source.delete();
        user.rebuildWorkspace();
        this.responseString = "OK";
    }

}
