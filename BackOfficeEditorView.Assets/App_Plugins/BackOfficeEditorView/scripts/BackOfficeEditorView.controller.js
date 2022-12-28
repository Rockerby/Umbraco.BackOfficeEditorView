(function () {
    'use strict';

    var editingButtonComponent = {
        templateUrl: '/App_Plugins/BackOfficeEditorView/components/editingButton.html',
        bindings: {},
        controllerAs: 'vm',
        controller: backOfficeEditorViewMenuController
    };

    function backOfficeEditorViewMenuController($scope, $rootScope, eventsService, editorService, $routeParams) {

        var vm = this;
        vm.openViewDrawer = openViewDrawer;
        vm.mainClass = '';
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

        function contentViewChangeReceived(eventData) {
            var messages = eventData.data;
            // Look for any content that matches what we're looking at (but isn't us)
            var matchingContent = messages.filter((item) => {
                return item.sessionId != window.boevSessionId && item.contentId == parseInt($routeParams.id)
            });

            if (typeof (matchingContent) == 'undefined')
                matchingContent = [];

            if (matchingContent.length > 0)
                vm.mainClass = 'active';
            else
                vm.mainClass = '';

            vm.userList = matchingContent;
        }

        // Listen for messages on the events service so we can action
        let msgRcvdHandlerUnsub = eventsService.on("boev.messageReceived", function (ev, args) {
            contentViewChangeReceived(args);
        });

        $scope.$on("$destroy", function () {
            msgRcvdHandlerUnsub();
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
        .component('editingButton', editingButtonComponent);

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

    function backOfficeEditorViewContentController($scope, $rootScope, backOfficeEditorViewServices, $routeParams) {

        var oldHref = document.location.href;
        var injector = angular.element('#umbracoMainPageBody').injector();
        var authResource = injector.get('authResource');

        // Initialise the services and trigger our functions when it's done
        backOfficeEditorViewServices.initialize().then(() => {
            processPage();
        });

        function processPage() {
            if (location.hash.indexOf('/content') == 1 && location.hash.indexOf('edit') !== -1) {
                console.log("WHAT UP!");
                let attempts = 0;
                const timeout = 100;
                function loadMarkup() {
                    console.log('namefield?', $('#nameField'));
                    // On accassion, this script can load faster than the markup, so try
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
                        var scope = obj.scope();
                        if (scope != undefined) {
                            obj[0].appendChild(document.createElement('editing-button'));
                            $compile(obj.contents())(scope);
                        }
                    });

                    // Get the user and notify the server that they are looking at a specific bit of content
                    authResource.getCurrentUser().then(function (user) {
                        console.log("user", user);
                        const viewData = {
                            sessionId: window.boevSessionId,
                            userId: user.id,
                            userName: user.name,
                            contentId: $routeParams.id
                        };
                        backOfficeEditorViewServices.registerView(viewData);
                    });
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
        };
        // no need to unsubscribe to this as the browser window is gone!
        window.addEventListener("beforeunload", beforeUnloadListener);

        //$scope.$on("$destroy", function (a, b) {
        //    console.log("Main controller being DESTROYED")
        //});
    }

    angular.module('umbraco')
        .controller('backOfficeEditorViewController', backOfficeEditorViewController);
    angular.module('umbraco')
        .controller('backOfficeEditorViewContentController', backOfficeEditorViewContentController);
})();





