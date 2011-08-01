package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.user.User;

public class DeleteResource extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException {
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
    }

    private void deleteDir(IVResource file) {
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
