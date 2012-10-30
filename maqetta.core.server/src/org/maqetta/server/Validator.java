package org.maqetta.server;

import javax.mail.internet.InternetAddress;
import javax.mail.internet.AddressException;
import java.util.regex.Pattern;
import org.davinci.server.review.Version;

public class Validator {

	// pattern matches that used in "Register for Maqetta" dialog
	private static Pattern userNamePattern = Pattern.compile("^\\w(\\w|[.@]){4,20}$");
	
	public static boolean isEmail(String email) {
		try {
			new InternetAddress(email).validate();
		} catch(AddressException ex) {
			return false;
		}
		return true;
	}
	
	public static boolean isValidISOTimeStamp(String timeStamp) {
		return Version.isValidISOTimeStamp(timeStamp);
	}
	
	public static boolean isUserName(String name) {
		return userNamePattern.matcher(name).matches();
	}
}
