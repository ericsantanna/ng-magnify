/*global angular, DocumentTouch*/

(function () {
  'use strict';

  var magnify = angular.module('ngMagnify', []);

  magnify.directive('ngMagnify', function () {
    return {
      restrict: 'EA',
      replace: true,
      template: '<div class="magnify-container" data-ng-style="getContainerStyle()">' +
                  '<div class="magnify-glass" data-ng-style="getGlassStyle()"></div>' +
                  '<img class="magnify-image" data-ng-src="{{ src }}"/>' +
                '</div>',
      scope: {
        src: '=ngSrc',
        imageWidth: '=',
        imageHeight: '=',
        glassWidth: '=',
        glassHeight: '='
      },
      link: function (scope, element) {
        var glass = element.find('div'),
          image = element.find('img'),
          el, nWidth, nHeight, magnifyCSS;

        if(!scope.src) {
          return;
        }

        // if touch devices, do something
        if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          return;
        }
        element.on('mousemove', function (evt) {
          el = angular.extend(scope.getOffset(element[0]), {
            width: element[0].offsetWidth,
            height: element[0].offsetHeight,
            imageWidth: image[0].offsetWidth,
            imageHeight: image[0].offsetHeight,
            glassWidth: glass[0].offsetWidth,
            glassHeight: glass[0].offsetHeight
          });
          magnifyCSS = scope.magnify(evt);

          if (magnifyCSS) {
            glass.css( magnifyCSS );
          }
        })
        .on('mouseout', function () {
          glass.on('mouseleave', function () {
            glass.css({
              opacity: 0,
              filter: 'alpha(opacity=0)'
            });
          });
        });

        scope.magnify = function (evt) {
          var mx, my, rx, ry, px, py, bgp, img;

          if (!nWidth && !nHeight) {
            img = new Image();
            img.onload = function () {
              nWidth = img.width;
              nHeight = img.height;
            };
            img.src = scope.src;
          } else {
            // IE8 uses evt.x and evt.y
            mx = (evt.pageX) ? (evt.pageX - el.left) : evt.x;
            my = (evt.pageY) ? (evt.pageY - el.top) : evt.y;

            if (mx < el.width && my < el.height && mx > 0 && my > 0) {
              glass.css({
                opacity: 1,
                'z-index': 1,
                filter: 'alpha(opacity=100)'
              });
            } else {
              glass.css({
                opacity: 0,
                'z-index': -1,
                filter: 'alpha(opacity=0)'
              });
              return;
            }

            rx = Math.round(mx/el.imageWidth*nWidth - el.glassWidth/2)*-1;
            ry = Math.round(my/el.imageHeight*nHeight - el.glassHeight/2)*-1;
            bgp = rx + 'px ' + ry + 'px';

            px = mx - el.glassWidth/2;
            py = my - el.glassHeight/2;

            return { left: px + 'px', top: py + 'px', backgroundPosition: bgp };
          }
        };

        scope.getOffset = function (_el) {
          var de = document.documentElement;
          var box = _el.getBoundingClientRect();
          var top = box.top + window.pageYOffset - de.clientTop;
          var left = box.left + window.pageXOffset - de.clientLeft;
          return { top: top, left: left };
        };

        scope.getContainerStyle = function () {
          return {
            width: (scope.imageWidth) ? scope.imageWidth + 'px' : '',
            height: (scope.imageHeight) ? scope.imageHeight + 'px' : ''
          };
        };

        scope.getGlassStyle = function () {
          return {
            background: 'url("' + scope.src + '") no-repeat',
            // backgroundSize: scope.imageWidth + 'px ' + scope.imageHeight + 'px',
            // transform: 'scale(' + 2.5 + ')',
            width: (scope.glassWidth) ? scope.glassWidth + 'px' : '',
            height: (scope.glassHeight) ? scope.glassHeight + 'px' : ''
          };
        };
      }
    };
  });
})();
