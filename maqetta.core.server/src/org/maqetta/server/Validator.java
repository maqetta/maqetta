package org.maqetta.server;

import javax.mail.internet.InternetAddress;
import javax.mail.internet.AddressException;
import java.util.regex.Pattern;

public class Validator {

	// pattern matches that used in "Register for Maqetta" dialog
	private static Pattern userNamePattern = Pattern.compile("^\\w+$");
	
	public static boolean isEmail(String email) {
		try {
			new InternetAddress(email).validate();
		} catch(AddressException ex) {
			return false;
		}
		return true;
	}
	
	public static boolean isUserName(String name) {
		// For Joomla builds, username is an email.
		// That is not the case for the 'standalone' build, so need to handle
		// that here.
		// NOTE: This code matches (more or less) that for the "Register for
		//       Maqetta" dialog in maqetta.core.client/WebContent/welcome.html
		//       (dialog is seen in the standalone build).  Keep the two in sync.
		return userNamePattern.matcher(name).matches() ||
				Validator.isEmail(name);
	}
}
