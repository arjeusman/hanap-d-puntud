<?php

require_once('config.php');

// get the incoming POST data
$post = file_get_contents('php://input') ?? $_POST;

if(!empty($post)){

    $post = json_decode($post, true);

    $id = (int)$post['id'];
    $name = $post['name'];
    $address = $post['address'];
    $description = $post['description'];

    try {
        mysqli_query($con, "update cementery set name='$post[name]', address='$post[address]', description='$post[description]' where id=$id");
        //results
        $result['type'] = 'success';
        $result['message'] = 'The record was updated succefully.';
        http_response_code(200);
    } catch(Exception  $e){
        $result['type'] = 'success';
        $result['message'] =$e->getMessage();
    }

    print json_encode($result);
}