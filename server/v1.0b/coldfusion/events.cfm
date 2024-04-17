<cfimport taglib="./" prefix="bind">
    <!--- 
        See LICENSE.txt in root of project for licensing information (Open source FreeBSD License Copyright 2024 Nate Nielsen)

        NOTE: This library is intentionally written in CF tags rather than CFScript format.
        This is to maximize version compatibility.  A CFScript version may be on the roadmap
        in the future, but for now, maximizing the compatibility with older server versions 
        is ideal.
    --->
<cfif thisTag.executionMode eq 'end'>
    <cfif request.isBindCFRequest>
        
        <!--- do model binding --->
        <cfset req          = createObject('component', 'bindCFRequest').get()>
        <cfset res          = createObject('component', 'bindCFResponse').get()>
        <cfset res.model    = req.model>
        <cfset res.model['componentid'] = req.componentid>

        <!--- if debugging is on, show bindCF debug information at bottom of page --->
        <cfif attributes.debug>
            <bind:Output action="prepend" class="bindCFDebug" return="false" componentid="#req.bodycomponentid#">
                <div>Response:</div>
                <cfdump var="#res#" expand="false"/>
            </bind:Output>
        </cfif>  

        <!--- TODO: warn if no respnses generated? --->

        <!--- return response to client --->
        <cfset res.returnResponse()>
    </cfif>
<cfelse>

    <!--- how we determine this is a bindCF request --->
    <cfparam name="form.BINDFRAMEWORK_DATA" default="">
    <cfparam name="request.isBindCFRequest" default="true">

    <!--- where to store the request event into the calling tag's scope --->
    <cfparam name="attributes.requestVar" default="req"/>
    <!--- where to store the request response data into the calling tag's scope --->
    <cfparam name="attributes.responseVar" default="res"/>

    <!--- bul --->
    <cfparam name="attributes.debug" default="false"/>
    
    <!--- default data --->
    <cfif len(trim(form.BINDFRAMEWORK_DATA)) eq 0>
        <cfset form.BINDFRAMEWORK_DATA = '{"type":"handleEvent","data":{"id":"no_cf_bind_event_data_sent","type":"click","name":"","value":"","html":"","key":""}}'>
        <cfset request.isBindCFRequest = false>
    </cfif>
    <cfparam name="form.BINDFRAMEWORK_DATA" default='{"type":"handleEvent","data":{"id":"no_cf_bind_event_data_sent","type":"click","name":"","value":"","html":"","key":""}}'/>
    
    <cfscript>
        // create a response obj in caller scope
        caller[attributes.responseVar]  = createObject('component', 'bindCFResponse').get(); 

        // create event obj in caller scope
        caller[attributes.requestVar]   = createObject('component', 'bindCFRequest').get();
        // populate event obj with json data
        caller[attributes.requestVar].populate(deserializeJSON(form.BINDFRAMEWORK_DATA));
        // associate response with request with a pointer
        caller[attributes.requestVar].setResponse(caller[attributes.responseVar]);

        // set the req/res var names into the caller scope (used to reference in nested tags like bindCFOutput etc)
        caller.bindCFResponseVarName    = attributes.responseVar;
        caller.bindCFRequestVarName     = attributes.requestVar;
    </cfscript>

    <cfset res          = createObject('component', 'bindCFResponse').get()>
    <cfset res.debug    = attributes.debug>

    <cfif request.isBindCFRequest>
        <!--- if debugging is on, show bindCF debug information at bottom of page --->
        <cfif attributes.debug>
            <cfset req = createObject('component', 'bindCFRequest').get()>
            <bind:Output action="prepend" class="bindCFDebug" return="false" componentid="#req.bodycomponentid#">
                <div>Request:<cfoutput>#req.type#</cfoutput></div>
                <cfdump var="#req#" expand="false"/>
            </bind:Output> 
        </cfif> 
    </cfif>
</cfif>