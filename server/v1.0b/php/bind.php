<?php
// See LICENSE.txt in root of project for licensing information (Open source FreeBSD License Copyright 2024 Nate Nielsen)
// parent base Bind class   
class Bind {
    public $req;
    public $res;

    public function __construct($requestVar = 'req', $responseVar = 'res') {
        // instantiate the request and response objects
        $this->req = new BindRequest();
        $this->res = new BindResponse();
        
        // set pointers between req and res objects
        $this->res->reqPointer = $this->req;
        $this->req->resPointer = $this->res;

        if (isset($_POST['BINDFRAMEWORK_DATA'])) { 
            $this->req->populate(json_decode($_POST['BINDFRAMEWORK_DATA'], true));
        }

        // set global variables for the request and response objects, based on the requestVar and responseVar passed in
        $GLOBALS[$requestVar] = $this->req;
        $GLOBALS[$responseVar] = $this->res;

    }    
}

// class that holds the bind request object, typically held in $bind->req
class BindRequest {
    // properties of the request object
    public $id                  = '';
    public $action              = 'event';
    public $type                = '';
    public $value               = '';
    public $name                = '';
    public $key                 = '';
    public $componentid         = '';
    public $bodycomponentid     = '';
    public $response            = '';
    public $processed           = '';
    public $formdata            = array();
    public $attrs               = array();
    public $tagname             = '';
    public $model               = array();
    public $data                = array();
    public $dispatcher          = array();
    public $dispatcherdata      = array();
    public $resPointer          = [];

    // gets a request obj containing the information related to the object that dispatched the event
    function getDispatcher() {
        // check to see if dispatcher is instantiated and is a type of BindRequest, if not set it to a new instance of BindRequest object
        if (!is_a($this->dispatcher, 'BindRequest')) {
            $this->dispatcher = new BindRequest();
        }
        // return the dispatcher object
        return $this->dispatcher;
    }

    // populate the request object with the event object data passed in
    public function populate($eventObjRaw) {
        
        $eventObj = $eventObjRaw['data'];
        //try setting the properties of the event object to the properties of the request object
        $this->id               = isset($eventObj['id'])                ? $eventObj['id']                   : '';
        $this->action           = isset($eventObj['action'])            ? $eventObj['action']               : '';
        $this->type             = isset($eventObj['type'])              ? $eventObj['type']                 : '';
        $this->value            = isset($eventObj['value'])             ? $eventObj['value']                : '';
        $this->name             = isset($eventObj['name'])              ? $eventObj['name']                 : '';
        $this->key              = isset($eventObj['key'])               ? $eventObj['key']                  : '';
        $this->componentid      = isset($eventObj['componentid'])       ? $eventObj['componentid']          : '';
        $this->bodycomponentid  = isset($eventObj['bodycomponentid'])   ? $eventObj['bodycomponentid']      : '';
        $this->response         = isset($eventObj['response'])          ? $eventObj['response']             : '';
        $this->processed        = isset($eventObj['processed'])         ? $eventObj['processed']            : '';
        $this->formdata         = isset($eventObj['formdata'])          ? $eventObj['formdata']             : array();
        $this->attrs            = isset($eventObj['attrs'])             ? $eventObj['attrs']                : array();
        $this->tagname          = isset($eventObj['tagname'])           ? $eventObj['tagname']              : '';
        $this->model            = isset($eventObj['model'])             ? $eventObj['model']                : array();
        $this->data             = isset($eventObj['data'])              ? $eventObj['data']                 : array();
        $this->dispatcher       = isset($eventObj['dispatcher'])        ? $eventObj['dispatcher']           : array();
        $this->dispatcherdata   = isset($eventObj['dispatcherdata'])    ? $eventObj['dispatcherdata']       : array();
   

        // set the keys of the event object to the properties of the request object
        $eventKeys = ['id', 'type', 'value', 'name', 'key', 'attrs', 'componentid', 'bodycomponentid', 'model', 'action', 'tagname', 'formdata', 'data', 'dispatcherdata'];
        // loop over the event keys array and populate the request object with the event object data
        foreach ($eventKeys as $key) {
            if (isset($eventObj[$key])) {
                $this->$key = $eventObj[$key];
            } else {
                $this->$key = '';
            }
        }
   
        // if the dispatcherdata key is not empty and is an array, populate the dispatcher object with the dispatcherdata using a new instance of BindRequest
        if (!empty($eventObj['dispatcherdata']) && is_array($eventObj['dispatcherdata'])) {
            $this->dispatcher = $this.getDispatcher();
            $this->dispatcher->populate($eventObj['dispatcherdata']);
        }

        // creates a blank array if no attributes for the calling tag (typically a dispatched event scenario or loading/init)
        if (!is_array($this->attrs)) {
            $this->attrs = [];
        }

        // deprecated processed flag, do not use, flagged for removal after testing
        $this->processed = true;
    }

