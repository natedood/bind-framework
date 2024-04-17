<?php
//require once bind server side framework
require_once '../../bind.php';

// initialize bind, res/req vars are set, but can be specified like so Bind('req', 'res')
$bind = new Bind();

// example of handling a click event on a button with the id of myButton
if( $req->type == 'click' && $req->id == 'getServertimeButton' ){

    // add the output to the response to bind client
    $res->addTask(array(
        'action'        => 'replace',
        'value'         => 'Hello World!<p>Current server time: ' . date("Y-m-d H:i:s") . '</p>',
        'id'            => 'serverMessage'
    ));  
 }


// return the response to the client (ends processing)
$res->returnResponse($bind);

?>