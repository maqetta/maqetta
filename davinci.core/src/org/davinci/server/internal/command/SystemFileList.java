package org.davinci.server.internal.command;

import java.io.File;
import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.ServerManager;
import org.davinci.server.user.User;

public class SystemFileList extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException {

        if (ServerManager.LOCAL_INSTALL) {
            String pathParm = req.getParameter("path");
            String queryParm = req.getParameter("query");

            if (queryParm != null) {
                File[] files;
                files = File.listRoots();

                StringBuffer sb = new StringBuffer("{\n 'total': " + files.length + ", pathSeparator : '" + File.separator.replace("\\", "\\\\")
                        + "',\n 'items' : [");
                for (int i = 0; i < files.length; i++) {
                    File file = files[i];
                    if (file.isHidden() && file.getParentFile() != null) {
                        continue;
                    }
                    if (i > 0) {
                        sb.append(',');
                    }
                    sb.append(getSystemFileInfo(file));
                }
                sb.append("\n ]\n}");
                responseString = sb.toString();
            } else if (pathParm != null) {
                File file = new File(pathParm.trim());
                if (file.exists()) {
                    responseString = getSystemFileInfo(file);
                }
            }
        } else {
            errorString = "Invalid Request";
        }
    }

    private String pathEscape(String path) {
        if (path.endsWith(File.separator)) {
            path = path.substring(0, path.length() - 1);
        }
        path = path.replace("\\", "\\\\").replace("'", "\\'");
        return path;
    }

    private String getSystemFileInfo(File file) {
        StringBuffer sb = new StringBuffer();
        File parent = file.getParentFile();
        String fileName = file.getName();
        String parentPath = (parent != null) ? parent.getPath() : "root";
        String path = file.getPath();
        if (fileName.length() == 0) {
            fileName = path;
        }
        parentPath = pathEscape(parentPath);
        path = pathEscape(path);
        fileName = pathEscape(fileName);
        sb.append("{'name': '").append(fileName).append("',");
        sb.append("'parentDir': '").append(parentPath).append("',");
        sb.append(" 'size': ").append(file.getTotalSpace()).append(",");
        sb.append("'modified': 1234567,");
        sb.append("  'directory': ").append(file.isDirectory()).append(",");
        if (file.isDirectory()) {
            sb.append("'children' : [ ");
            String[] childNames = file.list();
            if (childNames != null) {
                for (int j = 0; j < childNames.length; j++) {
                    if (j > 0) {
                        sb.append(",");
                    }
                    sb.append("'").append(pathEscape(childNames[j])).append("'");
                }
            }
            sb.append("],");
        }
        sb.append("  'path': ' ").append(path).append("'}");
        return sb.toString();
    }

}
