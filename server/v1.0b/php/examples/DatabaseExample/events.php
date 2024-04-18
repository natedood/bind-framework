
<?php

//require once bind server side framework
require_once '../../bind.php';

// initialize bind, res/req vars are set, but can be specified like so Bind('req', 'res')
$bind = new Bind();

// example of handling a click event on a button with the id of searchButton
// also listen for the enter key in the searchString input
if( $req->type == 'click' && $req->id == 'searchButton' || 
    $req->type == 'enter' && $req->id == 'searchString'){

    // get the form data (you can specify the form name in the getForm() method like so $req->getForm('myFormName');)
    // since our field isn't in a form, it is anonymous and no form name is needed
    $formData = $req->getForm();

    // this is using the sakila example database that comes with MySQL
    // change the following to your database credentials
    $dsn = 'mysql:host=127.0.0.1;dbname=sakila;charset=utf8';
    $username = 'readonly';
    $password = 'readonly';

    // try to connect to the database
    try {
        $pdo = new PDO($dsn, $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        die('Failed to connect to MySQL: ' . $e->getMessage());
    }

    // get customers from the customer table
    // using params to avoid sql injection, as always
    $searchString = '%' . $formData['searchString'] . '%';
    $stmt = $pdo->prepare('SELECT customer_id, first_name, last_name, email FROM customer WHERE active = 1 and (first_name LIKE ? or last_name LIKE ?)');
    $stmt->bindParam(1, $searchString);
    $stmt->bindParam(2, $searchString);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // output the result
    $tablerows = '';
    foreach ($result as $row) {
        $tablerows .= '<tr>';
        $tablerows .= '<td>' . $row['customer_id'] . '</td>';
        $tablerows .= '<td>' . $row['first_name'] . '</td>';
        $tablerows .= '<td>' . $row['last_name'] . '</td>';
        $tablerows .= '<td>' . $row['email'] . '</td>';
        $tablerows .= '</tr>';
    }

    // add the output to the response to bind client with the current count
    $res->addTask(array(
        'action'        => 'replace',
        'value'         => $tablerows,
        'id'            => 'searchResults'
    ));  

    // show the table 
    $res->addTask(array(
        'action'        => 'show',
        'id'            => 'resultsTable'
    ));  
 }

// return the response to the client (ends processing)
$res->returnResponse($bind);

?>