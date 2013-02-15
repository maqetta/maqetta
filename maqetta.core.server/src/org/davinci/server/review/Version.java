package org.davinci.server.review;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;
import java.util.SimpleTimeZone;

import org.davinci.server.review.user.Reviewer;

public class Version{

	private boolean hasClosedManually = false;

	private static final SimpleDateFormat formatter, shortFormatter;

	private String versionID;

	private String versionTitle;

	private String time;

	private boolean isDraft;

	private Calendar dueDate;

	private int desireWidth;

	private int desireHeight;

	private String restartFrom="0";

	private String description="";

	private boolean receiveEmail = true;

	private boolean hasRestarted = false;

	static {
		Calendar gmt = Calendar.getInstance(new SimpleTimeZone(0, "GMT"));
		shortFormatter = new SimpleDateFormat(Constants.DATE_PATTERN_SHORT);
		shortFormatter.setCalendar(gmt);	
		formatter = new SimpleDateFormat(Constants.DATE_PATTERN);
		formatter.setCalendar(gmt);	
	}

	public List<String> resources= Collections.synchronizedList(new ArrayList<String>());

	List<Reviewer> reviewers = Collections.synchronizedList(new ArrayList<Reviewer>());

	public Version(String versionID,String time,boolean isDraft,String dueDate,String width,String height){
		this.versionID = versionID;
		this.time = time;
		this.isDraft =  isDraft;
		this.dueDate = s2Date(dueDate);
		this.desireWidth = width==null?0:Integer.parseInt(width);
		this.desireHeight = height==null?0:Integer.parseInt(height);
	}

	private Calendar s2Date(String time){
		Calendar result = Calendar.getInstance();
		if(time.equals("infinite")){
			result.setTimeInMillis(Long.MAX_VALUE);
			return result;
		}
		try {
			result.setTime(formatter.parse(time));
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return result;
	}

	public Calendar getDueDate() {
		return dueDate;
	}

	public void setDueDate(Calendar dueDate) {
		this.dueDate = dueDate;
	}

	public void setDueDate(String sDueDate){
		this.dueDate=s2Date(sDueDate);
	}

	public int getDesireWidth() {
		return desireWidth;
	}

	public void setDesireWidth(int desireWidth) {
		this.desireWidth = desireWidth;
	}

	public void setDesireWidth(String width){
		this.desireWidth = width==null?0:Integer.parseInt(width);
	}

	public void setDesireHeight(String height){
		this.desireHeight = height==null?0:Integer.parseInt(height);
	}

	public int getDesireHeight() {
		return desireHeight;
	}

	public void setDesireHeight(int desireHeight) {
		this.desireHeight = desireHeight;
	}

	public String dueDateString(){
		if(this.dueDate.getTimeInMillis()==Long.MAX_VALUE) return "infinite";
		return formatter.format(this.dueDate.getTime());
	}

	public boolean isDraft() {
		return isDraft;
	}

	public void setDraft(boolean isDraft) {
		this.isDraft = isDraft;
	}

	public List<String> getResources() {
		return resources;
	}

	public void setResources(List<String> resources) {
		this.resources = resources;
	}


	public String getTime()
	{
		return time;
	}

	public String getVersionID()
	{
		return versionID;
	}

	public void setVersionID(String versionID) {
		this.versionID = versionID;
	}


	public void setVersionTitle(String versionTitle){
		this.versionTitle = versionTitle;
	}

	public String getVersionTitle(){
		return versionTitle;
	}

	public void setTime(String time) {
		this.time = time;
	}

	public void setResource(String[] paths){
		this.resources = Collections.synchronizedList(new ArrayList<String>());
		if(paths!=null)
		for (String path : paths) {
			this.addResource(path);
		}
	}

	public void addResource(String path)
	{
		this.resources.add(path);
	}

	public void addReviewer(Reviewer reviewer)
	{
		this.reviewers.add(reviewer);
	}

	public void setReviewers(List<Reviewer> reviewers)
	{
		this.reviewers = reviewers;
	}

	public List<Reviewer> getReviewers()
	{
		return this.reviewers;
	}

	public boolean containsUser(String userEmail) {
		for(Reviewer reviewer:reviewers)
		{
			if(reviewer.getEmail().equals(userEmail))
				return true;
		}
		return false;
	}

	public void closeVersion(){
		this.hasClosedManually = true;
	}

	public void openVersion(){
		this.hasClosedManually = false;
	}

	public boolean isClosed(){
		if(this.hasClosedManually) return true;
		Calendar current = Calendar.getInstance();
		current.add(Calendar.DAY_OF_MONTH,-1);
		if(current.compareTo(this.dueDate)>0)
			return true;

		return false;

	}

	public boolean isHasClosedManually() {
		return hasClosedManually;
	}

	public void setHasClosedManually(boolean hasClosedManually) {
		this.hasClosedManually = hasClosedManually;
	}

	public String getRestartFrom() {
		return restartFrom;
	}

	public void setRestartFrom(String restartFrom) {
		this.restartFrom = restartFrom;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public boolean isReceiveEmail() {
		return receiveEmail;
	}

	public void setReceiveEmail(boolean receiveEmail) {
		this.receiveEmail = receiveEmail;
	}

	public boolean isHasRestarted() {
		return hasRestarted;
	}

	public void setHasRestarted(boolean hasRestarted) {
		this.hasRestarted = hasRestarted;
	}

	public static boolean isValidISOTimeStamp(String timeStamp) {
		boolean result = false;
		try {
			shortFormatter.parse(timeStamp);
			result = true;
		} catch (ParseException e) {
			try {
				formatter.parse(timeStamp);
				result = true;
			} catch (ParseException e2) {
				// We have a bad time stamp
			}
		}
		return result;
	}

}