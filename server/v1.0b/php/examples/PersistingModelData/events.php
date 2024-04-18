<?php
//require once bind server side framework
require_once '../../bind.php';

// initialize bind, res/req vars are set, but can be specified like so Bind('req', 'res')
$bind = new Bind();

// example of handling a click event on a button with the id of getServertimeButton
if( $req->type == 'click' && $req->id == 'increaseCount' ){
    // if the model data doesn't exist, create it and set it to zero
    // on subsequent clicks, the model data will exist and be passed back to the server automatically
    if (!isset($req->model['data']['currentCount'])) {
        $req->model['data']['currentCount'] = 0;
    }
    
    // increment the current count
    $req->model['data']['currentCount']++;
    
    // add the output to the response to bind client with the current count
    $res->addTask(array(
        'action'        => 'replace',
        'value'         => '<p>Current count: ' . $req->model['data']['currentCount'] . '</p>',
        'id'            => 'serverMessage'
    ));  
 }

// return the response to the client (ends processing)
$res->returnResponse($bind);

?>