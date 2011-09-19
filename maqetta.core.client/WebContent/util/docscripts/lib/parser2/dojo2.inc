<?php

ini_set('display_errors', 1);
error_reporting(E_ALL ^ E_NOTICE);

require_once('JavaScriptLanguage.php');
require_once('JavaScriptParser.php');
require_once('JavaScriptStatements.php');
require_once('JavaScriptFunction.php');
require_once('Dojo.php');
require_once('DojoCommentBlock.php');

$_dojo_properties_modules = array();

function _dojo_get_namespaces($limit=null){
  static $namespaces;
  if (!isset($namespaces)) {
    $namespaces = array();
    $files = scandir('modules');
    foreach ($files as $file) {
      if (substr($file, -7) == '.module') {
        $namespace = substr($file, 0, -7);
        if (!$limit || in_array($namespace, $limit)) {
          include_once('modules/' . $file);
          $namespaces[] = substr($file, 0, -7);
        }
      }
      elseif (substr($file, -18) == '.module.properties') {
        $namespace = substr($file, 0, -18);
        if (!$limit || in_array($namespace, $limit)) {
          global $_dojo_properties_modules;
          foreach (preg_split('%[\n\r]+%', file_get_contents('modules/' . $file)) as $line) {
            list($line, ) = preg_split('%[!#]%', $line, 2);
            if ($line = trim($line)) {
              list($key, $line) = explode('=', $line, 2);
              $key = str_replace('\\ ', ' ', trim($key));
              $line = preg_replace('%^\s+%', '', $line);
              if ($key == 'location') {
                $line = _dojo_ensure_directory($line);
              }
              $_dojo_properties_modules[$namespace][$key] = $line;
            }
          }
          $namespaces[] = substr($file, 0, -18);
        }
      }
    }
  }
  return $namespaces;
}

function dojo_get_include($node, $provide) {
  if ($node->jsdoc_project_name == $provide->title) {
    return 'Included automatically';
  }
  else {
    return 'dojo.require("%s");';
  }
}

function _dojo_ensure_directory($directory) {
  if (!is_dir($directory)) {
    die("$directory is not a directory\n");
  }
  else {
    if(substr($directory, -1) != '/'){
      $directory .= '/';
    }
  }
  return $directory;
}

function dojo_get_file_time($namespace, $file) {
  if (function_exists($namespace . '_code_location')) {
    return filectime(_dojo_ensure_directory(call_user_func($namespace . '_code_location')) . $file);
  }
  else {
    global $_dojo_properties_modules;
    return filectime($_dojo_properties_modules[$namespace]['location'] . $file);
  }
}

function _jsdoc_file_list($dir = false, $recurse = false){
  $output = array();

  if (!$recurse) {
    $old_dir = getcwd();
    if (!is_dir($dir)) {
      return array();
    }
    chdir($dir);
    $dir = '.';
  }
  $files = scandir($dir);

  foreach ($files as $file) {
    if ($file{0} == '.') continue;
    if (is_dir($dir . '/' . $file)) {
      if ($recurse) {
        $file = $dir . '/' . $file;
      }
      $output = array_merge($output, _jsdoc_file_list($file, true));
    }else{
      if (substr($file, -3) == '.js' && substr($file, -6) != '.xd.js') {
        if ($recurse) {
          $file = $dir . '/' . $file;
        }
        $output[] = $file;
      }
    }
  }

  if (!$recurse) {
    chdir($old_dir);
  }
  return $output;
}

function dojo_get_files($limit=null) {
    $namespaces = _dojo_get_namespaces($limit);
    $files = array();
    foreach ($namespaces as $namespace) {
        if (function_exists($namespace . '_code_location')) {
          $location = _dojo_ensure_directory(call_user_func($namespace . '_code_location'));
        }
        else {
          global $_dojo_properties_modules;
          $location = $_dojo_properties_modules[$namespace]['location'];
        }
        if (!$location) die($namespace . '_code_location does not return useful result');
        $list = _jsdoc_file_list($location);
        foreach ($list as $i => $item) {
            // Skip internationalization/tests/demos files
            if (preg_match('%(^|/|\\\\)(nls|tests|demos)(\\\\|/)%', $item)) {
              unset($list[$i]);
              continue;
            }
            $list[$i] = array($namespace, $item);
        }
        $files = array_merge($files, array_values($list));
    }

    return $files;
}

function _slashtoname($thing){
    return str_replace("/", ".", $thing);
}

