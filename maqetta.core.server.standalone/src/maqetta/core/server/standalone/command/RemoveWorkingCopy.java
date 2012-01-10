package maqetta.core.server.standalone.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IVResource;

public class RemoveWorkingCopy extends Command {

    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        String path = req.getParameter("path");
        IVResource file = user.getResource(path);
        if (file != null) {
        	/* have to force garbage collection, or on windows the resource is never deleted */
        	System.gc();
            file.removeWorkingCopy();
        }
    }

}
