package org.davinci.server.mail;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.Properties;

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

import org.davinci.server.ServerManager;
import org.davinci.server.review.Constants;
import org.eclipse.core.runtime.IConfigurationElement;

/**
 * This is an helper that send mail via smtp protocol. It is intended to be used by a single thread,
 * so do not share an instance among more than one thread.
 * 
 */
public class SmtpPop3Mailer {

	public static final String LS = System.getProperty("line.separator");

	private static SmtpPop3Mailer dft = null;

	public static SmtpPop3Mailer getDefault() {
		String defaultMailServer = null;
		String adminName = null;
		String password = null;
		
		// Read it from the system properties
		defaultMailServer = ServerManager.getServerManger().getDavinciProperty(Constants.EP_ATTR_MAIL_CONFIG_MAILSERVER);
		adminName = ServerManager.getServerManger().getDavinciProperty(Constants.EP_ATTR_MAIL_CONFIG_LOGINUSER);
		password = ServerManager.getServerManger().getDavinciProperty(Constants.EP_ATTR_MAIL_CONFIG_PASSWORD);
		
		if(defaultMailServer == null || "".equals(defaultMailServer)){
			// Read it from the contributor bundle
			IConfigurationElement mailConfig = ServerManager.getServerManger().getExtension(Constants.EXTENSION_POINT_MAIL_CONFIG, Constants.EP_TAG_MAIL_CONFIG);
			if(mailConfig != null){
				defaultMailServer = mailConfig.getAttribute(Constants.EP_ATTR_MAIL_CONFIG_MAILSERVER);
				adminName = mailConfig.getAttribute(Constants.EP_ATTR_MAIL_CONFIG_LOGINUSER);
				password = mailConfig.getAttribute(Constants.EP_ATTR_MAIL_CONFIG_PASSWORD);
			}
		}
		if (defaultMailServer != null && !"".equals(defaultMailServer) && dft == null){
			if(adminName == null || "".equals(adminName)){
				dft = new SmtpPop3Mailer(defaultMailServer);
			}else{
				dft = new SmtpPop3Mailer(defaultMailServer, null, adminName, password);
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

	public SmtpPop3Mailer(String smtpHost) {
		this(smtpHost, null, null, null, false);
	}

	public SmtpPop3Mailer(String smtpHost, String pop3Host, String emailAccount, String password) {
		this(smtpHost, pop3Host, emailAccount, password, true);
	}

	public SmtpPop3Mailer(String smtpHost, String pop3Host, String emailAccount, String password,
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

		if (smtpHost != null) {
			smtpAccountUrl = new URLName("smtp", smtpHost, 25, null, emailAccount, password);
		}
		if (pop3Host != null) {
			pop3AccountUrl = new URLName("pop3", pop3Host, 110, null, emailAccount, password);
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
				.getTransport(smtpAccountUrl);
		trans.connect();
		try {
			trans.sendMessage(msg, msg.getAllRecipients());
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