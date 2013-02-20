package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IVResource;

public class CreateResource extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	// SECURITY, VALIDATION
    	//   'path': checked by User.createResource()
    	//   'isFolder': validated by Boolean.parseBoolean()

        String path = req.getParameter("path");
        boolean isFolder = Boolean.parseBoolean(req.getParameter("isFolder"));
        IVResource newFile = user.createResource(path,isFolder);
        if (newFile.exists()) {
            responseString = "EXISTS";
        } else if (isFolder) {
            if (newFile.mkdir()) {
                responseString = "OK";
            } else {
            	throw new IOException("Failed to create folder. path:" + path);
            }
        } else {
            newFile.createNewInstance();
            
            /* HACK: this fixes a bug that if a user creates a new / empty resource, then closes it the files working copy isn't removed in windows with the file.delete() call. 
             * it seems if you open an IO stream to the resource (without writing anything) then close and flush the stream the problem goes away.
             */
            responseString = "OK";
        }
    }
}
