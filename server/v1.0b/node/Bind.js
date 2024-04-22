class Bind {
    constructor(request_var = 'req', response_var = 'res') {
        // instantiate the request and response objects
        this.req = new BindRequest();
        this.res = new BindResponse();

        // set pointers between req and res objects
        this.res.reqPointer = this.req;
        this.req.resPointer = this.res;

        // set global variables for the request and response objects, based on the request_var and response_var passed in
        global[request_var] = this.req;
        global[response_var] = this.res;
    }
}

class BindRequest {
    constructor() {
        // properties of the request object
        this.id = '';
        this.action = 'event';
        this.type = '';
        this.value = '';
        this.name = '';
        this.key = '';
        this.componentid = '';
        this.bodycomponentid = '';
        this.response = '';
        this.processed = '';
        this.formdata = {};
        this.attrs = {};
        this.tagname = '';
        this.model = {};
        this.data = {};
        this.dispatcher = {};
        this.dispatcherdata = {};
        this.resPointer = [];
    }

    // gets a request obj containing the information related to the object that dispatched the event
    getDispatcher() {
        // check to see if dispatcher is instantiated and is a type of BindRequest, if not set it to a new instance of BindRequest object
        if (!(this.dispatcher instanceof BindRequest)) {
            this.dispatcher = new BindRequest();
        }
        // return the dispatcher object
        return this.dispatcher;
    }

    // populate the request object with the event object data passed in
    populate(eventObjRaw) {
        const eventObj = eventObjRaw['data'];
        // try setting the properties of the event object to the properties of the request object
        this.id = eventObj['id'] || '';
        this.action = eventObj['action'] || 'event';
        this.type = eventObj['type'] || '';
        this.value = eventObj['value'] || '';
        this.name = eventObj['name'] || '';
        this.key = eventObj['key'] || '';
        this.componentid = eventObj['componentid'] || '';
        this.bodycomponentid = eventObj['bodycomponentid'] || '';
        this.response = eventObj['response'] || '';
        this.processed = eventObj['processed'] || '';
        this.formdata = eventObj['formdata'] || {};
        this.attrs = eventObj['attrs'] || {};
        this.tagname = eventObj['tagname'] || '';
        this.model = eventObj['model'] || {};
        this.data = eventObj['data'] || {};
        this.dispatcher = eventObj['dispatcher'] || {};
        this.dispatcherdata = eventObj['dispatcherdata'] || {};

        // set the keys of the event object to the properties of the request object
        const eventKeys = ['id', 'type', 'value', 'name', 'key', 'attrs', 'componentid', 'bodycomponentid', 'model', 'action', 'tagname', 'formdata', 'data', 'dispatcherdata'];
        // loop over the event keys array and populate the request object with the event object data
        for (const key of eventKeys) {
            if (eventObj.hasOwnProperty(key)) {
                this[key] = eventObj[key];
            } else {
                this[key] = '';
            }
        }

        // if the dispatcherdata key is not empty and is an dictionary, populate the dispatcher object with the dispatcherdata using a new instance of BindRequest
        if (this.dispatcherdata && typeof this.dispatcherdata === 'object') {
            this.dispatcher = this.getDispatcher();
            this.dispatcher.populate(this.dispatcherdata);
        }

        // creates a blank dictionary if no attributes for the calling tag (typically a dispatched event scenario or loading/init)
        if (this.attrs === null) {
            this.attrs = {};
        }

        // deprecated processed flag, do not use, flagged for removal after testing
        this.processed = true;
    }

    // gets form struct based on the form name, if none provided returns the anonymous form (elements not part of a form with a name attr)
    getForm(formName = '_noFormName') {
        // if no form name is provided, returns form elements that weren't part of a form
        if (!formName.trim()) {
            formName = '_noFormName';
        }
        // check to see if this.formdata['forms'] is a list and if not, set it to an empty list
        if (!Array.isArray(this.formdata['forms'])) {
            this.formdata['forms'] = [];
        }

        // find the form
        const forms = this.formdata['forms'];
        for (const form of forms) {
            if (form['name'] === formName) {
                // return the fields list for the form
                return form['fields'];
            }
        }

        // invalid form name provided
        throw new Error(`request:getForm - couldn't find a form named ${formName}`);
    }

    // helper function to see if the requested node has a particular class name
    // useful for checking if a req has a particular class name easily i.e. req.hasClass('btn-primary')
    hasClass(className) {
        if ((this.attrs['class'] || '').split(' ').includes(className.trim())) {
            return true;
        }
        return false;
    }

    // helper function to see if the requested node has a particular attribute
    // useful for checking if a req has a particular attribute easily i.e. req.hasAttr('type')
    hasAttr(attributeName) {
        for (const attrObj of this.attrs) {
            if (attrObj['name'].toLowerCase() === attributeName.toLowerCase()) {
                return true;
            }
        }
        return false;
    }