function _amd_unwrap($text){

    $re = '/\/\/\s*AMD\-ID\s*"([^\n]+)"/i';
    $bre = '/define\(([^\]]+)\]\s*\,[\s\n]*function.+/';
    $depre = '/^[\'"]([-_a-zA-Z\/]+)[\'"]\s*,\s*\[(.*)$/';

    preg_match($re, $text, $foo);
    $anonmoduleid = $foo[1];
    
    // either speciam AMD-ID string found, or file startswith("define(")
    if($anonmoduleid || substr($text, 0, 8) == "define(\""){

        preg_match($bre, $text, $matches);
        preg_match($depre, $matches[1], $parts);

        $provide = _slashtoname($anonmoduleid ? $anonmoduleid : $parts[1]);
        preg_match_all('/[\'"]([\w\/-_\!]+)[\'"],?/', $anonmoduleid ? $matches[0] : $parts[2], $deps);
        $requires = $deps[1];
        
        $prefixtext = 'dojo.provide("' . $provide . '");';
        $prefixtext .= "\n";
        
        preg_match_all('/[\'"]([\w\/-_\!]+)[\'"],?/', $parts[2], $deps);        
        if(is_array($requires)){
            foreach($requires as $dep){
                $firstbit = substr($dep, 0, 5);
                if($firstbit == "text!"){
                    // do nothing
                }else if($firstbit == "i18n!"){
                    preg_match('/i18n\!(.+)\/nls\/(\w+)/', $dep, $bundlebits);
                    $prefixtext .= 'dojo.requireLocalization("' . $bundlebits[1] . '", "' . $bundlebits[2] . '");';
                    $prefixtext .= "\n";
                }else if($dep != "dojo" && $dep != "dijit" && $dep != "dojox"){
                    $prefixtext .= 'dojo.require("' . _slashtoname($dep) . '");';
                    $prefixtext .= "\n";
                }
            }
        }
        
        // strip out "AMD-result" comments? not sure what these are. 

        $text = preg_replace($bre, "", $text);        
        $text = preg_replace('/\s*(return\s+[_a-zA-Z\.0-9]+\s*;\s)?(\/\/.+)?\s*\}\);\s*$/', "", $text);

        $text = $prefixtext . $text;
        
    }

    return $text; 

}

