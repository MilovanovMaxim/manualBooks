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
                  templateUrl: 'tpl/show.html'
              })
              
              .state('show.recommendation', {
                  url: '/recommendation',
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
                  url: '/guidepages/{fold}',
				  views: {
                      '': {
                          templateUrl: 'tpl/show.guidepages.html'
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