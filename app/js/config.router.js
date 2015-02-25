'use strict';

/**
 * Config for the router
 */
angular.module('app')
  .run(
    [          '$rootScope', '$state', '$stateParams',
      function ($rootScope,   $state,   $stateParams) {
          $rootScope.$state = $state;
          $rootScope.$stateParams = $stateParams;        
      }
    ]
  )
  .config(
    [          '$stateProvider', '$urlRouterProvider',
      function ($stateProvider,   $urlRouterProvider) {

          function permissions (userRole1 /*userRole2, ...*/){
              var roles = Array.prototype.slice.call(arguments, 0);
              permissionChecker.$inject = ['profileService', '$q','$state', '$rootScope', '$timeout'];
              return permissionChecker;

              function permissionChecker(profileService, $q, $state, $rootScope, $timeout){
                  var defer = $q.defer(),
                      hasRole = false;

                  _.each(roles, function(role){
                      hasRole = profileService.hasRole(role) || hasRole;
                  });

                  if (!hasRole){
                      $timeout(function() {
                          $state.go('access.signin');
                      }, 100);
                  }
                  hasRole ? defer.resolve() : defer.reject();
                  return defer.promise;
              }
          }

          $urlRouterProvider
              .otherwise('access/signin');
          $stateProvider
              .state('app', {
                  abstract: true,
                  url: '/app',
                  templateUrl: 'tpl/app.html'
              })

			  ///////////// Access

			  .state('lockme', {
                  url: '/lockme',
                  templateUrl: 'tpl/page_lockme.html'
              })
              .state('access', {
                  url: '/access',
                  template: '<div ui-view class="fade-in-right-big smooth"></div>'
              })
              .state('access.signin', {
                  url: '/signin',
                  templateUrl: 'tpl/page_signin.html',
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/signin.js'] );
                      }]
                  }
              })
              .state('access.signup', {
                  url: '/signup',
                  templateUrl: 'tpl/page_signup.html',
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/signup.js'] );
                      }]
                  }
              })
              .state('access.forgotpwd', {
                  url: '/forgotpwd',
                  templateUrl: 'tpl/page_forgotpwd.html',
                  resolve: {
                      deps: ['uiLoad',
                          function( uiLoad ){
                              return uiLoad.load( ['js/controllers/forgotPwd.js'] );
                          }]
                  }
              })

              .state('access.404', {
                  url: '/404',
                  templateUrl: 'tpl/page_404.html'
              })


			  ///////////// sections

              .state('show', {
                  abstract: true,
                  url: '/show',
                  templateUrl: 'tpl/show.html',
                  resolve:{
                      permissions:permissions('standard', 'admin', 'superadmin')
                  }
              })

              .state('show.recommendation', {
                  url: '/recommendation',
                  resolve: {
                      deps: ['uiLoad',
                          function( uiLoad ){
                              return uiLoad.load( ['js/controllers/recommendation.js'] );
                          }]
                  },
				  views: {
                      '': {
                          templateUrl: 'tpl/show.recommendation.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/show.footer.html'
                      }
                  }
              })

              .state('show.glossary', {
                  url: '/glossary/:id',
                  views: {
                      '': {
                          templateUrl: 'tpl/show.glossary.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/show.footer.html'
                      }
                  },
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/glossary.js'] );
                      }]
                  }
              })

              .state('show.screencast', {
                  url: '/screencast',
				  views: {
                      '': {
                          templateUrl: 'tpl/show.screencast.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/show.footer.html'
                      }
                  }
              })

			  .state('show.guideversions', {
                  url: '/guideversions/{fold}',
                  resolve: {
                      deps: ['uiLoad',
                          function( uiLoad ){
                              return uiLoad.load( ['js/controllers/guideversions.js'] );
                          }]
                  },
				  views: {
                      '': {
                          templateUrl: 'tpl/show.guideversions.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/show.footer.html'
                      }
                  }
              })

			  .state('show.guidepages', {
                  url: '/guidepages/{fold}?title&version&page',
                  resolve: {
                      deps: ['uiLoad',
                          function( uiLoad ){
                              return uiLoad.load( ['js/controllers/guidepages.js'] );
                          }]
                  },
				  views: {
                      '': {
                          templateUrl: 'tpl/show.guidepages.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/show.footer.html'
                      }
                  }
              })

              .state('show.page', {
                 url:'/guidepage/{fold}',
                  resolve: {
                      deps: ['uiLoad',
                          function( uiLoad ){
                              return uiLoad.load( ['js/controllers/pageController.js'] );
                          }]
                  },
                  views:{
                      '': {
                          templateUrl: 'tpl/show.page.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/show.footer.html'
                      }
                  }
              })

			  .state('show.guidemanage', {
                  url: '/guidemanage/{fold}',
				  views: {
                      '': {
                          templateUrl: 'tpl/show.guidemanage.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/show.footer.html'
                      }
                  }
              })

			  .state('show.usersmanage', {
                  url: '/usersmanage',
				  views: {
                      '': {
                          templateUrl: 'tpl/show.usersmanage.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/show.footer.html'
                      }
                  }
              })
			  
			  .state('show.user', {
                  url: '/user/{fold}',
                  resolve: {
                      deps: ['uiLoad',
                          function( uiLoad ){
                              return uiLoad.load( ['js/controllers/profile.js'] );
                          }]
                  },
				  views: {
                      '': {
                          templateUrl: 'tpl/show.user.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/show.footer.html'
                      }
                  }
              })

			  .state('show.settings', {
                  url: '/settings',
				  views: {
                      '': {
                          templateUrl: 'tpl/show.settings.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/show.footer.html'
                      }
                  }
              })

			  .state('show.search', {
                  'url': '/search/{searchString}',
                  resolve: {
                      deps: ['uiLoad',
                          function( uiLoad ){
                              return uiLoad.load( ['js/controllers/search.js'] );
                          }]
                  },
                  views: {
                      '': {
                          templateUrl: 'tpl/show.search.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/show.footer.html'
                      }
                  }
              });
			  ////////////////


      }
    ]
  );