    // gets form struct based on the form name, if none provided returns the anonymous form (elements not part of a form with a name attr)
    function getForm($formName = '_noFormName') {
        // if no form name is provided, returns form elements that weren't part of a form
        if (trim($formName) == '') {
            $formName = '_noFormName';
        }
        // check to see if $this->formdata->forms is an array and if not, set it to an empty array
        if (!is_array($this->formdata['forms'])) {
            $this->formdata['forms'] = [];
        }
        
        // find the form
        $forms = $this->formdata['forms'];
        foreach ($forms as $form) {
            if ($form['name'] == $formName) {
                // return the fields array for the form
                return $form['fields'];
            }
        }
        
        // invalid form name provided
        throw new Exception("request:getForm - couldn't find a form named $formName");
    }

    // helper function to see if the requested node has a particular class name
    // useful for checking if a req has a particular class name easily i.e. $req->hasClass('btn-primary')
    function hasClass($className) {
        if (strpos(trim($this->attrs['class']), trim($className)) !== false) {
            return true;
        }
        return false;
    }

    // helper function to see if the requested node has a particular attribute
    // useful for checking if a req has a particular attribute easily i.e. $req->hasAttr('type')
    function hasAttr($attributeName) {
        foreach ($this->attrs as $attrObj) {
            if (strtolower($attrObj['name']) == strtolower($attributeName)) {
                return true;
            }
        }
        return false;
    }

    // helper function to get the value of a particular attribute (without having to loop through all the attributes)
    // useful for getting the value of a particular attribute easily i.e. $req->attr('type') == 'button'
    function attr($attributeName) {
        foreach ($this->attrs as $attrObj) {
            if ($attrObj['name'] == $attributeName) {
                return $attrObj['value'];
            }
        }
    }
}

// bind response object that holds the response data, typically held in $bind->res  
// main use are the tasks array
class BindResponse {
    public $tasks       = [];
    public $processed   = false;
    public $debug       = false;
    // note: model data implemented in reqPointer
    public $reqPointer  = [];
  
    // add a task to the tasks array that will be processed by the client
    function addTask($task) {
        // order of precedence is important here
        $validSelectorTypes = array("selector", "id", "tag", "class", "key", "attr", "attrValue", "even", "odd", "first", "last");
        $thisSelector = "";

        // if selector is specified, then it is the only selector value and the rest is ignored
        if (isset($task['selector']) && !empty(trim($task['selector']))) {
            $thisSelector = $task['selector'];
        }else{
            // loop over the valid selector array
            foreach ($validSelectorTypes as $selectorType) {
                // if the task has a selector key
                if (isset($task[$selectorType])) {
                    // if the selector key is not a string, throw an exception
                    if (!is_string($task[$selectorType])) {
                        throw new Exception("response:addTask - selector key must be a string");
                    }
                    // switch case between tag, class, key, id, attr, attrValue, even, odd, first, last
                    switch ($selectorType) {
                        case 'tag':
                            // if not null or blank, set the selector to the tag value
                            if (!empty(trim($task['tag']))) {
                                $thisSelector = $task['tag'];
                            }
                            break;
                        case 'class':
                            // if not null or blank, set the selector to existing selector value + "." + the class value
                            if (!empty(trim($task['class']))) {
                                $thisSelector = $thisSelector . "." . $task['class'];
                            }
                            break;
                        case 'key':
                            if (!empty(trim($task['key']))) {
                                $thisSelector = $thisSelector . "[key='" . $task['class'] . "']";
                            }
                            break;
                        case 'id':
                            if (!empty(trim($task['id']))) {
                                $thisSelector = $thisSelector . "#" . $task['id'];
                            }
                            break;
                        case 'attr':
                            $thisSelector = $thisSelector . "[" . $task['attr'];
                            if (!empty(trim($task['attrValue']))) {
                                $thisSelector = $thisSelector . "='" . $task['attrValue'] . "'";
                            }
                            $thisSelector = $thisSelector . "]";
                            break;
                        // TODO - not officially documented and supported yet, needs testing but should work ¯\_(ツ)_/¯
                        case 'even':
                        case 'odd':
                        case 'first':
                        case 'last':
                            $thisSelector = $thisSelector . ":" . $task['selectorType'];
                            break;
                        }        

                }
            }
        }

        // put into the task object the selector value
        $task['selector'] = $thisSelector;

        // check to see if task has componentid and if not, set it to req componentid
        if (!isset($task['componentid'])) {
            $task['componentid'] = $this->reqPointer->componentid;
        }

        //turn all the keys to uppercase
        $task = array_change_key_case($task, CASE_UPPER);

        array_push($this->tasks, $task);
    }

    // dutility function to get the tasks array rather than $bind->res->tasks directly, for future 
    // proofing/customization of processing before returning response to client
    function getTasks() {
        return $this->tasks;
    }

    // returns the response to the bind client to process the tasks
    function returnResponse() {
        $responseObj = array(
            'BIND_RESPONSE' => array(
                'TASKS' => $this->getTasks(),
                'DEBUG' => $this->debug,
                'MODEL' => $this->reqPointer->model
            )
        );
        // serialize the response object and decode it to utf-8
        $serializedResponse = json_encode($responseObj);
        // deprecated utf8_decode, using iconv instead
        //$decodedResponse = utf8_decode($serializedResponse);
        $decodedResponse = iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $serializedResponse);
        // set the content type to json and echo the response
        header('Content-Type: application/json; charset=utf-8');
        // sends to client
        echo $decodedResponse;
        // abort processing
        exit;
    }

}

?>