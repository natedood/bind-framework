<?php
//require once bind server side framework
require_once '../../bind.php';

// initialize bind, res/req vars are set, but can be specified like so Bind('req', 'res')
$bind = new Bind();

// example of handling a click event on a button with the id of getServertimeButton
if( $req->type == 'click' && $req->id == 'getServertimeButton' ){
    // get the form data.  You can specify the form name in the getForm() method like so $req->getForm('myFormName'); 
    $formData = $req->getForm();
    // add the output to the response to bind client
    $res->addTask(array(
        'action'        => 'replace',
        'value'         => 'Hello ' . $formData['name'] . '!<p>Current server time: ' . date("Y-m-d H:i:s") . '</p>',
        'id'            => 'serverMessage'
    ));  
 }

 // when clicking the button with the id of addComponent 
 if( $req->type == 'click' && $req->id == 'addComponent' ){
    // add a component into the component holder div
    $res->addTask(array(
        'action'        => 'append',
        'value'         => '<div bind-load="c_hello.php"></div><hr>',
        'id'            => 'componentHolder'
    ));
 }

// return the response to the client (ends processing)
$res->returnResponse($bind);

?>