package maqetta.core.server.command;

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
import org.maqetta.server.IStorage;

public class GetWorkbenchState extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        IStorage userSettings = user.getWorkbenchSettings();
        IStorage settingsFile = userSettings.newInstance(userSettings, IDavinciServerConstants.WORKBENCH_STATE_FILE);
        InputStream inputStream;
        if (settingsFile.exists()) {
            inputStream = settingsFile.getInputStream();

        } else {
            inputStream = new ByteArrayInputStream("{}".getBytes());
        }
        Command.transferStreams(inputStream, resp.getOutputStream(), true);
        resp.setContentType("application/json;charset=UTF-8");
    }

}
