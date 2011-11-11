package maqetta.core.server.standalone.command;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IVResource;

public class AddFiles extends Command {

    @Override
    public void handleCommand(HttpServletRequest request, HttpServletResponse resp, IUser user) throws IOException {
        String path = request.getParameter("path");
        resp.setContentType("application/json");

        // Create a factory for disk-based file items
        FileItemFactory factory = new DiskFileItemFactory();

        // Create a new file upload handler
        ServletFileUpload upload = new ServletFileUpload(factory);

        ArrayList fileNames = new ArrayList();
        try {
            // Parse the request
            List /* FileItem */items = upload.parseRequest(request);
            Iterator iter = items.iterator();
            IVResource userDirectory = user.getResource(path);
            while (iter.hasNext()) {
                FileItem item = (FileItem) iter.next();

                if (!item.isFormField()) {
                    String fileName = item.getName();
                    File f1 = new File(userDirectory.getURI());

                    File uploadedFile = new File(f1, fileName);
                    
                    /* ensure the file is valid and in the users workspace */
                    if(!user.isValid(uploadedFile.getAbsolutePath())) return;
                    
                    fileNames.add(fileName);
                    item.write(uploadedFile);
                }
            }

            StringBuffer nms = new StringBuffer();
            boolean first = true;
            for (Iterator iterator = fileNames.iterator(); iterator.hasNext();) {
                if (!first) {
                    nms.append(",");
                }
                first = false;
                String name = (String) iterator.next();
                nms.append("{ \"file\":\"").append(name).append("\"}");
            }
            responseString = "[" + nms.toString() + "]";

        } catch (FileUploadException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

}
