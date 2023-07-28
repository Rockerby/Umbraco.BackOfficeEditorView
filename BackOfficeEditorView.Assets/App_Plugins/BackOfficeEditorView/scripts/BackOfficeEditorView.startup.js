$(window).on('load',
    () => {
       
        // Load in a new html element which will load in the angular controller for the work
        function addWrapperAndLogic() {
            // This element is visible on all pages when you are logged in
            if ($(".umb-app-header").length && $(".umb-app-header").is(':visible')) {

                // We may already have this loaded in if we're not on the first page load, so don't load > 1!
                if ($("#boev_main-controller").length == 0) {
                    // We know this element is part of the Umbraco Angular system, fetch
                    // the injector so we can tie into the current Angular scope
                    var injector = angular.element('#umbracoMainPageBody').injector();
                    $(".umb-app-header").append('<div id="boev_main"></div>');

                    // Attach the ng-controller to tie it into Angular
                    var html = $('<div id="boev_main-controller" ng-controller="backOfficeEditorViewContentController as vm"></div>');

                    // Have Angular load in the HTML and the NG controller!
                    injector.invoke(function ($compile, $rootScope) {
                        var obj = $('#boev_main');
                        var scope = obj.scope();
                        //if (scope != undefined) {
                            obj.html(html);
                            $compile(obj.contents())($rootScope);
                        //}
                    });
                }
            } else {
                setTimeout(addWrapperAndLogic, 1000);
            }
        };

        addWrapperAndLogic();
    }
);  