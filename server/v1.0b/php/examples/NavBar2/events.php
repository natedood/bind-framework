<?php
//require once bind server side framework
require_once '../../bind.php';

// initialize bind, res/req vars are set, but can be specified like so Bind('req', 'res')
$bind = new Bind();

// when the main body component loads, hide all navsection nodes
if( $req->type == 'ready' && $req->tagname == 'body' ){
    $res->addTask(array(
        'action'        => 'hide',
        'class'         => 'navsection'
    ));
}

// when an item with the class of navItem is clicked, remove the active class from all navItems and add the active class to the clicked navItem
if( $req->type == 'click' && $req->hasClass('navItem') ){
    // remove active from all nodes with the class of navItem
    $res->addTask(array(
        'action'        => 'removeclass',
        'value'         => 'active',
        'class'         => 'navItem'
    ));
    // add active to the clicked navItem node based on the navname attribute of the item clicked
    $res->addTask(array(
        'action'        => 'addclass',
        'value'         => 'active',
        'class'         => 'navItem-' . $req->attr('navname')
    ));

    // add active to the clicked navItem node based on the navname attribute of the item clicked
    $res->addTask(array(
        'action'        => 'dispatch',
        'type'          => 'opensection',
        'data'          => $req->attr('navname')
    ));
 }

 if( $req->type == 'opensection') {
    // handle the display of the correct section
    // hide all sections
    $res->addTask(array(
        'action'        => 'hide',
        'class'         => 'navsection'
    ));
    // show the clicked section based on the navname attribute of the item clicked
    $res->addTask(array(
        'action'        => 'show',
        'class'         => 'section-' . $req->data
    ));
 }

// return the response to the client (ends processing)
$res->returnResponse($bind);

?>