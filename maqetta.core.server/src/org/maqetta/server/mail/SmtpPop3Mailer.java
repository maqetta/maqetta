package org.maqetta.server.mail;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.mail.Address;
import javax.mail.Flags;
import javax.mail.Folder;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Part;
import javax.mail.SendFailedException;
import javax.mail.Session;
import javax.mail.Store;
import javax.mail.Transport;
import javax.mail.URLName;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;

import org.davinci.server.review.Constants;
import org.eclipse.core.runtime.IConfigurationElement;
import org.maqetta.server.ServerManager;

/**
 * This is an helper that send mail via smtp protocol. It is intended to be used by a single thread,
 * so do not share an instance among more than one thread.
 * 
 */
public class SmtpPop3Mailer {

	static final private Logger theLogger = Logger.getLogger(SmtpPop3Mailer.class.getName());

	public static final String LS = System.getProperty("line.separator");

	private static SmtpPop3Mailer dft = null;

	public static SmtpPop3Mailer getDefault() {
		String defaultMailServer = null;
		String adminName = null;
		String password = null;
		String port = null;
		// Read it from the system properties
		defaultMailServer = ServerManager.getServerManager().getDavinciProperty(Constants.EP_ATTR_MAIL_CONFIG_MAILSERVER);
		adminName = ServerManager.getServerManager().getDavinciProperty(Constants.EP_ATTR_MAIL_CONFIG_LOGINUSER);
		password = ServerManager.getServerManager().getDavinciProperty(Constants.EP_ATTR_MAIL_CONFIG_PASSWORD);
		
		if (defaultMailServer != null && !"".equals(defaultMailServer)) {
			String[] mailSplit = defaultMailServer.split(":");
			if(mailSplit.length == 2){
				defaultMailServer = mailSplit[0];
				port = mailSplit[1];
			}
		}
		if(defaultMailServer == null || "".equals(defaultMailServer)){
			// Read it from the contributor bundle
			IConfigurationElement mailConfig = ServerManager.getServerManager().getExtension(Constants.EXTENSION_POINT_MAIL_CONFIG, Constants.EP_TAG_MAIL_CONFIG);
			if(mailConfig != null){
				defaultMailServer = mailConfig.getAttribute(Constants.EP_ATTR_MAIL_CONFIG_MAILSERVER);
				adminName = mailConfig.getAttribute(Constants.EP_ATTR_MAIL_CONFIG_LOGINUSER);
				password = mailConfig.getAttribute(Constants.EP_ATTR_MAIL_CONFIG_PASSWORD);
			}
		}
		if (defaultMailServer != null && !"".equals(defaultMailServer) && dft == null){
			if(adminName == null || "".equals(adminName)){
				dft = new SmtpPop3Mailer(defaultMailServer, port);
			}else{
				dft = new SmtpPop3Mailer(defaultMailServer, null, port, adminName, password);
			}
			
		}
		return dft;
	}

	public static void setDefaultMailer(SmtpPop3Mailer dft) {
		SmtpPop3Mailer.dft = dft;
	}

	protected Session mailSession;

	protected String emailAccount;

	protected URLName smtpAccountUrl;

	protected URLName pop3AccountUrl;

	public SmtpPop3Mailer(Session mailSession) {
		this.mailSession = mailSession;
	}

	public SmtpPop3Mailer(String smtpHost, String port) {
		this(smtpHost, null, port, null,null, false);
	}

	public SmtpPop3Mailer(String smtpHost, String pop3Host, String port, String emailAccount, String password) {
		this(smtpHost, pop3Host, port, emailAccount, password, true);
	}

	public SmtpPop3Mailer(String smtpHost, String pop3Host, String port, String emailAccount, String password,
			boolean smtpNeedsAuthen) {

		this.emailAccount = emailAccount;

		System.setProperty("mail.mime.charset", "UTF-8");
		Properties props = System.getProperties();
		props.put("mail.transport.protocol", "smtp");
		props.put("mail.store.protocol", "pop3");
		if (smtpHost != null) {
			props.put("mail.smtp.host", smtpHost);
		}
		if (pop3Host != null) {
			props.put("mail.pop3.host", pop3Host);
		}
		/* !IMPORTANT! Without this, sun's ri will not do auth. */
		if (smtpNeedsAuthen) {
			props.put("mail.smtp.auth", "true");
		}
		mailSession = Session.getInstance(props);

//		mailSession.setDebug(true);

		if (smtpHost != null) {
			if(port==null)
				port = "25";
			smtpAccountUrl = new URLName("smtp", smtpHost, Integer.parseInt(port), null, emailAccount, password);
		}
		if (pop3Host != null) {
			if(port==null)
				port = "110";
			pop3AccountUrl = new URLName("pop3", pop3Host, Integer.parseInt(port), null, emailAccount, password);
		}
	}

