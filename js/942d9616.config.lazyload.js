// lazyload config

angular.module('app')
    /**
   * jQuery plugin config use ui-jq directive , config the js and css files that required
   * key: function name of the jQuery plugin
   * value: array of the css js file located
   */
  .constant('JQ_CONFIG', {
      easyPieChart:   ['vendor/jquery/charts/easypiechart/26cb504c.jquery.easy-pie-chart.js'],
      sparkline:      ['vendor/jquery/charts/sparkline/3714a809.jquery.sparkline.min.js'],
      plot:           ['vendor/jquery/charts/flot/775e4a0e.jquery.flot.min.js', 
                          'vendor/jquery/charts/flot/2fb5b844.jquery.flot.resize.js',
                          'vendor/jquery/charts/flot/eadf184c.jquery.flot.tooltip.min.js',
                          'vendor/jquery/charts/flot/b15ce1de.jquery.flot.spline.js',
                          'vendor/jquery/charts/flot/9eed58e9.jquery.flot.orderBars.js',
                          'vendor/jquery/charts/flot/73748b8d.jquery.flot.pie.min.js'],
      slimScroll:     ['vendor/jquery/slimscroll/f2be7c10.jquery.slimscroll.min.js'],
      sortable:       ['vendor/jquery/sortable/def0abb3.jquery.sortable.js'],
      nestable:       ['vendor/jquery/nestable/8a1f5022.jquery.nestable.js',
                          'vendor/jquery/nestable/e66724b6.nestable.css'],
      filestyle:      ['vendor/jquery/file/84e2736f.bootstrap-filestyle.min.js'],
      slider:         ['vendor/jquery/slider/ea7fc9a7.bootstrap-slider.js',
                          'vendor/jquery/slider/649386e7.slider.css'],
      chosen:         ['vendor/jquery/chosen/88e758d9.chosen.jquery.min.js',
                          'vendor/jquery/chosen/ff6c648a.chosen.css'],
      TouchSpin:      ['vendor/jquery/spinner/93523924.jquery.bootstrap-touchspin.min.js',
                          'vendor/jquery/spinner/d37531a0.jquery.bootstrap-touchspin.css'],
      wysiwyg:        ['vendor/jquery/wysiwyg/54f3c178.bootstrap-wysiwyg.js',
                          'vendor/jquery/wysiwyg/9a51be56.jquery.hotkeys.js'],
      dataTable:      ['vendor/jquery/datatables/d0e760d2.jquery.dataTables.min.js',
                          'vendor/jquery/datatables/d849892c.dataTables.bootstrap.js',
                          'vendor/jquery/datatables/f91e4fee.dataTables.bootstrap.css'],
      vectorMap:      ['vendor/jquery/jvectormap/3b9a1346.jquery-jvectormap.min.js', 
                          'vendor/jquery/jvectormap/a4dbb660.jquery-jvectormap-world-mill-en.js',
                          'vendor/jquery/jvectormap/092cee9b.jquery-jvectormap-us-aea-en.js',
                          'vendor/jquery/jvectormap/a1cb7c40.jquery-jvectormap.css'],
      footable:       ['vendor/jquery/footable/98a3f0ed.footable.all.min.js',
                          'vendor/jquery/footable/a0697cc5.footable.core.css']
      }
  )
  // oclazyload config
  .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
      // We configure ocLazyLoad to use the lib script.js as the async loader
      $ocLazyLoadProvider.config({
          debug:  false,
          events: true,
          modules: [
              {
                  name: 'ngGrid',
                  files: [
                      'vendor/modules/ng-grid/29a97a95.ng-grid.min.js',
                      'vendor/modules/ng-grid/b84bbe4b.ng-grid.min.css',
                      'vendor/modules/ng-grid/891ba609.theme.css'
                  ]
              },
              {
                  name: 'ui.select',
                  files: [
                      'vendor/modules/angular-ui-select/f86bd571.select.min.js',
                      'vendor/modules/angular-ui-select/9e8e423b.select.min.css'
                  ]
              },
              {
                  name:'angularFileUpload',
                  files: [
                    'vendor/modules/angular-file-upload/744164b0.angular-file-upload.min.js'
                  ]
              },
              {
                  name:'ui.calendar',
                  files: ['vendor/modules/angular-ui-calendar/3cb49ca2.calendar.js']
              },
              {
                  name: 'ngImgCrop',
                  files: [
                      'vendor/modules/ngImgCrop/c181c396.ng-img-crop.js',
                      'vendor/modules/ngImgCrop/a9628919.ng-img-crop.css'
                  ]
              },
              {
                  name: 'angularBootstrapNavTree',
                  files: [
                      'vendor/modules/angular-bootstrap-nav-tree/61087bc9.abn_tree_directive.js',
                      'vendor/modules/angular-bootstrap-nav-tree/343ad029.abn_tree.css'
                  ]
              },
              {
                  name: 'toaster',
                  files: [
                      'vendor/modules/angularjs-toaster/bb0862f9.toaster.js',
                      'vendor/modules/angularjs-toaster/dd1d2815.toaster.css'
                  ]
              },
              {
                  name: 'textAngular',
                  files: [
                      'vendor/modules/textAngular/7a5ae2b5.textAngular-sanitize.min.js',
                      'vendor/modules/textAngular/be272352.textAngular.min.js'
                  ]
              },
              {
                  name: 'vr.directives.slider',
                  files: [
                      'vendor/modules/angular-slider/4ce4ae81.angular-slider.min.js',
                      'vendor/modules/angular-slider/d304676f.angular-slider.css'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular',
                  files: [
                      'vendor/modules/videogular/f8f5930f.videogular.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.controls',
                  files: [
                      'vendor/modules/videogular/plugins/4eafae0b.controls.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.buffering',
                  files: [
                      'vendor/modules/videogular/plugins/a6c4a128.buffering.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.overlayplay',
                  files: [
                      'vendor/modules/videogular/plugins/34f36bdf.overlay-play.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.poster',
                  files: [
                      'vendor/modules/videogular/plugins/fca826f4.poster.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.imaads',
                  files: [
                      'vendor/modules/videogular/plugins/6f3d2b9e.ima-ads.min.js'
                  ]
              }
          ]
      });
  }])
;