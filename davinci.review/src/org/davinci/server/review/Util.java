package org.davinci.server.review;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.OutputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

import org.davinci.server.ServerManager;
import org.davinci.server.user.User;
import org.eclipse.core.runtime.IConfigurationElement;

public class Util {
	public static Date getCurrentDateInGmt0() {
		Date date = new Date();
		date.setTime(date.getTime() - TimeZone.getDefault().getOffset(date.getTime()));

		return date;
	}

	public static String getCommonNotificationId() {
		String notificationId = null;
		
		notificationId = ServerManager.getServerManger().getDavinciProperty(Constants.EP_ATTR_MAIL_CONFIG_NOTIFICATIONID);
		if(notificationId == null || "".equals(notificationId)){
			IConfigurationElement mailConfig = ServerManager.getServerManger().getExtension(Constants.EXTENSION_POINT_MAIL_CONFIG, Constants.EP_TAG_MAIL_CONFIG);
			if(mailConfig != null){
				notificationId = mailConfig.getAttribute(Constants.EP_ATTR_MAIL_CONFIG_NOTIFICATIONID);
			}
		}
		if(notificationId == null){
			notificationId = "noreply@website.org";
		}
		return notificationId;
	}

	public static String genHtmlHeader() {
		return "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\"><html><head></head><body>";
	}

	public static String genHtmlTail() {
		return "</body></html>";
	}

	/**
	 * 
	 * @param obj
	 *            must implement Serializable
	 * @return a deep copy of an object
	 */
	public static Object deepClone(Object obj) {
		ObjectOutputStream oos = null;
		ObjectInputStream ois = null;
		try {
			ByteArrayOutputStream bos = new ByteArrayOutputStream();
			oos = new ObjectOutputStream(bos);
			oos.writeObject(obj);
			oos.flush();
			ByteArrayInputStream bin = new ByteArrayInputStream(bos.toByteArray());
			ois = new ObjectInputStream(bin);
			return ois.readObject();
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		} finally {
			close(oos);
			close(ois);
		}
	}

	public static void close(OutputStream os) {
		if (os != null) {
			try {
				os.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

	public static void close(InputStream is) {
		if (is != null) {
			try {
				is.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

	public static boolean isBlank(String str) {
		return (str == null || str.length() == 0 || str.trim().length() == 0);
	}
}
