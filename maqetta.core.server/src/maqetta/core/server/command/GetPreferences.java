package maqetta.core.server.command;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IStorage;

public class GetPreferences extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        String path = req.getParameter("id");
        String base = req.getParameter("base");
        
        IStorage userSettings = user.getWorkbenchSettings(base);
        IStorage settingsFile = userSettings.newInstance(userSettings, path + IDavinciServerConstants.SETTINGS_EXTENSION);
		
        if(!user.isValid(settingsFile.getAbsolutePath()) ) return;
        
        
        InputStream inputStream;
        if (settingsFile.exists()) {
            inputStream = new BufferedInputStream(settingsFile.getInputStream());

        } else {
            inputStream = new ByteArrayInputStream("".getBytes());
        }
        Command.transferStreams(inputStream, resp.getOutputStream(), true);
        resp.setContentType("application/json;charset=UTF-8");
    }

}
