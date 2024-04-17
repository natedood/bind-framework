<cfcomponent displayname="bindCF event">
    <!--- 
        See LICENSE.txt in root of project for licensing information (Open source FreeBSD License Copyright 2024 Nate Nielsen)

        NOTE: This library is intentionally written in CF tags rather than CFScript format.
        This is to maximize version compatibility.  A CFScript version may be on the roadmap
        in the future, but for now, maximizing the compatibility with older server versions 
        is ideal.
    --->

    <cfscript>
        this.id         = '';
        this.action     = 'event';
        this.type       = '';
        this.value      = '';
        this.name       = '';
        this.key        = '';
        this.componentid= '';
        this.bodycomponentid= '';
        this.response   = '';
        this.processed  = '';
        this.formdata   = {};
        this.attrs      = [];
        this.tagname    = '';
        this.model      = {};
        this.data       = {};
        this.dispatcher = {};
        this.dispatcherdata = {};
    </cfscript>

    <!--- gets a singleton of the request obj, this should be used rather than creating the object directly --->
    <cffunction name="get">
        <cfparam name="request.bindcf" default="#{}#">
        <cfparam name="request.bindcf.req" default="">
        <cfif not isInstanceOf(request.bindcf.req, 'bindCFRequest')>
            <cfset request.bindcf.req = this>
        </cfif>
        <cfreturn request.bindcf.req>
    </cffunction>

    <!--- gets a request obj containing the information related to the object that dispatched the event --->
    <cffunction name="getDispatcher">
        <cfparam name="request.bindcf" default="#{}#">
        <cfparam name="request.bindcf.dispatcher" default="">
        <cfif not isInstanceOf(request.bindcf.dispatcher, 'bindCFRequest')>
            <cfset request.bindcf.dispatcher = createObject('component', 'bindCFRequest')>
        </cfif>
        <cfreturn request.bindcf.dispatcher>
    </cffunction>

    <!--- gets a form struct from the request based on name --->
    <cffunction name="getForm">
        <!--- if no form name is provided, returns form elements that weren't part of a form --->
        <cfargument name="formName" default="_noFormName"> 
        <cfif len(trim(arguments.formName)) eq 0>
            <cfset arguments.formName = "_noFormName"/>
        </cfif>
        <!--- find the form --->
        <cfparam name="this.formdata.forms" default="[]">
        <cfloop from="1" to="#arrayLen(this.formdata.forms)#" index="f">
            <cfif this.formdata.forms[f].name eq arguments.formName>
                <!--- return the fields struct for the form --->
                <cfreturn this.formdata.forms[f].fields>
            </cfif>
        </cfloop>
        <cfthrow message="request:getForm - couldn't find a form named #arguments.formname#"/>
    </cffunction>

    <!--- currently not implemented, potential feature? --->
    <cffunction name="setForm">
        <!--- if no form name is provided, returns form elements that weren't part of a form --->
        <cfargument name="formName" default="_noFormName"> 
        <cfthrow message="request:setForm - setForm() should be called on the response, not the request object!"/>
    </cffunction>

    <!--- populates the obj with data passed from the client request  --->
    <cffunction name="populate">
        <cfargument name="eventObj" type="struct" required="true"/>
        <!--- add the baseline event values passed in --->
        <cfloop list="id,type,value,name,key,attrs,componentid,bodycomponentid,model,action,tagname,formdata,data,dispatcherdata" index="f">
            <!--- in case we get undefined values, they may not be included in package, so we want to default them to '' before attemping to set here --->
            <!--- this can happen when an observer receives a mutation target that doesn't have the ref, such as a value attribute on an span tag --->
            <cfparam name="eventObj.data[f]" default="">
            <cfset this[f] = eventObj.data[f]>
        </cfloop>
        <!--- if there is dispatcher information provided (from an event being dispatched/publish/broadcast), create a req obj for it and populate --->
        <cfparam name="eventObj.data.dispatcherdata" default="">
        <cfif isStruct(eventObj.data.dispatcherdata)>
            <cfset this.dispatcher = getDispatcher()>
            <cfdump var="#this.dispatcher#">
            <cfset this.dispatcher.populate( this.dispatcherdata )>
        </cfif>

        <!--- attributes must be an array, even if empty --->
        <cfif not isArray(this.attrs)>
            <cfset this.attrs = []>
        </cfif>
        <cfset this.processed = true>
    </cffunction>

    <!--- sets a pointer the response object --->
    <cffunction name="setResponse">
        <cfargument name="responseObj" type="bindCFResponse"/>
        <cfset this.response = arguments.responseObj/>
    </cffunction>

    <!--- helper function to see if the requested node has a particular class name --->
    <cffunction name="hasClass">
        <cfargument name="className" required="true">
        <cfif listFindNoCase( attr('class'), trim(arguments.className) , ' ') gt 0 >
            <cfreturn true>
        </cfif>
        <cfreturn false>
    </cffunction>

    <!--- helper fucntion to see if the requested node has a particular attribute --->
    <cffunction name="hasAttr">
        <cfargument name="attributeName" required="true"/>
        <cfloop array="#this.attrs#" index="attrObj">
            <cfif lCase(attrObj.name) eq lCase(arguments.attributeName)>
                <cfreturn true>
            </cfif>
        </cfloop>
        <cfreturn false>
    </cffunction>

    <!--- gets the attribute value specified --->
    <cffunction name="attr">
        <cfargument name="attributeName" required="true"/>
        <!--- <cfdump var="#{attrs:this.attrs}#" abort="true"/> --->
        <!--- <cfdump var="#this#" abort="true"> --->
        <cfloop array="#this.attrs#" index="attrObj">
            <cfif attrObj.name eq arguments.attributeName>
                <cfreturn attrObj.value>
            </cfif>
        </cfloop>
    </cffunction>
    
</cfcomponent>