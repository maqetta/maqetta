package org.davinci.server.internal.command;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.ajaxLibrary.Library;
import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.ServerManager;
import org.davinci.server.VLibraryResource;
import org.davinci.server.user.User;
import org.davinci.server.util.JSONReader;

public class Download extends Command {

    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException {
        if (user == null) {
            return;
        }

        String path = req.getParameter("fileName");
        String res = req.getParameter("resources");
        String libs = req.getParameter("libs");
        ArrayList o = (ArrayList) JSONReader.read(res);
        List lib = (List) JSONReader.read(libs);
        String[] resources = (String[]) o.toArray(new String[o.size()]);

        IVResource[] files = new IVResource[resources.length];
        for (int i = 0; i < files.length; i++) {
            files[i] = user.getResource(resources[i]);
        }

        try {
            resp.setContentType("application/x-download");
            resp.setHeader("Content-Disposition", "attachment; filename=" + path);

            ZipOutputStream zos = new ZipOutputStream(resp.getOutputStream());
            zipFiles(files, zos, false);
            zipLibs(lib, zos);
            zos.close();
            // responseString="OK";

        } catch (IOException e) {
            responseString = "Error creating download file : " + e;
        } finally {
            resp.getOutputStream().close();
        }

    }
    
    private static void zipLibs(List libs, ZipOutputStream zos) throws IOException{
        for (int i = 0; i < libs.size(); i++) {
            HashMap libEntry = (HashMap) libs.get(i);
            String id = (String) libEntry.get("id");
            String version = (String) libEntry.get("version");
            String path = (String) libEntry.get("root");
            Library lib = ServerManager.getServerManger().getLibraryManager().getLibrary(id, version);
            IVResource libResource = new VLibraryResource(lib, lib.getURL(""), null ,path, "");
            zipDir(libResource,zos, true);
            
        }
    }
    

    private static void zipDir(IVResource zipDir, ZipOutputStream zos, boolean includeLibs) throws IOException {
        IVResource[] dirList = zipDir.listFiles();
        
        if(!includeLibs && zipDir instanceof VLibraryResource)
        	return;
        
        zipFiles(dirList, zos,includeLibs);
    }

    private static void zipFiles(IVResource[] files, ZipOutputStream zos, boolean includeLibs) throws IOException {
        byte[] readBuffer = new byte[2156];
        int bytesIn = 0;
        // loop through dirList, and zip the files
        for (int i = 0; i < files.length; i++) {
            if (files[i].isDirectory()) {
                zipDir(files[i], zos,includeLibs);
                continue;
            }
            if(!includeLibs && files[i] instanceof VLibraryResource)
            	continue;
            
            InputStream fis = files[i].getInputStreem();
            ZipEntry anEntry = new ZipEntry(files[i].getPath().toString());
                // place the zip entry in the ZipOutputStream object
            zos.putNextEntry(anEntry);
                // now write the content of the file to the ZipOutputStream
            while ((bytesIn = fis.read(readBuffer)) != -1) {
              zos.write(readBuffer, 0, bytesIn);
            }
                // close the Stream
            fis.close();
            files[i].removeWorkingCopy();
       }
    }

}
