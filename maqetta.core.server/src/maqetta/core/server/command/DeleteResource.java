package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IVResource;

public class DeleteResource extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	// SECURITY, VALIDATION
    	//   'path': checked by User.getResouce()

        String path = req.getParameter("path");
        IVResource file = user.getResource(path);
        if (file.isDirectory()) {
            deleteDir(file);
        } else {
            if (file.delete()) {
                responseString = "OK";
            } else {
                errorString = "Problem deleting file: " + file.getPath();
            }
        }
        user.rebuildWorkspace();
    }

    private void deleteDir(IVResource file) throws IOException {
        IVResource[] files = file.listFiles();
        for (int i = 0; i < files.length; i++) {
            if (files[i].isDirectory()) {
                deleteDir(files[i]);
                if (this.getErrorString() != null) {
                   return;
                }
            } else {
                if (files[i].delete()) {
                    responseString = "OK";
                } else {
                    errorString = "Problem deleting file: " + files[i].getPath();
                    return;
                }
            }
        }
        if (file.delete()) {
            responseString = "OK";
        } else {
            errorString = "Problem deleting directory: " + file.getPath();
        }
    }
}
