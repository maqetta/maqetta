package maqetta.core.server.command;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.Command;
import org.maqetta.server.IVResource;

public class AddFiles extends Command {

    @Override
    public void handleCommand(HttpServletRequest request, HttpServletResponse resp, IUser user) throws IOException {
    	// SECURITY, VALIDATION
    	//   'path': checked by User.getResource()
    	//   items: XXX not validated

        String path = request.getParameter("path");
        resp.setContentType("application/json");
        boolean explodeZip = "1".equals(request.getParameter("explodeZip"));

        // Create a factory for disk-based file items
        FileItemFactory factory = new DiskFileItemFactory();

        // Create a new file upload handler
        ServletFileUpload upload = new ServletFileUpload(factory);

        ArrayList<String> fileNames = new ArrayList<String>();
        try {
            // Parse the request
            List<FileItem> items = upload.parseRequest(request);
            Iterator<FileItem> iter = items.iterator();
            IVResource userDirectory = user.getResource(path);
            while (iter.hasNext()) {
                FileItem item = iter.next();

                if (!item.isFormField()) {
                    String fileName = item.getName();
                    InputStream is = new BufferedInputStream(item.getInputStream());;
                    OutputStream os = null;
                    byte[] buffer = new byte[8192];

            		try {
	                    if(explodeZip && ("application/zip".equals(item.getContentType()) || fileName.endsWith(".zip"))){
							ZipInputStream zis = new ZipInputStream(is);
							ZipEntry entry;
						    int bytesIn;
							is = zis;
						
					        while ((entry = zis.getNextEntry()) != null) {
					        	String zipFileName = entry.getName();

//					        	theLogger.finest("Uploading zip: " + fileName + " entry: " + zipFileName);

					        	if(!zipFileName.endsWith("/")) {
					        		// Odd that create dir seems to do a recursive create, but file does not
					        		userDirectory.create(new Path(zipFileName).removeLastSegments(1).toString()+"/");
	
						        	IVResource uploaded = userDirectory.create(zipFileName);
				                    os = uploaded.getOutputStreem();
									while ((bytesIn = zis.read(buffer)) != -1) {
										os.write(buffer, 0, bytesIn);
									}
									os.flush();
									os.close();
				                    uploaded.flushWorkingCopy();
					        	}
			                    fileNames.add(zipFileName);
							}
						} else {
							//FIXME: common with above code
		                    IVResource uploaded = userDirectory.create(fileName);
		                    os = uploaded.getOutputStreem();
							while (true) {
								int bytesRead = -1;
								bytesRead = is.read(buffer);
								if (bytesRead == -1) {
									break;
								}
								os.write(buffer, 0, bytesRead);
							}
		                    fileNames.add(fileName);
		                    uploaded.flushWorkingCopy();
						}
					} finally {
            			is.close();
            			if (os != null) {
                			os.flush();
                			os.close();            				
            			}
            		}
                }
            }

            StringBuffer nms = new StringBuffer();
            boolean first = true;
            for (Iterator<String> iterator = fileNames.iterator(); iterator.hasNext();) {
                if (!first) {
                    nms.append(",");
                }
                first = false;
                String name = iterator.next();
                nms.append("{ \"file\":\"").append(name).append("\"}");
            }
            responseString = "[" + nms.toString() + "]";

        } catch (FileUploadException e) {
        	throw new IOException(e);
        }
    }

}
