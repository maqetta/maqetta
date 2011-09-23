package maqetta.core.server.standalone.command;

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

public class GetWorkbenchState extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        File userSettings = user.getWorkbenchSettings();
        File settingsFile = new File(userSettings, IDavinciServerConstants.WORKBENCH_STATE_FILE);
        InputStream inputStream;
        if (settingsFile.exists()) {
            inputStream = new FileInputStream(settingsFile);

        } else {
            inputStream = new ByteArrayInputStream("{}".getBytes());
        }
        Command.transferStreams(inputStream, resp.getOutputStream(), true);

    }

}
