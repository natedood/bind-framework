const Bind = require('../../../Bind.js');
const { app } = require('../../../server.js');

app.post('/HelloWorldEvents', (req, res) => {

    // initialize bind, res/req vars are set, but can be specified like so Bind('req', 'res')
    const bind = new Bind('bindreq', 'bindres');

    // populate bind with the request data from form post from client
    bind.req.populate(JSON.parse(req.body.BINDFRAMEWORK_DATA));

    // when the main body component loads, hide all navsection nodes
    if (bind.req.type === 'click' && bind.req.id === 'getServertimeButton') {
        bind.res.addTask({
            action: 'replace',
            value:  'Hello World!<p>Current server time: ' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            id:     'serverMessage'
        });
    }

    // return the response to the client - bind.res.returnResponse(bind) returns the json response
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(bind.res.returnResponse(bind)));

});
