// config

var app =  
angular.module('app')
  .config(
    [        '$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
    function ($controllerProvider,   $compileProvider,   $filterProvider,   $provide) {
        
        // lazy controller, directive and service
        app.controller = $controllerProvider.register;
        app.directive  = $compileProvider.directive;
        app.filter     = $filterProvider.register;
        app.factory    = $provide.factory;
        app.service    = $provide.service;
        app.constant   = $provide.constant;
        app.value      = $provide.value;
    }
  ])
  .config(['$translateProvider', function($translateProvider){
    // Register a loader for the static files
    // So, the module will search missing translation tables under the specified urls.
    // Those urls are [prefix][langKey][suffix].
    $translateProvider.useStaticFilesLoader({
      prefix: 'l10n/',
      suffix: '.js'
    });
    // Tell the module what language to use by default
    $translateProvider.preferredLanguage('en');
    // Tell the module to store the language in the local storage
    $translateProvider.useLocalStorage();
  }])
  .config(['uiZeroclipConfigProvider', function(uiZeroclipConfigProvider) {

        // config ZeroClipboard
        uiZeroclipConfigProvider.setZcConf({
            swfPath: '/vendor/ZeroClipboard.swf',
            hoverClass: '',
            activeClass: '',
            debug: false,
            forceHandCursor: true
        });
    }]).config(['notificationServiceProvider', function(notificationServiceProvider) {

        notificationServiceProvider

            .setDefaults({
                history: false,
                delay: 4000,
                closer: false,
                closer_hover: false
            })

            // Configure a stack named 'bottom_right' that append a call 'stack-bottomright'
            .setStack('bottom_right', 'stack-bottomright', {
                dir1: 'up',
                dir2: 'left',
                firstpos1: 25,
                firstpos2: 25
            });
        ;

    }]).value('config', {
        apiUrl:'http://marksmith.biz'
    });