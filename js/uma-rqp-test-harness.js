/*
 Copyright (c) 2018-2021, ForgeRock, Inc., All rights reserved
 Use subject to license terms.
 Scott Fehrman, scott.fehrman@forgerock.com
 */

/*
 Disclaimer:
 
 The sample code described herein is provided on an "as is" basis, without
 warranty of any kind, to the fullest extent permitted by law. ForgeRock does not
 warrant or guarantee the individual success developers may have in implementing
 the sample code on their development platforms or in production configurations.
 
 ForgeRock does not warrant, guarantee or make any representations regarding the
 use, results of use, accuracy, timeliness or completeness of any data or
 information relating to the sample code. ForgeRock disclaims all warranties,
 expressed or implied, and in particular, disclaims all warranties of
 merchantability, and warranties related to the code, or any service or software
 related thereto.
 
 ForgeRock shall not be liable for any direct, indirect or consequential damages
 or costs of any type arising out of any action taken by you or others related to
 the sample code.
 */

// Global variables

var _frdp_uma_as_oauth2_url = "";
var _frdp_uma_rs_url = "";
var _frdp_uma_rs_discover = "";
var _frdp_uma_rs_shared = "";
var _frdp_uma_rs_filter_discover = "";
var _frdp_uma_rs_filter_shared = "";
var _frdp_uma_rpt = "";
var _frdp_uma_perm_ticket = "";
var _frdp_param_resourceid = null;
var _frdp_param_scopes = null;
var _frdp_authenticated = false;

