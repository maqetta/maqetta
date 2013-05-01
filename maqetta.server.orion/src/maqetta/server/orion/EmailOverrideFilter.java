package maqetta.server.orion;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.logging.Logger;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import maqetta.server.orion.internal.Activator;

import org.eclipse.orion.server.useradmin.UserEmailUtil;

/**
 * Orion 2.0 does not allow apps built on Orion to override the email templates. This filter does
 * that by using Java Reflection APIs. When the first request is made, this code loads our email
 * templates and injects them into Orion's UserEmailUtil.java.
 * 
 * @see https://bugs.eclipse.org/bugs/show_bug.cgi?id=403261
 */

@SuppressWarnings("restriction")
public class EmailOverrideFilter implements Filter {

	private boolean called;

	private static final String EMAIL_CONFIRMATION_FILE = "/emails/EmailConfirmation.txt"; //$NON-NLS-1$
	private static final String EMAIL_CONFIRMATION_RESET_PASS_FILE = "/emails/EmailConfirmationPasswordReset.txt"; //$NON-NLS-1$
	private static final String EMAIL_PASSWORD_RESET = "/emails/PasswordReset.txt"; //$NON-NLS-1$

	static final private Logger theLogger = Logger.getLogger(EmailOverrideFilter.class.getName());

	// copied from Orion's UserEmailUtil; changed to load emails from our bundle instead
	private class EmailContent {
		private String title;
		private String content;

		public String getTitle() {
			return title;
		}

		public String getContent() {
			return content;
		}

		public EmailContent(String fileName) throws URISyntaxException, IOException {
			URL entry = Activator.getDefault().getContext().getBundle().getEntry(fileName);
			if (entry == null)
				throw new IOException("File not found: " + fileName);
			BufferedReader reader = new BufferedReader(new InputStreamReader(entry.openStream()));
			String line = null;
			try {
				title = reader.readLine();
				StringBuilder stringBuilder = new StringBuilder();
				String ls = System.getProperty("line.separator");
				while ((line = reader.readLine()) != null) {
					stringBuilder.append(line);
					stringBuilder.append(ls);
				}
				content = stringBuilder.toString();
			} finally {
				reader.close();
			}
		}
	};

	public void init(FilterConfig arg0) throws ServletException {
		theLogger.info("Initializing...");
	}

	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		// check to make sure we only run this code once
		if (!called) {
			called = true;
	
			overrideEmailContents();
		}
		
		chain.doFilter(request, response);

		// TODO Since we only need to run this filter once, to do initial setup, it would be great
		// if we could unregister it.  However, I ran into problems when trying to unregister from
		// within this filter, itself.
	}

	private void overrideEmailContents() throws IOException, ServletException {
		theLogger.info("Overriding Orion email templates");

		UserEmailUtil util = UserEmailUtil.getUtil();

		try {
			setModifiedEmailContent(util, EMAIL_CONFIRMATION_FILE, "confirmationEmail"); //$NON-NLS-1$
			setModifiedEmailContent(util, EMAIL_CONFIRMATION_RESET_PASS_FILE, "confirmationResetPassEmail"); //$NON-NLS-1$
			setModifiedEmailContent(util, EMAIL_PASSWORD_RESET, "passwordResetEmail"); //$NON-NLS-1$
		} catch (IllegalArgumentException e) {
			handleException(e);
		} catch (SecurityException e) {
			handleException(e);
		} catch (URISyntaxException e) {
			handleException(e);
		} catch (InstantiationException e) {
			handleException(e);
		} catch (IllegalAccessException e) {
			handleException(e);
		} catch (InvocationTargetException e) {
			handleException(e);
		} catch (NoSuchFieldException e) {
			handleException(e);
		}
	}

	void handleException(Exception e) throws ServletException {
		throw new ServletException("Error overriding Orion email templates", e);
	}

	private void setModifiedEmailContent(UserEmailUtil util, String filename, String fieldname)
			throws URISyntaxException, IOException, IllegalArgumentException, SecurityException,
			InstantiationException, IllegalAccessException, InvocationTargetException,
			NoSuchFieldException {

		Object emailContent = createModifiedEmailContent(util, filename);
		if (emailContent != null) {
			Field confirmationEmail = UserEmailUtil.class.getDeclaredField(fieldname);
			confirmationEmail.setAccessible(true);
			confirmationEmail.set(util, emailContent);
		}
	}

	private Object createModifiedEmailContent(UserEmailUtil util, String filename)
			throws URISyntaxException, IOException, IllegalArgumentException,
			InstantiationException, IllegalAccessException, InvocationTargetException,
			SecurityException, NoSuchFieldException {

		EmailContent ourEmailContent = new EmailContent(filename);
		
		Class<?> clazz = UserEmailUtil.class.getDeclaredClasses()[0];
		Constructor<?> ctor = clazz.getDeclaredConstructors()[0];
		ctor.setAccessible(true);
		
		Object emailContent = ctor.newInstance(util, filename);

		Field title = clazz.getDeclaredField("title");
		title.setAccessible(true);
		title.set(emailContent, ourEmailContent.getTitle());

		Field content = clazz.getDeclaredField("content");
		content.setAccessible(true);
		content.set(emailContent, ourEmailContent.getContent());
		
		return emailContent;
	}

	public void destroy() {}

}
