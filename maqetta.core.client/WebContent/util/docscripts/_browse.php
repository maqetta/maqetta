<?php /*

  _browse.php - rudimentary api browser designed to expose flaws in
  either the dojo doc parser or the effort to document the Dojo Toolkit
  API. it is embarasingly inefficient and sloppy, but works.
  
  this file requires PHP5, and a full source tree of the dojo toolkit.

  it parses a module, and dumps relevant API information made in real
  time. PLEASE use this to preview how the parse tool will interpret
  your code.

  it covers all files in dojtool's modules/ directory dynamically, so
  can be used to preview documentation in custom namespace code, as well.

*/

// hide warnings
error_reporting(1);
$ajaxy = !empty($_REQUEST['ajaxy']);

?>

<?php if(!$ajaxy){ ?>
	<html>
		<head>
		
		  <title>API Preview tool | The Dojo Toolkit </title>
		
		  <script type="text/javascript" src="../../dojo/dojo.js" djConfig="parseOnLoad:true"></script>
		
		  <script type="text/javascript">
			dojo.require("dijit.layout.BorderContainer");
			dojo.require("dojox.layout.ExpandoPane");
			dojo.require("dijit.layout.ContentPane");
			dojo.require("dijit.layout.TabContainer");
			dojo.require("dijit.layout.AccordionContainer");
			dojo.require("dojo.fx.easing");
			dojo.require("dijit.TitlePane");
			function tgShow(id){
			  var identity=document.getElementById(id);
					if(identity.className=="sho"){ identity.className="nosho";
					}else{ identity.className="sho"; }
			}
			dojo.addOnLoad(function(e){
				dojo.connect(window,"onclick",function(e){
					if(e.target && e.target.href){
						e.preventDefault();
						dijit.byId('apiPane').attr("href", e.target.href + "&ajaxy=true");
					}
				});
			});
		  </script>
		  <style type="text/css">
			@import "../../dijit/themes/soria/soria.css";
			@import "../../dojox/layout/resources/ExpandoPane.css";
			@import "../../dojo/resources/dojo.css"; 
			body, html { width:100%; height:100%; margin:0; padding:0; }
			.sho { display:block; }
			.nosho { display:none; } 
			.topbar li { display:inline; padding:5px; } 
			.pad {
				padding:20px;
				padding-top:8px;
			}
			</style>
		  </style>
		</head>
	<body class="soria">
<?php

} // $ajaxy

include_once('includes/dojo.inc');

$tree = '';
// no dojo.require() call made?
$u = 0; 
$files = dojo_get_files(); 
foreach ($files as $set){ 
  list($namespace, $file) = $set;
  $data[$namespace][] = $file;
}
$namespaces = array_keys($data); 

$trees = array();
$regexp = "";
foreach ($data as $ns => $file){
  $tree = "<ul>";
  foreach ($data[$ns] as $file){
    if(!preg_match('/tests\//i',$file)){
      if($ifile == $file){ $tree .= "<li>".$file."</li>"; 
      }else{ $tree .= "<li><a href=\"?ns=".$ns."&amp;file=".$file."\">".$ns."/".$file."</a></li>"; }
    }else{ $testfiles[] = $ns."/".$file; } 
  }
  $tree .= "</ul>";
  $trees[$ns] = $tree;
}


unset($files); 

