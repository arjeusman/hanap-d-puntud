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


// get the incoming POST data
$post = file_get_contents('php://input') ?? $_POST;

if(!empty($post)){
    $post = json_decode($post, true);

    try {
        mysqli_query($con, "insert into cementery(name, address, description, trace) values ('$post[name]', '$post[address]', '$post[description]', '$post[trace]')");
        //results
        $result['type'] = 'success';
        $result['message'] = 'The record was added succefully.';
        $result['data'] = array();
        $data = mysqli_query($con, "select * from cementery order by id desc");
        while($d = mysqli_fetch_assoc($data)):
            array_push($result['data'], $d);
        endwhile;
        http_response_code(200);
    } catch(Exception  $e){
        $result['type'] = 'success';
        $result['message'] =$e->getMessage();
    }

    print json_encode($result);
}