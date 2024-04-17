<cfcomponent displayname="bindCF response">
    <!--- 
        See LICENSE.txt in root of project for licensing information (Open source FreeBSD License Copyright 2024 Nate Nielsen)

        NOTE: This library is intentionally written in CF tags rather than CFScript format.
        This is to maximize version compatibility.  A CFScript version may be on the roadmap
        in the future, but for now, maximizing the compatibility with older server versions 
        is ideal.
    --->
    <cfscript>
        this.tasks      = [];
        this.processed  = false;
        this.debug      = false;
        this.model      = {data:{}};
    </cfscript>
   
    <cffunction name="get">
        <cfparam name="request.bindcf" default="#{}#">
        <cfparam name="request.bindcf.res" default="">
        <cfif not isInstanceOf(request.bindcf.res, 'bindCFResponse')>
            <cfset request.bindcf.res = this>
        </cfif>
        <cfreturn request.bindcf.res>
    </cffunction>

    <!--- ref:
    task = {
        action      : action,
        selector    : selector to perform action on,
        value       : data to be passed to action
    }
    --->

    <cffunction name="setForm">
        <!--- form data to set --->
        <cfargument name="formData" required="true"/>
        <!--- if no form name is provided, sets form elements that weren't part of a form --->
        <cfargument name="formName" default="_noFormName"> 
        <cfset task = {
            action      : 'setform',
            componentid : '#attributes.componentid#',
            value       : attributes.formName,
            data        : attributes.formData
        }/>
        <cfset this.addTask(task)>
    </cffunction>

    <cffunction name="addTask">
        <cfargument name="task" required="true"/>
        <cfset arrayAppend(this.tasks, task)/>
    </cffunction>

    <cffunction name="getTasks">
        <cfreturn this.tasks/>
    </cffunction>

    <cffunction name="dispatch">
        <cfargument name="name" required="true">

    </cffunction>
    
    <cffunction name="returnResponse">
        <cfset responseObj = {BIND_RESPONSE:
            {
            tasks: this.getTasks(),
            debug : this.debug,
            model : this.model
            }
        }>
        <cfcontent reset="yes" variable="#charsetDecode( serializeJSON(responseObj),'utf-8')#"><cfabort/> 
    </cffunction>

</cfcomponent>