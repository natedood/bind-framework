from flask import Flask, request, send_file
from flask_cors import CORS, cross_origin
from Bind import Bind
import json

app = Flask(__name__)
CORS(app)

@app.route('/')
def default():
    return send_file('index.html')

@app.route('/events', methods=['GET', 'POST'])
@cross_origin()
def events():

    # initialize bind, res/req vars are set, but can be specified like so Bind('req', 'res')
    bind = Bind()

    # sample test request for testing server - testing purposes
    # testdata = {
    #     "type": "handleEvent",
    #     "data": {
    #         "type": "click",
    #         "formdata": {
    #             "forms": [
    #                 {
    #                     "name": "_noFormName",
    #                     "fields": {}
    #                 }
    #             ]
    #         },
    #         "attrs": [
    #             {
    #                 "name": "class",
    #                 "value": "navItem navItem-customers  nav-link btn btn-light"
    #             },
    #             {
    #                 "name": "bind-events",
    #                 "value": "click"
    #             },
    #             {
    #                 "name": "navname",
    #                 "value": "customers"
    #             }
    #         ],
    #         "tagname": "span",
    #         "componentid": "bind_9053c0be74aa49348304fde7b273128c",
    #         "bodyComponentId": "bind_5e9c775a80604e0794ceebff6963bf55",
    #         "model": {
    #             "componentid": "bind_9053c0be74aa49348304fde7b273128c",
    #             "data": {}
    #         }
    #     }
    # }

    # the following can be consolidated to one line like so : 
    bind.req.populate(json.loads(request.form.get('BINDFRAMEWORK_DATA')));

    # here is an exploded version of the above line for clarity
    # # get the bind data from the client in the post variable BINDFRAMEWORK_DATA
    # bind_data = request.form.get('BINDFRAMEWORK_DATA')
    # # JSON decode the bind data from the client
    # decoded_data = json.loads(bind_data)
    # # populate the bind.req object with the decoded_data - testing purposes
    # bind.req.populate(decoded_data);

    # when the main body component loads, hide all navsection nodes
    if bind.req.type == 'ready' and bind.req.tagname == 'body':
        bind.res.addTask({
            'action': 'hide',
            'class': 'navsection'
        })

    # # when an item with the class of navItem is clicked, remove the active class from all navItems and add the active class to the clicked navItem
    # and bind.req.hasClass('navItem')
    if bind.req.type == 'click' :
        print(json.dumps(bind.req.componentid, indent=4))
        # remove active from all nodes with the class of navItem
        bind.res.addTask({
            'action': 'removeclass',
            'value': 'active',
            'class': 'navItem'
        })
        # add active to the clicked navItem node based on the navname attribute of the item clicked
        navname = bind.req.attr('navname')
        if navname is None:
            navname = "default_value"  # or raise AttributeError('navname attribute does not exist')

        bind.res.addTask({
            'action': 'addclass',
            'value': 'active',
            'class': 'navItem-' + navname
        })

        # dispatch an event to open the correct section based on the navname attribute of the item clicked
        # dispatch will go up to the closest parent with the bind-events listening for the event type of opensection (the body in this case)
        # notice we are passing the navname attribute of the item clicked as the data attribute of the event, we will read this when listening for this event
        bind.res.addTask({
            'action': 'dispatch',
            'type': 'opensection',
            'data': bind.req.attr('navname')
        })

    # # when the opensection event is dispatched, show the correct section based on the navname attribute of the item clicked
    # # in this example, the body component is listening for the opensection event (see the bind-events attribute in the body tag)
    if bind.req.type == 'opensection':
        # handle the display of the correct section
        # hide all sections
        bind.res.addTask({
            'action': 'hide',
            'class': 'navsection'
        })
        # show the clicked section based on the navname attribute of the item clicked
        # we are using the data attribute of the custom event to determine which section to show
        bind.res.addTask({
            'action': 'show',
            'class': 'section-' + bind.req.data
        })

    # return the response to the client - bind.res.returnResponse(bind) returns the json response
    return json.dumps(
            bind.res.returnResponse(bind)
        ), 200, {'Content-Type': 'application/json'}

if __name__ == '__main__':
    app.run(port=9000)