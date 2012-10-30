package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IVResource;

public class RemoveWorkingCopy extends Command {

    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	// SECURITY, VALIDATION
    	//   'path': contents eventually checked by User.getResource()

    	String path = req.getParameter("path");
        IVResource file = user.getResource(path);
        if (file != null) {
        	/* have to force garbage collection, or on windows the resource is never deleted */
            file.removeWorkingCopy();
        }
    }

}