	/**
	 * Verify send function by sending a test mail to the email account. If exception is thrown,
	 * then there may be some problems.
	 * 
	 * @throws SendFailedException
	 * @throws MessagingException
	 */
	public void verifySend() throws SendFailedException, MessagingException {
		SimpleMessage msg = new SimpleMessage(emailAccount, emailAccount, "subject of verify send",
				"body of verify send");
		sendMessage(msg);
	}

	/**
	 * Verify receive function by receiving mails without deletion. If exception is thrown, then
	 * there may be some problems.
	 * 
	 * @throws IOException
	 * @throws MessagingException
	 */
	public void verifyReceive() throws MessagingException {
		Store store = mailSession.getStore(pop3AccountUrl);
		store.connect();
		try {
			Folder folder = store.getFolder("INBOX");
			folder.open(Folder.READ_WRITE);
		} finally {
			store.close();
		}
	}

	/**
	 * Method sendMessage.
	 * 
	 * @param msg
	 *            The message to send.
	 * @throws SendFailedException
	 *             If the send failed because of invalid addresses.
	 * @throws MessagingException
	 *             If the connection is dead or not in the connected state.
	 */
	public void sendMessage(Message msg) throws SendFailedException, MessagingException {
		Transport trans = smtpAccountUrl == null ? mailSession.getTransport("stmp") : mailSession
				.getTransport(smtpAccountUrl);//FIXME: stmp or smtp?
		trans.connect();
		try {
			trans.sendMessage(msg, msg.getAllRecipients());
		// start LOGGING (#3427)
		} catch(NullPointerException e) {
			Address[] from = msg.getFrom();
			int fromSize = (from != null ? from.length : 0);
			Address[] rec = msg.getAllRecipients();
			int recSize = (rec != null ? rec.length : 0);
			Object content;
			try {
				content = msg.getContent();
			} catch (IOException ioe) {
				content = "<exception>";
			}
			StringBuffer sb = new StringBuffer();
			sb.append("NullPointerException when calling SMTPTransport.sendMessage()" +
							   "\n\t(Message) msg => ");
			sb.append("\n\t\t from = " + (fromSize > 0 ? from[0] : "null") + " (size: " + fromSize + ")");
			sb.append("\n\t\t to = " + (recSize > 0 ? rec[0] : "null") + " (size: " + recSize + ")");
			sb.append("\n\t\t sentDate = " + msg.getSentDate());
			sb.append("\n\t\t subject = " + msg.getSubject());
			sb.append("\n\t\t content = " + content);
			sb.append("\n\t(Address[]) recipients = " + (recSize > 0 ? rec[0] : "null") + " (size: " + recSize + ")");
			theLogger.logp(Level.WARNING,  SmtpPop3Mailer.class.getName(), "sendMessage", sb.toString(), e);
			throw e;
		// end LOGGING
		} finally {
			trans.close();
		}
	}

	public void sendMessage(SimpleMessage msg) throws SendFailedException, MessagingException {
		sendMessage(toMimeMessage(msg));
	}

