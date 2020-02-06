<?php
    header('Content-Type: text/html; charset=utf-8');
  //error_reporting(E_ALL);
  //ini_set("display_errors", 1);
  //ini_set("allow_url_fopen", 1);
//  date_default_timezone_set('Asia/Seoul');
  //ini_set( 'date.timezone', 'Asia/Seoul' );

  $url = "https://spreadsheets.google.com/feeds/list/1gzrxItSXDgTTnCaolsZXoAZggq4voNTc2Nbyz_J_Lf4/1/public/basic?alt=json-in-script";
//  $url = "http://www.cdc.go.kr/linkCheck.es?mid=a21111050500";

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_URL, $url);

  $result = curl_exec($ch);

  curl_close($ch);

  $result = str_replace("gdata.io.handleScriptLoaded(", "", $result);
  $result = str_replace("$", "", $result);
  $result = substr_replace($result, "", strlen($result)-1);
  $result = substr_replace($result, "", strlen($result)-1);

  $data = json_decode($result);

  $entry = $data -> feed -> entry;
  $content = $entry[0] -> content -> t;

  $arrlength = count($entry);
  $allString = "";

  for($k = 0; $k < $arrlength; $k++){

    $allString .= $entry[$k] -> title -> t;
    $allString .= $entry[$k] -> content -> t;

  }

  echo $allString;

?>
