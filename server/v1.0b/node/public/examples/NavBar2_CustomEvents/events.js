const Bind = require('../../../Bind.js');
const { app } = require('../../../server.js');

app.post('/NavBar2Events', (req, res) => {

    // initialize bind, res/req vars are set, but can be specified like so Bind('req', 'res')
    const bind = new Bind('bindreq', 'bindres');

    // populate bind with the request data from form post from client
    bind.req.populate(JSON.parse(req.body.BINDFRAMEWORK_DATA));

    // when the main body component loads, hide all navsection nodes
    if (bind.req.type === 'ready' && bind.req.tagname === 'body') {
        bind.res.addTask({
            action: 'hide',
            class: 'navsection'
        });
    }

    // when an item with the class of navItem is clicked, remove the active class from all navItems and add the active class to the clicked navItem
    // and bind.req.hasClass('navItem')
    if (bind.req.type === 'click') {
        // remove active from all nodes with the class of navItem
        bind.res.addTask({
            action: 'removeclass',
            value: 'active',
            class: 'navItem'
        });
        // add active to the clicked navItem node based on the navname attribute of the item clicked
        let navname = bind.req.attr('navname');
        if (navname === null) {
            navname = "default_value"; // or throw new Error('navname attribute does not exist');
        }

        bind.res.addTask({
            action: 'addclass',
            value: 'active',
            class: 'navItem-' + navname
        });

        // dispatch an event to open the correct section based on the navname attribute of the item clicked
        // dispatch will go up to the closest parent with the bind-events listening for the event type of opensection (the body in this case)
        // notice we are passing the navname attribute of the item clicked as the data attribute of the event, we will read this when listening for this event
        bind.res.addTask({
            action: 'dispatch',
            type: 'opensection',
            data: bind.req.attr('navname')
        });
    }

    // when the opensection event is dispatched, show the correct section based on the navname attribute of the item clicked
    // in this example, the body component is listening for the opensection event (see the bind-events attribute in the body tag)
    if (bind.req.type === 'opensection') {
        // handle the display of the correct section
        // hide all sections
        bind.res.addTask({
            action: 'hide',
            class: 'navsection'
        });
        // show the clicked section based on the navname attribute of the item clicked
        // we are using the data attribute of the custom event to determine which section to show
        bind.res.addTask({
            action: 'show',
            class: 'section-' + bind.req.data
        });
    }

    // return the response to the client - bind.res.returnResponse(bind) returns the json response
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(bind.res.returnResponse(bind)));

});