	/**
	 * 
	 * @param from
	 *            The sender's address.
	 * @param to
	 *            A comma separated list of recipient's addresses.
	 * @param cc
	 *            A comma separated list of CC recipient's addresses.
	 * @param bcc
	 *            A comma separated list of BCC recipient's addresses.
	 * @param subject
	 *            The subject of the mail.
	 * @param content
	 *            The html content of the mail.
	 * @param attachment
	 *            The attachment file
	 * @return MimeMessage The created mime message instance.
	 * @throws MessagingException
	 *             If something wrong when constructing the mime message.
	 */
	public MimeMessage toMimeMessage(String from, String to, String cc, String bcc, Date sentDate,
			String subject, Serializable content, File attachment) throws MessagingException {
		MimeMessage msg = new MimeMessage(mailSession);

		msg.setHeader("X-Mailer", "javamail");

		if (from != null)
			msg.setFrom(new InternetAddress(from));
		else
			msg.setFrom();
		if (to != null)
			msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to, false));
		if (cc != null)
			msg.setRecipients(Message.RecipientType.CC, InternetAddress.parse(cc, false));
		if (bcc != null)
			msg.setRecipients(Message.RecipientType.BCC, InternetAddress.parse(bcc, false));
		msg.setSubject(subject, "UTF-8");
		msg.setSentDate(sentDate == null ? new Date() : sentDate);

		if (attachment == null || !attachment.exists()) {
			msg.setContent(content, "text/html;charset=UTF-8");
		} else {
			MimeBodyPart p1 = new MimeBodyPart();
			p1.setContent(content, "text/html;charset=UTF-8");
//			MimeBodyPart p2 = new MimeBodyPart();
//			p2.setDataHandler(new DataHandler(new FileDataSource(attachment)));
//			p2.setFileName(attachment.getName());
			Multipart mp = new MimeMultipart();
			mp.addBodyPart(p1);
//			mp.addBodyPart(p2);
			msg.setContent(mp);
		}

		msg.saveChanges(); 
		return msg;
	}

	/**
	 * 
	 * @param msg
	 *            A SerializableMessage.
	 * @return MimeMessage The created mime message instance.
	 * @throws MessagingException
	 *             If something wrong when constructing the mime message.
	 */
	public MimeMessage toMimeMessage(SimpleMessage msg) throws MessagingException {
		return toMimeMessage(msg.from, msg.to, msg.cc, msg.bcc, msg.sentDate, msg.subject,
				msg.content, msg.attachment);
	}

	public SimpleMessage[] receiveMessagesNoDelete() throws IOException, MessagingException {
		return receiveMessages(false);
	}

	public SimpleMessage[] receiveMessages() throws IOException, MessagingException {
		return receiveMessages(true);
	}

	/**
	 * Returns all new messages in the default mail folder (INBOX). Mail contents are extracted into
	 * strings and returned. Attachments are ignored.
	 * 
	 * @param deleteReceived
	 * @return
	 * @throws MessagingException
	 * @throws IOException
	 */
	private SimpleMessage[] receiveMessages(boolean deleteReceived) throws IOException,
			MessagingException {
		Store store = mailSession.getStore(pop3AccountUrl);
		store.connect();
		try {
			Folder folder = store.getFolder("INBOX");
			folder.open(Folder.READ_WRITE);
			ArrayList list = new ArrayList();
			Message msgs[] = folder.getMessages();
			for (int i = 0; i < msgs.length; i++) {
				list.add(toSimpleMessage(msgs[i]));
				if (deleteReceived) {
					msgs[i].setFlag(Flags.Flag.DELETED, true);
				}
			}
			folder.close(true);
			return (SimpleMessage[]) list.toArray(new SimpleMessage[list.size()]);
		} finally {
			store.close();
		}
	}

	private SimpleMessage toSimpleMessage(Message message) throws IOException, MessagingException {
		SimpleMessage simple = new SimpleMessage();
		simple.setFrom(addr2string(message.getFrom()));
		simple.setTo(addr2string(message.getRecipients(Message.RecipientType.TO)));
		simple.setCc(addr2string(message.getRecipients(Message.RecipientType.CC)));
		simple.setBcc(addr2string(message.getRecipients(Message.RecipientType.BCC)));
		simple.setSentDate(message.getSentDate());
		simple.setSubject(message.getSubject());
		simple.setSize(message.getSize());

		StringBuffer buf = new StringBuffer();
		extractContent(message, buf);
		simple.setContent(buf.toString());

		return simple;
	}

	private void extractContent(Part part, StringBuffer buf) throws IOException, MessagingException {
		Object content = part.getContent();
		if (content instanceof Multipart) {
			Multipart mp = (Multipart) content;
			for (int i = 0; i < mp.getCount(); i++) {
				extractContent(mp.getBodyPart(i), buf);
			}
		} else {
			if (buf.length() > 0) {
				buf.append(LS);
				buf.append(LS);
			}
			buf.append(content.toString());
		}
	}

	private String addr2string(Address[] addr) {
		if (addr == null) {
			return null;
		}
		StringBuffer buf = new StringBuffer();
		for (int i = 0; i < addr.length; i++) {
			if (i > 0) {
				buf.append(", ");
			}
			buf.append(addr[i].toString());
		}
		return buf.toString();
	}

}