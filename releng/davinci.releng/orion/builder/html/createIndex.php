<html><head>
<link rel="stylesheet" href="default_style.css">
<title>Eclipse Orion Downloads</title></head>
<body>
	<table border=0 cellspacing=5 cellpadding=2 width="100%" >
		<tr><td align=left width="72%">
			<font class=indextop>Eclipse Orion<br>downloads</font><br>
			<font class=indexsub>latest downloads from the eclipse Orion project</font></td>		 
		</tr>
	</table>
	<table border=0 cellspacing=5 cellpadding=2 width="100%" >  	
		<!-- The Eclipse Projects --> 
		<tr><td> 
			<p>On this page you can find the latest Orion builds.</p>
			<?php
				$lastLabel=file_get_contents('build.label');
				if ($lastLabel != "") {
					echo "<p>Build <a href=\"drops/$lastLabel/index.html\">$lastLabel</a> was started on the <a href=\"http://orion.eclipse.org/\">test server</a> and JS Docs are <a href=\"http://orion.eclipse.org/jsdoc/index.html\">here</a>.";
				}
			?>
			<p>All downloads are provided under the terms and conditions of the <a href="http://www.eclipse.org/legal/epl/notice.php" target="_top">Eclipse Foundation Software User Agreement</a> unless otherwise specified.</p>
			<p>Other <B>eclipse.org project</B> downloads are available <A HREF="http://www.eclipse.org/downloads/index.php">here</A>.</p>
		</td></tr> 
	</table>
	
	<?php
       $contents = substr(file_get_contents('dlconfig.txt'),0,-1);
       $contents = str_replace("\n", "", $contents);

        #split the content file by & and fill the arrays
        $elements = explode("&",$contents);
        $t = 0; 
        $p = 0;
        for ($c = 0; $c < count($elements)-1; $c++) {
		$tString = "dropType";
                $pString = "dropPrefix";
    	        if (strstr($elements[$c],$tString)) {
                   $temp = preg_split("/=/",$elements[$c]);
                   $dropType[$t] = $temp[1];
                   $t++;
                }
    	        if (strstr($elements[$c],$pString)) {
                   $temp = preg_split("/=/",$elements[$c]);
                   $dropPrefix[$p] = $temp[1];
                   $p++;
                }
        }
	
		for ($i = 0; $i < count($dropType); $i++) {
			$typeToPrefix[$dropType[$i]] = $dropPrefix[$i];
		}
		
		$aDirectory = dir("drops");
		while ($anEntry = $aDirectory->read()) {
	
			// Short cut because we know aDirectory only contains other directories.
	
			if ($anEntry != "." && $anEntry!=".." && $anEntry!="TIME") {
				$parts = explode("-", $anEntry);
				if (count($parts) == 3) {
	
					$buckets[$parts[0]][] = $anEntry;
		
					$timePart = $parts[2];
					$year = substr($timePart, 0, 4);
					$month = substr($timePart, 4, 2);
					$day = substr($timePart, 6, 2);
					$hour = substr($timePart,8,2);
					$minute = substr($timePart,10,2);
					$timeStamp = mktime($hour, $minute, 0, $month, $day, $year);
					
					$timeStamps[$anEntry] = date("D, j M Y -- H:i (O)", $timeStamp);
				
					if ($timeStamp > $latestTimeStamp[$parts[0]]) {
						$latestTimeStamp[$parts[0]] = $timeStamp;
						$latestFile[$parts[0]] = $anEntry;
					}
				}
	
				if (count($parts) == 2) {
	
                        $buildType=substr($parts[0],0,1);
                        $buckets[$buildType][] = $anEntry;
                        $datePart = substr($parts[0],1);
                        $timePart = $parts[1];
                        $year = substr($datePart, 0, 4);
                        $month = substr($datePart, 4, 2);
                        $day = substr($datePart, 6, 2);
                        $hour = substr($timePart,0,2);
                        $minute = substr($timePart,2,2);
                        $timeStamp = mktime($hour, $minute, 0, $month, $day, $year);
                        $timeStamps[$anEntry] = date("D, j M Y -- H:i (O)", $timeStamp);

                        if ($timeStamp > $latestTimeStamp[$buildType]) {
                                $latestTimeStamp[$buildType] = $timeStamp;
                                $latestFile[$buildType] = $anEntry;
                        }
                }

                if (count($parts) == 1) {
                    $buildType=substr($parts[0],0,1);
                    $buckets[$buildType][] = $anEntry;
                    $datePart = substr($parts[0],1, 8);
                    $timePart = substr($parts[0],9,12);
                    $year = substr($datePart, 0, 4);
                    $month = substr($datePart, 4, 2);
                    $day = substr($datePart, 6, 2);
                    $hour = substr($timePart,0,2);
                    $minute = substr($timePart,2,2);
                    $timeStamp = mktime($hour, $minute, 0, $month, $day, $year);
                    $timeStamps[$anEntry] = date("D, j M Y -- H:i (O)", $timeStamp);

                    if ($timeStamp > $latestTimeStamp[$buildType]) {
                            $latestTimeStamp[$buildType] = $timeStamp;
                            $latestFile[$buildType] = $anEntry;
                    }
                }
			}
		}
 	?> 
 	<table width="100%" cellspacing=0 cellpadding=3 align=center> 
 		<td align=left> 
			<TABLE  width="100%" CELLSPACING=0 CELLPADDING=3> 
				<tr> <td width=\"30%\">
					<b>Build Type</b></td><td><b>Build Name</b></td><td><b>Build Date</b>
				</td></tr> 
				<?php
					foreach($dropType as $value) {
						$prefix=$typeToPrefix[$value];
						$fileName = $latestFile[$prefix];
						echo "<tr>
							<td width=\"30%\">$value</td>";
						
						$parts = explode("-", $fileName);
						
						// Uncomment the line below if we need click through licenses.
						// echo "<td><a href=license.php?license=drops/$fileName>$parts[1]</a></td>";
						
						// Comment the line below if we need click through licenses.
						if (count($parts)==3)
							echo "<td><a href=\"drops/$fileName/index.html\">$parts[1]</a></td>";
						if (count($parts)==2 || count($parts)==1)
							echo "<td><a href=\"drops/$fileName/index.html\">$fileName</a></td>";
				
						echo "<td>$timeStamps[$fileName]</td>";
						echo "</tr>";
					}
				?>
			</table>
		</td>
	</table>&nbsp;<?php
		foreach($dropType as $value) {
			$prefix=$typeToPrefix[$value];
			echo "
			<table width=\"100%\" cellspacing=0 cellpadding=3 align=center>
			<tr bgcolor=\"#999999\">
			<td align=left width=\"30%\"><b><a name=\"$value ($prefix)\"><font color=\"#FFFFFF\" face=\"Arial,Helvetica\">$value";
			echo "s</font></b></a></td>
			</TR>
			<TR>
			<td align=left>
			<TABLE  width=\"100%\" CELLSPACING=0 CELLPADDING=3>
			<tr>
			<td width=\"30%\"><b>Build Name</b></td>
			<td><b>Build Date</b></td>
			</tr>";
			
			$aBucket = $buckets[$prefix];
			if (isset($aBucket)) {
				rsort($aBucket);
				foreach($aBucket as $innerValue) {
					$parts = explode("-", $innerValue);
					echo "<tr>";
					
						// Uncomment the line below if we need click through licenses.
						// echo "<td><a href=\"license.php?license=drops/$innerValue\">$parts[1]</a></td>";
						
						// Comment the line below if we need click through licenses.
						if (count ($parts)==3)
							echo "<td><a href=\"drops/$innerValue/index.html\">$parts[1]</a></td>";
						if (count($parts)==2 || count($parts)==1)
							echo "<td><a href=\"drops/$innerValue/index.html\">$innerValue</a></td>";
	
						echo "<td>$timeStamps[$innerValue]</td>
						</tr>";
				}
			}
			echo "</table></table>&nbsp;";
		}
	?> &nbsp; 
</body></html>
