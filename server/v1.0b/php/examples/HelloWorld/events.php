<?php
//require once bind server side framework
require_once '../../bind.php';

// initialize bind, res/req vars are set, but can be specified like so Bind('req', 'res')
$bind = new Bind();

// example of handling a click event on a button with the id of myButton
if( $req->type == 'click' && $req->id == 'getServertimeButton' ){

    // get the form data
    $formData = $req->getForm();

    // get the content we will be outputting
    ob_start();?>
        <p>Button clicked! <?php echo date("Y-m-d H:i:s")?></p>
        <p>Message: <?php echo $formData['firstname']?></p>
    <?php
    $output = ob_get_clean();

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