(function () {
    'use strict';

    var editingButtonComponent = {
        templateUrl: '/App_Plugins/BackOfficeEditorView/components/editingButton.html',
        bindings: {},
        controllerAs: 'vm',
        controller: backOfficeEditorViewMenuController
    };

    function backOfficeEditorViewMenuController($scope, $rootScope, eventsService, editorService, $routeParams, backOfficeEditorViewServices) {
        var injector = angular.element('#umbracoMainPageBody').injector();
        var authResource = injector.get('authResource');
        var isCultureAware = Umbraco.Sys.ServerVariables.boev.isCultureAware === true;

        var vm = this;
        vm.openViewDrawer = openViewDrawer;
        vm.mainClass = '';
        vm.showLockedFn = Umbraco.Sys.ServerVariables.boev.enabledLockFunction || false;
        vm.isLocked = false;
        vm.toggleLocked = toggleLocked;
        vm.lockedClass = '';
        vm.lockedByOtherUser = '';
        vm.lockedByUserEmail = '';

        vm.close = function () {
            editorService.close();
        }
        vm.userList = [];

        function openViewDrawer() {

            const userEditor = {
                size: "small",
                view: "/App_Plugins/BackOfficeEditorView/views/editingDrawer.html",
                userList: vm.userList,
                close: function () {
                    editorService.close();
                }
            };

            editorService.open(userEditor);
        }

        function toggleLocked() {
            if (vm.lockedByOtherUser !== '') {
                alert(`This content has been locked by ${vm.lockedByOtherUser} (${vm.lockedByUserEmail})`);
            } else {
                vm.isLocked = !vm.isLocked;
                authResource.getCurrentUser().then(function (user) {
                    const lockData = {
                        sessionId: window.boevSessionId,
                        userId: user.id,
                        userName: user.name,
                        userEmail: user.email,
                        contentId: $routeParams.id
                    };

                    if (isCultureAware) {
                        lockData.culture = $routeParams.cculture ?? $routeParams.mculture;
                    }

                    if (vm.isLocked) {
                        backOfficeEditorViewServices.addUserLock(lockData);
                    } else {
                        backOfficeEditorViewServices.removeUserLock(lockData);
                    }
                });               
            }
        }
       
        let contentLockedUnsub = eventsService.on("contentLocked", function (ev, args) {
            if (vm.isLocked != args.lockedData.contentIsLocked) {
                vm.isLocked = args.lockedData.contentIsLocked;
                vm.lockedByOtherUser = args.lockedData.lockedByUserName;
                vm.lockedClass = args.lockedData.contentIsLockedByOtherUser ? 'active' : '';
                vm.lockedByUserEmail = args.lockedData.lockedByUserEmail;
            }
        });

        let contentViewedUnsub = eventsService.on("contentViewed", function (ev, args) {   
            vm.mainClass = args.contentView.mainClass;
            vm.userList = args.contentView.userList;
        });

        $scope.$on("$destroy", function () {
            contentViewedUnsub();
            contentLockedUnsub();
        });

    }

    ///
    /// The controller for the side drawer showing the user list
    ///
    function backOfficeEditorViewDrawerController($scope, $rootScope, eventsService, editorService, $routeParams, appState) {

        var vm = this;
        vm.close = function () {
            editorService.close();
        }
        vm.userList = $scope.model.userList;
        vm.avatar = [
            { value: "assets/img/application/logo.png" },
            { value: "assets/img/application/logo@2x.png" },
            { value: "assets/img/application/logo@3x.png" }
        ];

        $scope.vm = vm;
    }

    angular.module('umbraco')
        .component('backOfficeEditorViewEditingButton', editingButtonComponent);

    angular.module('umbraco')
        .controller('backOfficeEditorViewDrawerController', backOfficeEditorViewDrawerController);
})();

