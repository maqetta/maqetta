package maqetta.core.server.orion.command;
import java.io.IOException;

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
                responseString = "OK";

            }
        }

    }

}
