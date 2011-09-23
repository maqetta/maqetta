package maqetta.core.server.standalone.command;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;

public class GetPreferences extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        String path = req.getParameter("id");
        String base = req.getParameter("base");
        
        File userSettings = user.getWorkbenchSettings(base);
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
