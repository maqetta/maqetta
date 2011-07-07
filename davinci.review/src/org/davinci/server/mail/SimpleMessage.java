package org.davinci.server.mail;


import java.io.File;
import java.io.Serializable;
import java.util.Date;

/**
 * A class of mail message, which is able to be serialized.
 * 
 * @author young
 */
public class SimpleMessage implements Serializable, Cloneable {

	private static final long serialVersionUID = 1L;

	protected String from;

	protected String to;

	protected String cc;

	protected String bcc;

	protected String subject;

	protected Date sentDate;

	protected String content;

	protected File attachment;

	protected int size;

	public SimpleMessage() {

	}

	/**
	 * Constructor.
	 * 
	 * @param from
	 *            The sender's address.
	 * @param to
	 *            A comma separated list of recipient's addresses.
	 * @param subject
	 *            The subject of the mail.
	 * @param content
	 *            The content of the mail.
	 */
	public SimpleMessage(String from, String to, String subject, String content) {
		this(from, to, null, null, subject, content);
	}

	/**
	 * Constructor.
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
	 *            The content of the mail.
	 */
	public SimpleMessage(String from, String to, String cc, String bcc, String subject,
			String content) {
		this.from = from;
		this.to = to;
		this.cc = cc;
		this.bcc = bcc;
		this.subject = subject;
		this.content = content;
	}

	// ==================//
	// Helper Methods //
	// ==================//

	/**
	 * Gets the from attribute.
	 */
	public String getFrom() {
		return from;
	}

	/**
	 * Gets the to attribute.
	 */
	public String getTo() {
		return to;
	}

	/**
	 * Gets the cc attribute.
	 */
	public String getCc() {
		return cc;
	}

	/**
	 * Gets the bcc attribute.
	 */
	public String getBcc() {
		return bcc;
	}

	/**
	 * Gets the subject attribute.
	 */
	public String getSubject() {
		return subject;
	}

	/**
	 * Gets the content attribute.
	 */
	public String getContent() {
		return content;
	}

	/**
	 * Sets the from attribute.
	 */
	public void setFrom(String from) {
		this.from = from;
	}

	/**
	 * Sets the to attribute.
	 */
	public void setTo(String to) {
		this.to = to;
	}

	/**
	 * Sets the cc attribute.
	 */
	public void setCc(String cc) {
		this.cc = cc;
	}

	/**
	 * Sets the bcc attribute.
	 */
	public void setBcc(String bcc) {
		this.bcc = bcc;
	}

	/**
	 * Sets the subject attribute.
	 */
	public void setSubject(String subject) {
		this.subject = subject;
	}

	/**
	 * Sets the content attribute.
	 */
	public void setContent(String content) {
		this.content = content;
	}

	/**
	 * @return Returns the attachment.
	 */
	public File getAttachment() {
		return attachment;
	}

	/**
	 * @param attachment
	 *            The attachment to set.
	 */
	public void setAttachment(File attachment) {
		this.attachment = attachment;
	}

	/**
	 * @return Returns the sentDate.
	 */
	public Date getSentDate() {
		return sentDate;
	}

	/**
	 * @param sentDate
	 *            The sentDate to set.
	 */
	public void setSentDate(Date sentDate) {
		this.sentDate = sentDate;
	}

	/**
	 * @return Returns the size.
	 */
	public int getSize() {
		return size;
	}

	/**
	 * @param size
	 *            The size to set.
	 */
	public void setSize(int size) {
		this.size = size;
	}
}
