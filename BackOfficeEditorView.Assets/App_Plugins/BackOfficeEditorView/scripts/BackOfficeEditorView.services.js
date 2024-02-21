function backOfficeEditorViewServices($rootScope, $q, assetsService, eventsService) {

    if (typeof (Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath) == 'undefined') {
        console.log("boev :: path isn't set yet");
        //return {};
    }

    var proxy = null;
    const sessionCookieId = '_boev_sessionid';
    let sessionId = '';

    var initialize = function () {
        var scripts = [
            //Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath + '/lib/signalr/signalr.min.js']
            '/umbraco/lib/signalr/signalr.min.js']

        sessionId = Cookies.get(sessionCookieId);
        if (typeof (sessionId) == 'undefined') {
            // Not quite a UUID, but good enough
            sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        }

        window.boevSessionId = sessionId;
        Cookies.set(sessionCookieId, sessionId, { secure: true, sameSite: 'strict' });

        var completedPromise = new Promise((resolve, reject) => {

            var promises = [];
            scripts.forEach(function (script) {
                promises.push(assetsService.loadJs(script));
            });

            $q.all(promises)
                .then(function () {
                    hubSetup(resolve);
                });
        });

        return completedPromise;
    }

    function hubSetup(resolve) {
        //Creating proxy
        if (proxy == null) {
            if (typeof (signalR) == 'undefined' || typeof(Umbraco.Sys.ServerVariables.boev) == 'undefined') {
                //If we're not defined here then something's gone wrong with the loading of the plugin...
                console.log("boev :: Unable to setup, SignalR or Umbraco.Sys.ServerVariables.boev undefined")
                return;
            }
            $.connection = new signalR.HubConnectionBuilder()
                .withUrl(Umbraco.Sys.ServerVariables.boev.signalRHub)
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Warning)
                .build();
            proxy = $.connection.SyncHub;
        }

        // This event is fired from the server when someone looks at something!
        // The data it returns is a list of the user and the content they are looking at.
        // Tie into a custom event by listening to $rootScope.$on("boev_messageReceived", (ev, data) { ... });
        $.connection.on('ContentViewed', (data) => {
            eventsService.emit("boev.messageReceived", { eventName: 'ContentViewed', data });
        });

        $.connection.on('ContentLocked', (data) => {
            eventsService.emit("boev.contentLockedMessageReceived", { eventName: 'ContentLocked', data });
        });

        // Start the connection with the server to put it in an open state and ready
        // to communicate
        $.connection.start().then(function (e, f, g) {
            resolve();
        });
    };

    // Send a message to the server to say the given user is viewing the given content
    var registerView = function (viewData) {
        viewData.sessionId = sessionId;
        $.connection.send('RegisterView', viewData);
    }

    // Send a message to the server to say the given user has stopped viewing content
    var removeViews = function (user) {
        $.connection.send('removeViews', sessionId);
    }

    var getContentLocks = function (contentId, culture = '') {
        $.connection.send('GetContentLocksForContentId', contentId, culture);
    }

    var addUserLock = function (lockData) {
        lockData.sessionId = sessionId;
        $.connection.send('AddContentLockForUser', lockData);
    }

    var removeUserLock = function (lockData) {
        $.connection.send('RemoveContentLockForUser', lockData);
    }
    
    return {
        initialize,
        registerView,
        removeViews,
        getContentLocks,
        addUserLock,
        removeUserLock
    };
};

angular.module('umbraco.resources').factory('backOfficeEditorViewServices', backOfficeEditorViewServices);