(function () {
    'use strict';

    function backOfficeEditorViewController($scope, $q, $controller,
        backOfficeEditorViewServices) {

        var vm = this;

        vm.versionInfo = {
            IsCurrent: true
        };

        $scope.vm = vm;

        init();

        function init() {
            initHub();
        }

        function initHub() {
            backOfficeEditorViewServices.initialize(function (hub) {

                vm.hub = hub;

                vm.hub.on('add', function (data) {
                    vm.status = data;
                });

                vm.hub.on('update', function (update) {
                    vm.update = update;
                });

                vm.hub.start();
            });
        }

        //function getClientId() {
        //    if ($.connection !== undefined) {
        //        return $.connection.connectionId;
        //    }
        //    return "";
        //}
    }

    function backOfficeEditorViewContentController($scope, $rootScope, backOfficeEditorViewServices, $routeParams, eventsService) {
        var oldHref = document.location.href;
        var injector = angular.element('#umbracoMainPageBody').injector();
        var authResource = injector.get('authResource');
        var isCultureAware = Umbraco.Sys.ServerVariables.boev.isCultureAware === true;

        // Initialise the services and trigger our functions when it's done
        backOfficeEditorViewServices.initialize().then(() => {
            processPage();
        });

        function processPage() {
            if (location.hash.indexOf('/content') == 1 && location.hash.indexOf('edit') !== -1) {
                let attempts = 0;
                const timeout = 100;
                function loadMarkup() {
                    // On occasion, this script can load faster than the markup, so try
                    // to load in the content or retry if the name bar doesn't exist
                    if ($('#nameField').length == 0) {
                        if (attempts++ <= 10000 / timeout) {
                            setTimeout(() => {
                                loadMarkup();
                            }, timeout);
                        }
                        return;
                    }

                    // Just check we're not already init'd here
                    if ($('#boev_main-wrapper_outter').length > 0)
                        return;
                    $('#nameField').before('<div id="boev_main-wrapper_outter"></div>');

                    // Have Angular load in the HTML and the NG controller!
                    injector.invoke(function ($compile) {
                        var obj = $('#boev_main-wrapper_outter');
                        //var scope = obj.scope();
                        //if (scope != undefined) {
                        let btnWrapper = document.createElement('back-office-editor-view-editing-button');
                        btnWrapper.className = 'boev_editing-buttons';

                        obj[0].appendChild(btnWrapper);
                        $compile(obj.contents())($scope);
                        //}
                    });

                    // Get the user and notify the server that they are looking at a specific bit of content
                    authResource.getCurrentUser().then(function (user) {
                        const viewData = {
                            sessionId: window.boevSessionId,
                            userId: user.id,
                            userName: user.name,
                            contentId: $routeParams.id
                        };

                        if (isCultureAware) {
                            viewData.culture = $routeParams.cculture ?? $routeParams.mculture;
                        }

                        backOfficeEditorViewServices.registerView(viewData);
                    });
                    if (Umbraco.Sys.ServerVariables.boev.enabledLockFunction || false) {
                        // delay the call for content locks on page load, because it can beat the component render
                        setTimeout(() => {
                            // making sure everything is unlocked on the view before reassessing the locked state
                            toggleViewInactive(false);

                            if (isCultureAware) {
                                backOfficeEditorViewServices.getContentLocks($routeParams.id, $routeParams.cculture ?? $routeParams.mculture);
                            }
                            else {
                                backOfficeEditorViewServices.getContentLocks($routeParams.id);
                            }
                        }, 500);
                    }
                }
                loadMarkup();
            } else {
                // This is taken care of with the destoy function within the backOfficeEditorViewMenuController

                // If we're not on a page that has any content nodes then remove the user
                // from the list of content viewed
                //authResource.getCurrentUser().then(function (user) {
                  //  backOfficeEditorViewServices.removeViews(user.id);
                //});
            }
        }

        // Listen for changes in the URL so we can trigger the page view
        function setupUrlListener() {
            var bodyList = document.querySelector("body")

            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (oldHref != document.location.href) {
                        oldHref = document.location.href;
                        processPage();

                        // if enabled lock functionality then also ensure unlock the page
                        if (Umbraco.Sys.ServerVariables.boev.enabledLockFunction || false) {
                            authResource.getCurrentUser().then(function (user) {
                                const lockData = {
                                    sessionId: window.boevSessionId,
                                    userId: user.id,
                                    userName: user.name,
                                    userEmail: user.email,
                                    contentId: $routeParams.id
                                };

                                if (isCultureAware) {
                                    lockData.culture = $routeParams.cculture ?? $routeParams.mculture;
                                }

                                backOfficeEditorViewServices.removeUserLock(lockData);
                            });
                        }
                    }
                });
            });

            var config = {
                childList: true,
                subtree: true
            };

            observer.observe(bodyList, config);
        }

        setupUrlListener();


        // This gets fired when the user leaves the page (i.e. closes the browser or tab)
        // It's not reliably fired but good enough for our purpose
        const beforeUnloadListener = (event) => {
            // Signal to the server that we're out of here
            backOfficeEditorViewServices.removeViews();

            // if enabled lock functionality then also ensure unlock the page
            if (Umbraco.Sys.ServerVariables.boev.enabledLockFunction || false) {
                
                authResource.getCurrentUser().then(function (user) {
                    const lockData = {
                        sessionId: window.boevSessionId,
                        userId: user.id,
                        userName: user.name,
                        userEmail: user.email,
                        contentId: $routeParams.id
                    };

                    if (isCultureAware) {
                        lockData.culture = $routeParams.cculture ?? $routeParams.mculture;
                    }

                    backOfficeEditorViewServices.removeUserLock(lockData);
                });
            }
        };
        // no need to unsubscribe to this as the browser window is gone!
        window.addEventListener("beforeunload", beforeUnloadListener);

        function lockedContentChangeReceived(eventData) {
            var messages = eventData.data;
            var matchingContent = messages.filter((item) => {
                var isMatch = item.contentId === parseInt($routeParams.id);

                if (isCultureAware) {
                    isMatch = isMatch && item.culture === ($routeParams.cculture ?? $routeParams.mculture);
                }

                return isMatch;
            });

            if (typeof (matchingContent) == 'undefined') {
                matchingContent = [];
            }

            const contentIsLocked = matchingContent.length > 0;
            let lockedByOtherUser = matchingContent.filter(item => item.sessionId != window.boevSessionId);
            const contentIsLockedByOtherUser = lockedByOtherUser.length > 0;

            toggleViewInactive(contentIsLockedByOtherUser);

            let lockedData = {
                contentIsLocked: contentIsLocked,
                contentIsLockedByOtherUser: contentIsLockedByOtherUser,
                lockedByUserName: lockedByOtherUser.length > 0 ? lockedByOtherUser[0].userName : '',
                lockedByUserEmail: lockedByOtherUser.length > 0 ? lockedByOtherUser[0].userEmail : ''
            }
            
            eventsService.emit("contentLocked", { eventName: 'ContentLocked', lockedData });
            
            if (contentIsLockedByOtherUser) {
                alert(`This content has been locked by ${lockedByOtherUser[0].userName} (${lockedByOtherUser[0].userEmail})`);
            }
        }

        function toggleViewInactive(shouldLock) {
            setTimeout(() => {
                const elementsToToggle = [
                    '[data-element="editor-container"]',
                    '[data-element="editor-footer"]',
                    'ng-form[name="headerNameForm"]',
                    '[data-element="editor-actions"]'
                ];

                elementsToToggle.forEach(selector => {
                    document.querySelectorAll(selector).forEach(element => {
                        if (element) {
                            element.style.pointerEvents = shouldLock ? "none" : "auto";
                        }
                    });
                });
            }, 1000);
        }

        function contentViewChangeReceived(eventData) {
            var messages = eventData.data;
            // Look for any content that matches what we're looking at (but isn't us)
            var matchingContent = messages.filter((item) => {
                var isMatch = item.sessionId !== window.boevSessionId && item.contentId === parseInt($routeParams.id);

                if (isCultureAware) {
                    isMatch = isMatch && item.culture === ($routeParams.cculture ?? $routeParams.mculture);
                }

                return isMatch;
            });

            if (typeof (matchingContent) == 'undefined') {
                matchingContent = [];
            }

            let mainClass = ''
            if (matchingContent.length > 0) {
                mainClass = 'active';
            }

            let contentView = {
                mainClass: mainClass,
                userList: matchingContent
            }
            eventsService.emit("contentViewed", { eventName: 'ContentViewed', contentView });
        }

        
        let msgRcvdHandlerLockedContentUnsub = eventsService.on("boev.contentLockedMessageReceived", function (ev, args) {
            lockedContentChangeReceived(args);
        });

        // Listen for messages on the events service so we can action
        let msgRcvdHandlerUnsub = eventsService.on("boev.messageReceived", function (ev, args) {
            contentViewChangeReceived(args);
        });

        $scope.$on("$destroy", function () {
            msgRcvdHandlerUnsub();
            msgRcvdHandlerLockedContentUnsub();
        });
    }

    angular.module('umbraco')
        .controller('backOfficeEditorViewController', backOfficeEditorViewController);
    angular.module('umbraco')
        .controller('backOfficeEditorViewContentController', backOfficeEditorViewContentController);
})();