$(document).ready(function () {

    // Header and menus

    var aMenuResource = $('#frdp-menu-a-resource');
    var aMenuDiscover = $('#frdp-menu-a-discover');
    var aMenuShared = $('#frdp-menu-a-shared');
    var divMenuResource = $('#frdp-menu-div-resource');
    var divMenuDiscover = $('#frdp-menu-div-discover');
    var divMenuShared = $('#frdp-menu-div-shared');
    var spanMenuUserId = $('#frdp-menu-span-userid');
    var spanMenuFirstName = $('#frdp-menu-span-firstname');
    var spanMenuLastName = $('#frdp-menu-span-lastname');

    // Resource and Id ... get RPT and the resource

    var aResourceClearRPT = $('#frdp-resource-a-clear-rpt');
    var aResourceTabResponse = $('#frdp-resource-a-tab-response');
    var aResourceTabPermTicket = $('#frdp-resource-a-tab-permticket');
    var aResourceTabClaimToken = $('#frdp-resource-a-tab-claimtoken');
    var aResourceTabRPT = $('#frdp-resource-a-tab-rpt');
    var btnResourceGetRPT = $('#frdp-resource-btn-get-rpt');
    var btnResourceGetResource = $('#frdp-resource-btn-get-resource');
    var btnResourceGetClaim = $('#frdp-resource-btn-get-claim');
    var btnResourceReset = $('#frdp-resource-btn-reset');
    var divResourceBannerInfo = $('#frdp-resource-div-banner-info');
    var divResourceBannerSuccess = $('#frdp-resource-div-banner-success');
    var divResourceBannerFailed = $('#frdp-resource-div-banner-failed');
    var divResourceBannerError = $('#frdp-resource-div-banner-error');
    var spanResourceURI = $('#frdp-resource-span-uri');
    var spanResourceASURI = $('#frdp-resource-span-as-uri');
    var spanResourceAuthCode = $('#frdp-resource-span-auth-code');
    var spanResourceStatus = $('#frdp-resource-span-status');
    var spanResourcePermTicketStatus = $('#frdp-resource-span-permTicket-status');
    var spanResourceClaimTokenStatus = $('#frdp-resource-span-claimToken-status');
    var spanResourceRPTStatus = $('#frdp-resource-span-rpt-status');
    var textResourceId = $('#frdp-resource-text-id');
    var textResourceScopes = $('#frdp-resource-text-scopes');
    var textResourceRPT = $('#frdp-resource-text-rpt');
    var textareaResourcePermTicketResponse = $('#frdp-resource-textarea-permTicket-response');
    var textareaResourcePermTicketEncode = $('#frdp-resource-textarea-permTicket-encode');
    var textareaResourcePermTicketDecode = $('#frdp-resource-textarea-permTicket-decode');
    var textareaResourceClaimTokenResponse = $('#frdp-resource-textarea-claimToken-response');
    var textareaResourceClaimTokenEncode = $('#frdp-resource-textarea-claimToken-encode');
    var textareaResourceClaimTokenDecode = $('#frdp-resource-textarea-claimToken-decode');
    var textareaResourceRPTResponse = $('#frdp-resource-textarea-rpt-response');
    var textareaResourceRPTEncode = $('#frdp-resource-textarea-rpt-encode');
    var textareaResourceRPTDecode = $('#frdp-resource-textarea-rpt-decode');
    var textareaResourceResponse = $('#frdp-resource-textarea-response');

    // Discover resources for a given Resource Owner

    var btnDiscoverSubmit = $('#frdp-discover-btn-submit');
    var btnDiscoverClear = $('#frdp-discover-btn-clear');
    var radioDiscoverFilter = $('input:radio[name="frdp-discover-filter"]');
    var radioDiscoverFilterNone = $('#frdp-discover-filter-radio-none');
    var spanDiscoverURI = $('#frdp-discover-span-uri');
    var tableBodyDiscover = $('#frdp-discover-table-body');
    var textDiscoverOwner = $('#frdp-discover-text-owner');
    var textDiscoverFilterType = $('#frdp-discover-filter-text-type');
    var textDiscoverFilterName = $('#frdp-discover-filter-text-name');

    // Shared With Me

    var btnSharedSubmit = $('#frdp-shared-btn-submit');
    var btnSharedClear = $('#frdp-shared-btn-clear');
    var radioSharedFilter = $('input:radio[name="frdp-shared-filter"]');
    var radioSharedFilterNone = $('#frdp-shared-filter-radio-none');
    var spanSharedURI = $('#frdp-shared-span-uri');
    var tableBodyShared = $('#frdp-shared-table-body');
    var textSharedFilterType = $('#frdp-shared-filter-text-type');
    var textSharedFilterName = $('#frdp-shared-filter-text-name');

    // Modal, Authentication

    var modalAuthen = $('#frdp-modal-authen');
    var spanAuthenStatus = $('#frdp-span-authen-status');
    var textAuthenUserName = $('#frdp-input-authen-username');
    var textAuthenPassword = $('#frdp-input-authen-password');
    var btnAuthenSubmit = $('#frdp-btn-authen-submit');

    // Functions

    $.urlParam = function (name) {
        /*
        * jQuery function
        * gets a query parameter value for the specified query parameter name
        */

        var fnName = "urlParam(): ";
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);

        if (results === null) {
            return null;
        }
        else {
            return results[1] || 0;
        }
    };

    var errorAuthenticate = function (xhr, status, error) {
        /*
         * Invoked (callback) when authentication response has failed
         * log error to console, update UI
         */

        var fnName = "errorAuthenticate(): ";
        var msg = "Authentication Failed";

        console.error(fnName + "Status='" + status + "', " +
            "Error='" + error + "', " + 
            "XHR='" + JSON.stringify(xhr) + "', " +
            "Cookie='" + getCookie() + "'");

        spanAuthenStatus.text(msg);
        textAuthenUserName.val("");
        textAuthenPassword.val("");
        textAuthenUserName.focus();
    };

    var successAuthenticate = function(data, status, xhr) {
        /*
         * Invoked (callback) when authentication response is successful
         * call function to process the data
         */

        var fnName = "successAuthenticate(): ";
        var msg = "";

        console.info(fnName + "Status='" + status + "', " +
			"Data='" + JSON.stringify(data) + "'" +
			"XHR='" + JSON.stringify(xhr) + "'");
        
        if (data) {
            spanAuthenStatus.text(""); // success
            getUserData(updateUserData);
        } else {
            msg = "Data is empty";
            spanAuthenStatus.text(msg);
            console.error(fnName + msg + ", Cookie='" + getCookie() + "'");
        }
    }

    var getUserData = function (callback) {
        /*
         * If the user is authenticated, has a valid Cookie
         * get the user details (username, last name, first name)
         * Using a valid session cookie
         * HTTP POST to get the user's session info
         * On success: Using the username (from the session)
         * HTTP GET to get user json details
         * On success: Process JSON response
         */

        var fnName = "getUserData(): ";
        var msg = "";
        var oreo = "";
        var url_sessions = "";
        var url_users = "";

        oreo = getCookie();

        if (oreo) {

            url_sessions = _frdp_uma_as_base + _frdp_uma_as_endpoint + 
                "/json/realms/root/sessions?_action=getSessionInfo";

            console.info(fnName + "ajax(): POST: " + url_sessions);

            $.ajax({
                type: "POST",
                url: url_sessions,
                dataType: "json",
                contentType: "application/json",
                   headers: {
                    _frdp_uma_as_cookieName: oreo
                   },
                error: function (xhr, status, error) {
                    msg = "Failed to get session info";
                    _frdp_authenticated = false;
                    console.error(fnName + msg + 
                       ": status='" + status +
                       "', error='" + error +
                       "', xhr='" + JSON.stringify(xhr) +
                       "', cookie='" + oreo + "'");
                    modalAuthen.show();
                    spanAuthenStatus.text(msg);
                    textAuthenUserName.focus();
                },
                success: function (data, status, xhr) {
                    console.info(fnName + "Got session info" +
                       ": status='" + status + "'" +
                       ", data='" + JSON.stringify(data) + "'" +
                       ", xhr='" + JSON.stringify(xhr) + "'" +
                       ", cookie='" + oreo + "'");
    
                    if (data && data.username)
                    {
                        // Get user information
                        url_users = _frdp_uma_as_base + _frdp_uma_as_endpoint +
                            "/json/users/" + data.username;

                        console.info(fnName + "ajax(): GET: " + url_users);

                        $.ajax({
                            type: "GET",
                            url: url_users,
                            dataType: "json",
                            contentType: "application/json",
                            headers: {
                                _frdp_uma_as_cookieName: oreo
                            },
                            error: function (xhr, status, error) {
                                _frdp_authenticated = false;
                                console.error(fnName + "GET users"
                                   + ": status='" + status
                                   + "', error='" + error
                                   + "', cookie='" + oreo
                                   + "', xhr='" + JSON.stringify(xhr) + "'");
                            },
                            success: function (data, status, xhr) {
                                console.info(fnName + "GET users"
                                   + ": status='" + status
                                   + "', data='" + JSON.stringify(data)
                                   + "', xhr='" + JSON.stringify(xhr) + "'");
                                if (data) {
                                    processUserDataResponse(data, callback);
                                } else {
                                    msg = "User data is empty";
                                    console.error(fnName + msg);
                                    spanAuthenStatus.text(msg);
                                }
                            }
                        });
                    } else {
                        _frdp_authenticated = false;
                        msg = "User Name not found in Data";
                        spanAuthenStatus.text(msg);
                        console.error(fnName + msg + ", '" + JSON.stringify(data) + "'");
                    }
                }
            });
        } else {
            _frdp_authenticated = false;

            spanMenuUserId.text("Login Required");
            textAuthenUserName.val("");
            textAuthenPassword.val("");
            modalAuthen.show();
            spanAuthenStatus.text("Login Required");
            textAuthenUserName.focus();
        }
    
    };

    var xhrResource = function (evt) {
        /*
         * Callback function for POST to get the Resource
         * Handles all response (evt) status
         * If success, show resource details
         * If not authorized, process response Permission Ticket
         *                    set-up UI to get Claim Token
         */

        var fnName = "xhrResource(evt): ";
        var response = evt.target.response;
        var json = null;

        json = JSON.parse(response);

        console.info(fnName, evt);

        switch (evt.target.status) {
            case 200: // OK
            case 201: // CREATED
            {
                btnResourceGetResource.prop("disabled", false); // ENABLED
                btnResourceGetClaim.prop("disabled", true);
                btnResourceGetRPT.prop("disabled", true);

                divResourceBannerInfo.hide();
                divResourceBannerSuccess.show();
                divResourceBannerError.hide();
                divResourceBannerFailed.hide();

                aResourceTabResponse.tab('show');

                spanResourceStatus.text("200 : OK / 201 : CREATED");

                divResourceBannerSuccess.html('<tt>200 : OK / 201 : CREATED :</tt> '
                   + '<strong>Congratulations!</strong> ' + json.message);

                textareaResourceResponse.text(JSON.stringify(json, null, 3));

                break;
            }
            case 400: // bad request
            {
                btnResourceGetResource.prop("disabled", false); // ENABLED
                btnResourceGetClaim.prop("disabled", true);
                btnResourceGetRPT.prop("disabled", true);

                divResourceBannerInfo.hide();
                divResourceBannerSuccess.hide();
                divResourceBannerFailed.hide();
                divResourceBannerError.show();

                aResourceTabResponse.tab('show');

                spanResourceStatus.text("400 : BAD REQUEST");

                divResourceBannerError.html('<tt>400 : BAD REQUEST :</tt> '
                   + '<strong>Error,</strong> ' + json.message);

                textareaResourceResponse.text(JSON.stringify(json, null, 3));

                break;
            }
            case 401: // not authorized, show permission ticket
            {
                var jwt0 = null;
                var jwt1 = null;
                var base64url = '';
                var base64 = '';

                _frdp_uma_as_oauth2_url = json.as_uri;

                btnResourceGetResource.prop("disabled", true);
                btnResourceGetClaim.prop("disabled", false); // ENABLED
                btnResourceGetRPT.prop("disabled", true);

                divResourceBannerInfo.hide();
                divResourceBannerSuccess.hide();
                divResourceBannerError.hide();
                divResourceBannerFailed.show();

                _frdp_uma_perm_ticket = json.ticket;

                aResourceTabPermTicket.tab('show');

                spanResourcePermTicketStatus.text("401 : NOT AUTHORIZED");

                divResourceBannerFailed.html('<tt>401 : NOT AUTHORIZED :</tt> '
                   + '<strong>Sorry,</strong> ' + json.message);

                spanResourceASURI.text(json.as_uri);

                textareaResourcePermTicketResponse.text(JSON.stringify(json, null, 3));
                textareaResourcePermTicketEncode.text(json.ticket);

                base64url = json.ticket.split('.')[0];
                base64 = base64url.replace('-', '+').replace('_', '/');
                jwt0 = JSON.parse(window.atob(base64));

                base64url = json.ticket.split('.')[1];
                base64 = base64url.replace('-', '+').replace('_', '/');
                jwt1 = JSON.parse(window.atob(base64));

                textareaResourcePermTicketDecode.text(
                   JSON.stringify(jwt0, null, 3) + "\n" +
                   JSON.stringify(jwt1, null, 3));


                btnResourceGetClaim.focus();

                break;
            }
            case 404: // not found
            {
                btnResourceGetResource.prop("disabled", false); // ENABLED
                btnResourceGetClaim.prop("disabled", true);
                btnResourceGetRPT.prop("disabled", true);

                divResourceBannerInfo.hide();
                divResourceBannerSuccess.hide();
                divResourceBannerFailed.hide();
                divResourceBannerError.show();

                aResourceTabResponse.tab('show');

                spanResourceStatus.text("404 : NOT FOUND");

                divResourceBannerError.html(
                   '<tt>404 : NOT FOUND :</tt> '
                   + '<strong>Error,</strong> ' + json.message);

                textareaResourceResponse.text(JSON.stringify(json, null, 3));


                break;
            }
            case 409: // conflict, mixed scopes
            {
                btnResourceGetResource.prop("disabled", false); // ENABLED
                btnResourceGetClaim.prop("disabled", true);
                btnResourceGetRPT.prop("disabled", true);

                divResourceBannerInfo.hide();
                divResourceBannerSuccess.hide();
                divResourceBannerFailed.hide();
                divResourceBannerError.show();

                aResourceTabResponse.tab('show');

                spanResourceStatus.text("409 : CONFLICT");

                divResourceBannerError.html('<tt>409 : CONFLICT :</tt> '
                   + '<strong>Error,</strong> ' + json.message);

                textareaResourceResponse.text(JSON.stringify(json, null, 3));

                break;
            }
            default: // ERROR
            {
                btnResourceGetResource.prop("disabled", false); // ENABLED
                btnResourceGetClaim.prop("disabled", true);
                btnResourceGetRPT.prop("disabled", true);

                divResourceBannerInfo.hide();
                divResourceBannerSuccess.hide();
                divResourceBannerFailed.hide();
                divResourceBannerError.show();

                aResourceTabResponse.tab('show');

                spanResourceStatus.text("DEFAULT: " + evt.target.status);

                divResourceBannerError.html(
                   '<tt>DEFAULT : ' + evt.target.status + ' :</tt> '
                   + '<strong>Error,</strong> ' + json.message);

                textareaResourceResponse.text(JSON.stringify(json, null, 3));

                break;
            }
        }
    };

    var xhrAuthzCode = function (evt) {
        /*
         * Callback function for POST to get the Authorization Code
         * Handles all response (evt) status
         * If success, parse HTML response and get the authorization code
         *             then make call get the Claim Token (access token)
         */

        var fnName = "xhrAuthzCode(evt): ";

        console.info(fnName, evt);

        switch (evt.target.status) {
            case 200: // OK
            {
                var response = evt.target.response;
                var doc = new DOMParser().parseFromString(response, "text/html");
                var codeElement = doc.getElementsByName("code");
                var code = codeElement[0].value;

                console.info(fnName + "code=" + code);

                spanResourceAuthCode.text(code);

                getClaimToken(code);

                break;
            }
            default:
            {
                btnResourceGetResource.prop("disabled", false); // ENABLED
                btnResourceGetClaim.prop("disabled", true);
                btnResourceGetRPT.prop("disabled", true);

                divResourceBannerInfo.hide();
                divResourceBannerSuccess.hide();
                divResourceBannerFailed.hide();
                divResourceBannerError.show();

                aResourceTabClaimToken.tab('show');

                spanResourceClaimTokenStatus.text("DEFAULT: " + evt.target.status);

                divResourceBannerError.html(
                   '<tt>DEFAULT : ' + evt.target.status + ' :</tt> '
                   + '<strong>Error,</strong> Could not get Authorization Code');

                textareaResourceClaimTokenResponse.text(fnName + "\n" + evt.target.response);

                console.error(fnName + evt.target.status);
                console.error(evt.target.response);

                break;
            }
        }
    };

    var xhrClaimToken = function (evt) {
        /*
         * Callback function for POST to get the Claim token
         * Handles all response (evt) status
         * If success, decode and display JWT
         */

        var fnName = "xhrClaimToken(evt): ";

        console.info(fnName, evt);

        switch (evt.target.status) {
            case 200:
            {
                var jwt0 = null;
                var jwt1 = null;
                var base64url = '';
                var base64 = '';
                var response = evt.target.response;
                var json = JSON.parse(response);

                divResourceBannerInfo.hide();
                divResourceBannerSuccess.show();
                divResourceBannerError.hide();
                divResourceBannerFailed.hide();

                divResourceBannerSuccess.html('<tt>200 : OK : </tt> '
                   + '<strong>Success,</strong> Claim Token created');

                aResourceTabClaimToken.tab('show');

                spanResourceClaimTokenStatus.text("200 : OK");

                textareaResourceClaimTokenResponse.text(JSON.stringify(json, null, 3));

                textareaResourceClaimTokenEncode.text(json.id_token);

                base64url = json.id_token.split('.')[0];
                base64 = base64url.replace('-', '+').replace('_', '/');
                jwt0 = JSON.parse(window.atob(base64));

                base64url = json.id_token.split('.')[1];
                base64 = base64url.replace('-', '+').replace('_', '/');
                jwt1 = JSON.parse(window.atob(base64));

                btnResourceGetResource.prop("disabled", true);
                btnResourceGetClaim.prop("disabled", true);
                btnResourceGetRPT.prop("disabled", false); // ENABLED

                textareaResourceClaimTokenDecode.text(
                   JSON.stringify(jwt0, null, 3) + "\n" +
                   JSON.stringify(jwt1, null, 3));

                btnResourceGetRPT.focus();

                break;
            }
            default:
            {
                btnResourceGetResource.prop("disabled", false); // ENABLED
                btnResourceGetClaim.prop("disabled", true);
                btnResourceGetRPT.prop("disabled", true);

                divResourceBannerInfo.hide();
                divResourceBannerSuccess.hide();
                divResourceBannerFailed.hide();
                divResourceBannerError.show();

                divResourceBannerError.html(
                   '<tt>DEFAULT : ' + evt.target.status + ' :</tt> '
                   + '<strong>Error,</strong> Could not create Claim Token');

                aResourceTabClaimToken.tab('show');

                spanResourceClaimTokenStatus.text("DEFAULT : " + evt.target.status);

                textareaResourceResponse.text(fnName + "\n" + evt.target.response);

                console.error(fnName + evt.target.status);
                console.error(evt.target.response);

                break;
            }
        }
    };

    var xhrRPT = function (evt) {
        /*
         * Callback function for POST to get the Requesting Party Token (RPT)
         * Handles all response (evt) status
         * If success, update UI with resource details
         * If forbidden, indicate need to create new RPT
         */
        var fnName = "xhrRPT(evt): ";
        var response = evt.target.response;
        var json = JSON.parse(response);

        console.info(fnName, evt);

        switch (evt.target.status) {
            case 200: // OK
            {
                var jwt0 = null;
                var jwt1 = null;
                var base64url = '';
                var base64 = '';

                _frdp_uma_rpt = json.access_token;

                btnResourceGetResource.prop("disabled", false); // ENABLED
                btnResourceGetClaim.prop("disabled", true);
                btnResourceGetRPT.prop("disabled", true);

                textResourceRPT.val(_frdp_uma_rpt);

                divResourceBannerInfo.hide();
                divResourceBannerSuccess.show();
                divResourceBannerError.hide();
                divResourceBannerFailed.hide();

                divResourceBannerSuccess.html('<tt>200 : OK : </tt> '
                   + '<strong>Success,</strong> Requesting Party Token created');

                aResourceTabRPT.tab('show');

                spanResourceRPTStatus.text('200 : OK');

                textareaResourceRPTResponse.text(JSON.stringify(json, null, 3));

                textareaResourceRPTEncode.text(json.access_token);

                if (json.access_token.indexOf(".") >= 0) {
                    base64url = json.access_token.split('.')[0];
                    base64 = base64url.replace('-', '+').replace('_', '/');
                    jwt0 = JSON.parse(window.atob(base64));

                    base64url = json.access_token.split('.')[1];
                    base64 = base64url.replace('-', '+').replace('_', '/');
                    jwt1 = JSON.parse(window.atob(base64));

                    textareaResourceRPTDecode.text(
                        JSON.stringify(jwt0, null, 3) + "\n" +
                        JSON.stringify(jwt1, null, 3));
                } else {
                    textareaResourceRPTDecode.text("Can not decode");
                }
                btnResourceGetResource.focus();

                break;
            }
            case 403: // Forbidden
            {
                btnResourceGetResource.prop("disabled", false); // ENABLED
                btnResourceGetClaim.prop("disabled", true);
                btnResourceGetRPT.prop("disabled", true);

                divResourceBannerInfo.hide();
                divResourceBannerSuccess.hide();
                divResourceBannerFailed.show();
                divResourceBannerError.hide();

                divResourceBannerFailed.html('<tt>403 : FORBIDDEN :</tt> '
                   + '<strong>Notice,</strong> ' + json.error);

                aResourceTabRPT.tab('show');

                spanResourceRPTStatus.text('403 : FORBIDDEN');

                textareaResourceRPTResponse.text(JSON.stringify(json, null, 3));

                btnResourceGetResource.focus();

                break;
            }
            default:
            {
                btnResourceGetResource.prop("disabled", false); // ENABLED
                btnResourceGetClaim.prop("disabled", true);
                btnResourceGetRPT.prop("disabled", true);

                divResourceBannerInfo.hide();
                divResourceBannerSuccess.hide();
                divResourceBannerFailed.hide();
                divResourceBannerError.show();

                divResourceBannerError.html(
                   '<tt>DEFAULT : ' + evt.target.status + ' :</tt> '
                   + '<strong>Error,</strong> Could not create Requesting Party Token');

                aResourceTabRPT.tab('show');

                textareaResourceRPTResponse.text(fnName + "\n" + evt.target.response);

                btnResourceGetResource.focus();

                console.error(fnName + evt.target.status);
                console.error(evt.target.response);

                break;
            }
        }
    };

    var xhrLoadDiscovered = function (evt) {
        /*
         * Callback function for REST response from getting discoverable resources
         * Handles all response (evt) status
         * If successful, update UI
         */
        var fnName = "xhrLoadDiscovered(): ";

        console.info(fnName, evt);

        switch (evt.target.status) {
            case 200: // OK
            {
                var response = evt.target.response;
                var json = JSON.parse(response);
                var results = json.results;
                var rows = '';
                var scopes = '';

                tableBodyDiscover.html("");

                if (results.length > 0) {
                    for (var i = 0; i < results.length; i++) {
                        scopes = '';
                        if (results[i].scopes !== undefined && results[i].scopes !== null)
                        {
                            for (var j = 0; j < results[i].scopes.length; j++) {
                                scopes += results[i].scopes[j] + ' ';
                            }
                        }
                        rows += '<tr>'
                           + '<td><small>' + results[i].id + '</small></td>'
                           + '<td><small>' + results[i].name + '</small></td>'
                           + '<td><small>' + results[i].type + '</small></td>'
                           + '<td><small>' + results[i].description + '</small></td>'
                           + '<td><small>' + scopes + '</small></td>'
                           + '</tr>';
                    }
                } else {
                    rows += '<tr><td colspan="5">- Nothing Found -</td></tr>';
                }

                tableBodyDiscover.html(rows);

                updateDiscoverURI();

                break;
            }
            default:
            {
                console.error(fnName + evt.target.status);
                console.error(evt.target.response);

                break;
            }
        }
    };

    var xhrLoadShared = function (evt) {
        /*
         * Callback function for REST response from getting shared resources
         * Handles all response (evt) status
         * If successful, update UI
         */
        var fnName = "xhrLoadShared(evt): ";

        console.info(fnName, evt);

        switch (evt.target.status) {
            case 200: // OK
            {
                var response = evt.target.response;
                var json = JSON.parse(response);
                var results = json.results;
                var rows = '';
                var policy = '';
                var scopes = '';
                var resourceIds = [];

                tableBodyShared.html("");

                if (results.length > 0) {
                    for (var i = 0; i < results.length; i++) {
                        policy = '';
                        if (results[i].policy !== undefined && results[i].policy !== null)
                        {
                            for (var j = 0; j < results[i].policy.length; j++) {
                                policy += results[i].policy[j] + ' ';
                            }
                        }

                        scopes = '';
                        if (results[i].scopes !== undefined && results[i].scopes !== null)
                        {
                            for (var j = 0; j < results[i].scopes.length; j++) {
                                scopes += results[i].scopes[j] + ' ';
                            }
                        }

                        rows += '<tr>'
                           + '<td><small>' + results[i].id + '</small></td>'
                           + '<td><small>' + results[i].name + '</small></td>'
                           + '<td><small>' + results[i].type + '</small></td>'
                           + '<td><small>' + results[i].owner + '</small></td>'
                           + '<td><small>' + policy + '</small></td>'
                           + '<td><small>' + scopes + '</small></td>'
                           + '<td>'
                           + '<button class="btn btn-sm btn-danger" id="frdpShared_'
                           + results[i].id
                           + '" type="button">Revoke</button>'
                           + '</td>'
                           + '</tr>';

                        resourceIds.push(results[i].id);
                    }
                } else {
                    rows += '<tr><td colspan="7">- Nothing Found -</td></tr>';
                }
                tableBodyShared.html(rows);

                /*
                 * Add event listners for each row
                 */
                if (resourceIds !== null && resourceIds.length > 0)
                {
                    for (var i = 0; i < resourceIds.length; i++)
                    {
                        document.getElementById("frdpShared_" + resourceIds[i])
                           .addEventListener("click", revokeShared, false);
                    }
                }

                break;
            }
            default:
            {
                console.error(fnName + evt.target.status);
                console.error(evt.target.response);

                break;
            }
        }
    };

    var xhrRevokeShared = function (evt) {
        /*
         * Callback function for REST response from revoking shared access
         * Handles all response (evt) status
         * If successful, make REST call to (re)load shared resources
         */
        var fnName = "xhrRevokeShared(evt): ";
        var XHR = null;

        console.info(fnName, evt);

        switch (evt.target.status) {
            case 200: // OK
            case 204: // NO CONTENT
            {
                console.info(fnName + "complete, reloading shared resources");

                XHR = new XMLHttpRequest();
                XHR.open("GET", _frdp_uma_rs_shared);
                XHR.setRequestHeader("x-frdp-ssotoken", getCookie());
                XHR.addEventListener("load", xhrLoadShared);
                XHR.addEventListener("error", xhrLoadShared);
                XHR.send();

                break;
            }
            case 404: // NOT FOUND
            {
                console.warn(fnName + "not found, url='"
                   + evt.target.responseURL + "'");
                break;
            }
            default:
            {
                console.info(fnName + "default case: status: "
                   + evt.target.status + ", url='" + evt.target.responseURL + "'");
                break;
            }
        }
    };

    function processUserDataResponse(input, callback) {
        /* 
         * Process the response from getting user data
         * input is JSON with id, firstname, lastname, email
         * create output and call the "callback" function
         */

        var fnName = "processUserDataResponse(): ";
        var output = {};
    
        console.info(fnName + "input='" + JSON.stringify(input) + "'");
        
        output.id = input.uid[0];
        output.firstname = input.givenName[0];
        output.lastname = input.sn[0];
        output.email = input.mail[0];
        
        console.info(fnName + "output='" + JSON.stringify(output) + "'");

        _frdp_authenticated = true;

        modalAuthen.hide();

        callback(output);
    }

    function revokeShared(evt) {
        /*
         * Revoke the Shared Resource, for the logged-in Requesting Party
         * Target id = "frdpShared_GUID" ... split on "_" to get Resource Id
         */
        var fnName = "revokeShared(evt): ";
        var resourceId = evt.target.id.split('_')[1];
        var XHR = null;
        var url = null;

        console.info(fnName + "Resource Id=" + resourceId);

        if (resourceId !== null && resourceId.length > 0)
        {
            url = _frdp_uma_rs_base + _frdp_uma_rs_endpoint
               + '/resources/' + resourceId + "/policy";
            XHR = new XMLHttpRequest();
            XHR.open("DELETE", url);
            XHR.setRequestHeader("x-frdp-ssotoken", getCookie());
            XHR.addEventListener("load", xhrRevokeShared);
            XHR.addEventListener("error", xhrRevokeShared);
            XHR.send();
        }
        return;
    }

    function getClaimToken(code) {
        /*
         * Get an "Access Token" (the Claim Token) using the provided
         * "Authorization Code" (code)
         */
        var fnName = "getClaimToken(code): ";
        var XHR = new XMLHttpRequest();
        var basicAuthz = btoa(_frdp_uma_as_oauth2_client_id + ":" + _frdp_uma_as_oauth2_client_secret);
        var strData = "grant_type=authorization_code"
           + "&redirect_uri=" + _frdp_uma_as_oauth2_client_redirecturi
           + "&code=" + code;

        console.info(fnName + "OAuth2 URL=" + _frdp_uma_as_oauth2_url);

        XHR.open("POST", _frdp_uma_as_oauth2_url + "/access_token");
        XHR.setRequestHeader("authorization", "Basic " + basicAuthz);
        XHR.setRequestHeader("content-type", "application/x-www-form-urlencoded");
        XHR.addEventListener("load", xhrClaimToken);
        XHR.addEventListener("error", xhrClaimToken);
        XHR.send(strData);
    }

    function getCookie() {
        /*
         * Return the value of the Single-Sign-On (SSO) Cookie 
         * for the logged-in user.  Value may be empty (not authenticated)
         */

        var fnName = "getCookie(): ";
        var name = _frdp_uma_as_cookieName + '=';
        var value = '';
        var ca = document.cookie.split(';');

        console.info(fnName + _frdp_uma_as_cookieName + "='" + decodeURIComponent(document.cookie) + "'");

        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                value = c.substring(name.length, c.length);
                break;
            }
        }
        return value;
    }

    function reset() {
        /*
         * Reset the user interface to the default state.
         */
        var fnName = "reset(): ";

        _frdp_uma_rpt = "";

        modalAuthen.hide();
        spanAuthenStatus.text("");
        textAuthenUserName.text("");
        textAuthenPassword.text("");

        divMenuResource.show();
        divMenuDiscover.hide();
        divMenuShared.hide();

        spanResourceStatus.text("");
        spanResourcePermTicketStatus.text("");
        spanResourceClaimTokenStatus.text("");
        spanResourceRPTStatus.text("");

        textareaResourcePermTicketResponse.text("");
        textareaResourcePermTicketEncode.text("");
        textareaResourcePermTicketDecode.text("");
        textareaResourceClaimTokenResponse.text("");
        textareaResourceClaimTokenEncode.text("");
        textareaResourceClaimTokenDecode.text("");
        textareaResourceRPTResponse.text("");
        textareaResourceResponse.text("");

        textResourceId.val("");
        textResourceScopes.val("");
        textResourceRPT.val("");

        btnResourceGetResource.prop("disabled", true);
        btnResourceGetClaim.prop("disabled", true);
        btnResourceGetRPT.prop("disabled", true);
        btnResourceReset.prop("disabled", false);

        divResourceBannerInfo.show();
        divResourceBannerSuccess.hide();
        divResourceBannerFailed.hide();
        divResourceBannerError.hide();

        aResourceTabResponse.tab('show');

        textDiscoverFilterName.val("");
        textDiscoverFilterType.val("");
        textDiscoverFilterName.prop("disabled", true);
        textDiscoverFilterType.prop("disabled", true);

        textSharedFilterName.val("");
        textSharedFilterType.val("");
        textSharedFilterName.prop("disabled", true);
        textSharedFilterType.prop("disabled", true);

        updateRSURI();
        updateSharedURI();
    }

    function updateUserData(data) {
        /*
         * Update UI user data 
         */
        var fnName = "updateUserData(data) ";

        spanMenuUserId.text(data.id);
        spanMenuFirstName.text(data.firstname);
        spanMenuLastName.text(data.lastname);
    }

    function updateRSURI() {
        /*
         * Update Resource Server URI for a resource, from the inputs
         */

        var fnName = "updateRSURI(): ";
        var resourceId = textResourceId.val();
        var scopes = textResourceScopes.val();

        _frdp_uma_rs_url = _frdp_uma_rs_base + _frdp_uma_rs_endpoint + '/resources/';

        if (resourceId.length > 0) {
            _frdp_uma_rs_url = _frdp_uma_rs_url + resourceId + "/";
            if (scopes.length > 0) {
                _frdp_uma_rs_url = _frdp_uma_rs_url + '?scopes=' + scopes;
            }
        }

        spanResourceURI.text(_frdp_uma_rs_url);
    }

    function updateDiscoverURI() {
        /*
         * Update Resource Server URI for discovery, from the inputs
         * https://FQDN/apps/uma-rs/rest/share/owners/bjensen/discover
         */

        var fnName = "updateDiscoverURI(): ";
        var owner = textDiscoverOwner.val();

        _frdp_uma_rs_discover = _frdp_uma_rs_base + _frdp_uma_rs_endpoint
           + '/owners/' + owner + '/discover';

        if (_frdp_uma_rs_filter_discover === 'type') {
            _frdp_uma_rs_discover += '?type=' + textDiscoverFilterType.val();
        } else if (_frdp_uma_rs_filter_discover === 'name') {
            _frdp_uma_rs_discover += '?name=' + textDiscoverFilterName.val();
        }

        spanDiscoverURI.text(_frdp_uma_rs_discover);
    }

    function updateSharedURI() {
        /*
         * Update Resource Server URI for "share with me", from the inputs
         * https://FQDN/apps/uma-rs/rest/share/withme
         */

        var fnName = "updateSharedURI(): ";

        _frdp_uma_rs_shared = _frdp_uma_rs_base + _frdp_uma_rs_endpoint
           + '/withme';

        if (_frdp_uma_rs_filter_shared === 'type') {
            _frdp_uma_rs_shared += '?type=' + textSharedFilterType.val();
        } else if (_frdp_uma_rs_filter_shared === 'name') {
            _frdp_uma_rs_shared += '?name=' + textSharedFilterName.val();
        }

        spanSharedURI.text(_frdp_uma_rs_shared);
    }

    function checkQueryParams() {
        /* 
         * Look for query parameters, set variables for resourceid and scopes
         */
        var fnName = "checkQueryParams(): ";

        _frdp_param_resourceid = $.urlParam('resourceid');
        _frdp_param_scopes = $.urlParam('scopes');

        console.info(fnName + "resourceid='" +
           _frdp_param_resourceid + "', scopes='" + _frdp_param_scopes + "'");

        if (_frdp_param_resourceid !== null)
        {
            textResourceId.val(_frdp_param_resourceid);
            if (_frdp_param_scopes !== null) {
                textResourceScopes.val(_frdp_param_scopes);
            }
        }
    }

    function authenticateUser(userName, userPassword) {
        /*
         * Attempt to authenticate the user, with username and password
         * An AJAX call is made to the AS 
         * If success, the successAuthenticate function is called
         * If error, the errorAuthenticate function is called
         */

        var fnName = "authenticateUser(): ";
        var ajax_method = 'POST';
        var ajax_url = _frdp_uma_as_base + _frdp_uma_as_endpoint +
            '/json/authenticate';

        console.info(fnName + 
            "username='" + userName + "', " +
            "password='" + userPassword + "'");

        spanAuthenStatus.text("Authenticating ... Please wait");

        $.ajax({
            type: ajax_method,
            url: ajax_url,
            dataType: 'json',
            contentType: 'application/json',
            data: {},
            headers: {
                'X-OpenAM-Username': userName,
                'X-OpenAM-Password': userPassword
            },
            error: errorAuthenticate,
            success: successAuthenticate
        });

    }

    function processUserInputForAuthentication(event) {
        /*
         * Handle input events related to user authentication
         * stop default event handler from running
         * onBlur of textfields and click of button
         * If non-zero length username and password call authenticate function
         */
        var fnName = "processUserInputForAuthentication(event): ";
        var error = false;
        var msg = "";
        var userName = "";
        var userPassword = "";
        var textInput = null;

        event.preventDefault();

        userName = textAuthenUserName.val();
        userPassword = textAuthenPassword.val();

        if (userName.length > 0) {
            if (userPassword.length > 0) {
                authenticateUser(userName, userPassword);
            } else {
                error = true;
                msg = "Password is empty";
                textInput = textAuthenPassword;
            }
        } else {
            error = true;
            msg = "User Name is empty";
            textInput = textAuthenUserName;
        }

        if (error) {
            console.warn(fnName + msg);

            setTimeout(function(){
                textInput.focus();
            }, 500);
        }
    }

    // Handle user interface events

    btnAuthenSubmit.click(function(event) {
        var fnName = "btnAuthenSubmit.click(): ";

        processUserInputForAuthentication(event);
    });

    textAuthenUserName.blur(function (event) {
        var fnName = "textAuthenUserName.blur(): ";

        processUserInputForAuthentication(event);
    });

    textAuthenPassword.blur(function (event) {
        var fnName = "textAuthenPassword.blur(): ";

        processUserInputForAuthentication(event);
    });

    textResourceId.keyup(function () {
        updateRSURI();
        if (textResourceId.val().length) {
            btnResourceGetResource.prop("disabled", false);
        } else {
            btnResourceGetResource.prop("disabled", true);
        }
    });

    textResourceScopes.keyup(function () {
        updateRSURI();
    });

    textDiscoverOwner.keyup(function () {
        updateDiscoverURI();
    });

    textDiscoverFilterType.keyup(function () {
        updateDiscoverURI();
    });

    textDiscoverFilterName.keyup(function () {
        updateDiscoverURI();
    });

    textSharedFilterType.keyup(function () {
        updateSharedURI();
    });

    textSharedFilterName.keyup(function () {
        updateSharedURI();
    });

    aResourceClearRPT.click(function () {
        _frdp_uma_rpt = '';
        textResourceRPT.val(_frdp_uma_rpt);
    });

    aMenuResource.click(function () {
        divMenuResource.show();
        divMenuDiscover.hide();
        divMenuShared.hide();
        textResourceId.focus();
    });

    aMenuDiscover.click(function () {
        divMenuResource.hide();
        divMenuDiscover.show();
        divMenuShared.hide();
    });

    aMenuShared.click(function () {
        divMenuResource.hide();
        divMenuDiscover.hide();
        divMenuShared.show();
    });

    btnResourceGetResource.click(function (event) {
        /*
         * Handle button click for "Get Resource"
         * stop default event handler from running
         * Attempt to get the resource from the Resource Server
         * Calls the xhrResource function for all responses
         */

        var fnName = "btnResourceGetResource.click(): ";
        var XHR = new XMLHttpRequest();

        event.preventDefault();

        textareaResourceResponse.text("");

        updateRSURI();

        console.info(fnName + "XMLHttpRequest(): GET: " + _frdp_uma_rs_url);

        XHR.open("GET", _frdp_uma_rs_url);
        XHR.setRequestHeader("x-frdp-rpt", _frdp_uma_rpt);
        XHR.addEventListener("load", xhrResource);
        XHR.addEventListener("error", xhrResource);
        XHR.send();
    });

    btnResourceGetClaim.click(function (event) {
        /*
         * Handle button click for "Get Claim Token"
         * stop default event handler from running
         * Two step process to get a "claim token"
         * 1) get an authorization code
         * 2) use authorization code to get claim token (callback function)
         * This function is "Step 1" ... attempts to get an authorization code
         * Calls function xhrAuthzCode for success or error
         */

        var fnName = "btnResourceGetClaim.click(): ";
        var cookie = getCookie();
        var XHR = new XMLHttpRequest();
        var url = "";
        var strData = "";

        event.preventDefault();

        if (cookie.length > 0) {
            url = _frdp_uma_as_oauth2_url + "/authorize";
            strData = "response_type=code"
            + "&save_consent=off"
            + "&decision=allow"
            + "&client_id=" + _frdp_uma_as_oauth2_client_id
            + "&redirect_uri=" + _frdp_uma_as_oauth2_client_redirecturi
            + "&scope=openid"
            + "&response_mode=form_post"
            + "&csrf=" + cookie;

            console.info(fnName + "XMLHttpRequest(): POST: " + url);

            XHR.open("POST", url);
            XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            XHR.setRequestHeader(_frdp_uma_as_cookieName, cookie);
            XHR.setRequestHeader("Cookie", _frdp_uma_as_cookieName + "=" + cookie);
            XHR.addEventListener("load", xhrAuthzCode);
            XHR.addEventListener("error", xhrAuthzCode);
            XHR.send(strData);
        } else {
            btnResourceGetResource.prop("disabled", false);
            btnResourceGetClaim.prop("disabled", true);
            btnResourceGetRPT.prop("disabled", true);

            divResourceBannerInfo.hide();
            divResourceBannerSuccess.hide();
            divResourceBannerFailed.hide();
            divResourceBannerError.show();

            aResourceTabResponse.tab('show');

            textareaResourceResponse.text("SSO Cookie is empty");
        }
    });

    btnResourceGetRPT.click(function (event) {
        /*
         * Handle button click for "Get RPT"
         * stop default event handler from running
         * Get the Requesting Party Token (RPT) ... need the
         * 1) Permission Ticket
         * 2) Claims Token
         * Calls function xhrRPT for success and error
         */

        var fnName = "btnResourceGetRPT.click(): ";
        var url = "";
        var basicAuthz = btoa(_frdp_uma_as_oauth2_client_id + ":" + _frdp_uma_as_oauth2_client_secret);
        var XHR = new XMLHttpRequest();
        var strData = "grant_type=urn:ietf:params:oauth:grant-type:uma-ticket"
           + "&ticket=" + _frdp_uma_perm_ticket
           + "&scope=" + textResourceScopes.val()
           + "&claim_token=" + textareaResourceClaimTokenEncode.val()
           + "&claim_token_format=http://openid.net/specs/openid-connect-core-1_0.html#IDToken";

        event.preventDefault();

        btnResourceGetRPT.prop("disabled", true);

        url = _frdp_uma_as_oauth2_url + "/access_token";

        console.info(fnName + "XMLHttpRequest(): POST: " + url);

        XHR.open("POST", url);
        XHR.setRequestHeader("authorization", "Basic " + basicAuthz);
        XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        XHR.addEventListener("load", xhrRPT);
        XHR.addEventListener("error", xhrRPT);
        XHR.send(strData);
    });

    btnResourceReset.click(function (event) {
        /*
         * Handle button click for "Reset"
         * stop default event handler from running
         */

        event.preventDefault();

        reset();
    });

    btnDiscoverSubmit.click(function (event) {
        /*
         * Handle button click for Discover Submit
         * stop default event handler from running
         * Calls xhrLoadDiscovered for success and error
         */

        var fnName = "btnDiscoverSubmit.click(): ";
        var XHR = new XMLHttpRequest();
        var cookie = getCookie();
        var url = "";

        event.preventDefault();

        url = _frdp_uma_rs_discover;

        console.info(fnName + "XMLHttpRequest(): GET: " + url);

        XHR.open("GET", url);
        XHR.setRequestHeader("x-frdp-ssotoken", cookie);
        XHR.addEventListener("load", xhrLoadDiscovered);
        XHR.addEventListener("error", xhrLoadDiscovered);
        XHR.send();
    });

    btnDiscoverClear.click(function (event) {
        /*
         * Handle button click for Discover Clear
         * stop default event handler from running
         */

        event.preventDefault();

        _frdp_uma_rs_filter_discover = "";

        tableBodyDiscover.html("");
        textDiscoverFilterName.val("");
        textDiscoverFilterType.val("");
        textDiscoverFilterName.prop("disabled", true);
        textDiscoverFilterType.prop("disabled", true);
        radioDiscoverFilterNone.prop('checked', true);

        updateDiscoverURI();
    });

    btnSharedSubmit.click(function (event) {
        /*
         * Handle button click for Shared-With-Me Submit
         * stop default event handler from running
         */

        var fnName = "btnSharedSubmit.click(): ";
        var XHR = new XMLHttpRequest();
        var cookie = getCookie();
        var url = "";

        event.preventDefault();

        url = _frdp_uma_rs_shared;

        console.info(fnName + "XMLHttpRequest(): GET: " + url);

        XHR.open("GET", url);
        XHR.setRequestHeader("x-frdp-ssotoken", cookie);
        XHR.addEventListener("load", xhrLoadShared);
        XHR.addEventListener("error", xhrLoadShared);
        XHR.send();
    });

    btnSharedClear.click(function (event) {
        /*
         * Handle button click for Shared-With-Me Clear
         * stop default event handler from running
         */

        _frdp_uma_rs_filter_shared = "";

        event.preventDefault();

        tableBodyShared.html("");
        textSharedFilterName.val("");
        textSharedFilterType.val("");
        textSharedFilterName.prop("disabled", true);
        textSharedFilterType.prop("disabled", true);
        radioSharedFilterNone.prop('checked', true);

        updateSharedURI();
    });

    radioDiscoverFilter.change(function () {
        /*
         * Handle Discover Filter radio button change
         * update the UI
         */

        var value = $(this).val();

        if (value === 'name') {
            textDiscoverFilterName.prop("disabled", false);
            textDiscoverFilterType.prop("disabled", true);
            textDiscoverFilterName.focus();
        } else if (value === 'type') {
            textDiscoverFilterName.prop("disabled", true);
            textDiscoverFilterType.prop("disabled", false);
            textDiscoverFilterType.focus();
        } else {
            textDiscoverFilterName.prop("disabled", true);
            textDiscoverFilterType.prop("disabled", true);
        }

        _frdp_uma_rs_filter_discover = value;

        updateDiscoverURI();
    });

    radioSharedFilter.change(function () {
        /*
         * Handle Shared-With-Me Filter radio button change
         * update the UI
         */

        var value = $(this).val();

        if (value === 'name') {
            textSharedFilterName.prop("disabled", false);
            textSharedFilterType.prop("disabled", true);
            textSharedFilterName.focus();
        } else if (value === 'type') {
            textSharedFilterName.prop("disabled", true);
            textSharedFilterType.prop("disabled", false);
            textSharedFilterType.focus();
        } else {
            textSharedFilterName.prop("disabled", true);
            textSharedFilterType.prop("disabled", true);
        }

        _frdp_uma_rs_filter_shared = value;

        updateSharedURI();
    });

    reset();

    getUserData(updateUserData); // external Javascript

    checkQueryParams();

});