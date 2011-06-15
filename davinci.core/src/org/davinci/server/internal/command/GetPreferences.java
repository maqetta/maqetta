package org.davinci.server.internal.command;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.user.User;

public class GetPreferences extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException {
        String path = req.getParameter("id");
        File userSettings = user.getSettingsDirectory();
        File settingsFile = new File(userSettings, path + IDavinciServerConstants.SETTINGS_EXTENSION);
        InputStream inputStream;
        if (settingsFile.exists()) {
            inputStream = new BufferedInputStream(new FileInputStream(settingsFile));

        } else {
            inputStream = new ByteArrayInputStream("".getBytes());
        }
        Command.transferStreams(inputStream, resp.getOutputStream(), true);

    }

}