function dojo_get_contents($namespace, $file_name) {
  if (function_exists($namespace . '_code_location')) {
    $location = _dojo_ensure_directory(call_user_func($namespace . '_code_location'));
  }
  else {
    global $_dojo_properties_modules;
    $location = $_dojo_properties_modules[$namespace]['location'];
  }

  $filedata = file_get_contents($location . '/' . $file_name);
  $filedata = _amd_unwrap($filedata);

  $lines = preg_replace('%/\*={3,}|={3,}\*/%', '', $filedata);
  $parser = new JavaScriptParser(JavaScriptLanguage::tokenize($lines));
  // print '<pre>';
  // $statements = $parser->statements();
  // print $statements[0]->resolve();
  // print '</pre>';
  // die();
  $package = new JavaScriptStatements($parser->statements());

  $output = array();

  // Handle dojo.provide calls
  foreach ($package->function_calls(TRUE, 'dojo.provide') as $call) {
    if ($module = $call->arguments()->getString(0)) {
      $output['#provides'] = $module;
    }
  }

  $output['#resource'] = $file_name;

  // Handle dojo.require calls
  foreach ($package->function_calls(TRUE, 'dojo.require') as $call) {
    if ($module = $call->arguments()->getString(0)) {
      $output['#requires'][] = array('common', $module);
    }
  }

  // Handle mixin/extend calls
  foreach ($package->function_calls(TRUE, 'dojo.mixin', 'dojo.extend') as $call) {
    $arguments = $call->arguments();
    $assignment = $call->assignment();
    $root = NULL;
    if ($constructor = $arguments->getFunction(0)) {
      if ($assignment) {
        Dojo::roll_out($constructor, $assignment, FALSE, $output);
      }
    }
    else {
      $root = $arguments->getVariable(0, TRUE);
      if ($call->name() == 'dojo.extend') {
        $output[$root]['type'] = 'Function';
      }
    }

    foreach (array_diff(array_unique(array($assignment, $root)), array(NULL)) as $root) {
      $mixin = $call->name() == 'dojo.mixin';
      for ($i = 1; $i < $arguments->length; $i++) {
        if ($arguments->getObject($i)) {
          $keys = array();
          foreach ($arguments->getObject($i)->values() as $key => $values) {
            $keys[] = $key;
            $full_name = "$root.$key";
            foreach ($values as $value) {
              if ($value instanceof JavaScriptVariable) {
                $key = $mixin ? $full_name : "$root.prototype.$key";
                if ($key != $value->value()) {
                  $output[$key]['alias'] = $value->value();
                }
              }
              else {
                Dojo::roll_out($value, $full_name, FALSE, $output);
                $output[$full_name][$mixin ? 'attached' : 'prototype'] = $root;
              }
            }
          }
          Dojo::roll_out_comment_block($arguments->getObject($i), $root, $output, $keys);
        }
        elseif ($root && $full_name = $arguments->getVariable($i)) {
          if ($mixin) {
            $output[$root]['mixins']['normal'][] = $full_name;
          }
          else {
            $output[$root]['chains']['prototype'][] = $full_name;
          }
        }
      }
    }
  }

  foreach ($package->function_calls(TRUE, 'dojo.declare') as $call) {
    $arguments = $call->arguments();
    $name = $arguments->getString(0);
    if (!$name) {
      continue;
    }
    $output[$name]['type'] = 'Function';
    if ($superclass = $arguments->getVariable(1)) {
      if ($superclass != 'null') {
        $output[$name]['chains']['prototype'][] = $superclass;
        $output[$name]['chains']['call'][] = $superclass;
      }
    }
    elseif ($superclasses = $arguments->getArray(1)) {
      for($i = 0; TRUE; $i++) {
        if ($superclass = $superclasses->getVariable($i)) {
          $output[$name]['chains']['prototype'][] = $superclass . ($i ? '.prototype' : '');
          $output[$name]['chains']['call'][] = $superclass;
        }
        else {
          break;
        }
      }
    }
    if ($mixin = $arguments->getObject(2)) {
      $keys = $block_keys = Dojo::$block_keys;
      $new_keys = array();
      $constructors = array();
      // Remember that bad code can have multiple matching keys
      foreach ($mixin->values() as $key => $values) {
        $new_keys[] = $key;
        $full_name = "$name.$key";
        foreach ($values as $value) {
          if ($value instanceof JavaScriptFunction) {
            if (in_array($key, array('constructor', 'preamble', 'postscript'))) {
              $output[$full_name]['constructor'] = $key;
              $output[$full_name]['prototype'] = $name;
              $constructors[$full_name] = $value;
              continue;
            }
          }
          elseif ($value->type() == 'variable') {
            if ($full_name != $value->value()) {
              $output[$full_name]['alias'] = $value->value();
            }
            continue;
          }

          $output[$full_name]['prototype'] = $name;
          $new_keys = array_unique(array_merge($new_keys, Dojo::roll_out($value, $full_name, FALSE, $output, $new_keys)));
        }
      }

      foreach ($constructors as $full_name => $constructor) {
        $new_keys = array_unique(array_merge($new_keys, Dojo::roll_out($constructor, $name, FALSE, $output, $new_keys)));
        foreach ($output[$name] as $key => $value) {
          if ($key != 'chains') {
            $output[$full_name][$key] = $value;
          }
        }
      }

      Dojo::roll_out_comment_block($mixin, $name, $output, $new_keys);
    }
  }

  // Variable assignments (global)
  foreach ($package->assignments(TRUE) as $variable) {
    foreach ($variable->names() as $name) {
      $parts = explode('.', $name);
      $name = implode('.', array_diff($parts, array('prototype')));
      $last = array_pop($parts);

      $is_prototype = ($last == 'prototype');

      Dojo::roll_out($variable->value(), $name, FALSE, $output, array(), $is_prototype);

      if (count($parts) && !$is_prototype) {
        $output[$name]['attached'] = implode('.', $parts);
      }
    }
  }

  // dojo.provide creates new objects if needed
  if (!empty($output['#provides'])) {
    $parts = explode('.', $output['#provides']);
    while (count($parts)) {
      if (!array_key_exists(implode('.', $parts), $output)) {
        $output[implode('.', $parts)] = array('type' => 'Object');
      }
      array_pop($parts);
    }
  }

  // Set privacy, classlikeness, and clean up the summary a bit
  foreach ($output as $object_name => $object) {
    if ($object_name{0} == '#') {
      continue;
    }
    $parts = explode('.', $object_name);
    $last = array_pop($parts);
    if ($last{0} == '_') {
      $output[$object_name]['private'] = true;
    }
    if (preg_match('%\._+[^A-Z]%', implode('.', $parts), $match)) {
        $output[$object_name]['private_parent'] = true;
    }
    if (is_array($object['tags'])) {
      foreach ($object['tags'] as $tag) {
        if ($tag == 'protected') {
          unset($output[$object_name]['private']);
          $output[$object_name]['protected'] = true;
        }
        elseif ($tag == 'private') {
          unset($output[$object_name]['protected']);
          $output[$object_name]['private'] = true;
        }
        elseif ($tag == 'deprecated') {
          $output[$object_name]['deprecated'] = true;
        }
      }
      $output[$object_name]['tags'] = array_diff($object['tags'], array('private', 'protected', 'deprecated'));
    }

    if (isset($object['inferred_type'])) {
      if (empty($object['type'])) {
        $output[$object_name]['type'] = $object['inferred_type'];
      }
      unset($output[$object_name]['inferred_type']);
    }

    if ($object['type'] == 'Function') {
      if (preg_match('%^(_*)[A-Z]%', $last, $match)) {
        if (strlen($match[1]) < 2) {
          unset($output[$object_name]['private']);
        }
        $output[$object_name]['classlike'] = true;
      }
    }

    if ($object['prototype'] && $output[$object['prototype']]) {
      $output[$object['prototype']]['classlike'] = true;
    }
    elseif ($object['instance'] && $output[$object['instance']]) {
      $output[$object['instance']]['classlike'] = true;
    }
  }

  return $output;
}