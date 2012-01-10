package maqetta.core.server.standalone.command;

import java.io.IOException;
import java.io.OutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IVResource;

public class CreateResource extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        String path = req.getParameter("path");
        boolean isFolder = "true".equalsIgnoreCase(req.getParameter("isFolder"));
        IVResource newFile = user.createResource(path);
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
                
                /* HACK: this fixes a bug that if a user creates a new / empty resource, then closes it the files working copy isn't removed in windows with the file.delete() call. 
                 * it seems if you open an IO stream to the resource (without writing anything) then close and flush the stream the problem goes away.
                 * 
                 * 
                 */
                OutputStream stream = newFile.getOutputStreem();
                stream.flush();
                stream.close();
                responseString = "OK";

            }
        }

    }

}
