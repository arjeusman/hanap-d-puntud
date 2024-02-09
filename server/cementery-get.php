<?php

require_once('config.php');

try {
    //results
    $result['type'] = 'success';
    $result['message'] = 'Record was loaded successfully.';
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