if(!empty($_REQUEST['ns'])){
  $ns = $_REQUEST['ns'];
  $ifile = $_REQUEST['file'];
  

  if($ifile){
    $apiData = dojo_get_contents($ns,$ifile);

    $print .= "<h2>".$ns."/".$ifile."</h2><ul>";
    foreach($apiData as $key => $val){
      switch($key){
        case "#resource" : break;
        case "#requires" : 
          $print .= "<li><h3>Requires:</h3><ul>";
          foreach($val as $resource){
            $print .= "<li>{$resource[1]} in {$resource[0]}";
            if ($resource[2]) {
              $print .= " in project {$resource[2]}";
            }
            $print .= "</li>"; 
          }
          $print .= "</ul></li>"; 
          break;
        case "#provides" :
          $print .= "<li><h3>Provides:</h3><ul>";
          $print .= "<li>$val</li>"; 
          $print .= "</ul></li>"; 
          break;
        default:
          $print .= "<li><h4>".$key."</h4><ul> ";
          foreach($val as $key2 => $val2){
  
              switch($key2){
                // most things using dojo.declare() trigger this, eg: dijits
                case "classlike": $knownClasses[] = $key; break;

                // these are partially useless for our "overview" api, but set showall=1 in the
                // url if you want to see these, too. sortof.
                case "type" : $print .= "<li><em>".$key2."</em><div><pre>".htmlentities($val2)."</pre></div></li>"; break;
                case "private_parent" :
                case "prototype" :
                case "instance" :
                case "private" :
                  if($_REQUEST['showall']){ $print .= "<li>".$key2." - ".$val2."</li>"; }
                  break;
                
                // another array we want inspect more closely 
                case "parameters" : 
                  $print .= "<li><em>parameters:</em> <ul>"; 
                  foreach($val2 as $param => $paramData){
                    $print .= "<li>".$param.": <em>(typeof ".$paramData['type'].")</em><div>";
                    if(!empty($paramData['summary'])){
                      $print .= "<pre>".htmlentities($paramData['summary'])."</pre>";
                    }
                    $print .= "</div></li>";
                  } //print_r($val2);             
                  $print .= "</ul></li>";
                  break;
                
                // the stripped source, and some minimal toggling to show/hide  
                case "source" : 
                  $print .= "<li class=\"source\"><em>source: [<a onclick=\"tgShow('unique".++$u."');\">view</a>]</em> 
                    <div class=\"nosho\" id=\"unique".$u."\">\n
                    ".ltrim(str_replace("\n","<br>",str_replace("\t","&nbsp;",$val2)))."
                    </div>
                    ";  
                  break;

                case "tags":
                  $print .= "<li><em>$key2</em>: " . implode(' ', $val2) . '</li>';
                  break;

                case "chains" :
                case "mixins" :
                  if (!empty($val2)) {
                    $print .= "<li><em>" . $key2 . ":</em> <ul>";
                    foreach ($val2 as $subtype => $chains) {
                      foreach ($chains as $chain) {
                        $print .= "<li>$chain: <em>($subtype)</em></li>";
                      }
                    }
                    $print .= "</ul></li>";
                  }
                  break;

                // these are the ones we care about, and are fulltext/sometimes html
                case "examples" :
                  foreach ($val2 as $example){
                    $print .= "<li><em>example</em><div><pre>".htmlentities($example)."</pre></div></li>";
                  }
                  break;
                case "returns" :
                case "return_summary" :
                case "exceptions" :
                case "description" :
                case "summary" : $print .= "<li><em>".$key2."</em><div><pre>".htmlentities($val2)."</pre></div></li>"; break;

                // this is a key we don't know about above, so show it just in case
                default: $print .= "<li>?? ".$key2." = ".$val2." (debug: ".gettype($val2).") ??</li>"; break;
              }
          } 
          $print .= "</ul></li>"; break;
      }
    }
    $print .= "</ul>";
  }
}

if(!$ajaxy){ ?>
<div dojoType="dijit.layout.BorderContainer" style="width:100%; height:100%;">
	<div dojoType="dojox.layout.ExpandoPane" easeOut="dojo.fx.easing.backIn" easeIn="dojo.fx.easing.backOut" title="Namespaces" region="left" style="width:250px" splitter="true">
		<div dojoType="dijit.layout.AccordionContainer" style="width:250px" tabPosition="top">
			<?php
				foreach($trees as $ns => $list){
					print "\n\n<div dojoType=\"dijit.layout.ContentPane\" title=\"".$ns."\">";
					print $list;
					print "</div>";
				}
			?>
		</div>
	</div>
    <div dojoType="dijit.layout.TabContainer" closeable="false" region="center">
		<div dojoType="dijit.layout.ContentPane" id="apiPane" title="Crude API Browser">
			<div class="pad"><?php echo $print; ?></div>
		</div>
    </div>
</div>
</body>
</html>
<?php }else{
	// we just want the content we parsed
	echo '<div class="pad">'.$print.'</div>';
}
?>
