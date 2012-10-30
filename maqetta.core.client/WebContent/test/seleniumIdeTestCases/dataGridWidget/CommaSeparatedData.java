package org.openqa.selenium.example;

import java.util.Iterator;
import java.util.regex.Pattern;
import java.util.concurrent.TimeUnit;
import org.junit.*;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.internal.seleniumemulation.DoubleClick;
import org.openqa.selenium.support.ui.Select;


public class CommaSeparatedData {
	private WebDriver driver;
	private String baseUrl;
	private StringBuffer verificationErrors = new StringBuffer();
	@Before
	public void setUp() throws Exception {
		driver = new FirefoxDriver();
		baseUrl = "http://localhost:8081";
		driver.get(baseUrl);
		driver.manage().timeouts().implicitlyWait(1, TimeUnit.SECONDS);
	}

	@Test
	public void testCommaSeparatedData() throws Exception {
		
		driver.get(baseUrl + "/maqetta/");
		driver.findElement(By.id("username")).clear();
		driver.findElement(By.id("username")).sendKeys("user1");
		driver.findElement(By.id("password")).clear();
		driver.findElement(By.id("password")).sendKeys("user1");
		driver.findElement(By.cssSelector("input[type=\"submit\"]")).click();
		driver.findElement(By.xpath("//span[@id='davinci_main_menu']/span/span/span")).click();
		driver.findElement(By.id("newHTML")).click();
		driver.findElement(By.xpath("//tr[@class='fileNameRow']/td[2]/div/div/input")).clear();
		driver.findElement(By.xpath("//tr[@class='fileNameRow']/td[2]/div/div/input")).sendKeys("dataGridCsdTestCase.html");
		driver.findElement(By.xpath("//span[.=\"Create\"]")).click();
		// wait for editor to load
		for (int second = 0;; second++) {
			if (second >= 10) fail("timeout");
			try { if (isElementPresent(By.xpath("//div[@id='editors_container_tablist_editor-._project1_dataGridCsdTestCase.html']"))) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}
		// wait for the widget palette
		for (int second = 0;; second++) {
			if (second >= 10) fail("timeout");
			try { if (isElementPresent(By.linkText("Dojo Controls"))) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}

		dragNDropWidget();
        //clickToAddWidget();

		driver.findElement(By.id("davinciIleb")).click();
		driver.findElement(By.id("davinciIleb")).clear();
		driver.findElement(By.id("davinciIleb")).sendKeys("one, two, three\naaaa, bbbb, cccc\ndddd, dddd, eeee\nfffff, gggg, hhhhh");
		driver.findElement(By.id("davinci.ve.input.SmartInput_ok_label")).click();
		driver.findElement(By.xpath("//div[@id='davinci.ve.style']/div/div/span/label[.='ID']/following-sibling::input")).click();
		driver.findElement(By.xpath("//div[@id='davinci.ve.style']/div/div/span/label[.='ID']/following-sibling::input")).clear();
		driver.findElement(By.xpath("//div[@id='davinci.ve.style']/div/div/span/label[.='ID']/following-sibling::input")).sendKeys("data_grid_testcase1\n");
		driver.switchTo().frame(driver.findElement(By.xpath("//div[@id='editor-._project1_dataGridCsdTestCase.html']/div[2]/div/div/iframe")));
		try {
			assertEquals("three", driver.findElement(By.xpath("//div[@id='data_grid_testcase1']/div/div/div//div/table/tbody/tr/th[3]/div")).getText());
		} catch (Error e) {
			verificationErrors.append(e.toString());
		}
		try {
			assertEquals("hhhhh", driver.findElement(By.xpath("//div[@id='data_grid_testcase1']/div[2]/div/div/div/div/div[3]/table/tbody/tr/td[3]")).getText());
		} catch (Error e) {
			verificationErrors.append(e.toString());
		}
		driver.switchTo().defaultContent();
		//  Save file and reopen 
		driver.findElement(By.xpath("//span[@class='dijitReset dijitInline dijitIcon saveIcon']")).click();
		driver.findElement(By.xpath("//div[@id='editors_container_tablist_editor-._project1_dataGridCsdTestCase.html']/span[2]")).click();
		doubleClick(driver.findElement(By.xpath("//span[@class='dijitTreeContent']/span[. ='dataGridCsdTestCase.html']/../..")));
		
		try {
			assertTrue(isElementPresent(By.xpath("//div[@id='editors_container_tablist_editor-._project1_dataGridCsdTestCase.html']/span[2]")));
		} catch (Error e) {
			verificationErrors.append(e.toString());
		}
		driver.switchTo().frame(driver.findElement(By.xpath("//div[@id='editor-._project1_dataGridCsdTestCase.html']/div[2]/div/div/iframe")));
		try {
			assertEquals("three", driver.findElement(By.xpath("//div[@id='data_grid_testcase1']/div/div/div//div/table/tbody/tr/th[3]/div")).getText());
		} catch (Error e) {
			verificationErrors.append(e.toString());
		}
		try {
			assertEquals("hhhhh", driver.findElement(By.xpath("//div[@id='data_grid_testcase1']/div[2]/div/div/div/div/div[3]/table/tbody/tr/td[3]")).getText());
		} catch (Error e) {
			verificationErrors.append(e.toString());
		}
		driver.switchTo().defaultContent();
		// Open Preview

		String parentWindowHandle = driver.getWindowHandle(); // save the current window handle.
		driver.findElement(By.xpath("//span[@class='dijitReset dijitInline dijitIcon openBrowserIcon']")).click();
	      WebDriver popup = null;
	      Iterator<String> windowIterator = driver.getWindowHandles().iterator();
	      while(windowIterator.hasNext()) { 
	        String windowHandle = windowIterator.next(); 
	        popup = driver.switchTo().window(windowHandle);
	        if (popup.getTitle().equals("Untitled")) { // find the popup
	          break;
	        }
	      }
		try {
			assertEquals("three", driver.findElement(By.xpath("//div[@id='data_grid_testcase1']/div/div/div//div/table/tbody/tr/th[3]/div")).getText());
		} catch (Error e) {
			verificationErrors.append(e.toString());
		}
		try {
			assertEquals("hhhhh", driver.findElement(By.xpath("//div[@id='data_grid_testcase1']/div[2]/div/div/div/div/div[3]/table/tbody/tr/td[3]")).getText());
		} catch (Error e) {
			verificationErrors.append(e.toString());
		}
		driver.close();  // the popup
		driver.switchTo().window(parentWindowHandle); // switch back to the main
		driver.findElement(By.xpath("//div[@id='editors_container_tablist_editor-._project1_dataGridCsdTestCase.html']/span[2]")).click();
	}

	@After
	public void tearDown() throws Exception {
		driver.quit();
		String verificationErrorString = verificationErrors.toString();
		if (!"".equals(verificationErrorString)) {
			fail(verificationErrorString);
		}
	}

	private boolean isElementPresent(By by) {
		try {
			driver.findElement(by);
			return true;
		} catch (NoSuchElementException e) {
			return false;
		}
	}
	
	private void dragNDropWidget() {
		// Becouse we have the DnD target in an iFrame we need to do this bit of code
		driver.findElement(By.linkText("Dojo Controls")).click();
		WebElement srcElement = driver.findElement(By.xpath("//a[text()='Dojo Controls']/../following-sibling::div/a[.='DataGridDojo Controls']"));
		String xto=Integer.toString(srcElement.getLocation().x);
		srcElement.click();
		// switch to the canvas
		driver.switchTo().frame(driver.findElement(By.xpath("//div[@id='editor-._project1_dataGridCsdTestCase.html']/div[2]/div/div/iframe")));
		WebElement targetElement = driver.findElement(By.xpath("//body[@id=\"myapp\"]"));
		String yto=Integer.toString(targetElement.getLocation().y);
		driver.switchTo().defaultContent();
		((JavascriptExecutor)driver).executeScript("function simulate(f,c,d,e){var b,a=null;for(b in eventMatchers)if(eventMatchers[b].test(c)){a=b;break}if(!a)return!1;document.createEvent?(b=document.createEvent(a),a==\"HTMLEvents\"?b.initEvent(c,!0,!0):b.initMouseEvent(c,!0,!0,document.defaultView,0,d,e,d,e,!1,!1,!1,!1,0,null),f.dispatchEvent(b)):(a=document.createEventObject(),a.detail=0,a.screenX=d,a.screenY=e,a.clientX=d,a.clientY=e,a.ctrlKey=!1,a.altKey=!1,a.shiftKey=!1,a.metaKey=!1,a.button=1,f.fireEvent(\"on\"+c,a));return!0} var eventMatchers={HTMLEvents:/^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,MouseEvents:/^(?:click|dblclick|mouse(?:down|up|over|move|out))$/}; " +
				 "simulate(arguments[0],\"mousedown\",arguments[1],arguments[2]);",srcElement,xto,yto);
		((JavascriptExecutor)driver).executeScript("function simulate(f,c,d,e){var b,a=null;for(b in eventMatchers)if(eventMatchers[b].test(c)){a=b;break}if(!a)return!1;document.createEvent?(b=document.createEvent(a),a==\"HTMLEvents\"?b.initEvent(c,!0,!0):b.initMouseEvent(c,!0,!0,document.defaultView,0,d,e,d,e,!1,!1,!1,!1,0,null),f.dispatchEvent(b)):(a=document.createEventObject(),a.detail=0,a.screenX=d,a.screenY=e,a.clientX=d,a.clientY=e,a.ctrlKey=!1,a.altKey=!1,a.shiftKey=!1,a.metaKey=!1,a.button=1,f.fireEvent(\"on\"+c,a));return!0} var eventMatchers={HTMLEvents:/^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,MouseEvents:/^(?:click|dblclick|mouse(?:down|up|over|move|out))$/}; " +
				 "simulate(arguments[0],\"mousemove\",arguments[1],arguments[2]);",srcElement,xto,yto);
		 driver.switchTo().frame(driver.findElement(By.xpath("//div[@id='editor-._project1_dataGridCsdTestCase.html']/div[2]/div/div/iframe")));
		 ((JavascriptExecutor)driver).executeScript("function simulate(f,c,d,e){var b,a=null;for(b in eventMatchers)if(eventMatchers[b].test(c)){a=b;break}if(!a)return!1;document.createEvent?(b=document.createEvent(a),a==\"HTMLEvents\"?b.initEvent(c,!0,!0):b.initMouseEvent(c,!0,!0,document.defaultView,0,d,e,d,e,!1,!1,!1,!1,0,null),f.dispatchEvent(b)):(a=document.createEventObject(),a.detail=0,a.screenX=d,a.screenY=e,a.clientX=d,a.clientY=e,a.ctrlKey=!1,a.altKey=!1,a.shiftKey=!1,a.metaKey=!1,a.button=1,f.fireEvent(\"on\"+c,a));return!0} var eventMatchers={HTMLEvents:/^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,MouseEvents:/^(?:click|dblclick|mouse(?:down|up|over|move|out))$/}; " +
				 "simulate(arguments[0],\"mouseup\",arguments[1],arguments[2]);",targetElement,xto,yto);
		 
	/*	((JavascriptExecutor)driver).executeScript("function simulate(f,c,d,e){var b,a=null;for(b in eventMatchers)if(eventMatchers[b].test(c)){a=b;break}if(!a)return!1;document.createEvent?(b=document.createEvent(a),a==\"HTMLEvents\"?b.initEvent(c,!0,!0):b.initMouseEvent(c,!0,!0,document.defaultView,0,d,e,d,e,!1,!1,!1,!1,0,null),f.dispatchEvent(b)):(a=document.createEventObject(),a.detail=0,a.screenX=d,a.screenY=e,a.clientX=d,a.clientY=e,a.ctrlKey=!1,a.altKey=!1,a.shiftKey=!1,a.metaKey=!1,a.button=1,f.fireEvent(\"on\"+c,a));return!0} var eventMatchers={HTMLEvents:/^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,MouseEvents:/^(?:click|dblclick|mouse(?:down|up|over|move|out))$/}; " +
		"simulate(arguments[0],\"mousedown\",0,0); simulate(arguments[0],\"mousemove\",arguments[1],arguments[2]); simulate(arguments[0],\"mouseup\",arguments[1],arguments[2]); ",
		srcElement,xto,yto);*/
		driver.switchTo().defaultContent();
	}
	
	private void clickToAddWidget(){
		// this bit clicks the widget is the palette and then clicks in the iFrame to place
		driver.findElement(By.linkText("Dojo Controls")).click();
		driver.findElement(By.xpath("//a[text()='Dojo Controls']/../following-sibling::div/a[.='DataGridDojo Controls']")).click();
		// switch to the canvas
		driver.switchTo().frame(driver.findElement(By.xpath("//div[@id='editor-._project1_dataGridCsdTestCase.html']/div[2]/div/div/iframe")));
		driver.findElement(By.xpath("//body[@id=\"myapp\"]")).click(); 
		driver.switchTo().defaultContent();
	}
	
	private void doubleClick(WebElement element){
		// hack for doubleClick
		element.click();
		JavascriptExecutor js = (JavascriptExecutor) driver;
		js.executeScript("var evt = document.createEvent('MouseEvents');" +
		        "evt.initMouseEvent('dblclick',true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0,null);" +
		        "arguments[0].dispatchEvent(evt);", element);
		// end hack for doubleClick
	}

}