    // helper function to get the value of a particular attribute (without having to loop through all the attributes)
    // useful for getting the value of a particular attribute easily i.e. req.attr('type') == 'button'
    attr(attributeName) {
        for (const attrObj of this.attrs) {
            if (attrObj['name'] === attributeName) {
                return attrObj['value'];
            }
        }
    }
}

class BindResponse {
    constructor() {
        this.tasks = [];
        this.processed = false;
        this.debug = false;
        // note: model data implemented in reqPointer
        this.reqPointer = {};
    }

    // add a task to the tasks array that will be processed by the client
    addTask(task) {
        // order of precedence is important here
        const validSelectorTypes = ["selector", "id", "tag", "class", "key", "attr", "attrValue", "even", "odd", "first", "last"];
        let thisSelector = "";
        if (!task.hasOwnProperty('selector')) {
            task['selector'] = "";
        }

        // if selector is specified, then it is the only selector value and the rest is ignored
        if (task.hasOwnProperty('selector') && task['selector'].trim()) {
            thisSelector = task['selector'];
        } else {
            // loop over the valid selector array
            for (const selectorType of validSelectorTypes) {
                // if the task has a selector key
                if (task.hasOwnProperty(selectorType)) {
                    // if the selector key is not a string, throw an exception
                    if (typeof task[selectorType] !== 'string') {
                        throw new Error("response:addTask - selector key must be a string");
                    }
                    // switch case between tag, class, key, id, attr, attrValue, even, odd, first, last
                    if (selectorType === 'tag') {
                        // if not null or blank, set the selector to the tag value
                        if (task.hasOwnProperty('tag') && task['tag'].trim()) {
                            thisSelector = task['tag'];
                        }
                    } else if (selectorType === 'class') {
                        // if not null or blank, set the selector to existing selector value + "." + the class value
                        if (task.hasOwnProperty('class') && task['class'].trim()) {
                            thisSelector = `${thisSelector}.${task['class']}`;
                        }
                    } else if (selectorType === 'key') {
                        if (task.hasOwnProperty('key') && task['key'].trim()) {
                            thisSelector = `${thisSelector}[key='${task['class']}']`;
                        }
                    } else if (selectorType === 'id') {
                        if (task.hasOwnProperty('id') && task['id'].trim()) {
                            thisSelector = `${thisSelector}#${task['id']}`;
                        }
                    } else if (selectorType === 'attr') {
                        thisSelector = `${thisSelector}[${task['attr']}`;
                        if (task['attrValue'].trim()) {
                            thisSelector = `${thisSelector}='${task['attrValue']}'`;
                        }
                        thisSelector = `${thisSelector}]`;
                    } else if (['even', 'odd', 'first', 'last'].includes(selectorType)) {
                        thisSelector = `${thisSelector}:${task['selectorType']}`;
                    }
                }
            }
        }

        task['selector'] = thisSelector;
        if (this.reqPointer.hasOwnProperty('componentid')) {
            task['componentid'] = this.reqPointer.componentid;
        } else {
            task['componentid'] = "default_value";  // or throw new Error('componentid is not an attribute of reqPointer');
        }

        if (!task.hasOwnProperty('componentid')) {
            if (this.reqPointer.hasOwnProperty('componentid')) {
                task['componentid'] = this.reqPointer.componentid;
            } else {
                task['componentid'] = "default_value";  // or throw new Error('componentid is not an attribute of reqPointer');
            }
        }

        // check to see if task has componentid and if not, set it to req componentid
        if (!task.hasOwnProperty('componentid')) {
            task.componentid = this.reqPointer.componentid;
        }

        // turn all the keys to uppercase
        task = Object.fromEntries(Object.entries(task).map(([k, v]) => [k.toUpperCase(), v]));

        this.tasks.push(task);
    }

    // utility function to get the tasks array rather than $bind->res->tasks directly, for future 
    // proofing/customization of processing before returning response to client
    getTasks() {
        return this.tasks;
    }

    // returns the response to the bind client to process the tasks
    returnResponse(bind) {
        let model;
        if (this.reqPointer.hasOwnProperty('model')) {
            model = this.reqPointer.model;
        } else {
            model = "default_value";  // or throw new Error('model is not an attribute of reqPointer');
        }

        const responseObj = {
            'BIND_RESPONSE': {
                'TASKS': this.getTasks(),
                'DEBUG': this.debug,
                'MODEL': model
            }
        };

        // serialize the response object and return for delivery to client
        const serializedResponse = JSON.stringify(responseObj);
        return serializedResponse;
    }
}

module.exports = Bind;