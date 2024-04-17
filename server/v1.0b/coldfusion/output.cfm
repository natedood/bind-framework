<!--- wrap me around content, including cf-bind enabled tags, to output/bind to the server --->
<cfif thisTag.executionMode eq 'end'>
    <!--- 
        See LICENSE.txt in root of project for licensing information (Open source FreeBSD License Copyright 2024 Nate Nielsen)

        NOTE: This library is intentionally written in CF tags rather than CFScript format.
        This is to maximize version compatibility.  A CFScript version may be on the roadmap
        in the future, but for now, maximizing the compatibility with older server versions 
        is ideal.
    --->
    
    <!--- the request object --->
    <cfset req = createObject('component', 'bindCFRequest').get()>

    <!--- every output call requires an action --->
    <cfparam name="attributes.action"       default="replace">
    
    <!--- if true, immediately returns request and doesn't process any further! --->
    <cfparam name="attributes.return"       default="false">
    
    <!--- special selector type if this should apply to the component of the calling node --->
    <cfparam name="attributes.self"         default="false">
    <!--- help dev by notifying them if they've supplied an invalid self attr value --->
    <cfif attributes.self neq 'true' and attributes.self neq 'false'>
        <cfthrow message="attributes.self of bind:output must be either 'true' or 'false' - supplied value of '#attributes.self#' is invalid."/>
    </cfif>

    <!--- selector attributes --->
    <cfparam name="attributes.id"           default=""/>
    <cfparam name="attributes.value"        default=""/>
    <cfparam name="attributes.oldValue"     default=""/>
    <cfparam name="attributes.selector"     default=""/>
    <cfparam name="attributes.key"          default=""/>
    <cfparam name="attributes.tag"          default=""/>
    <cfparam name="attributes.attr"         default=""/>
    <cfparam name="attributes.attrValue"    default=""/>
    <!--- used for actions: setAttr, removeAttr --->
    <cfparam name="attributes.attrName"     default=""/>
    <cfparam name="attributes.class"        default=""/>
    <!--- experimental selector items --->
    <cfparam name="attributes.even"         default=""/>
    <cfparam name="attributes.odd"          default=""/>
    <cfparam name="attributes.first"        default=""/>
    <cfparam name="attributes.last"         default=""/>

    <!--- used for dispatch/publish/broadcast event types --->
    <cfparam name="attributes.type"         default="output"/>
    <cfparam name="attributes.componentid"  default="#req.componentid#"/>

    <!--- explicitly direct model or form binding, ideally this is done by checking for mutations to both --->
    <!--- hashing should be done at response level? --->
    <cfparam name="attributes.model"        default="">
    <cfparam name="attributes.form"         default="">
    <cfparam name="attributes.data"         default="">

    <!--- order of precedence is important here! --->
    <cfset validSelectorTypes   = "selector,id,tag,class,key,attr,attrValue,even,odd,first,last"/>
    <cfset selectorCollection   = attributes>

    <!--- build selector to apply this action to on the client side --->
    <cfset thisSelector         = "">
    <cfloop list="#validSelectorTypes#" index="selectorIdx">
        <cfswitch expression="#selectorIdx#">
            <!--- selector, id, and key short circuit the process --->
            <cfcase value="selector">
                <cfif len(trim(selectorCollection[selectorIdx]))>
                    <cfset thisSelector = selectorCollection.selector><cfbreak/>
                </cfif>
            </cfcase>
            <!--- build composite selector --->
            <cfdefaultcase>
                <cfif len(trim(selectorCollection[selectorIdx]))>
                    <cfswitch expression="#selectorIdx#">
                    <cfcase value="tag" >
                        <cfif len(trim(selectorCollection[selectorIdx]))>
                            <cfset thisSelector = selectorCollection.tag>
                        </cfif>
                    </cfcase>
                    <cfcase value="class" >
                        <cfif len(trim(selectorCollection[selectorIdx]))>
                            <cfset thisSelector = thisSelector & '.' & selectorCollection.class>
                        </cfif>
                        <!--- <cfdump var="#thisSelector#"/> --->
                    </cfcase>
                    <cfcase value="key">
                        <cfif len(trim(selectorCollection[selectorIdx]))>
                            <cfset thisSelector = thisSelector & "[key='" & selectorCollection.key & "']"><cfbreak/>
                        </cfif>
                    </cfcase>
                    <cfcase value="id">
                        <cfif len(trim(selectorCollection[selectorIdx]))>
                            <cfset thisSelector = '##' & selectorCollection.id><cfbreak/>
                        </cfif>
                    </cfcase>
                    <cfcase value="attr" >
                        <cfset thisSelector = thisSelector & '[' & selectorCollection.attr >
                        <cfif len(trim(selectorCollection['attrValue']))>
                            <cfset thisSelector = thisSelector & "='" & selectorCollection.attrValue & "'">    
                        </cfif>
                        <cfset thisSelector = thisSelector & ']'>
                    </cfcase>
                    <cfcase value="even,odd,first,last" delimiters=",">
                            <cfset thisSelector = thisSelector & ':' & selectorCollection.selectorIdx>
                    </cfcase>
                    </cfswitch>
                </cfif>
            </cfdefaultcase>
        </cfswitch>
    </cfloop>
    
    <!--- default time attribute, experimental feature --->
    <cfparam name="attributes.time" default="250"/>
    <!--- generate a task obj for this output action --->
    <cfswitch expression="#attributes.action#">
        <!--- tasks that don't need a value --->
        <cfcase value="remove,hide,show,toggle" delimiters=",">
            <!--- create task obj --->
            <cfset task = {
                action      : attributes.action,
                selector    : thisSelector,
                value       : '',
                time        : attributes.time,
                componentid : '#attributes.componentid#',
                type        : attributes.type,
                data        : attributes.data,
                self        : attributes.self
            }/>
        </cfcase>
        <!--- tasks that don't need a value and have time option --->
        <cfcase value="fadeOut,fadeIn,fadeRemove" delimiters=",">
            <!--- create task obj --->
            <cfset task = {
                action      : attributes.action,
                selector    : thisSelector,
                value       : '',
                time        : attributes.time,
                componentid : '#attributes.componentid#',
                type        : attributes.type,
                data        : attributes.data,
                self        : attributes.self
            }/>
        </cfcase>
        <!--- tasks that have a value and possiblly have time option --->
        <cfcase value="addClass,removeClass,replaceClass,addBindEvent,removeBindEvent,replaceBindEvent" delimiters=",">
            <!--- create task obj --->
            <cfset task = {
                action      : attributes.action,
                selector    : thisSelector,
                value       : attributes.value,
                oldValue    : attributes.oldValue,
                time        : attributes.time,
                componentid : '#attributes.componentid#',
                type        : attributes.type,
                data        : attributes.data,
                self        : attributes.self
            }/>
        </cfcase>
        <!--- tasks that have a attr name and value and possiblly have time option --->
        <cfcase value="setAttr,removeAttr" delimiters=",">
            <!--- create task obj --->
            <cfset task = {
                action      : attributes.action,
                selector    : thisSelector,
                value       : attributes.value,
                attrName    : attributes.attrName,
                time        : attributes.time,
                componentid : '#attributes.componentid#',
                type        : attributes.type,
                data        : attributes.data,
                self        : attributes.self
            }/>
        </cfcase>
        <cfcase value="publish">
            <cfset task = {
                action      : attributes.action,
                selector    : thisSelector,
                value       : '',
                componentid : '#attributes.componentid#',
                type        : attributes.type,
                data        : attributes.data,
                self        : attributes.self
            }/>
        </cfcase>
        <!--- by default, just pass through the action and the generated content --->
        <!--- used for actions:
                 setValue, setHtml, appendHtml, add, fadeAppend, fadeReplace, prepend, fadePrepend etc --->
        <cfdefaultcase>
            <!--- create task obj --->
            <cfset thisValue = attributes.value>
            <!--- if no value attr provided, use the tag's generated content --->
            <cfif len(trim(thisValue)) eq 0>
                <cfset thisValue = thisTag.generatedContent>
            </cfif>
            <cfset task = {
                action      : attributes.action,
                selector    : thisSelector,
                value       : thisValue,
                time        : attributes.time,
                componentid : '#attributes.componentid#',
                type        : attributes.type,
                data        : attributes.data,
                self        : attributes.self
            }/>
        </cfdefaultcase>
    </cfswitch>
    

    <!--- add the task to the response obj --->
    <cfset res.addTask( task )/>

    <!--- clear the content now that we've stored it into the task --->
    <cfset thisTag.generatedContent = ''/>

    <!--- optionally return immediately --->
    <cfif attributes.return eq 'true'>
        <cfset res.returnResponse()>
    </cfif>

<cfelse>

    <!--- get response obj --->
    <cfset res = createObject('component', 'bindCFResponse').get()>
    
</cfif>