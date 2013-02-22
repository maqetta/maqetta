package org.davinci.server.review;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.OutputStream;
import java.util.Map;
import java.util.Properties;

public class Utils {
	private static Properties templateProperties;

	static{
		templateProperties = new Properties();
		try{
			templateProperties.load(new Utils().getClass().getClassLoader().getResourceAsStream(Constants.TEMPLATE_PROPERTY_FILE));
		}catch(IOException e){
			e.printStackTrace();
		}
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

	public static Properties getTemplates(){
		return templateProperties;
	}

	private static final String START_FLAG = "${";
	private static final String END_FLAG = "}";

	public static String substitute(String s, Map<String, String> map) {
		StringBuilder ret = new StringBuilder(s.length());
		int pos = 0;
		for(int start, end; (start = s.indexOf(START_FLAG, pos)) != -1 && (end = s.indexOf(END_FLAG, start)) != -1;){
			ret.append(s.substring(pos, start)).append(
					map.get(s.substring(start + START_FLAG.length(), end)));
			pos = end + END_FLAG.length();
		}
		ret.append(s.substring(pos, s.length()));
		return ret.toString();
	}
}
