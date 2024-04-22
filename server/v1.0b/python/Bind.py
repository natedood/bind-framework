import sys
import json
# from datetime import datetime

# print('Content-Type: text/plain')
# print('')
# current_time = datetime.now()
# print('Current Server Time:', current_time)
# print('Hello, world!')

class Bind:
    def __init__(self, request_var='req', response_var='res'):
        # instantiate the request and response objects
        self.req = BindRequest()
        self.res = BindResponse()
        
        # set pointers between req and res objects
        self.res.reqPointer = self.req
        self.req.resPointer = self.res

        # if 'BINDFRAMEWORK_DATA' in $_POST:
        #     self.req.populate(json.loads($_POST['BINDFRAMEWORK_DATA']))

        # set global variables for the request and response objects, based on the request_var and response_var passed in
        globals()[request_var] = self.req
        globals()[response_var] = self.res


class BindRequest:
    def __init__(self):
        # properties of the request object
        self.id = ''
        self.action = 'event'
        self.type = ''
        self.value = ''
        self.name = ''
        self.key = ''
        self.componentid = ''
        self.bodycomponentid = ''
        self.response = ''
        self.processed = ''
        self.formdata = {}
        self.attrs = {}
        self.tagname = ''
        self.model = {}
        self.data = {}
        self.dispatcher = {}
        self.dispatcherdata = {}
        self.resPointer = []

    # gets a request obj containing the information related to the object that dispatched the event
    def getDispatcher(self):
        # check to see if dispatcher is instantiated and is a type of BindRequest, if not set it to a new instance of BindRequest object
        if not isinstance(self.dispatcher, BindRequest):
            self.dispatcher = BindRequest()
        # return the dispatcher object
        return self.dispatcher

    # populate the request object with the event object data passed in
    def populate(self, eventObjRaw):
        eventObj = eventObjRaw['data']
        # try setting the properties of the event object to the properties of the request object
        self.id = eventObj.get('id', '')
        self.action = eventObj.get('action', 'event')
        self.type = eventObj.get('type', '')
        self.value = eventObj.get('value', '')
        self.name = eventObj.get('name', '')
        self.key = eventObj.get('key', '')
        self.componentid = eventObj.get('componentid', '')
        self.bodycomponentid = eventObj.get('bodycomponentid', '')
        self.response = eventObj.get('response', '')
        self.processed = eventObj.get('processed', '')
        self.formdata = eventObj.get('formdata', {})
        self.attrs = eventObj.get('attrs', {})
        self.tagname = eventObj.get('tagname', '')
        self.model = eventObj.get('model', {})
        self.data = eventObj.get('data', {})
        self.dispatcher = eventObj.get('dispatcher', {})
        self.dispatcherdata = eventObj.get('dispatcherdata', {})

        # set the keys of the event object to the properties of the request object
        eventKeys = ['id', 'type', 'value', 'name', 'key', 'attrs', 'componentid', 'bodycomponentid', 'model', 'action', 'tagname', 'formdata', 'data', 'dispatcherdata']
        # loop over the event keys array and populate the request object with the event object data
        for key in eventKeys:
            if key in eventObj:
                setattr(self, key, eventObj[key])
            else:
                setattr(self, key, '')

        # if the dispatcherdata key is not empty and is an dictionary, populate the dispatcher object with the dispatcherdata using a new instance of BindRequest
        if self.dispatcherdata and isinstance(self.dispatcherdata, dict):
            self.dispatcher = self.getDispatcher()
            self.dispatcher.populate(self.dispatcherdata)

        # creates a blank dictionary if no attributes for the calling tag (typically a dispatched event scenario or loading/init)
        if self.attrs is None:
            self.attrs = {}

        # deprecated processed flag, do not use, flagged for removal after testing
        self.processed = True


    # gets form struct based on the form name, if none provided returns the anonymous form (elements not part of a form with a name attr)
    def getForm(self, formName='_noFormName'):
        # if no form name is provided, returns form elements that weren't part of a form
        if not formName.strip():
            formName = '_noFormName'
        # check to see if self.formdata['forms'] is a list and if not, set it to an empty list
        if not isinstance(self.formdata.get('forms'), list):
            self.formdata['forms'] = []
        
        # find the form
        forms = self.formdata['forms']
        for form in forms:
            if form['name'] == formName:
                # return the fields list for the form
                return form['fields']
        
        # invalid form name provided
        raise Exception(f"request:getForm - couldn't find a form named {formName}")

    # helper function to see if the requested node has a particular class name
    # useful for checking if a req has a particular class name easily i.e. req.hasClass('btn-primary')
    def hasClass(self, className):
        if className.strip() in (self.attrs.get('class') or '').split():
            return True
        return False

    # helper function to see if the requested node has a particular attribute
    # useful for checking if a req has a particular attribute easily i.e. req.hasAttr('type')
    def hasAttr(self, attributeName):
        for attrObj in self.attrs:
            if attrObj['name'].lower() == attributeName.lower():
                return True
        return False

    # helper function to get the value of a particular attribute (without having to loop through all the attributes)
    # useful for getting the value of a particular attribute easily i.e. req.attr('type') == 'button'
    def attr(self, attributeName):
        for attrObj in self.attrs:
            if attrObj['name'] == attributeName:
                return attrObj['value']


