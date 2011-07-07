package org.davinci.server.internal.command;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.user.User;

public class SetPreferences extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException {
        String id = req.getParameter("id");
        File settingsDir = user.getSettingsDirectory();
        File settingsFile = new File(settingsDir, id + IDavinciServerConstants.SETTINGS_EXTENSION);
        if (!settingsFile.exists()) {
            settingsFile.createNewFile();
        }
        OutputStream os = new BufferedOutputStream(new FileOutputStream(settingsFile));
        Command.transferStreams(req.getInputStream(), os, false);
    }

}
