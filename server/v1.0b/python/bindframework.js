       
    function parseSendObjs( node ){
        var toSend = {forms:[]};
        // process forms
        var forms = [];
        // process other elements
    }

    function getBindCFComponent( bindCFComponentId ) {
        return $('[bind-componentid="' + bindCFComponentId +  '"]');
    }

    // recursive function for applying response tasks to only the encapsuling component
    // returns number of children updated
    function applyBindableResponseToNodeChildren( task, parentNode ){
        var updatedChildren = 0;
        
        if( task.SELF == 'true'){
            var nodesToApplyTo = $(parentNode).children(task.SELECTOR);
        }else{
                
            var nonComponentChildren  = $(parentNode).children(':not([bind-componentid])') ;

            // recursive call for children, we update from inside out, so drill down before executing tasks
            for ( childNode of nonComponentChildren ){
                updatedChildren =+ applyBindableResponseToNodeChildren( task, childNode );
            }
            
            // get matching child elements
            // runs on all children, including components, but not children of components 
            var nodesToApplyTo            = $(parentNode).children(task.SELECTOR);
        }
        var thisNode = '';

        for( thisNode of nodesToApplyTo ){

            var nodeToApplyTo = $(thisNode);

            if( nodeToApplyTo.is(task.SELECTOR) || task.SELF == 'true'){
                // obviously move to switch or similar strategy, this is just prototyping
                switch (task.ACTION.toLowerCase()) {
                    case 'call':
                        // call function
                        window[task.NAME]( $bind.getVarOrJSON(task.DATA) );
                        rebindNodeEvents( nodeToApplyTo );
                        break;
                    case 'replace':
                        nodeToApplyTo.html(task.VALUE);
                        // update bindings of new html added to dom, if any
                        rebindNodeEvents( nodeToApplyTo );
                        break;
                    case 'append':
                        nodeToApplyTo.append(task.VALUE);
                        // update bindings of new html added to dom, if any
                        rebindNodeEvents( $(nodeToApplyTo) );
                        break;
                    case 'prepend':
                        nodeToApplyTo.prepend(task.VALUE);
                        // update bindings of new html added to dom, if any
                        rebindNodeEvents( $(nodeToApplyTo) );
                        break;
                    case 'remove':
                        // need cleanup task for removing components to clean the model!
                        nodeToApplyTo.remove();
                        break;
                    case 'hide':
                        nodeToApplyTo.hide();
                        break;
                    case 'show':
                        nodesToApplyTo.show();
                        break;
                    case 'toggle':
                        nodeToApplyTo.toggle();
                        break;
                    case 'fadeout':
                        nodeToApplyTo.fadeOut(task.VALUE);
                        break;
                    case 'fadein':
                        nodeToApplyTo.fadeIn(task.VALUE);
                        break;
                    case 'setvalue':
                        nodeToApplyTo.val(task.VALUE);
                        break;
                    case 'addclass':
                        nodeToApplyTo.addClass(task.VALUE);
                        break;
                    case 'removeclass':
                        nodeToApplyTo.removeClass(task.VALUE);
                        break;
                    case 'replaceclass':
                        nodeToApplyTo.removeClass(task.OLDVALUE);
                        nodeToApplyTo.addClass(task.VALUE);
                        break;
                    case 'setattr':
                        // nodeToApplyTo.attr(task.ATTRNAME, task.VALUE);
                        nodeToApplyTo.prop(task.ATTRNAME, task.VALUE);
                        break;
                    case 'removeattr':
                        nodeToApplyTo.removeAttr(task.ATTRNAME);
                        break;
                    case 'addbindevent':
                        var existing = nodeToApplyTo.attr('bind-events');
                        nodeToApplyTo.attr('bind-events', existing + ' ' + task.VALUE);
                        break;
                    case 'removebindevent':
                        var existing = nodeToApplyTo.attr('bind-events');
                        nodeToApplyTo.attr('bind-events', existing.replace(new RegExp('(?:^|\\s)'+ task.VALUE + '(?:\\s|$)'), ' ') );
                        break;
                    case 'replacebindevent':
                        var existing = nodeToApplyTo.attr('bind-events');
                        nodeToApplyTo.attr('bind-events', existing.replace(new RegExp('(?:^|\\s)'+ task.OLDVALUE + '(?:\\s|$)'), ' ') );
                        existing = nodeToApplyTo.attr('bind-events');
                        nodeToApplyTo.attr('bind-events', existing + ' ' + task.VALUE);
                        break;
                    case 'faderemove':
                        // need cleanup task for removing components to clean the model?!
                        nodeToApplyTo.fadeOut(parseInt(task.TIME),function() { $(this).remove(); });
                        break;
                    case 'fadeappend':
                        nodeToApplyTo.append($(task.VALUE)
                            .hide()
                            .fadeIn(task.TIME)
                        );
                        rebindNodeEvents( nodeToApplyTo );
                        break;
                    case 'fadeprepend':
                        nodeToApplyTo.prepend($(task.VALUE)
                            .hide()
                            .fadeIn(task.TIME)
                        );
                        rebindNodeEvents( nodeToApplyTo );
                        break;
                    case 'fadereplace':
                        // need cleanup task for removing components to clean the model!
                        nodeToApplyTo.html($(task.VALUE)
                            .hide()
                            .fadeIn(task.TIME)
                        );
                        rebindNodeEvents( nodeToApplyTo );
                        break;
                    case 'add':
                        nodeToApplyTo.add( $(task.VALUE.trim()) ) ;
                        // update bindings of new html added to dom, if any
                        rebindNodeEvents( nodeToApplyTo );
                        break;
                    default:
                        // handle unknown action
                        break;
                }
            }
        }

        return updatedChildren;

    }

    // TODO
    function bindCFLog( append, detail ){
        //short circuit if directed not to append (such as debug is turned off)
        if(!append){
        }
    }

    function handleBindableResponse( responseObj ){ 
        console.log(responseObj);
        // bind component model
        $bind.setModelByComponentId( responseObj.BIND_RESPONSE.MODEL.componentid , responseObj.BIND_RESPONSE.MODEL );
        
        responseObj.updatedChildren = 0;
        // process DOM related update tasks first        
        for( task of responseObj.BIND_RESPONSE.TASKS ){
            if( task.ACTION.toLowerCase() != 'dipatch' && task.ACTION.toLowerCase() != 'publish'){
                //taskAttempts++;
                responseObj.updatedChildren  += applyBindableResponseToNodeChildren( task, getBindCFComponent(task.COMPONENTID) );
                //responseUpdates += updated;
            }
        }

        udpatedChildren = 0;
        // process dispatches (up component tree with bind-listen)
        for( task of responseObj.BIND_RESPONSE.TASKS ){
            if( task.ACTION.toLowerCase() == 'dispatch' || task.ACTION.toLowerCase() == 'publish' || task.ACTION.toLowerCase() == 'broadcast'){
                // start barking up the component tree
                var dispatcher = $('[bind-componentid="' + task.COMPONENTID + '"]');
                // move to switch
                if( task.ACTION.toLowerCase() == 'dispatch' ){
                    var listeners = dispatcher.closest('[bind-events~="' + task.TYPE + '"]');
                }
                if( task.ACTION.toLowerCase() == 'publish' ){
                    var listeners = dispatcher.find('[bind-events~="' + task.TYPE + '"]');
                }
                if( task.ACTION.toLowerCase() == 'broadcast' ){
                    var listeners = $('[bind-events~="' + task.TYPE + '"]');
                }
                if( !listeners || listeners.length == 0 ){
                    console.log('could not find a listener/subscriber component for ' + task.ACTION.toLowerCase() +':'+ task.TYPE + '.  check that you have a bind-component with this type.  NOTE: possible values for the attributes bind-listens should be SPACE DELIMITED');
                }else{
                    for( listener of listeners ){
                        listener = $(listener);
                        var payload = {
                            type:task.ACTION.toLowerCase(),
                            data: {
                                id: listener.attr('id'),
                                action: task.ACTION.toLowerCase(),
                                type: task.TYPE,
                                value: task.VALUE,
                                formdata:$bind.getComponentForm( listener ),
                                key : listener.attr('key'),
                                attrs: getAttributesCollection( listener ),
                                tagname: listener[0].tagName.toLowerCase(),
                                componentid: $bind.getComponentId(listener),
                                formdata:$bind.getComponentForm( listener ),
                                data : task.DATA,
                                bodyComponentId : $bind.getBodyComponentId(),
                                model : $bind.getModelByNode( listener ),
                                // should this be optional?  should it be restricted to force explicit passing of this data?
                                dispatcherdata:{
                                    type: task.TYPE,
                                    data: {
                                        id: listener.attr('id'),
                                        action: task.ACTION.toLowerCase(),
                                        value: task.VALUE,
                                        formdata:$bind.getComponentForm( dispatcher ),
                                        key : dispatcher.attr('key'),
                                        attrs: getAttributesCollection( dispatcher ),
                                        tagname: dispatcher[0].tagName.toLowerCase(),
                                        componentid: $bind.getComponentId(dispatcher),
                                        formdata:$bind.getComponentForm( dispatcher ),
                                        data : task.DATA,
                                        bodyComponentId : $bind.getBodyComponentId(),
                                        model : $bind.getModelByNode( dispatcher ),
                                    }
                                }
                            }
                        };
                        console.log('payload');
                        console.log( payload );
                        var bindCFUrl = $(listener).children().first().parents('[bind-handler]').first().attr('bind-handler');
                        $.ajax({
                            url: bindCFUrl,       
                            crossDomain: true,
                            type: 'POST',
                            data: 'BINDFRAMEWORK_DATA=' + JSON.stringify(payload),
                            success: function(result){
                                // got response from server
                                if( typeof result == 'object' ){
                                    handleBindableResponse(result);
                                }else{
                                    handleBindableResponse(JSON.parse(result));
                                }
                            }
                        });
                    }
                }
            }

        }
    }

    function getAttributesCollection( node ){
        var attrArray = [];
        $(node).each( function() {
            $.each(this.attributes, function() {
                // this.attributes is not a plain object, but an array
                // of attribute nodes, which contain both the name and value
                if(this.specified) {
                    attrArray.push( {name: this.name, value: this.value} );
                }
            });
        });
        return attrArray;
    }

    function handleBindableCFEvent( eventObj ){
        
        // added special bind enter key handling
        var tagname = '';
        if (eventObj.type != 'enter') {
            tagname = eventObj.currentTarget.tagName.toLowerCase();
        }
        var eventType = eventObj.type;
        var refTarget = eventObj.currentTarget;
        if (eventObj.type === 'enter') {
            eventObj    = event;    // deprecated but necessary to support enter key handling
            eventType   = 'enter';
            refTarget   = this;
        }

        console.log('bindable event triggered:');
        console.log(eventObj);

        payload = {
            type:'handleEvent',
            data: {
                id: $(refTarget).attr('id'),
                type: eventType,
                formdata:$bind.getComponentForm( refTarget ),
                key : $(refTarget).attr('key'),
                attrs: getAttributesCollection($(refTarget)),
                tagname: tagname,
                componentid: $(refTarget).parents('[bind-componentid]').first().attr('bind-componentid'),
                bodyComponentId : $bind.getBodyComponentId(),
                model : $bind.getModelByNode( refTarget )
            }
        };

        // for debugging server payloads
        console.log('payload');
        console.log( payload );

        var bindCFUrl = $(eventObj.currentTarget).parents('[bind-handler]').first().attr('bind-handler');
        $.ajax({
            url: bindCFUrl, 
            crossDomain: true,
            type: 'POST',
            data: 'BINDFRAMEWORK_DATA=' + JSON.stringify(payload),
            success: function(result){
                // got response from server
                if( typeof result == 'object' ){
                    handleBindableResponse(result);
                }else{
                    handleBindableResponse(JSON.parse(result));
                }
            }
        });
    };

    // IMPORTANT!  model data VARIABLE NAMES will come in UPPERCASE - due to the case insensitivity of CF!
    var $bind = {
        models:[],
        getComponentById( name ){
            return $('[bind-componentid="' + name + '"]');
        },
        getMyParentComponent( node ){
            return $(this.getMyComponent(node)).parents('[bind-componentid]').first();
        },
        getMyComponent( node ){
            if( $(node).attr('bind-componentid') ){
                return $(node);
            }
            return $(node).parents('[bind-componentid]').first();
        },
        getVarOrJSON: function(str ) {
            try {
                return JSON.parse(str);;
              } catch (e) {
                return str;
              }
        },
        getComponentId: function( node ){
            return this.getMyComponent(node).attr('bind-componentid');
            //return $(node).parents('[bind-componentid]').first().attr('bind-componentid');
        },
        getModelByNode: function ( node ) {
            return this.getModelByComponentId( this.getComponentId(node)  );
        },
        getModelByComponentId: function ( name ) {
            if( !this.models[name] ){
                this.models[name] = {
                    componentid:name,
                    data:{}
                    // for model methods
                };
            }
            return this.models[name];
        },
        setModelByComponentId: function ( name, model ){
            if( !this.models[name] ){
                this.models[name] = {
                    componentid:name,
                    data:{}
                    // for model methods
                };
            }
            this.models[name] = model;
            return this.models[name];
        },
        getBodyComponentId: function () {
            if( !this.bodyComponentId ){
                this.bodyComponentId = $('body').attr('bind-componentid');
            }
            return this.bodyComponentId;
        },
        // sets a for obj in the forms collection that gets sent to the server
        setFormDataObjElement : function ( formDataObj , formName, elementName, elementValue ){
            // move to .find(o => o.name === formName) later
            for( var i = 0; i < formDataObj.forms.length; i++ ){
                if( formDataObj.forms[i].name == formName ){
                    // handle the stupid html form rules where elements with the same name are concat with commas
                    if( formDataObj.forms[i].fields[elementName] && formDataObj.forms[i].fields[elementName].length > 0 ){
                        formDataObj.forms[i].fields[elementName] = formDataObj.forms[i].fields[elementName].split(',').concat([ elementValue ]).join(',');
                    }else{
                        formDataObj.forms[i].fields[elementName] = elementValue;
                    }
                    return formDataObj;
                }
            }
            // didn't find form
            formDataObj.forms[formDataObj.forms.length] = {name:formName, fields:{}};
            //formDataObj.forms[formDataObj.forms.length-1].fields.empty = '';
            formDataObj.forms[formDataObj.forms.length-1].fields[elementName] = elementValue;
            return formDataObj;
        },
        // gets all the form data for sending with a server req
        getComponentForm: function ( nodeOfComponent ){
            // $('input').first().closest('[bind-component="true"]') ?
            var myComponent = this.getMyComponent( nodeOfComponent );
            var formData = {forms:[
                {   name:'_noFormName',
                    fields: {}
                }
            ]}; 
            return this.getFormDataForChildren(myComponent, formData);
        },
        // recursively called function to get one nested level of form objects loaded into the form collection that is sent to the server
        getFormDataForChildren: function ( parentNode , formData  ) {
            var formName    = '';
            // get inputs
            var inputs      = $(parentNode).children('input');
            // input fields
            for( input of inputs ){
                var input = $(input);
                // get valid form name
                if( input.closest('form[name]').length == 0){
                    formName = '_noFormName';
                }else{
                    formName = input.closest('form[name]').attr('name');
                }
                // set the form field value into data obj
                if( ( input.attr('type') != 'checkbox' && input.attr('type') != 'radio' ) || (input.attr('type') == 'checkbox' && input[0].checked) ) {
                    formData = this.setFormDataObjElement(formData, formName, input.attr('name'), input.val() );
                }
                // radio buttons
                if( input.attr('type') == 'radio' && input[0].checked ){
                    formData = this.setFormDataObjElement(formData, formName, input.attr('name'), input.val() );
                }
            }
            // select fields
            inputs = $(parentNode).children('select');
            for( input of inputs ){
                var input   = $(input);
                var val     = '';
                // get valid form name
                if( input.closest('form[name]').length == 0){
                    formName = '_noFormName';
                }else{
                    formName = input.closest('form[name]').attr('name');
                }
                // get selected value(s)
                if( input.attr('multiple') ){
                    val = input.val().join(',');
                }else{
                    val = input.val();
                }
                // set the form field value into data obj
                formData = this.setFormDataObjElement(formData, formName, input.attr('name'), val );
            }
            // textareas 
            inputs      = $(parentNode).children('textarea');
            // input fields
            for( input of inputs ){
                var input = $(input);
                // get valid form name
                if( input.closest('form[name]').length == 0){
                    formName = '_noFormName';
                }else{
                    formName = input.closest('form[name]').attr('name');
                }
                // set the form field value into data obj
                formData = this.setFormDataObjElement(formData, formName, input.attr('name'), input.val() );
            }
            // process children that are not a component
            var children = $(parentNode).children(':not([bind-component])');
            for( child of children ){
                formData = this.getFormDataForChildren( child, formData );
            }
            return formData;
        }

    };



    function processComponentLoadingForNode( parentNode ){
        // find nodes to load
        var nodesToLoad = $('[bind-load]')
        for( nodeToLoad of nodesToLoad ) {
            nodeToLoad = $(nodeToLoad);
            if( nodeToLoad.attr('bind-loaded') != '1' && nodeToLoad.attr('bind-loading') != '1' ){
                nodeToLoad.attr('bind-loading', 1);
                console.log(nodeToLoad.attr('bind-componentid') + ' loading: ' + nodeToLoad.attr('bind-load'));
                $.ajax({
                    url: nodeToLoad.attr('bind-load'), 
                    crossDomain: true,
                    type: 'GET',
                    data: 'BINDFRAMEWORK_DATA=',
                    componentid : nodeToLoad.attr('bind-componentid'),
                    success: function(result){
                        var loadedComponent = $('[bind-componentid="' + this.componentid + '"]');
                        loadedComponent.html( result );
                        loadedComponent.attr('bind-loading', '0');
                        loadedComponent.attr('bind-loaded', '1');
                        console.log(this.componentid + ' loaded: ' + this.url); 
                        
                        rebindNodeEvents( loadedComponent );

                        // dispatch a ready event for the component
                        dispatchComponentReady(loadedComponent);
                    }
                });
            }
        }
        // remove loaded attribute / set bind-load to false
        // load component

        // rebind events for the loaded component!

    }

    function dispatchComponentReady( componentNode ){
        // console.log('dispatch ready event:')
        // console.log(componentNode);
                
        var bindCFUrl = $('body').attr('bind-handler');
        var thisComponentId = $(componentNode).attr('bind-componentid');
        // handle root body node handler url
        if( componentNode[0].tagName.toLowerCase() == 'body' ){
            if( !bindCFUrl || bindCFUrl.trim().length == 0){
                bindCFUrl = '#';
                $('body').attr('bind-handler', bindCFUrl);
            }
            //$(componentNode).parents('[bind-componentid]').first().attr('bind-componentid')
        }else{
            // get this componenets handler
            bindCFUrl = componentNode.attr('bind-handler');
            // if we don't have once, then find next handler url up the chain
            if(!bindCFUrl){
                bindCFUrl = $(componentNode).parents('[bind-handler]').first().attr('bind-handler');
            }
        }

        var payload2 = {
            type: 'ready',
            data : {
                id:                 $(componentNode).attr('id'),
                key :               $(componentNode).attr('key'),
                type:               'ready',
                attrs:              getAttributesCollection($(componentNode)),
                tagname:            $(componentNode)[0].tagName.toLowerCase(),
                componentid:        thisComponentId,
                bodyComponentId :   $bind.getBodyComponentId(),
                model :             $bind.getModelByNode( componentNode )
            }
        }
        console.log('payload');
        console.log( payload2 );
        $.ajax({
            url:    bindCFUrl, 
            crossDomain: true,
            type:   'POST',
            data:   'BINDFRAMEWORK_DATA=' + JSON.stringify(payload2),
            success: function(result){
                if( typeof result == 'object' ){
                    handleBindableResponse(result);
                }else{
                    handleBindableResponse(JSON.parse(result));
                }
            }
        }); 
    }

    // called when dom changes occur to re-bind events and bind-cf properties/actions
    function rebindNodeEvents( parentNode ){

        // auto assign component = true where it has a load param...
        $(parentNode).find('[bind-load]').map( (i,bindableObj)=>{
            $(bindableObj).attr( 'bind-component', true );
        } );
        $(parentNode).find('[bind-handler]').map( (i,bindableObj)=>{
            $(bindableObj).attr( 'bind-component', true );
        } );

        // first, all components must have their own namespace before anything else, including pre-loaded ones!
        // nodes defined as a component but without a componentid
        $(parentNode).find('[bind-component="true"]').map( (i,bindableObj)=>{
            let compid = $(bindableObj).attr( 'bind-componentid');
            if( !compid || compid.length == 0 ){
                $(bindableObj).attr( 'bind-componentid', createBindCFUUIDName() );
            }
        } );
        // nodes with null componentid should be auto-assigned
        $(parentNode).find('[bind-componentid=""]').map( (i,bindableObj)=>{
            $(bindableObj).attr( 'bind-componentid', createBindCFUUIDName() );
        } );

        // process component loading
        processComponentLoadingForNode( parentNode );

        // find bind-cf events in the component and attached event handlers
        // existing handlers re-unbind and re-bind so only one event handler exists per bind-event/eventType combo
        $(parentNode).find('[bind-events]').map( (i,bindableObj)=>{
            eventTypes = $(bindableObj).attr('bind-events');
            //console.log('attaching events:', eventTypes)
            eventTypes.split(' ').map( 
                (eventType)=> {
                        eventType=eventType.trim();
                        if (eventType === "enter") {
                            // special handling for enter key handling since it's not a real native js event
                            $(bindableObj).unbind('keydown.bindCF').bind('keydown.bindCF', function(event) {
                                if (event.keyCode == 13) {
                                    event.preventDefault();
                                    handleBindableCFEvent.call(this, new CustomEvent('enter', event));
                                }
                            });
                        } else {    
                            $(bindableObj).unbind(eventType + '.bindCF').bind(eventType + '.bindCF', handleBindableCFEvent);
                        }
                    // }
                } 
            );
        } );
        // handle watchers      
    }

    function uuidv4NoDashes(){
        return "10000000100040008000100000000000".replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
    function createBindCFUUIDName() {
        return 'bind_' + uuidv4NoDashes();
    }
    
    $('document').ready(function(){
        // initial load

        // if body isn't defined as a component, do so and give it a componentid
        if( !$('body').attr('bind-component') ){
            $('body').attr('bind-component', 'true' )
        }
        if( !$('body').attr('bind-componentid') ){
                $('body').attr('bind-componentid', createBindCFUUIDName() )
        }

        // initial event bindings
        rebindNodeEvents( $('body') );
                
        // fire ready event
        dispatchComponentReady( $('body') );
        
    });

    