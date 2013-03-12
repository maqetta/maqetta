package org.maqetta.server;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Enumeration;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;

public abstract class Command {

    protected String errorString;
    protected String responseString;

    abstract public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException;

    public String getErrorString() {
        return errorString;
    }

    
    /* return true if the request originated from one of the local IPs */
    public static boolean isLocalRequest(HttpServletRequest req){
    	boolean isLocal = false;
    	String remoteIP = req.getRemoteAddr();
    	try{
	    	for (Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces(); en.hasMoreElements();) {
	    		NetworkInterface intf = en.nextElement();
	    		for (Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses(); enumIpAddr.hasMoreElements();) {
	    			InetAddress inetAddress = enumIpAddr.nextElement();
	    			String address = inetAddress.getHostAddress();
	    			if(address.equals(remoteIP)) return true;
	    		}
	    	}
		}catch(Exception ex){
			// network exceptions
		}
    	return isLocal;
    }
    
    public String getResponse() {
        return responseString;
    }

    public void init() {
        this.errorString = null;
        this.responseString = null;

    }

    public static File getWorkingCopy(File file) {
        File parent = file.getParentFile();
        File workingCopy = new File(parent, file.getName() + IDavinciServerConstants.WORKING_COPY_EXTENSION);
        return workingCopy;
    }

    public static final void transferStreams(InputStream source, OutputStream destination, boolean closeInput) throws IOException {
        byte[] buffer = new byte[8192];
        try {
            synchronized(buffer){
                while (true) {
                    int bytesRead = -1;
                    bytesRead = source.read(buffer);
                    if (bytesRead == -1) {
                        break;
                    }
                    destination.write(buffer, 0, bytesRead);
                }
            }
        } finally {
            if (closeInput) {
                source.close();
            } else {
                destination.close();
            }
        }
    }
}
