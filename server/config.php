<?php

// error_reporting(0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'hanap-d-puntod';

$result = [];

try {
    $con = mysqli_connect($host, $user, $pass, $db);
} catch(Exception  $e){
    $result = array(
        'type' => 'error',
        'messsage' => $e->getMessage()
    );
    die(json_encode($result));
}