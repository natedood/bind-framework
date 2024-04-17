<?php
header('Access-Control-Allow-Origin: *');

// test data JSON object 
$test_data = '{
    "type": "handleEvent",
    "data": {
        "id": "myButton",
        "type": "click",
        "formdata": {
            "forms": [
                {
                    "name": "_noFormName",
                    "fields": {
                        "firstname": ""
                    }
                }
            ]
        },
        "attrs": [
            {
                "name": "type",
                "value": "button"
            },
            {
                "name": "class",
                "value": "btn btn-primary"
            },
            {
                "name": "id",
                "value": "myButton"
            },
            {
                "name": "bind-events",
                "value": "click"
            }
        ],
        "tagname": "button",
        "componentid": "bind_6567897d735846dcab5417d4765a089d",
        "bodyComponentId": "bind_cb394a294b7d496f85b54ef3b2e12a81",
        "model": {
            "componentid": "bind_6567897d735846dcab5417d4765a089d",
            "data": {}
        }
    }
}';


//require once bind server side framework
require_once 'bind.php';

// initialize bind, res/req vars are set, but can be specified like so Bind('req', 'res')
$bind = new Bind();

// test data JSON object for development
// /$req->populate(json_decode($test_data, true));

// example of handling a click event on a button with the id of myButton
 if( $req->type == 'click' && $req->id == 'myButton' ){

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
        'value'         => $output,
        'id'            => 'myMessage'
    ));  
 }

 // when an event occurs on the add component button (it's suggested to also check the type of event, this is just an example)
 // (click event not specified in this case, so will run on any event where the id of the dom node is addComponentButton)
 if( $req->id == 'addComponentButton' ){
    // add the output to the response to bind client
    $res->addTask(array(
        'action'        => 'fadeappend',
        'value'         => '<div bind-load="c_hello.html"></div>',
        'id'            => 'componentHolder'
    ));  
 }

 
 
// return the response to the client (ends processing)
$res->returnResponse($bind);



// Output current server time
/*
echo "Current server time: " . date("Y-m-d H:i:s");
echo '<pre>' . print_r($bind->req->id, true) . '</pre>';
echo '<pre>' . print_r($bind, true) . '</pre>';
*/
// Abort processing
//exit;
?>