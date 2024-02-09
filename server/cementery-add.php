<?php

require_once('config.php');

// get the incoming POST data
$post = file_get_contents('php://input') ?? $_POST;

if(!empty($post)){
    $post = json_decode($post, true);

    try {
        mysqli_query($con, "insert into cementery(name, address, description, trace) values ('$post[name]', '$post[address]', '$post[description]', '$post[trace]')");
        //results
        $result['type'] = 'success';
        $result['message'] = 'The record was added succefully.';
        http_response_code(200);
    } catch(Exception  $e){
        $result['type'] = 'success';
        $result['message'] =$e->getMessage();
    }

    print json_encode($result);
}