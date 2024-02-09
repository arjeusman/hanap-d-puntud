<?php

require_once('config.php');

// get the incoming POST data
$post = file_get_contents('php://input') ?? $_POST;

if(!empty($post)){
    $post = json_decode($post, true);
    
    $id = (int)$post['id'];

    try {
        mysqli_query($con, "delete from cementery where id=$id");
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