# bind response object that holds the response data, typically held in $bind->res  
# main use are the tasks array
class BindResponse:
    def __init__(self):
        self.tasks = []
        self.processed = False
        self.debug = False
        # note: model data implemented in reqPointer
        self.reqPointer = {}

    # add a task to the tasks array that will be processed by the client
    def addTask(self, task):
        # order of precedence is important here
        validSelectorTypes = ["selector", "id", "tag", "class", "key", "attr", "attrValue", "even", "odd", "first", "last"]
        thisSelector = ""
        if 'selector' not in task:
            task['selector'] = ""

        # if selector is specified, then it is the only selector value and the rest is ignored
        if 'selector' in task and task['selector'].strip():
            thisSelector = task['selector']
        else:
            # loop over the valid selector array
            for selectorType in validSelectorTypes:
                # if the task has a selector key
                if selectorType in task:
                    # if the selector key is not a string, throw an exception
                    if not isinstance(task[selectorType], str):
                        raise Exception("response:addTask - selector key must be a string")
                    # switch case between tag, class, key, id, attr, attrValue, even, odd, first, last
                    if selectorType == 'tag':
                        # if not null or blank, set the selector to the tag value
                        if 'tag' in task and task['tag'].strip():
                            thisSelector = task['tag']
                    elif selectorType == 'class':
                        # if not null or blank, set the selector to existing selector value + "." + the class value
                        if 'class' in task and task['class'].strip():
                            thisSelector = f"{thisSelector}.{task['class']}"
                    elif selectorType == 'key':
                        if 'key' in task and task['key'].strip():
                            thisSelector = f"{thisSelector}[key='{task['class']}']"
                    elif selectorType == 'id':
                        if 'id' in task and task['id'].strip():
                            thisSelector = f"{thisSelector}#{task['id']}"
                    elif selectorType == 'attr':
                        thisSelector = f"{thisSelector}[{task['attr']}"
                        if task['attrValue'].strip():
                            thisSelector = f"{thisSelector}='{task['attrValue']}'"
                        thisSelector = f"{thisSelector}]"
                    # TODO - not officially documented and supported yet, needs testing but should work ¯\_(ツ)_/¯
                    elif selectorType in ['even', 'odd', 'first', 'last']:
                        thisSelector = f"{thisSelector}:{task['selectorType']}"

        task['selector'] = thisSelector
        if hasattr(self.reqPointer, 'componentid'):
            task['componentid'] = self.reqPointer.componentid
        else:
            task['componentid'] = "default_value"  # or raise AttributeError('componentid is not an attribute of reqPointer')

        if 'componentid' not in task:
            if hasattr(self.reqPointer, 'componentid'):
                task['componentid'] = self.reqPointer.componentid
            else:
                task['componentid'] = "default_value"  # or raise AttributeError('componentid is not an attribute of reqPointer')



        # check to see if task has componentid and if not, set it to req componentid
        if 'componentid' not in task:
            task.componentid = self.reqPointer.componentid

        # turn all the keys to uppercase
        task = {k.upper(): v for k, v in task.items()}

        self.tasks.append(task)

    # utility function to get the tasks array rather than $bind->res->tasks directly, for future 
    # proofing/customization of processing before returning response to client
    def getTasks(self):
        return self.tasks

    # returns the response to the bind client to process the tasks
    def returnResponse(self, bind):
        if hasattr(self.reqPointer, 'model'):
            model = self.reqPointer.model
        else:
            model = "default_value"  # or raise AttributeError('model is not an attribute of reqPointer')

        responseObj = {
            'BIND_RESPONSE': {
                'TASKS': self.getTasks(),
                'DEBUG': self.debug,
                'MODEL': model
            }
        }
        # serialize the response object and decode it to utf-8
        serializedResponse = json.dumps(responseObj)
        return serializedResponse
        # set the content type to json and echo the response
        # print("Content-Type: application/json; charset=utf-8")
        # sends to client
        # print(serializedResponse)
        # Print headers
        # sys.stdout.write('Content-Type: application/json;charset=utf-8\n')
        # sys.stdout.write('\n')

        # # Print data
        # sys.stdout.write(serializedResponse)
        # # abort processing
        # exit()
