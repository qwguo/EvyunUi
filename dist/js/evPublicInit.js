;(function ($, window, document, undefined) {
  //定义的构造函数
  var Drag = function (ele, opt) {
      this.$ele = ele;
      this.x = 0;
      this.y = 0;
      this.defaults = {
        parent: 'parent',
        randomPosition: true,
        direction: 'all',
        handler: false,
        dragStart: function (x, y) {
        },
        dragEnd: function (x, y) {
        },
        dragMove: function (x, y) {
        }
      };
      this.options = $.extend({}, this.defaults, opt);
  };
  //定义方法
  Drag.prototype = {
    run: function () {
      var $this = this;
      var element = this.$ele;
      var randomPosition = this.options.randomPosition; //位置
      var direction = this.options.direction; //方向
      var handler = this.options.handler;
      var parent = this.options.parent;
      var isDown = false; //记录鼠标是否按下
      var fun = this.options; //使用外部函数
      var X = 0,
        Y = 0,
        moveX,
        moveY;
      // 阻止冒泡
      element.find('*').not('img').mousedown(function (e) {
        e.stopPropagation();
      });
      //初始化判断
      if (parent == 'parent') {
        parent = element.parent();
      } else {
        parent = element.parents(parent);
      }
      if (!handler) {
        handler = element;
      } else {
        handler = element.find(handler);
      }
      //初始化
      // parent.css({position: 'relative'});
      // element.css({position: 'absolute'});
      var boxWidth = 0, boxHeight = 0, sonWidth = 0, sonHeight = 0;
      //盒子 和 元素大小初始化
      initSize();
      if (randomPosition) {
        randomPlace();
      }
      /*$(window).resize(function () {
        initSize();
        if (randomPosition) {
          randomPlace();
        }
      });*/

      //盒子 和 元素大小初始化函数
      function initSize() {
        boxWidth = parent.outerWidth();
        boxHeight = parent.outerHeight();
        sonWidth = element.outerWidth();
        sonHeight = element.outerHeight();
      }

      //位置随机函数
      function randomPlace() {
        if (randomPosition) {
          var randX = parseInt(Math.random() * (boxWidth - sonWidth));
          var randY = parseInt(Math.random() * (boxHeight - sonHeight));
          if (direction.toLowerCase() === 'x') {
            element.css({left: randX});
          } else if (direction.toLowerCase() === 'y') {
            element.css({top: randY});
          } else {
            element.css({left: randX, top: randY});
          }
        }
      }

      handler.css({cursor: 'move'}).mousedown(function (e) {
        isDown = true;
        X = e.pageX;
        Y = e.pageY;
        $this.x = element.position().left;
        $this.y = element.position().top;
        element.addClass('on');
        fun.dragStart(parseInt(element.css('left')), parseInt(element.css('top')));
        jqDocument =$(document);
        jqDocument.on('mouseup.popupDrag', function (e) {
          fun.dragEnd(parseInt(element.css('left')), parseInt(element.css('top')));
          element.removeClass('on');
          jqDocument.off('.popupDrag');
          isDown = false;
        });
        jqDocument.on('mousemove.popupDrag', function (e) {
          moveX = $this.x + e.pageX - X;
          moveY = $this.y + e.pageY - Y;
          function thisXMove() { //x轴移动
            if (isDown) {
              element.css({left: moveX});
            } else {
              return;
            }
            if (moveX < 0) {
              element.css({left: 0});
            }
            if (moveX > (boxWidth - sonWidth)) {
              element.css({left: boxWidth - sonWidth});
            }
            return moveX;
          }

          function thisYMove() { //y轴移动
            if (isDown) {
              element.css({top: moveY});
            } else {
              return;
            }
            if (moveY < 0) {
              element.css({top: 0});
            }
            if (moveY > (boxHeight - sonHeight)) {
              element.css({top: boxHeight - sonHeight});
            }
            return moveY;
          }

          function thisAllMove() { //全部移动
            if (isDown) {
              element.css({left: moveX, top: moveY});
            } else {
              return;
            }

            if (moveX < 0) {
              element.css({left: 0});
            }
            if (moveX > (boxWidth - sonWidth)) {
              element.css({left: boxWidth - sonWidth});
            }
            if (moveY < 0) {
              element.css({top: 0});
            }
            if (moveY > (boxHeight - sonHeight)) {
              element.css({top: boxHeight - sonHeight});
            }
          }

          if (isDown) {
            fun.dragMove(parseInt(element.css('left')), parseInt(element.css('top')));
          } else {
            return false;
          }
          if (direction.toLowerCase() === "x") {
            thisXMove();
          } else if (direction.toLowerCase() === "y") {
            thisYMove();
          } else {
            thisAllMove();
          }
        });
        return false;
      });
    }
  };

  //插件
  $.fn.drag = function (options) {
    //创建实体
    var drag = new Drag(this, options);
    //调用方法
    drag.run();
    return this;
  }
})(jQuery, window, document);

/*!
 * jQuery Mousewheel 3.1.13
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 */

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.12',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function(elem) {
            var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },

        getPageHeight: function(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0,
            offsetX    = 0,
            offsetY    = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if ( orgEvent.deltaMode === 1 ) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta  *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if ( orgEvent.deltaMode === 2 ) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta  *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            // Divide all the things by 40!
            delta  /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));

/*
== malihu jquery custom scrollbar plugin == 
Version: 3.1.5 
Plugin URI: http://manos.malihu.gr/jquery-custom-content-scroller 
Author: malihu
Author URI: http://manos.malihu.gr
License: MIT License (MIT)
*/

/*
Copyright Manos Malihutsakis (email: manos@malihu.gr)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
The code below is fairly long, fully commented and should be normally used in development. 
For production, use either the minified jquery.mCustomScrollbar.min.js script or 
the production-ready jquery.mCustomScrollbar.concat.min.js which contains the plugin 
and dependencies (minified). 
*/

(function(factory){
	if(typeof define==="function" && define.amd){
		define(["jquery"],factory);
	}else if(typeof module!=="undefined" && module.exports){
		module.exports=factory;
	}else{
		factory(jQuery,window,document);
	}
}(function($){
(function(init){
	/*var _rjs=typeof define==="function" && define.amd,  RequireJS 
		_njs=typeof module !== "undefined" && module.exports,  NodeJS 
		_dlp=("https:"==document.location.protocol) ? "https:" : "http:",  location protocol 
		_url="cdnjs.cloudflare.com/ajax/libs/jquery-mousewheel/3.1.13/jquery.mousewheel.min.js";
	if(!_rjs){
		if(_njs){
			require("jquery-mousewheel")($);
		}else{
			//  load jquery-mousewheel plugin (via CDN) if it's not present or not loaded via RequireJS 
			// (works when mCustomScrollbar fn is called on window load) 
			$.event.special.mousewheel || $("head").append(decodeURI("%3Cscript src="+_dlp+"//"+_url+"%3E%3C/script%3E"));
		}
	}*/
	init();
}(function(){
	
	/* 
	----------------------------------------
	PLUGIN NAMESPACE, PREFIX, DEFAULT SELECTOR(S) 
	----------------------------------------
	*/
	
	var pluginNS="mCustomScrollbar",
		pluginPfx="mCS",
		defaultSelector=".mCustomScrollbar",
	
	
		
	
	
	/* 
	----------------------------------------
	DEFAULT OPTIONS 
	----------------------------------------
	*/
	
		defaults={
			skin:'1',
			/*
			set element/content width/height programmatically 
			values: boolean, pixels, percentage 
				option						default
				-------------------------------------
				setWidth					false
				setHeight					false
			*/
			/*
			set the initial css top property of content  
			values: string (e.g. "-100px", "10%" etc.)
			*/
			setTop:0,
			/*
			set the initial css left property of content  
			values: string (e.g. "-100px", "10%" etc.)
			*/
			setLeft:0,
			/* 
			scrollbar axis (vertical and/or horizontal scrollbars) 
			values (string): "y", "x", "yx"
			*/
			axis:"y",
			/*
			position of scrollbar relative to content  
			values (string): "inside", "outside" ("outside" requires elements with position:relative)
			*/
			scrollbarPosition:"inside",
			/*
			scrolling inertia
			values: integer (milliseconds)
			*/
			scrollInertia:950,
			/* 
			auto-adjust scrollbar dragger length
			values: boolean
			*/
			autoDraggerLength:true,
			/*
			auto-hide scrollbar when idle 
			values: boolean
				option						default
				-------------------------------------
				autoHideScrollbar			false
			*/
			/*
			auto-expands scrollbar on mouse-over and dragging
			values: boolean
				option						default
				-------------------------------------
				autoExpandScrollbar			false
			*/
			/*
			always show scrollbar, even when there's nothing to scroll 
			values: integer (0=disable, 1=always show dragger rail and buttons, 2=always show dragger rail, dragger and buttons), boolean
			*/
			alwaysShowScrollbar:0,
			/*
			scrolling always snaps to a multiple of this number in pixels
			values: integer, array ([y,x])
				option						default
				-------------------------------------
				snapAmount					null
			*/
			/*
			when snapping, snap with this number in pixels as an offset 
			values: integer
			*/
			snapOffset:0,
			/* 
			mouse-wheel scrolling
			*/
			mouseWheel:{
				/* 
				enable mouse-wheel scrolling
				values: boolean
				*/
				enable:true,
				/* 
				scrolling amount in pixels
				values: "auto", integer 
				*/
				scrollAmount:"auto",
				/* 
				mouse-wheel scrolling axis 
				the default scrolling direction when both vertical and horizontal scrollbars are present 
				values (string): "y", "x" 
				*/
				axis:"y",
				/* 
				prevent the default behaviour which automatically scrolls the parent element(s) when end of scrolling is reached 
				values: boolean
					option						default
					-------------------------------------
					preventDefault				null
				*/
				/*
				the reported mouse-wheel delta value. The number of lines (translated to pixels) one wheel notch scrolls.  
				values: "auto", integer 
				"auto" uses the default OS/browser value 
				*/
				deltaFactor:"auto",
				/*
				normalize mouse-wheel delta to -1 or 1 (disables mouse-wheel acceleration) 
				values: boolean
					option						default
					-------------------------------------
					normalizeDelta				null
				*/
				/*
				invert mouse-wheel scrolling direction 
				values: boolean
					option						default
					-------------------------------------
					invert						null
				*/
				/*
				the tags that disable mouse-wheel when cursor is over them
				*/
				disableOver:["select","option","keygen","datalist","textarea"]
			},
			/* 
			scrollbar buttons
			*/
			scrollButtons:{ 
				/*
				enable scrollbar buttons
				values: boolean
					option						default
					-------------------------------------
					enable						null
				*/
				/*
				scrollbar buttons scrolling type 
				values (string): "stepless", "stepped"
				*/
				scrollType:"stepless",
				/*
				scrolling amount in pixels
				values: "auto", integer 
				*/
				scrollAmount:"auto"
				/*
				tabindex of the scrollbar buttons
				values: false, integer
					option						default
					-------------------------------------
					tabindex					null
				*/
			},
			/* 
			keyboard scrolling
			*/
			keyboard:{ 
				/*
				enable scrolling via keyboard
				values: boolean
				*/
				enable:true,
				/*
				keyboard scrolling type 
				values (string): "stepless", "stepped"
				*/
				scrollType:"stepless",
				/*
				scrolling amount in pixels
				values: "auto", integer 
				*/
				scrollAmount:"auto"
			},
			/*
			enable content touch-swipe scrolling 
			values: boolean, integer, string (number)
			integer values define the axis-specific minimum amount required for scrolling momentum
			*/
			contentTouchScroll:25,
			/*
			enable/disable document (default) touch-swipe scrolling 
			*/
			documentTouchScroll:true,
			/*
			advanced option parameters
			*/
			advanced:{
				/*
				auto-expand content horizontally (for "x" or "yx" axis) 
				values: boolean, integer (the value 2 forces the non scrollHeight/scrollWidth method, the value 3 forces the scrollHeight/scrollWidth method)
					option						default
					-------------------------------------
					autoExpandHorizontalScroll	null
				*/
				/*
				auto-scroll to elements with focus
				*/
				autoScrollOnFocus:"input,textarea,select,button,datalist,keygen,a[tabindex],area,object,[contenteditable='true']",
				/*
				auto-update scrollbars on content, element or viewport resize 
				should be true for fluid layouts/elements, adding/removing content dynamically, hiding/showing elements, content with images etc. 
				values: boolean
				*/
				updateOnContentResize:true,
				/*
				auto-update scrollbars each time each image inside the element is fully loaded 
				values: "auto", boolean
				*/
				updateOnImageLoad:"auto",
				/*
				auto-update scrollbars based on the amount and size changes of specific selectors 
				useful when you need to update the scrollbar(s) automatically, each time a type of element is added, removed or changes its size 
				values: boolean, string (e.g. "ul li" will auto-update scrollbars each time list-items inside the element are changed) 
				a value of true (boolean) will auto-update scrollbars each time any element is changed
					option						default
					-------------------------------------
					updateOnSelectorChange		null
				*/
				/*
				extra selectors that'll allow scrollbar dragging upon mousemove/up, pointermove/up, touchend etc. (e.g. "selector-1, selector-2")
					option						default
					-------------------------------------
					extraDraggableSelectors		null
				*/
				/*
				extra selectors that'll release scrollbar dragging upon mouseup, pointerup, touchend etc. (e.g. "selector-1, selector-2")
					option						default
					-------------------------------------
					releaseDraggableSelectors	null
				*/
				/*
				auto-update timeout 
				values: integer (milliseconds)
				*/
				autoUpdateTimeout:60
			},
			/* 
			scrollbar theme 
			values: string (see CSS/plugin URI for a list of ready-to-use themes)
			*/
			theme:"light",
			/*
			user defined callback functions
			*/
			callbacks:{
				/*
				Available callbacks: 
					callback					default
					-------------------------------------
					onCreate					null
					onInit						null
					onScrollStart				null
					onScroll					null
					onTotalScroll				null
					onTotalScrollBack			null
					whileScrolling				null
					onOverflowY					null
					onOverflowX					null
					onOverflowYNone				null
					onOverflowXNone				null
					onImageLoad					null
					onSelectorChange			null
					onBeforeUpdate				null
					onUpdate					null
				*/
				onTotalScrollOffset:0,
				onTotalScrollBackOffset:0,
				alwaysTriggerOffsets:true
			}
			/*
			add scrollbar(s) on all elements matching the current selector, now and in the future 
			values: boolean, string 
			string values: "on" (enable), "once" (disable after first invocation), "off" (disable)
			liveSelector values: string (selector)
				option						default
				-------------------------------------
				live						false
				liveSelector				null
			*/
		},
	
	
	
	
	
	/* 
	----------------------------------------
	VARS, CONSTANTS 
	----------------------------------------
	*/
	
		totalInstances=0, /* plugin instances amount */
		liveTimers={}, /* live option timers */
		oldIE=(window.attachEvent && !window.addEventListener) ? 1 : 0, /* detect IE < 9 */
		touchActive=false,touchable, /* global touch vars (for touch and pointer events) */
		/* general plugin classes */
		classes=[
			"mCSB_dragger_onDrag","mCSB_scrollTools_onDrag","mCS_img_loaded","mCS_disabled","mCS_destroyed","mCS_no_scrollbar",
			"mCS-autoHide","mCS-dir-rtl","mCS_no_scrollbar_y","mCS_no_scrollbar_x","mCS_y_hidden","mCS_x_hidden","mCSB_draggerContainer",
			"mCSB_buttonUp","mCSB_buttonDown","mCSB_buttonLeft","mCSB_buttonRight"
		],
		
	
	
	
	
	/* 
	----------------------------------------
	METHODS 
	----------------------------------------
	*/
	
		methods={
			
			/* 
			plugin initialization method 
			creates the scrollbar(s), plugin data object and options
			----------------------------------------
			*/
			
			init:function(options){
				
				var options=$.extend(true,{},defaults,options),
					selector=_selector.call(this); /* validate selector */
				
				/* 
				if live option is enabled, monitor for elements matching the current selector and 
				apply scrollbar(s) when found (now and in the future) 
				*/
				if(options.live){
					var liveSelector=options.liveSelector || this.selector || defaultSelector, /* live selector(s) */
						$liveSelector=$(liveSelector); /* live selector(s) as jquery object */
					if(options.live==="off"){
						/* 
						disable live if requested 
						usage: $(selector).mCustomScrollbar({live:"off"}); 
						*/
						removeLiveTimers(liveSelector);
						return;
					}
					liveTimers[liveSelector]=setTimeout(function(){
						/* call mCustomScrollbar fn on live selector(s) every half-second */
						$liveSelector.mCustomScrollbar(options);
						if(options.live==="once" && $liveSelector.length){
							/* disable live after first invocation */
							removeLiveTimers(liveSelector);
						}
					},500);
				}else{
					removeLiveTimers(liveSelector);
				}
				
				/* options backward compatibility (for versions < 3.0.0) and normalization */
				options.setWidth=(options.set_width) ? options.set_width : options.setWidth;
				options.setHeight=(options.set_height) ? options.set_height : options.setHeight;
				options.axis=(options.horizontalScroll) ? "x" : _findAxis(options.axis);
				options.scrollInertia=options.scrollInertia>0 && options.scrollInertia<17 ? 17 : options.scrollInertia;
				if(typeof options.mouseWheel!=="object" &&  options.mouseWheel==true){ /* old school mouseWheel option (non-object) */
					options.mouseWheel={enable:true,scrollAmount:"auto",axis:"y",preventDefault:false,deltaFactor:"auto",normalizeDelta:false,invert:false}
				}
				options.mouseWheel.scrollAmount=!options.mouseWheelPixels ? options.mouseWheel.scrollAmount : options.mouseWheelPixels;
				options.mouseWheel.normalizeDelta=!options.advanced.normalizeMouseWheelDelta ? options.mouseWheel.normalizeDelta : options.advanced.normalizeMouseWheelDelta;
				options.scrollButtons.scrollType=_findScrollButtonsType(options.scrollButtons.scrollType); 
				
				_theme(options); /* theme-specific options */
				
				/* plugin constructor */
				return $(selector).each(function(){
					
					var $this=$(this);
					
					if(!$this.data(pluginPfx)){ /* prevent multiple instantiations */
					
						/* store options and create objects in jquery data */
						$this.data(pluginPfx,{
							idx:++totalInstances, /* instance index */
							opt:options, /* options */
							scrollRatio:{y:null,x:null}, /* scrollbar to content ratio */
							overflowed:null, /* overflowed axis */
							contentReset:{y:null,x:null}, /* object to check when content resets */
							bindEvents:false, /* object to check if events are bound */
							tweenRunning:false, /* object to check if tween is running */
							sequential:{}, /* sequential scrolling object */
							langDir:$this.css("direction"), /* detect/store direction (ltr or rtl) */
							cbOffsets:null, /* object to check whether callback offsets always trigger */
							/* 
							object to check how scrolling events where last triggered 
							"internal" (default - triggered by this script), "external" (triggered by other scripts, e.g. via scrollTo method) 
							usage: object.data("mCS").trigger
							*/
							trigger:null,
							/* 
							object to check for changes in elements in order to call the update method automatically 
							*/
							poll:{size:{o:0,n:0},img:{o:0,n:0},change:{o:0,n:0}}
						});
						
						var d=$this.data(pluginPfx),o=d.opt,
							/* HTML data attributes */
							htmlDataAxis=$this.data("mcs-axis"),htmlDataSbPos=$this.data("mcs-scrollbar-position"),htmlDataTheme=$this.data("mcs-theme");
						 
						if(htmlDataAxis){o.axis=htmlDataAxis;} /* usage example: data-mcs-axis="y" */
						if(htmlDataSbPos){o.scrollbarPosition=htmlDataSbPos;} /* usage example: data-mcs-scrollbar-position="outside" */
						if(htmlDataTheme){ /* usage example: data-mcs-theme="minimal" */
							o.theme=htmlDataTheme;
							_theme(o); /* theme-specific options */
						}
						
						_pluginMarkup.call(this); /* add plugin markup */
						
						if(d && o.callbacks.onCreate && typeof o.callbacks.onCreate==="function"){o.callbacks.onCreate.call(this);} /* callbacks: onCreate */
						
						$("#mCSB_"+d.idx+"_container img:not(."+classes[2]+")").addClass(classes[2]); /* flag loaded images */
						
						methods.update.call(null,$this); /* call the update method */
					
					}
					
				});
				
			},
			/* ---------------------------------------- */
			
			
			
			/* 
			plugin update method 
			updates content and scrollbar(s) values, events and status 
			----------------------------------------
			usage: $(selector).mCustomScrollbar("update");
			*/
			
			update:function(el,cb){
				
				var selector=el || _selector.call(this); /* validate selector */
				
				return $(selector).each(function(){
					
					var $this=$(this);
					
					if($this.data(pluginPfx)){ /* check if plugin has initialized */
						
						var d=$this.data(pluginPfx),o=d.opt,
							mCSB_container=$("#mCSB_"+d.idx+"_container"),
							mCustomScrollBox=$("#mCSB_"+d.idx),
							mCSB_dragger=[$("#mCSB_"+d.idx+"_dragger_vertical"),$("#mCSB_"+d.idx+"_dragger_horizontal")];
						
						if(!mCSB_container.length){return;}
						
						if(d.tweenRunning){_stop($this);} /* stop any running tweens while updating */
						
						if(cb && d && o.callbacks.onBeforeUpdate && typeof o.callbacks.onBeforeUpdate==="function"){o.callbacks.onBeforeUpdate.call(this);} /* callbacks: onBeforeUpdate */
						
						/* if element was disabled or destroyed, remove class(es) */
						if($this.hasClass(classes[3])){$this.removeClass(classes[3]);}
						if($this.hasClass(classes[4])){$this.removeClass(classes[4]);}
						
						/* css flexbox fix, detect/set max-height */
						mCustomScrollBox.css("max-height","none");
						if(mCustomScrollBox.height()!==$this.height()){mCustomScrollBox.css("max-height",$this.height());}
						
						_expandContentHorizontally.call(this); /* expand content horizontally */
						
						if(o.axis!=="y" && !o.advanced.autoExpandHorizontalScroll){
							mCSB_container.css("width",_contentWidth(mCSB_container));
						}
						
						d.overflowed=_overflowed.call(this); /* determine if scrolling is required */
						
						_scrollbarVisibility.call(this); /* show/hide scrollbar(s) */
						
						/* auto-adjust scrollbar dragger length analogous to content */
						if(o.autoDraggerLength){_setDraggerLength.call(this);}
						
						_scrollRatio.call(this); /* calculate and store scrollbar to content ratio */
						
						_bindEvents.call(this); /* bind scrollbar events */
						
						/* reset scrolling position and/or events */
						var to=[Math.abs(mCSB_container[0].offsetTop),Math.abs(mCSB_container[0].offsetLeft)];
						if(o.axis!=="x"){ /* y/yx axis */
							if(!d.overflowed[0]){ /* y scrolling is not required */
								_resetContentPosition.call(this); /* reset content position */
								if(o.axis==="y"){
									_unbindEvents.call(this);
								}else if(o.axis==="yx" && d.overflowed[1]){
									_scrollTo($this,to[1].toString(),{dir:"x",dur:0,overwrite:"none"});
								}
							}else if(mCSB_dragger[0].height()>mCSB_dragger[0].parent().height()){
								_resetContentPosition.call(this); /* reset content position */
							}else{ /* y scrolling is required */
								_scrollTo($this,to[0].toString(),{dir:"y",dur:0,overwrite:"none"});
								d.contentReset.y=null;
							}
						}
						if(o.axis!=="y"){ /* x/yx axis */
							if(!d.overflowed[1]){ /* x scrolling is not required */
								_resetContentPosition.call(this); /* reset content position */
								if(o.axis==="x"){
									_unbindEvents.call(this);
								}else if(o.axis==="yx" && d.overflowed[0]){
									_scrollTo($this,to[0].toString(),{dir:"y",dur:0,overwrite:"none"});
								}
							}else if(mCSB_dragger[1].width()>mCSB_dragger[1].parent().width()){
								_resetContentPosition.call(this); /* reset content position */
							}else{ /* x scrolling is required */
								_scrollTo($this,to[1].toString(),{dir:"x",dur:0,overwrite:"none"});
								d.contentReset.x=null;
							}
						}
						
						/* callbacks: onImageLoad, onSelectorChange, onUpdate */
						if(cb && d){
							if(cb===2 && o.callbacks.onImageLoad && typeof o.callbacks.onImageLoad==="function"){
								o.callbacks.onImageLoad.call(this);
							}else if(cb===3 && o.callbacks.onSelectorChange && typeof o.callbacks.onSelectorChange==="function"){
								o.callbacks.onSelectorChange.call(this);
							}else if(o.callbacks.onUpdate && typeof o.callbacks.onUpdate==="function"){
								o.callbacks.onUpdate.call(this);
							}
						}
						
						_autoUpdate.call(this); /* initialize automatic updating (for dynamic content, fluid layouts etc.) */
						
					}
					
				});
				
			},
			/* ---------------------------------------- */
			
			
			
			/* 
			plugin scrollTo method 
			triggers a scrolling event to a specific value
			----------------------------------------
			usage: $(selector).mCustomScrollbar("scrollTo",value,options);
			*/
		
			scrollTo:function(val,options){
				
				/* prevent silly things like $(selector).mCustomScrollbar("scrollTo",undefined); */
				if(typeof val=="undefined" || val==null){return;}
				
				var selector=_selector.call(this); /* validate selector */
				
				return $(selector).each(function(){
					
					var $this=$(this);
					
					if($this.data(pluginPfx)){ /* check if plugin has initialized */
					
						var d=$this.data(pluginPfx),o=d.opt,
							/* method default options */
							methodDefaults={
								trigger:"external", /* method is by default triggered externally (e.g. from other scripts) */
								scrollInertia:o.scrollInertia, /* scrolling inertia (animation duration) */
								scrollEasing:"mcsEaseInOut", /* animation easing */
								moveDragger:false, /* move dragger instead of content */
								timeout:60, /* scroll-to delay */
								callbacks:true, /* enable/disable callbacks */
								onStart:true,
								onUpdate:true,
								onComplete:true
							},
							methodOptions=$.extend(true,{},methodDefaults,options),
							to=_arr.call(this,val),dur=methodOptions.scrollInertia>0 && methodOptions.scrollInertia<17 ? 17 : methodOptions.scrollInertia;
						
						/* translate yx values to actual scroll-to positions */
						to[0]=_to.call(this,to[0],"y");
						to[1]=_to.call(this,to[1],"x");
						
						/* 
						check if scroll-to value moves the dragger instead of content. 
						Only pixel values apply on dragger (e.g. 100, "100px", "-=100" etc.) 
						*/
						if(methodOptions.moveDragger){
							to[0]*=d.scrollRatio.y;
							to[1]*=d.scrollRatio.x;
						}
						
						methodOptions.dur=_isTabHidden() ? 0 : dur; //skip animations if browser tab is hidden
						
						setTimeout(function(){ 
							/* do the scrolling */
							if(to[0]!==null && typeof to[0]!=="undefined" && o.axis!=="x" && d.overflowed[0]){ /* scroll y */
								methodOptions.dir="y";
								methodOptions.overwrite="all";
								_scrollTo($this,to[0].toString(),methodOptions);
							}
							if(to[1]!==null && typeof to[1]!=="undefined" && o.axis!=="y" && d.overflowed[1]){ /* scroll x */
								methodOptions.dir="x";
								methodOptions.overwrite="none";
								_scrollTo($this,to[1].toString(),methodOptions);
							}
						},methodOptions.timeout);
						
					}
					
				});
				
			},
			/* ---------------------------------------- */
			
			
			
			/*
			plugin stop method 
			stops scrolling animation
			----------------------------------------
			usage: $(selector).mCustomScrollbar("stop");
			*/
			stop:function(){
				
				var selector=_selector.call(this); /* validate selector */
				
				return $(selector).each(function(){
					
					var $this=$(this);
					
					if($this.data(pluginPfx)){ /* check if plugin has initialized */
										
						_stop($this);
					
					}
					
				});
				
			},
			/* ---------------------------------------- */
			
			
			
			/*
			plugin disable method 
			temporarily disables the scrollbar(s) 
			----------------------------------------
			usage: $(selector).mCustomScrollbar("disable",reset); 
			reset (boolean): resets content position to 0 
			*/
			disable:function(r){
				
				var selector=_selector.call(this); /* validate selector */
				
				return $(selector).each(function(){
					
					var $this=$(this);
					
					if($this.data(pluginPfx)){ /* check if plugin has initialized */
						
						var d=$this.data(pluginPfx);
						
						_autoUpdate.call(this,"remove"); /* remove automatic updating */
						
						_unbindEvents.call(this); /* unbind events */
						
						if(r){_resetContentPosition.call(this);} /* reset content position */
						
						_scrollbarVisibility.call(this,true); /* show/hide scrollbar(s) */
						
						$this.addClass(classes[3]); /* add disable class */
					
					}
					
				});
				
			},
			/* ---------------------------------------- */
			
			
			
			/*
			plugin destroy method 
			completely removes the scrollbar(s) and returns the element to its original state
			----------------------------------------
			usage: $(selector).mCustomScrollbar("destroy"); 
			*/
			destroy:function(){
				
				var selector=_selector.call(this); /* validate selector */
				
				return $(selector).each(function(){
					
					var $this=$(this);
					
					if($this.data(pluginPfx)){ /* check if plugin has initialized */
					
						var d=$this.data(pluginPfx),o=d.opt,
							mCustomScrollBox=$("#mCSB_"+d.idx),
							mCSB_container=$("#mCSB_"+d.idx+"_container"),
							scrollbar=$(".mCSB_"+d.idx+"_scrollbar");
					
						if(o.live){removeLiveTimers(o.liveSelector || $(selector).selector);} /* remove live timers */
						
						_autoUpdate.call(this,"remove"); /* remove automatic updating */
						
						_unbindEvents.call(this); /* unbind events */
						
						_resetContentPosition.call(this); /* reset content position */
						
						$this.removeData(pluginPfx); /* remove plugin data object */
						
						_delete(this,"mcs"); /* delete callbacks object */
						
						/* remove plugin markup */
						scrollbar.remove(); /* remove scrollbar(s) first (those can be either inside or outside plugin's inner wrapper) */
						mCSB_container.find("img."+classes[2]).removeClass(classes[2]); /* remove loaded images flag */
						mCustomScrollBox.replaceWith(mCSB_container.contents()); /* replace plugin's inner wrapper with the original content */
						/* remove plugin classes from the element and add destroy class */
						$this.removeClass(pluginNS+" _"+pluginPfx+"_"+d.idx+" "+classes[6]+" "+classes[7]+" "+classes[5]+" "+classes[3]).addClass(classes[4]);
					
					}
					
				});
				
			}
			/* ---------------------------------------- */
			
		},
	
	
	
	
		
	/* 
	----------------------------------------
	FUNCTIONS
	----------------------------------------
	*/
	
		/* validates selector (if selector is invalid or undefined uses the default one) */
		_selector=function(){
			return (typeof $(this)!=="object" || $(this).length<1) ? defaultSelector : this;
		},
		/* -------------------- */
		
		
		/* changes options according to theme */
		_theme=function(obj){
			var fixedSizeScrollbarThemes=["rounded","rounded-dark","rounded-dots","rounded-dots-dark"],
				nonExpandedScrollbarThemes=["rounded-dots","rounded-dots-dark","3d","3d-dark","3d-thick","3d-thick-dark","inset","inset-dark","inset-2","inset-2-dark","inset-3","inset-3-dark"],
				disabledScrollButtonsThemes=["minimal","minimal-dark"],
				enabledAutoHideScrollbarThemes=["minimal","minimal-dark"],
				scrollbarPositionOutsideThemes=["minimal","minimal-dark"];
			obj.autoDraggerLength=$.inArray(obj.theme,fixedSizeScrollbarThemes) > -1 ? false : obj.autoDraggerLength;
			obj.autoExpandScrollbar=$.inArray(obj.theme,nonExpandedScrollbarThemes) > -1 ? false : obj.autoExpandScrollbar;
			obj.scrollButtons.enable=$.inArray(obj.theme,disabledScrollButtonsThemes) > -1 ? false : obj.scrollButtons.enable;
			obj.autoHideScrollbar=$.inArray(obj.theme,enabledAutoHideScrollbarThemes) > -1 ? true : obj.autoHideScrollbar;
			obj.scrollbarPosition=$.inArray(obj.theme,scrollbarPositionOutsideThemes) > -1 ? "outside" : obj.scrollbarPosition;
		},
		/* -------------------- */
		
		
		/* live option timers removal */
		removeLiveTimers=function(selector){
			if(liveTimers[selector]){
				clearTimeout(liveTimers[selector]);
				_delete(liveTimers,selector);
			}
		},
		/* -------------------- */
		
		
		/* normalizes axis option to valid values: "y", "x", "yx" */
		_findAxis=function(val){
			return (val==="yx" || val==="xy" || val==="auto") ? "yx" : (val==="x" || val==="horizontal") ? "x" : "y";
		},
		/* -------------------- */
		
		
		/* normalizes scrollButtons.scrollType option to valid values: "stepless", "stepped" */
		_findScrollButtonsType=function(val){
			return (val==="stepped" || val==="pixels" || val==="step" || val==="click") ? "stepped" : "stepless";
		},
		/* -------------------- */
		
		
		/* generates plugin markup */
		_pluginMarkup=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				expandClass=o.autoExpandScrollbar ? " "+classes[1]+"_expand" : "",
				scrollbar=["<div id='mCSB_"+d.idx+"_scrollbar_vertical' class='mCSB_scrollTools mCSB_"+d.idx+"_scrollbar mCS-"+o.theme+" mCSB_scrollTools_vertical"+expandClass+"'><div class='"+classes[12]+"'><div id='mCSB_"+d.idx+"_dragger_vertical' class='mCSB_dragger' style='position:absolute;'><div class='mCSB_dragger_bar' /></div><div class='mCSB_draggerRail' /></div></div>","<div id='mCSB_"+d.idx+"_scrollbar_horizontal' class='mCSB_scrollTools mCSB_"+d.idx+"_scrollbar mCS-"+o.theme+" mCSB_scrollTools_horizontal"+expandClass+"'><div class='"+classes[12]+"'><div id='mCSB_"+d.idx+"_dragger_horizontal' class='mCSB_dragger' style='position:absolute;'><div class='mCSB_dragger_bar' /></div><div class='mCSB_draggerRail' /></div></div>"],
				wrapperClass=o.axis==="yx" ? "mCSB_vertical_horizontal" : o.axis==="x" ? "mCSB_horizontal" : "mCSB_vertical",
				scrollbars=o.axis==="yx" ? scrollbar[0]+scrollbar[1] : o.axis==="x" ? scrollbar[1] : scrollbar[0],
				contentWrapper=o.axis==="yx" ? "<div id='mCSB_"+d.idx+"_container_wrapper' class='mCSB_container_wrapper' />" : "",
				autoHideClass=o.autoHideScrollbar ? " "+classes[6] : "",
				scrollbarDirClass=(o.axis!=="x" && d.langDir==="rtl") ? " "+classes[7] : "";
			if(o.setWidth){$this.css("width",o.setWidth);} /* set element width */
			if(o.setHeight){$this.css("height",o.setHeight);} /* set element height */
			o.setLeft=(o.axis!=="y" && d.langDir==="rtl") ? "989999px" : o.setLeft; /* adjust left position for rtl direction */
			$this.addClass(pluginNS+" _"+pluginPfx+"_"+d.idx+autoHideClass+scrollbarDirClass).wrapInner("<div id='mCSB_"+d.idx+"' class='mCustomScrollBox mCS-"+o.theme+" "+wrapperClass+"'><div id='mCSB_"+d.idx+"_container' class='mCSB_container' style='position:relative; top:"+o.setTop+"; left:"+o.setLeft+";' dir='"+d.langDir+"' /></div>");
			var mCustomScrollBox=$("#mCSB_"+d.idx),
				mCSB_container=$("#mCSB_"+d.idx+"_container");
			if(o.axis!=="y" && !o.advanced.autoExpandHorizontalScroll){
				mCSB_container.css("width",_contentWidth(mCSB_container));
			}
			if(o.scrollbarPosition==="outside"){
				if($this.css("position")==="static"){ /* requires elements with non-static position */
					$this.css("position","relative");
				}
				$this.css("overflow","visible");
				mCustomScrollBox.addClass("mCSB_outside").after(scrollbars);
			}else{
				mCustomScrollBox.addClass("mCSB_inside").append(scrollbars);
				mCSB_container.wrap(contentWrapper);
			}
			_scrollButtons.call(this); /* add scrollbar buttons */
			/* minimum dragger length */
			var mCSB_dragger=[$("#mCSB_"+d.idx+"_dragger_vertical"),$("#mCSB_"+d.idx+"_dragger_horizontal")];
			mCSB_dragger[0].css("min-height",mCSB_dragger[0].height());
			mCSB_dragger[1].css("min-width",mCSB_dragger[1].width());
		},
		/* -------------------- */
		
		
		/* calculates content width */
		_contentWidth=function(el){
			var val=[el[0].scrollWidth,Math.max.apply(Math,el.children().map(function(){return $(this).outerWidth(true);}).get())],w=el.parent().width();
			return val[0]>w ? val[0] : val[1]>w ? val[1] : "100%";
		},
		/* -------------------- */
		
		
		/* expands content horizontally */
		_expandContentHorizontally=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				mCSB_container=$("#mCSB_"+d.idx+"_container");
			if(o.advanced.autoExpandHorizontalScroll && o.axis!=="y"){
				/* calculate scrollWidth */
				mCSB_container.css({"width":"auto","min-width":0,"overflow-x":"scroll"});
				var w=Math.ceil(mCSB_container[0].scrollWidth);
				if(o.advanced.autoExpandHorizontalScroll===3 || (o.advanced.autoExpandHorizontalScroll!==2 && w>mCSB_container.parent().width())){
					mCSB_container.css({"width":w,"min-width":"100%","overflow-x":"inherit"});
				}else{
					/* 
					wrap content with an infinite width div and set its position to absolute and width to auto. 
					Setting width to auto before calculating the actual width is important! 
					We must let the browser set the width as browser zoom values are impossible to calculate.
					*/
					mCSB_container.css({"overflow-x":"inherit","position":"absolute"})
						.wrap("<div class='mCSB_h_wrapper' style='position:relative; left:0; width:999999px;' />")
						.css({ /* set actual width, original position and un-wrap */
							/* 
							get the exact width (with decimals) and then round-up. 
							Using jquery outerWidth() will round the width value which will mess up with inner elements that have non-integer width
							*/
							"width":(Math.ceil(mCSB_container[0].getBoundingClientRect().right+0.4)-Math.floor(mCSB_container[0].getBoundingClientRect().left)),
							"min-width":"100%",
							"position":"relative"
						}).unwrap();
				}
			}
		},
		/* -------------------- */
		
		
		/* adds scrollbar buttons */
		_scrollButtons=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				mCSB_scrollTools=$(".mCSB_"+d.idx+"_scrollbar:first"),
				tabindex=!_isNumeric(o.scrollButtons.tabindex) ? "" : "tabindex='"+o.scrollButtons.tabindex+"'",
				btnHTML=[
					"<a href='#' class='"+classes[13]+"' "+tabindex+" />",
					"<a href='#' class='"+classes[14]+"' "+tabindex+" />",
					"<a href='#' class='"+classes[15]+"' "+tabindex+" />",
					"<a href='#' class='"+classes[16]+"' "+tabindex+" />"
				],
				btn=[(o.axis==="x" ? btnHTML[2] : btnHTML[0]),(o.axis==="x" ? btnHTML[3] : btnHTML[1]),btnHTML[2],btnHTML[3]];
			if(o.scrollButtons.enable){
				mCSB_scrollTools.prepend(btn[0]).append(btn[1]).next(".mCSB_scrollTools").prepend(btn[2]).append(btn[3]);
			}
		},
		/* -------------------- */
		
		
		/* auto-adjusts scrollbar dragger length */
		_setDraggerLength=function(){
			var $this=$(this),d=$this.data(pluginPfx),
				mCustomScrollBox=$("#mCSB_"+d.idx),
				mCSB_container=$("#mCSB_"+d.idx+"_container"),
				mCSB_dragger=[$("#mCSB_"+d.idx+"_dragger_vertical"),$("#mCSB_"+d.idx+"_dragger_horizontal")],
				ratio=[mCustomScrollBox.height()/mCSB_container.outerHeight(false),mCustomScrollBox.width()/mCSB_container.outerWidth(false)],
				l=[
					parseInt(mCSB_dragger[0].css("min-height")),Math.round(ratio[0]*mCSB_dragger[0].parent().height()),
					parseInt(mCSB_dragger[1].css("min-width")),Math.round(ratio[1]*mCSB_dragger[1].parent().width())
				],
				h=oldIE && (l[1]<l[0]) ? l[0] : l[1],w=oldIE && (l[3]<l[2]) ? l[2] : l[3];
			mCSB_dragger[0].css({
				"height":h,"max-height":(mCSB_dragger[0].parent().height()-10)
			}).find(".mCSB_dragger_bar").css({"line-height":l[0]+"px"});
			mCSB_dragger[1].css({
				"width":w,"max-width":(mCSB_dragger[1].parent().width()-10)
			});
		},
		/* -------------------- */
		
		
		/* calculates scrollbar to content ratio */
		_scrollRatio=function(){
			var $this=$(this),d=$this.data(pluginPfx),
				mCustomScrollBox=$("#mCSB_"+d.idx),
				mCSB_container=$("#mCSB_"+d.idx+"_container"),
				mCSB_dragger=[$("#mCSB_"+d.idx+"_dragger_vertical"),$("#mCSB_"+d.idx+"_dragger_horizontal")],
				scrollAmount=[mCSB_container.outerHeight(false)-mCustomScrollBox.height(),mCSB_container.outerWidth(false)-mCustomScrollBox.width()],
				ratio=[
					scrollAmount[0]/(mCSB_dragger[0].parent().height()-mCSB_dragger[0].height()),
					scrollAmount[1]/(mCSB_dragger[1].parent().width()-mCSB_dragger[1].width())
				];
			d.scrollRatio={y:ratio[0],x:ratio[1]};
		},
		/* -------------------- */
		
		
		/* toggles scrolling classes */
		_onDragClasses=function(el,action,xpnd){
			var expandClass=xpnd ? classes[0]+"_expanded" : "",
				scrollbar=el.closest(".mCSB_scrollTools");
			if(action==="active"){
				el.toggleClass(classes[0]+" "+expandClass); scrollbar.toggleClass(classes[1]); 
				el[0]._draggable=el[0]._draggable ? 0 : 1;
			}else{
				if(!el[0]._draggable){
					if(action==="hide"){
						el.removeClass(classes[0]); scrollbar.removeClass(classes[1]);
					}else{
						el.addClass(classes[0]); scrollbar.addClass(classes[1]);
					}
				}
			}
		},
		/* -------------------- */
		
		
		/* checks if content overflows its container to determine if scrolling is required */
		_overflowed=function(){
			var $this=$(this),d=$this.data(pluginPfx),
				mCustomScrollBox=$("#mCSB_"+d.idx),
				mCSB_container=$("#mCSB_"+d.idx+"_container"),
				contentHeight=d.overflowed==null ? mCSB_container.height() : mCSB_container.outerHeight(false),
				contentWidth=d.overflowed==null ? mCSB_container.width() : mCSB_container.outerWidth(false),
				h=mCSB_container[0].scrollHeight,w=mCSB_container[0].scrollWidth;
			if(h>contentHeight){contentHeight=h;}
			if(w>contentWidth){contentWidth=w;}
			return [contentHeight>mCustomScrollBox.height(),contentWidth>mCustomScrollBox.width()];
		},
		/* -------------------- */
		
		
		/* resets content position to 0 */
		_resetContentPosition=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				mCustomScrollBox=$("#mCSB_"+d.idx),
				mCSB_container=$("#mCSB_"+d.idx+"_container"),
				mCSB_dragger=[$("#mCSB_"+d.idx+"_dragger_vertical"),$("#mCSB_"+d.idx+"_dragger_horizontal")];
			_stop($this); /* stop any current scrolling before resetting */
			if((o.axis!=="x" && !d.overflowed[0]) || (o.axis==="y" && d.overflowed[0])){ /* reset y */
				mCSB_dragger[0].add(mCSB_container).css("top",0);
				_scrollTo($this,"_resetY");
			}
			if((o.axis!=="y" && !d.overflowed[1]) || (o.axis==="x" && d.overflowed[1])){ /* reset x */
				var cx=dx=0;
				if(d.langDir==="rtl"){ /* adjust left position for rtl direction */
					cx=mCustomScrollBox.width()-mCSB_container.outerWidth(false);
					dx=Math.abs(cx/d.scrollRatio.x);
				}
				mCSB_container.css("left",cx);
				mCSB_dragger[1].css("left",dx);
				_scrollTo($this,"_resetX");
			}
		},
		/* -------------------- */
		
		
		/* binds scrollbar events */
		_bindEvents=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt;
			if(!d.bindEvents){ /* check if events are already bound */
				_draggable.call(this);
				if(o.contentTouchScroll){_contentDraggable.call(this);}
				_selectable.call(this);
				if(o.mouseWheel.enable){ /* bind mousewheel fn when plugin is available */
					function _mwt(){
						mousewheelTimeout=setTimeout(function(){
							if(!$.event.special.mousewheel){
								_mwt();
							}else{
								clearTimeout(mousewheelTimeout);
								_mousewheel.call($this[0]);
							}
						},100);
					}
					var mousewheelTimeout;
					_mwt();
				}
				_draggerRail.call(this);
				_wrapperScroll.call(this);
				if(o.advanced.autoScrollOnFocus){_focus.call(this);}
				if(o.scrollButtons.enable){_buttons.call(this);}
				if(o.keyboard.enable){_keyboard.call(this);}
				d.bindEvents=true;
			}
		},
		/* -------------------- */
		
		
		/* unbinds scrollbar events */
		_unbindEvents=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				namespace=pluginPfx+"_"+d.idx,
				sb=".mCSB_"+d.idx+"_scrollbar",
				sel=$("#mCSB_"+d.idx+",#mCSB_"+d.idx+"_container,#mCSB_"+d.idx+"_container_wrapper,"+sb+" ."+classes[12]+",#mCSB_"+d.idx+"_dragger_vertical,#mCSB_"+d.idx+"_dragger_horizontal,"+sb+">a"),
				mCSB_container=$("#mCSB_"+d.idx+"_container");
			if(o.advanced.releaseDraggableSelectors){sel.add($(o.advanced.releaseDraggableSelectors));}
			if(o.advanced.extraDraggableSelectors){sel.add($(o.advanced.extraDraggableSelectors));}
			if(d.bindEvents){ /* check if events are bound */
				/* unbind namespaced events from document/selectors */
				$(document).add($(!_canAccessIFrame() || top.document)).unbind("."+namespace);
				sel.each(function(){
					$(this).unbind("."+namespace);
				});
				/* clear and delete timeouts/objects */
				clearTimeout($this[0]._focusTimeout); _delete($this[0],"_focusTimeout");
				clearTimeout(d.sequential.step); _delete(d.sequential,"step");
				clearTimeout(mCSB_container[0].onCompleteTimeout); _delete(mCSB_container[0],"onCompleteTimeout");
				d.bindEvents=false;
			}
		},
		/* -------------------- */
		
		
		/* toggles scrollbar visibility */
		_scrollbarVisibility=function(disabled){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				contentWrapper=$("#mCSB_"+d.idx+"_container_wrapper"),
				content=contentWrapper.length ? contentWrapper : $("#mCSB_"+d.idx+"_container"),
				scrollbar=[$("#mCSB_"+d.idx+"_scrollbar_vertical"),$("#mCSB_"+d.idx+"_scrollbar_horizontal")],
				mCSB_dragger=[scrollbar[0].find(".mCSB_dragger"),scrollbar[1].find(".mCSB_dragger")];
			if(o.axis!=="x"){
				if(d.overflowed[0] && !disabled){
					scrollbar[0].add(mCSB_dragger[0]).add(scrollbar[0].children("a")).css("display","block");
					content.removeClass(classes[8]+" "+classes[10]);
				}else{
					if(o.alwaysShowScrollbar){
						if(o.alwaysShowScrollbar!==2){mCSB_dragger[0].css("display","none");}
						content.removeClass(classes[10]);
					}else{
						scrollbar[0].css("display","none");
						content.addClass(classes[10]);
					}
					content.addClass(classes[8]);
				}
			}
			if(o.axis!=="y"){
				if(d.overflowed[1] && !disabled){
					scrollbar[1].add(mCSB_dragger[1]).add(scrollbar[1].children("a")).css("display","block");
					content.removeClass(classes[9]+" "+classes[11]);
				}else{
					if(o.alwaysShowScrollbar){
						if(o.alwaysShowScrollbar!==2){mCSB_dragger[1].css("display","none");}
						content.removeClass(classes[11]);
					}else{
						scrollbar[1].css("display","none");
						content.addClass(classes[11]);
					}
					content.addClass(classes[9]);
				}
			}
			if(!d.overflowed[0] && !d.overflowed[1]){
				$this.addClass(classes[5]);
			}else{
				$this.removeClass(classes[5]);
			}
		},
		/* -------------------- */
		
		
		/* returns input coordinates of pointer, touch and mouse events (relative to document) */
		_coordinates=function(e){
			var t=e.type,o=e.target.ownerDocument!==document && frameElement!==null ? [$(frameElement).offset().top,$(frameElement).offset().left] : null,
				io=_canAccessIFrame() && e.target.ownerDocument!==top.document && frameElement!==null ? [$(e.view.frameElement).offset().top,$(e.view.frameElement).offset().left] : [0,0];
			switch(t){
				case "pointerdown": case "MSPointerDown": case "pointermove": case "MSPointerMove": case "pointerup": case "MSPointerUp":
					return o ? [e.originalEvent.pageY-o[0]+io[0],e.originalEvent.pageX-o[1]+io[1],false] : [e.originalEvent.pageY,e.originalEvent.pageX,false];
					break;
				case "touchstart": case "touchmove": case "touchend":
					var touch=e.originalEvent.touches[0] || e.originalEvent.changedTouches[0],
						touches=e.originalEvent.touches.length || e.originalEvent.changedTouches.length;
					return e.target.ownerDocument!==document ? [touch.screenY,touch.screenX,touches>1] : [touch.pageY,touch.pageX,touches>1];
					break;
				default:
					return o ? [e.pageY-o[0]+io[0],e.pageX-o[1]+io[1],false] : [e.pageY,e.pageX,false];
			}
		},
		/* -------------------- */
		
		
		/* 
		SCROLLBAR DRAG EVENTS
		scrolls content via scrollbar dragging 
		*/
		_draggable=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				namespace=pluginPfx+"_"+d.idx,
				draggerId=["mCSB_"+d.idx+"_dragger_vertical","mCSB_"+d.idx+"_dragger_horizontal"],
				mCSB_container=$("#mCSB_"+d.idx+"_container"),
				mCSB_dragger=$("#"+draggerId[0]+",#"+draggerId[1]),
				draggable,dragY,dragX,
				rds=o.advanced.releaseDraggableSelectors ? mCSB_dragger.add($(o.advanced.releaseDraggableSelectors)) : mCSB_dragger,
				eds=o.advanced.extraDraggableSelectors ? $(!_canAccessIFrame() || top.document).add($(o.advanced.extraDraggableSelectors)) : $(!_canAccessIFrame() || top.document);
			mCSB_dragger.bind("contextmenu."+namespace,function(e){
				e.preventDefault(); //prevent right click
			}).bind("mousedown."+namespace+" touchstart."+namespace+" pointerdown."+namespace+" MSPointerDown."+namespace,function(e){
				e.stopImmediatePropagation();
				e.preventDefault();
				if(!_mouseBtnLeft(e)){return;} /* left mouse button only */
				touchActive=true;
				if(oldIE){document.onselectstart=function(){return false;}} /* disable text selection for IE < 9 */
				_iframe.call(mCSB_container,false); /* enable scrollbar dragging over iframes by disabling their events */
				_stop($this);
				draggable=$(this);
				var offset=draggable.offset(),y=_coordinates(e)[0]-offset.top,x=_coordinates(e)[1]-offset.left,
					h=draggable.height()+offset.top,w=draggable.width()+offset.left;
				if(y<h && y>0 && x<w && x>0){
					dragY=y; 
					dragX=x;
				}
				_onDragClasses(draggable,"active",o.autoExpandScrollbar); 
			}).bind("touchmove."+namespace,function(e){
				e.stopImmediatePropagation();
				e.preventDefault();
				var offset=draggable.offset(),y=_coordinates(e)[0]-offset.top,x=_coordinates(e)[1]-offset.left;
				_drag(dragY,dragX,y,x);
			});
			$(document).add(eds).bind("mousemove."+namespace+" pointermove."+namespace+" MSPointerMove."+namespace,function(e){
				if(draggable){
					var offset=draggable.offset(),y=_coordinates(e)[0]-offset.top,x=_coordinates(e)[1]-offset.left;
					if(dragY===y && dragX===x){return;} /* has it really moved? */
					_drag(dragY,dragX,y,x);
				}
			}).add(rds).bind("mouseup."+namespace+" touchend."+namespace+" pointerup."+namespace+" MSPointerUp."+namespace,function(e){
				if(draggable){
					_onDragClasses(draggable,"active",o.autoExpandScrollbar); 
					draggable=null;
				}
				touchActive=false;
				if(oldIE){document.onselectstart=null;} /* enable text selection for IE < 9 */
				_iframe.call(mCSB_container,true); /* enable iframes events */
			});
			function _drag(dragY,dragX,y,x){
				mCSB_container[0].idleTimer=o.scrollInertia<233 ? 250 : 0;
				if(draggable.attr("id")===draggerId[1]){
					var dir="x",to=((draggable[0].offsetLeft-dragX)+x)*d.scrollRatio.x;
				}else{
					var dir="y",to=((draggable[0].offsetTop-dragY)+y)*d.scrollRatio.y;
				}
				_scrollTo($this,to.toString(),{dir:dir,drag:true});
			}
		},
		/* -------------------- */
		
		
		/* 
		TOUCH SWIPE EVENTS
		scrolls content via touch swipe 
		Emulates the native touch-swipe scrolling with momentum found in iOS, Android and WP devices 
		*/
		_contentDraggable=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				namespace=pluginPfx+"_"+d.idx,
				mCustomScrollBox=$("#mCSB_"+d.idx),
				mCSB_container=$("#mCSB_"+d.idx+"_container"),
				mCSB_dragger=[$("#mCSB_"+d.idx+"_dragger_vertical"),$("#mCSB_"+d.idx+"_dragger_horizontal")],
				draggable,dragY,dragX,touchStartY,touchStartX,touchMoveY=[],touchMoveX=[],startTime,runningTime,endTime,distance,speed,amount,
				durA=0,durB,overwrite=o.axis==="yx" ? "none" : "all",touchIntent=[],touchDrag,docDrag,
				iframe=mCSB_container.find("iframe"),
				events=[
					"touchstart."+namespace+" pointerdown."+namespace+" MSPointerDown."+namespace, //start
					"touchmove."+namespace+" pointermove."+namespace+" MSPointerMove."+namespace, //move
					"touchend."+namespace+" pointerup."+namespace+" MSPointerUp."+namespace //end
				],
				touchAction=document.body.style.touchAction!==undefined && document.body.style.touchAction!=="";
			mCSB_container.bind(events[0],function(e){
				_onTouchstart(e);
			}).bind(events[1],function(e){
				_onTouchmove(e);
			});
			mCustomScrollBox.bind(events[0],function(e){
				_onTouchstart2(e);
			}).bind(events[2],function(e){
				_onTouchend(e);
			});
			if(iframe.length){
				iframe.each(function(){
					$(this).bind("load",function(){
						/* bind events on accessible iframes */
						if(_canAccessIFrame(this)){
							$(this.contentDocument || this.contentWindow.document).bind(events[0],function(e){
								_onTouchstart(e);
								_onTouchstart2(e);
							}).bind(events[1],function(e){
								_onTouchmove(e);
							}).bind(events[2],function(e){
								_onTouchend(e);
							});
						}
					});
				});
			}
			function _onTouchstart(e){
				if(!_pointerTouch(e) || touchActive || _coordinates(e)[2]){touchable=0; return;}
				touchable=1; touchDrag=0; docDrag=0; draggable=1;
				$this.removeClass("mCS_touch_action");
				var offset=mCSB_container.offset();
				dragY=_coordinates(e)[0]-offset.top;
				dragX=_coordinates(e)[1]-offset.left;
				touchIntent=[_coordinates(e)[0],_coordinates(e)[1]];
			}
			function _onTouchmove(e){
				if(!_pointerTouch(e) || touchActive || _coordinates(e)[2]){return;}
				if(!o.documentTouchScroll){e.preventDefault();} 
				e.stopImmediatePropagation();
				if(docDrag && !touchDrag){return;}
				if(draggable){
					runningTime=_getTime();
					var offset=mCustomScrollBox.offset(),y=_coordinates(e)[0]-offset.top,x=_coordinates(e)[1]-offset.left,
						easing="mcsLinearOut";
					touchMoveY.push(y);
					touchMoveX.push(x);
					touchIntent[2]=Math.abs(_coordinates(e)[0]-touchIntent[0]); touchIntent[3]=Math.abs(_coordinates(e)[1]-touchIntent[1]);
					if(d.overflowed[0]){
						var limit=mCSB_dragger[0].parent().height()-mCSB_dragger[0].height(),
							prevent=((dragY-y)>0 && (y-dragY)>-(limit*d.scrollRatio.y) && (touchIntent[3]*2<touchIntent[2] || o.axis==="yx"));
					}
					if(d.overflowed[1]){
						var limitX=mCSB_dragger[1].parent().width()-mCSB_dragger[1].width(),
							preventX=((dragX-x)>0 && (x-dragX)>-(limitX*d.scrollRatio.x) && (touchIntent[2]*2<touchIntent[3] || o.axis==="yx"));
					}
					if(prevent || preventX){ /* prevent native document scrolling */
						if(!touchAction){e.preventDefault();} 
						touchDrag=1;
					}else{
						docDrag=1;
						$this.addClass("mCS_touch_action");
					}
					if(touchAction){e.preventDefault();} 
					amount=o.axis==="yx" ? [(dragY-y),(dragX-x)] : o.axis==="x" ? [null,(dragX-x)] : [(dragY-y),null];
					mCSB_container[0].idleTimer=250;
					if(d.overflowed[0]){_drag(amount[0],durA,easing,"y","all",true);}
					if(d.overflowed[1]){_drag(amount[1],durA,easing,"x",overwrite,true);}
				}
			}
			function _onTouchstart2(e){
				if(!_pointerTouch(e) || touchActive || _coordinates(e)[2]){touchable=0; return;}
				touchable=1;
				e.stopImmediatePropagation();
				_stop($this);
				startTime=_getTime();
				var offset=mCustomScrollBox.offset();
				touchStartY=_coordinates(e)[0]-offset.top;
				touchStartX=_coordinates(e)[1]-offset.left;
				touchMoveY=[]; touchMoveX=[];
			}
			function _onTouchend(e){
				if(!_pointerTouch(e) || touchActive || _coordinates(e)[2]){return;}
				draggable=0;
				e.stopImmediatePropagation();
				touchDrag=0; docDrag=0;
				endTime=_getTime();
				var offset=mCustomScrollBox.offset(),y=_coordinates(e)[0]-offset.top,x=_coordinates(e)[1]-offset.left;
				if((endTime-runningTime)>30){return;}
				speed=1000/(endTime-startTime);
				var easing="mcsEaseOut",slow=speed<2.5,
					diff=slow ? [touchMoveY[touchMoveY.length-2],touchMoveX[touchMoveX.length-2]] : [0,0];
				distance=slow ? [(y-diff[0]),(x-diff[1])] : [y-touchStartY,x-touchStartX];
				var absDistance=[Math.abs(distance[0]),Math.abs(distance[1])];
				speed=slow ? [Math.abs(distance[0]/4),Math.abs(distance[1]/4)] : [speed,speed];
				var a=[
					Math.abs(mCSB_container[0].offsetTop)-(distance[0]*_m((absDistance[0]/speed[0]),speed[0])),
					Math.abs(mCSB_container[0].offsetLeft)-(distance[1]*_m((absDistance[1]/speed[1]),speed[1]))
				];
				amount=o.axis==="yx" ? [a[0],a[1]] : o.axis==="x" ? [null,a[1]] : [a[0],null];
				durB=[(absDistance[0]*4)+o.scrollInertia,(absDistance[1]*4)+o.scrollInertia];
				var md=parseInt(o.contentTouchScroll) || 0; /* absolute minimum distance required */
				amount[0]=absDistance[0]>md ? amount[0] : 0;
				amount[1]=absDistance[1]>md ? amount[1] : 0;
				if(d.overflowed[0]){_drag(amount[0],durB[0],easing,"y",overwrite,false);}
				if(d.overflowed[1]){_drag(amount[1],durB[1],easing,"x",overwrite,false);}
			}
			function _m(ds,s){
				var r=[s*1.5,s*2,s/1.5,s/2];
				if(ds>90){
					return s>4 ? r[0] : r[3];
				}else if(ds>60){
					return s>3 ? r[3] : r[2];
				}else if(ds>30){
					return s>8 ? r[1] : s>6 ? r[0] : s>4 ? s : r[2];
				}else{
					return s>8 ? s : r[3];
				}
			}
			function _drag(amount,dur,easing,dir,overwrite,drag){
				if(!amount){return;}
				_scrollTo($this,amount.toString(),{dur:dur,scrollEasing:easing,dir:dir,overwrite:overwrite,drag:drag});
			}
		},
		/* -------------------- */
		
		
		/* 
		SELECT TEXT EVENTS 
		scrolls content when text is selected 
		*/
		_selectable=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,seq=d.sequential,
				namespace=pluginPfx+"_"+d.idx,
				mCSB_container=$("#mCSB_"+d.idx+"_container"),
				wrapper=mCSB_container.parent(),
				action;
			mCSB_container.bind("mousedown."+namespace,function(e){
				if(touchable){return;}
				if(!action){action=1; touchActive=true;}
			}).add(document).bind("mousemove."+namespace,function(e){
				if(!touchable && action && _sel()){
					var offset=mCSB_container.offset(),
						y=_coordinates(e)[0]-offset.top+mCSB_container[0].offsetTop,x=_coordinates(e)[1]-offset.left+mCSB_container[0].offsetLeft;
					if(y>0 && y<wrapper.height() && x>0 && x<wrapper.width()){
						if(seq.step){_seq("off",null,"stepped");}
					}else{
						if(o.axis!=="x" && d.overflowed[0]){
							if(y<0){
								_seq("on",38);
							}else if(y>wrapper.height()){
								_seq("on",40);
							}
						}
						if(o.axis!=="y" && d.overflowed[1]){
							if(x<0){
								_seq("on",37);
							}else if(x>wrapper.width()){
								_seq("on",39);
							}
						}
					}
				}
			}).bind("mouseup."+namespace+" dragend."+namespace,function(e){
				if(touchable){return;}
				if(action){action=0; _seq("off",null);}
				touchActive=false;
			});
			function _sel(){
				return 	window.getSelection ? window.getSelection().toString() : 
						document.selection && document.selection.type!="Control" ? document.selection.createRange().text : 0;
			}
			function _seq(a,c,s){
				seq.type=s && action ? "stepped" : "stepless";
				seq.scrollAmount=10;
				_sequentialScroll($this,a,c,"mcsLinearOut",s ? 60 : null);
			}
		},
		/* -------------------- */
		
		
		/* 
		MOUSE WHEEL EVENT
		scrolls content via mouse-wheel 
		via mouse-wheel plugin (https://github.com/brandonaaron/jquery-mousewheel)
		*/
		_mousewheel=function(){
			if(!$(this).data(pluginPfx)){return;} /* Check if the scrollbar is ready to use mousewheel events (issue: #185) */
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				namespace=pluginPfx+"_"+d.idx,
				mCustomScrollBox=$("#mCSB_"+d.idx),
				mCSB_dragger=[$("#mCSB_"+d.idx+"_dragger_vertical"),$("#mCSB_"+d.idx+"_dragger_horizontal")],
				iframe=$("#mCSB_"+d.idx+"_container").find("iframe");
			if(iframe.length){
				iframe.each(function(){
					$(this).bind("load",function(){
						/* bind events on accessible iframes */
						if(_canAccessIFrame(this)){
							$(this.contentDocument || this.contentWindow.document).bind("mousewheel."+namespace,function(e,delta){
								_onMousewheel(e,delta);
							});
						}
					});
				});
			}
			mCustomScrollBox.bind("mousewheel."+namespace,function(e,delta){
				_onMousewheel(e,delta);
			});
			function _onMousewheel(e,delta){
				_stop($this);
				if(_disableMousewheel($this,e.target)){return;} /* disables mouse-wheel when hovering specific elements */
				var deltaFactor=o.mouseWheel.deltaFactor!=="auto" ? parseInt(o.mouseWheel.deltaFactor) : (oldIE && e.deltaFactor<100) ? 100 : e.deltaFactor || 100,
					dur=o.scrollInertia;
				if(o.axis==="x" || o.mouseWheel.axis==="x"){
					var dir="x",
						px=[Math.round(deltaFactor*d.scrollRatio.x),parseInt(o.mouseWheel.scrollAmount)],
						amount=o.mouseWheel.scrollAmount!=="auto" ? px[1] : px[0]>=mCustomScrollBox.width() ? mCustomScrollBox.width()*0.9 : px[0],
						contentPos=Math.abs($("#mCSB_"+d.idx+"_container")[0].offsetLeft),
						draggerPos=mCSB_dragger[1][0].offsetLeft,
						limit=mCSB_dragger[1].parent().width()-mCSB_dragger[1].width(),
						dlt=o.mouseWheel.axis==="y" ? (e.deltaY || delta) : e.deltaX;
				}else{
					var dir="y",
						px=[Math.round(deltaFactor*d.scrollRatio.y),parseInt(o.mouseWheel.scrollAmount)],
						amount=o.mouseWheel.scrollAmount!=="auto" ? px[1] : px[0]>=mCustomScrollBox.height() ? mCustomScrollBox.height()*0.9 : px[0],
						contentPos=Math.abs($("#mCSB_"+d.idx+"_container")[0].offsetTop),
						draggerPos=mCSB_dragger[0][0].offsetTop,
						limit=mCSB_dragger[0].parent().height()-mCSB_dragger[0].height(),
						dlt=e.deltaY || delta;
				}
				if((dir==="y" && !d.overflowed[0]) || (dir==="x" && !d.overflowed[1])){return;}
				if(o.mouseWheel.invert || e.webkitDirectionInvertedFromDevice){dlt=-dlt;}
				if(o.mouseWheel.normalizeDelta){dlt=dlt<0 ? -1 : 1;}
				if((dlt>0 && draggerPos!==0) || (dlt<0 && draggerPos!==limit) || o.mouseWheel.preventDefault){
					e.stopImmediatePropagation();
					e.preventDefault();
				}
				if(e.deltaFactor<5 && !o.mouseWheel.normalizeDelta){
					//very low deltaFactor values mean some kind of delta acceleration (e.g. osx trackpad), so adjusting scrolling accordingly
					amount=e.deltaFactor; dur=17;
				}
				_scrollTo($this,(contentPos-(dlt*amount)).toString(),{dir:dir,dur:dur});
			}
		},
		/* -------------------- */
		
		
		/* checks if iframe can be accessed */
		_canAccessIFrameCache=new Object(),
		_canAccessIFrame=function(iframe){
		    var result=false,cacheKey=false,html=null;
		    if(iframe===undefined){
				cacheKey="#empty";
		    }else if($(iframe).attr("id")!==undefined){
				cacheKey=$(iframe).attr("id");
		    }
			if(cacheKey!==false && _canAccessIFrameCache[cacheKey]!==undefined){
				return _canAccessIFrameCache[cacheKey];
			}
			if(!iframe){
				try{
					var doc=top.document;
					html=doc.body.innerHTML;
				}catch(err){/* do nothing */}
				result=(html!==null);
			}else{
				try{
					var doc=iframe.contentDocument || iframe.contentWindow.document;
					html=doc.body.innerHTML;
				}catch(err){/* do nothing */}
				result=(html!==null);
			}
			if(cacheKey!==false){_canAccessIFrameCache[cacheKey]=result;}
			return result;
		},
		/* -------------------- */
		
		
		/* switches iframe's pointer-events property (drag, mousewheel etc. over cross-domain iframes) */
		_iframe=function(evt){
			var el=this.find("iframe");
			if(!el.length){return;} /* check if content contains iframes */
			var val=!evt ? "none" : "auto";
			el.css("pointer-events",val); /* for IE11, iframe's display property should not be "block" */
		},
		/* -------------------- */
		
		
		/* disables mouse-wheel when hovering specific elements like select, datalist etc. */
		_disableMousewheel=function(el,target){
			var tag=target.nodeName.toLowerCase(),
				tags=el.data(pluginPfx).opt.mouseWheel.disableOver,
				/* elements that require focus */
				focusTags=["select","textarea"];
			return $.inArray(tag,tags) > -1 && !($.inArray(tag,focusTags) > -1 && !$(target).is(":focus"));
		},
		/* -------------------- */
		
		
		/* 
		DRAGGER RAIL CLICK EVENT
		scrolls content via dragger rail 
		*/
		_draggerRail=function(){
			var $this=$(this),d=$this.data(pluginPfx),
				namespace=pluginPfx+"_"+d.idx,
				mCSB_container=$("#mCSB_"+d.idx+"_container"),
				wrapper=mCSB_container.parent(),
				mCSB_draggerContainer=$(".mCSB_"+d.idx+"_scrollbar ."+classes[12]),
				clickable;
			mCSB_draggerContainer.bind("mousedown."+namespace+" touchstart."+namespace+" pointerdown."+namespace+" MSPointerDown."+namespace,function(e){
				touchActive=true;
				if(!$(e.target).hasClass("mCSB_dragger")){clickable=1;}
			}).bind("touchend."+namespace+" pointerup."+namespace+" MSPointerUp."+namespace,function(e){
				touchActive=false;
			}).bind("click."+namespace,function(e){
				if(!clickable){return;}
				clickable=0;
				if($(e.target).hasClass(classes[12]) || $(e.target).hasClass("mCSB_draggerRail")){
					_stop($this);
					var el=$(this),mCSB_dragger=el.find(".mCSB_dragger");
					if(el.parent(".mCSB_scrollTools_horizontal").length>0){
						if(!d.overflowed[1]){return;}
						var dir="x",
							clickDir=e.pageX>mCSB_dragger.offset().left ? -1 : 1,
							to=Math.abs(mCSB_container[0].offsetLeft)-(clickDir*(wrapper.width()*0.9));
					}else{
						if(!d.overflowed[0]){return;}
						var dir="y",
							clickDir=e.pageY>mCSB_dragger.offset().top ? -1 : 1,
							to=Math.abs(mCSB_container[0].offsetTop)-(clickDir*(wrapper.height()*0.9));
					}
					_scrollTo($this,to.toString(),{dir:dir,scrollEasing:"mcsEaseInOut"});
				}
			});
		},
		/* -------------------- */
		
		
		/* 
		FOCUS EVENT
		scrolls content via element focus (e.g. clicking an input, pressing TAB key etc.)
		*/
		_focus=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				namespace=pluginPfx+"_"+d.idx,
				mCSB_container=$("#mCSB_"+d.idx+"_container"),
				wrapper=mCSB_container.parent();
			mCSB_container.bind("focusin."+namespace,function(e){
				var el=$(document.activeElement),
					nested=mCSB_container.find(".mCustomScrollBox").length,
					dur=0;
				if(!el.is(o.advanced.autoScrollOnFocus)){return;}
				_stop($this);
				clearTimeout($this[0]._focusTimeout);
				$this[0]._focusTimer=nested ? (dur+17)*nested : 0;
				$this[0]._focusTimeout=setTimeout(function(){
					var	to=[_childPos(el)[0],_childPos(el)[1]],
						contentPos=[mCSB_container[0].offsetTop,mCSB_container[0].offsetLeft],
						isVisible=[
							(contentPos[0]+to[0]>=0 && contentPos[0]+to[0]<wrapper.height()-el.outerHeight(false)),
							(contentPos[1]+to[1]>=0 && contentPos[0]+to[1]<wrapper.width()-el.outerWidth(false))
						],
						overwrite=(o.axis==="yx" && !isVisible[0] && !isVisible[1]) ? "none" : "all";
					if(o.axis!=="x" && !isVisible[0]){
						_scrollTo($this,to[0].toString(),{dir:"y",scrollEasing:"mcsEaseInOut",overwrite:overwrite,dur:dur});
					}
					if(o.axis!=="y" && !isVisible[1]){
						_scrollTo($this,to[1].toString(),{dir:"x",scrollEasing:"mcsEaseInOut",overwrite:overwrite,dur:dur});
					}
				},$this[0]._focusTimer);
			});
		},
		/* -------------------- */
		
		
		/* sets content wrapper scrollTop/scrollLeft always to 0 */
		_wrapperScroll=function(){
			var $this=$(this),d=$this.data(pluginPfx),
				namespace=pluginPfx+"_"+d.idx,
				wrapper=$("#mCSB_"+d.idx+"_container").parent();
			wrapper.bind("scroll."+namespace,function(e){
				if(wrapper.scrollTop()!==0 || wrapper.scrollLeft()!==0){
					$(".mCSB_"+d.idx+"_scrollbar").css("visibility","hidden"); /* hide scrollbar(s) */
				}
			});
		},
		/* -------------------- */
		
		
		/* 
		BUTTONS EVENTS
		scrolls content via up, down, left and right buttons 
		*/
		_buttons=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,seq=d.sequential,
				namespace=pluginPfx+"_"+d.idx,
				sel=".mCSB_"+d.idx+"_scrollbar",
				btn=$(sel+">a");
			btn.bind("contextmenu."+namespace,function(e){
				e.preventDefault(); //prevent right click
			}).bind("mousedown."+namespace+" touchstart."+namespace+" pointerdown."+namespace+" MSPointerDown."+namespace+" mouseup."+namespace+" touchend."+namespace+" pointerup."+namespace+" MSPointerUp."+namespace+" mouseout."+namespace+" pointerout."+namespace+" MSPointerOut."+namespace+" click."+namespace,function(e){
				e.preventDefault();
				if(!_mouseBtnLeft(e)){return;} /* left mouse button only */
				var btnClass=$(this).attr("class");
				seq.type=o.scrollButtons.scrollType;
				switch(e.type){
					case "mousedown": case "touchstart": case "pointerdown": case "MSPointerDown":
						if(seq.type==="stepped"){return;}
						touchActive=true;
						d.tweenRunning=false;
						_seq("on",btnClass);
						break;
					case "mouseup": case "touchend": case "pointerup": case "MSPointerUp":
					case "mouseout": case "pointerout": case "MSPointerOut":
						if(seq.type==="stepped"){return;}
						touchActive=false;
						if(seq.dir){_seq("off",btnClass);}
						break;
					case "click":
						if(seq.type!=="stepped" || d.tweenRunning){return;}
						_seq("on",btnClass);
						break;
				}
				function _seq(a,c){
					seq.scrollAmount=o.scrollButtons.scrollAmount;
					_sequentialScroll($this,a,c);
				}
			});
		},
		/* -------------------- */
		
		
		/* 
		KEYBOARD EVENTS
		scrolls content via keyboard 
		Keys: up arrow, down arrow, left arrow, right arrow, PgUp, PgDn, Home, End
		*/
		_keyboard=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,seq=d.sequential,
				namespace=pluginPfx+"_"+d.idx,
				mCustomScrollBox=$("#mCSB_"+d.idx),
				mCSB_container=$("#mCSB_"+d.idx+"_container"),
				wrapper=mCSB_container.parent(),
				editables="input,textarea,select,datalist,keygen,[contenteditable='true']",
				iframe=mCSB_container.find("iframe"),
				events=["blur."+namespace+" keydown."+namespace+" keyup."+namespace];
			if(iframe.length){
				iframe.each(function(){
					$(this).bind("load",function(){
						/* bind events on accessible iframes */
						if(_canAccessIFrame(this)){
							$(this.contentDocument || this.contentWindow.document).bind(events[0],function(e){
								_onKeyboard(e);
							});
						}
					});
				});
			}
			mCustomScrollBox.attr("tabindex","0").bind(events[0],function(e){
				_onKeyboard(e);
			});
			function _onKeyboard(e){
				switch(e.type){
					case "blur":
						if(d.tweenRunning && seq.dir){_seq("off",null);}
						break;
					case "keydown": case "keyup":
						var code=e.keyCode ? e.keyCode : e.which,action="on";
						if((o.axis!=="x" && (code===38 || code===40)) || (o.axis!=="y" && (code===37 || code===39))){
							/* up (38), down (40), left (37), right (39) arrows */
							if(((code===38 || code===40) && !d.overflowed[0]) || ((code===37 || code===39) && !d.overflowed[1])){return;}
							if(e.type==="keyup"){action="off";}
							if(!$(document.activeElement).is(editables)){
								e.preventDefault();
								e.stopImmediatePropagation();
								_seq(action,code);
							}
						}else if(code===33 || code===34){
							/* PgUp (33), PgDn (34) */
							if(d.overflowed[0] || d.overflowed[1]){
								e.preventDefault();
								e.stopImmediatePropagation();
							}
							if(e.type==="keyup"){
								_stop($this);
								var keyboardDir=code===34 ? -1 : 1;
								if(o.axis==="x" || (o.axis==="yx" && d.overflowed[1] && !d.overflowed[0])){
									var dir="x",to=Math.abs(mCSB_container[0].offsetLeft)-(keyboardDir*(wrapper.width()*0.9));
								}else{
									var dir="y",to=Math.abs(mCSB_container[0].offsetTop)-(keyboardDir*(wrapper.height()*0.9));
								}
								_scrollTo($this,to.toString(),{dir:dir,scrollEasing:"mcsEaseInOut"});
							}
						}else if(code===35 || code===36){
							/* End (35), Home (36) */
							if(!$(document.activeElement).is(editables)){
								if(d.overflowed[0] || d.overflowed[1]){
									e.preventDefault();
									e.stopImmediatePropagation();
								}
								if(e.type==="keyup"){
									if(o.axis==="x" || (o.axis==="yx" && d.overflowed[1] && !d.overflowed[0])){
										var dir="x",to=code===35 ? Math.abs(wrapper.width()-mCSB_container.outerWidth(false)) : 0;
									}else{
										var dir="y",to=code===35 ? Math.abs(wrapper.height()-mCSB_container.outerHeight(false)) : 0;
									}
									_scrollTo($this,to.toString(),{dir:dir,scrollEasing:"mcsEaseInOut"});
								}
							}
						}
						break;
				}
				function _seq(a,c){
					seq.type=o.keyboard.scrollType;
					seq.scrollAmount=o.keyboard.scrollAmount;
					if(seq.type==="stepped" && d.tweenRunning){return;}
					_sequentialScroll($this,a,c);
				}
			}
		},
		/* -------------------- */
		
		
		/* scrolls content sequentially (used when scrolling via buttons, keyboard arrows etc.) */
		_sequentialScroll=function(el,action,trigger,e,s){
			var d=el.data(pluginPfx),o=d.opt,seq=d.sequential,
				mCSB_container=$("#mCSB_"+d.idx+"_container"),
				once=seq.type==="stepped" ? true : false,
				steplessSpeed=o.scrollInertia < 26 ? 26 : o.scrollInertia, /* 26/1.5=17 */
				steppedSpeed=o.scrollInertia < 1 ? 17 : o.scrollInertia;
			switch(action){
				case "on":
					seq.dir=[
						(trigger===classes[16] || trigger===classes[15] || trigger===39 || trigger===37 ? "x" : "y"),
						(trigger===classes[13] || trigger===classes[15] || trigger===38 || trigger===37 ? -1 : 1)
					];
					_stop(el);
					if(_isNumeric(trigger) && seq.type==="stepped"){return;}
					_on(once);
					break;
				case "off":
					_off();
					if(once || (d.tweenRunning && seq.dir)){
						_on(true);
					}
					break;
			}
			
			/* starts sequence */
			function _on(once){
				if(o.snapAmount){seq.scrollAmount=!(o.snapAmount instanceof Array) ? o.snapAmount : seq.dir[0]==="x" ? o.snapAmount[1] : o.snapAmount[0];} /* scrolling snapping */
				var c=seq.type!=="stepped", /* continuous scrolling */
					t=s ? s : !once ? 1000/60 : c ? steplessSpeed/1.5 : steppedSpeed, /* timer */
					m=!once ? 2.5 : c ? 7.5 : 40, /* multiplier */
					contentPos=[Math.abs(mCSB_container[0].offsetTop),Math.abs(mCSB_container[0].offsetLeft)],
					ratio=[d.scrollRatio.y>10 ? 10 : d.scrollRatio.y,d.scrollRatio.x>10 ? 10 : d.scrollRatio.x],
					amount=seq.dir[0]==="x" ? contentPos[1]+(seq.dir[1]*(ratio[1]*m)) : contentPos[0]+(seq.dir[1]*(ratio[0]*m)),
					px=seq.dir[0]==="x" ? contentPos[1]+(seq.dir[1]*parseInt(seq.scrollAmount)) : contentPos[0]+(seq.dir[1]*parseInt(seq.scrollAmount)),
					to=seq.scrollAmount!=="auto" ? px : amount,
					easing=e ? e : !once ? "mcsLinear" : c ? "mcsLinearOut" : "mcsEaseInOut",
					onComplete=!once ? false : true;
				if(once && t<17){
					to=seq.dir[0]==="x" ? contentPos[1] : contentPos[0];
				}
				_scrollTo(el,to.toString(),{dir:seq.dir[0],scrollEasing:easing,dur:t,onComplete:onComplete});
				if(once){
					seq.dir=false;
					return;
				}
				clearTimeout(seq.step);
				seq.step=setTimeout(function(){
					_on();
				},t);
			}
			/* stops sequence */
			function _off(){
				clearTimeout(seq.step);
				_delete(seq,"step");
				_stop(el);
			}
		},
		/* -------------------- */
		
		
		/* returns a yx array from value */
		_arr=function(val){
			var o=$(this).data(pluginPfx).opt,vals=[];
			if(typeof val==="function"){val=val();} /* check if the value is a single anonymous function */
			/* check if value is object or array, its length and create an array with yx values */
			if(!(val instanceof Array)){ /* object value (e.g. {y:"100",x:"100"}, 100 etc.) */
				vals[0]=val.y ? val.y : val.x || o.axis==="x" ? null : val;
				vals[1]=val.x ? val.x : val.y || o.axis==="y" ? null : val;
			}else{ /* array value (e.g. [100,100]) */
				vals=val.length>1 ? [val[0],val[1]] : o.axis==="x" ? [null,val[0]] : [val[0],null];
			}
			/* check if array values are anonymous functions */
			if(typeof vals[0]==="function"){vals[0]=vals[0]();}
			if(typeof vals[1]==="function"){vals[1]=vals[1]();}
			return vals;
		},
		/* -------------------- */
		
		
		/* translates values (e.g. "top", 100, "100px", "#id") to actual scroll-to positions */
		_to=function(val,dir){
			if(val==null || typeof val=="undefined"){return;}
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				mCSB_container=$("#mCSB_"+d.idx+"_container"),
				wrapper=mCSB_container.parent(),
				t=typeof val;
			if(!dir){dir=o.axis==="x" ? "x" : "y";}
			var contentLength=dir==="x" ? mCSB_container.outerWidth(false)-wrapper.width() : mCSB_container.outerHeight(false)-wrapper.height(),
				contentPos=dir==="x" ? mCSB_container[0].offsetLeft : mCSB_container[0].offsetTop,
				cssProp=dir==="x" ? "left" : "top";
			switch(t){
				case "function": /* this currently is not used. Consider removing it */
					return val();
					break;
				case "object": /* js/jquery object */
					var obj=val.jquery ? val : $(val);
					if(!obj.length){return;}
					return dir==="x" ? _childPos(obj)[1] : _childPos(obj)[0];
					break;
				case "string": case "number":
					if(_isNumeric(val)){ /* numeric value */
						return Math.abs(val);
					}else if(val.indexOf("%")!==-1){ /* percentage value */
						return Math.abs(contentLength*parseInt(val)/100);
					}else if(val.indexOf("-=")!==-1){ /* decrease value */
						return Math.abs(contentPos-parseInt(val.split("-=")[1]));
					}else if(val.indexOf("+=")!==-1){ /* inrease value */
						var p=(contentPos+parseInt(val.split("+=")[1]));
						return p>=0 ? 0 : Math.abs(p);
					}else if(val.indexOf("px")!==-1 && _isNumeric(val.split("px")[0])){ /* pixels string value (e.g. "100px") */
						return Math.abs(val.split("px")[0]);
					}else{
						if(val==="top" || val==="left"){ /* special strings */
							return 0;
						}else if(val==="bottom"){
							return Math.abs(wrapper.height()-mCSB_container.outerHeight(false));
						}else if(val==="right"){
							return Math.abs(wrapper.width()-mCSB_container.outerWidth(false));
						}else if(val==="first" || val==="last"){
							var obj=mCSB_container.find(":"+val);
							return dir==="x" ? _childPos(obj)[1] : _childPos(obj)[0];
						}else{
							if($(val).length){ /* jquery selector */
								return dir==="x" ? _childPos($(val))[1] : _childPos($(val))[0];
							}else{ /* other values (e.g. "100em") */
								mCSB_container.css(cssProp,val);
								methods.update.call(null,$this[0]);
								return;
							}
						}
					}
					break;
			}
		},
		/* -------------------- */
		
		
		/* calls the update method automatically */
		_autoUpdate=function(rem){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				mCSB_container=$("#mCSB_"+d.idx+"_container");
			if(rem){
				/* 
				removes autoUpdate timer 
				usage: _autoUpdate.call(this,"remove");
				*/
				clearTimeout(mCSB_container[0].autoUpdate);
				_delete(mCSB_container[0],"autoUpdate");
				return;
			}
			upd();
			function upd(){
				clearTimeout(mCSB_container[0].autoUpdate);
				if($this.parents("html").length===0){
					/* check element in dom tree */
					$this=null;
					return;
				}
				mCSB_container[0].autoUpdate=setTimeout(function(){
					/* update on specific selector(s) length and size change */
					if(o.advanced.updateOnSelectorChange){
						d.poll.change.n=sizesSum();
						if(d.poll.change.n!==d.poll.change.o){
							d.poll.change.o=d.poll.change.n;
							doUpd(3);
							return;
						}
					}
					/* update on main element and scrollbar size changes */
					if(o.advanced.updateOnContentResize){
						d.poll.size.n=$this[0].scrollHeight+$this[0].scrollWidth+mCSB_container[0].offsetHeight+$this[0].offsetHeight+$this[0].offsetWidth;
						if(d.poll.size.n!==d.poll.size.o){
							d.poll.size.o=d.poll.size.n;
							doUpd(1);
							return;
						}
					}
					/* update on image load */
					if(o.advanced.updateOnImageLoad){
						if(!(o.advanced.updateOnImageLoad==="auto" && o.axis==="y")){ //by default, it doesn't run on vertical content
							d.poll.img.n=mCSB_container.find("img").length;
							if(d.poll.img.n!==d.poll.img.o){
								d.poll.img.o=d.poll.img.n;
								mCSB_container.find("img").each(function(){
									imgLoader(this);
								});
								return;
							}
						}
					}
					if(o.advanced.updateOnSelectorChange || o.advanced.updateOnContentResize || o.advanced.updateOnImageLoad){upd();}
				},o.advanced.autoUpdateTimeout);
			}
			/* a tiny image loader */
			function imgLoader(el){
				if($(el).hasClass(classes[2])){doUpd(); return;}
				var img=new Image();
				function createDelegate(contextObject,delegateMethod){
					return function(){return delegateMethod.apply(contextObject,arguments);}
				}
				function imgOnLoad(){
					this.onload=null;
					$(el).addClass(classes[2]);
					doUpd(2);
				}
				img.onload=createDelegate(img,imgOnLoad);
				img.src=el.src;
			}
			/* returns the total height and width sum of all elements matching the selector */
			function sizesSum(){
				if(o.advanced.updateOnSelectorChange===true){o.advanced.updateOnSelectorChange="*";}
				var total=0,sel=mCSB_container.find(o.advanced.updateOnSelectorChange);
				if(o.advanced.updateOnSelectorChange && sel.length>0){sel.each(function(){total+=this.offsetHeight+this.offsetWidth;});}
				return total;
			}
			/* calls the update method */
			function doUpd(cb){
				clearTimeout(mCSB_container[0].autoUpdate);
				methods.update.call(null,$this[0],cb);
			}
		},
		/* -------------------- */
		
		
		/* snaps scrolling to a multiple of a pixels number */
		_snapAmount=function(to,amount,offset){
			return (Math.round(to/amount)*amount-offset); 
		},
		/* -------------------- */
		
		
		/* stops content and scrollbar animations */
		_stop=function(el){
			var d=el.data(pluginPfx),
				sel=$("#mCSB_"+d.idx+"_container,#mCSB_"+d.idx+"_container_wrapper,#mCSB_"+d.idx+"_dragger_vertical,#mCSB_"+d.idx+"_dragger_horizontal");
			sel.each(function(){
				_stopTween.call(this);
			});
		},
		/* -------------------- */
		
		
		/* 
		ANIMATES CONTENT 
		This is where the actual scrolling happens
		*/
		_scrollTo=function(el,to,options){
			var d=el.data(pluginPfx),o=d.opt,
				defaults={
					trigger:"internal",
					dir:"y",
					scrollEasing:"mcsEaseOut",
					drag:false,
					dur:o.scrollInertia,
					overwrite:"all",
					callbacks:true,
					onStart:true,
					onUpdate:true,
					onComplete:true
				},
				options=$.extend(defaults,options),
				dur=[options.dur,(options.drag ? 0 : options.dur)],
				mCustomScrollBox=$("#mCSB_"+d.idx),
				mCSB_container=$("#mCSB_"+d.idx+"_container"),
				wrapper=mCSB_container.parent(),
				totalScrollOffsets=o.callbacks.onTotalScrollOffset ? _arr.call(el,o.callbacks.onTotalScrollOffset) : [0,0],
				totalScrollBackOffsets=o.callbacks.onTotalScrollBackOffset ? _arr.call(el,o.callbacks.onTotalScrollBackOffset) : [0,0];
			d.trigger=options.trigger;
			if(wrapper.scrollTop()!==0 || wrapper.scrollLeft()!==0){ /* always reset scrollTop/Left */
				$(".mCSB_"+d.idx+"_scrollbar").css("visibility","visible");
				wrapper.scrollTop(0).scrollLeft(0);
			}
			if(to==="_resetY" && !d.contentReset.y){
				/* callbacks: onOverflowYNone */
				if(_cb("onOverflowYNone")){o.callbacks.onOverflowYNone.call(el[0]);}
				d.contentReset.y=1;
			}
			if(to==="_resetX" && !d.contentReset.x){
				/* callbacks: onOverflowXNone */
				if(_cb("onOverflowXNone")){o.callbacks.onOverflowXNone.call(el[0]);}
				d.contentReset.x=1;
			}
			if(to==="_resetY" || to==="_resetX"){return;}
			if((d.contentReset.y || !el[0].mcs) && d.overflowed[0]){
				/* callbacks: onOverflowY */
				if(_cb("onOverflowY")){o.callbacks.onOverflowY.call(el[0]);}
				d.contentReset.x=null;
			}
			if((d.contentReset.x || !el[0].mcs) && d.overflowed[1]){
				/* callbacks: onOverflowX */
				if(_cb("onOverflowX")){o.callbacks.onOverflowX.call(el[0]);}
				d.contentReset.x=null;
			}
			if(o.snapAmount){ /* scrolling snapping */
				var snapAmount=!(o.snapAmount instanceof Array) ? o.snapAmount : options.dir==="x" ? o.snapAmount[1] : o.snapAmount[0];
				to=_snapAmount(to,snapAmount,o.snapOffset);
			}
			switch(options.dir){
				case "x":
					var mCSB_dragger=$("#mCSB_"+d.idx+"_dragger_horizontal"),
						property="left",
						contentPos=mCSB_container[0].offsetLeft,
						limit=[
							mCustomScrollBox.width()-mCSB_container.outerWidth(false),
							mCSB_dragger.parent().width()-mCSB_dragger.width()
						],
						scrollTo=[to,to===0 ? 0 : (to/d.scrollRatio.x)],
						tso=totalScrollOffsets[1],
						tsbo=totalScrollBackOffsets[1],
						totalScrollOffset=tso>0 ? tso/d.scrollRatio.x : 0,
						totalScrollBackOffset=tsbo>0 ? tsbo/d.scrollRatio.x : 0;
					break;
				case "y":
					var mCSB_dragger=$("#mCSB_"+d.idx+"_dragger_vertical"),
						property="top",
						contentPos=mCSB_container[0].offsetTop,
						limit=[
							mCustomScrollBox.height()-mCSB_container.outerHeight(false),
							mCSB_dragger.parent().height()-mCSB_dragger.height()
						],
						scrollTo=[to,to===0 ? 0 : (to/d.scrollRatio.y)],
						tso=totalScrollOffsets[0],
						tsbo=totalScrollBackOffsets[0],
						totalScrollOffset=tso>0 ? tso/d.scrollRatio.y : 0,
						totalScrollBackOffset=tsbo>0 ? tsbo/d.scrollRatio.y : 0;
					break;
			}
			if(scrollTo[1]<0 || (scrollTo[0]===0 && scrollTo[1]===0)){
				scrollTo=[0,0];
			}else if(scrollTo[1]>=limit[1]){
				scrollTo=[limit[0],limit[1]];
			}else{
				scrollTo[0]=-scrollTo[0];
			}
			if(!el[0].mcs){
				_mcs();  /* init mcs object (once) to make it available before callbacks */
				if(_cb("onInit")){o.callbacks.onInit.call(el[0]);} /* callbacks: onInit */
			}
			clearTimeout(mCSB_container[0].onCompleteTimeout);
			_tweenTo(mCSB_dragger[0],property,Math.round(scrollTo[1]),dur[1],options.scrollEasing);
			if(!d.tweenRunning && ((contentPos===0 && scrollTo[0]>=0) || (contentPos===limit[0] && scrollTo[0]<=limit[0]))){return;}
			_tweenTo(mCSB_container[0],property,Math.round(scrollTo[0]),dur[0],options.scrollEasing,options.overwrite,{
				onStart:function(){
					if(options.callbacks && options.onStart && !d.tweenRunning){
						/* callbacks: onScrollStart */
						if(_cb("onScrollStart")){_mcs(); o.callbacks.onScrollStart.call(el[0]);}
						d.tweenRunning=true;
						_onDragClasses(mCSB_dragger);
						d.cbOffsets=_cbOffsets();
					}
				},onUpdate:function(){
					if(options.callbacks && options.onUpdate){
						/* callbacks: whileScrolling */
						if(_cb("whileScrolling")){_mcs(); o.callbacks.whileScrolling.call(el[0]);}
					}
				},onComplete:function(){
					if(options.callbacks && options.onComplete){
						if(o.axis==="yx"){clearTimeout(mCSB_container[0].onCompleteTimeout);}
						var t=mCSB_container[0].idleTimer || 0;
						mCSB_container[0].onCompleteTimeout=setTimeout(function(){
							/* callbacks: onScroll, onTotalScroll, onTotalScrollBack */
							if(_cb("onScroll")){_mcs(); o.callbacks.onScroll.call(el[0]);}
							if(_cb("onTotalScroll") && scrollTo[1]>=limit[1]-totalScrollOffset && d.cbOffsets[0]){_mcs(); o.callbacks.onTotalScroll.call(el[0]);}
							if(_cb("onTotalScrollBack") && scrollTo[1]<=totalScrollBackOffset && d.cbOffsets[1]){_mcs(); o.callbacks.onTotalScrollBack.call(el[0]);}
							d.tweenRunning=false;
							mCSB_container[0].idleTimer=0;
							_onDragClasses(mCSB_dragger,"hide");
						},t);
					}
				}
			});
			/* checks if callback function exists */
			function _cb(cb){
				return d && o.callbacks[cb] && typeof o.callbacks[cb]==="function";
			}
			/* checks whether callback offsets always trigger */
			function _cbOffsets(){
				return [o.callbacks.alwaysTriggerOffsets || contentPos>=limit[0]+tso,o.callbacks.alwaysTriggerOffsets || contentPos<=-tsbo];
			}
			/* 
			populates object with useful values for the user 
			values: 
				content: this.mcs.content
				content top position: this.mcs.top 
				content left position: this.mcs.left 
				dragger top position: this.mcs.draggerTop 
				dragger left position: this.mcs.draggerLeft 
				scrolling y percentage: this.mcs.topPct 
				scrolling x percentage: this.mcs.leftPct 
				scrolling direction: this.mcs.direction
			*/
			function _mcs(){
				var cp=[mCSB_container[0].offsetTop,mCSB_container[0].offsetLeft], /* content position */
					dp=[mCSB_dragger[0].offsetTop,mCSB_dragger[0].offsetLeft], /* dragger position */
					cl=[mCSB_container.outerHeight(false),mCSB_container.outerWidth(false)], /* content length */
					pl=[mCustomScrollBox.height(),mCustomScrollBox.width()]; /* content parent length */
				el[0].mcs={
					content:mCSB_container, /* original content wrapper as jquery object */
					top:cp[0],left:cp[1],draggerTop:dp[0],draggerLeft:dp[1],
					topPct:Math.round((100*Math.abs(cp[0]))/(Math.abs(cl[0])-pl[0])),leftPct:Math.round((100*Math.abs(cp[1]))/(Math.abs(cl[1])-pl[1])),
					direction:options.dir
				};
				/* 
				this refers to the original element containing the scrollbar(s)
				usage: this.mcs.top, this.mcs.leftPct etc. 
				*/
			}
		},
		/* -------------------- */
		
		
		/* 
		CUSTOM JAVASCRIPT ANIMATION TWEEN 
		Lighter and faster than jquery animate() and css transitions 
		Animates top/left properties and includes easings 
		*/
		_tweenTo=function(el,prop,to,duration,easing,overwrite,callbacks){
			if(!el._mTween){el._mTween={top:{},left:{}};}
			var callbacks=callbacks || {},
				onStart=callbacks.onStart || function(){},onUpdate=callbacks.onUpdate || function(){},onComplete=callbacks.onComplete || function(){},
				startTime=_getTime(),_delay,progress=0,from=el.offsetTop,elStyle=el.style,_request,tobj=el._mTween[prop];
			if(prop==="left"){from=el.offsetLeft;}
			var diff=to-from;
			tobj.stop=0;
			if(overwrite!=="none"){_cancelTween();}
			_startTween();
			function _step(){
				if(tobj.stop){return;}
				if(!progress){onStart.call();}
				progress=_getTime()-startTime;
				_tween();
				if(progress>=tobj.time){
					tobj.time=(progress>tobj.time) ? progress+_delay-(progress-tobj.time) : progress+_delay-1;
					if(tobj.time<progress+1){tobj.time=progress+1;}
				}
				if(tobj.time<duration){tobj.id=_request(_step);}else{onComplete.call();}
			}
			function _tween(){
				if(duration>0){
					tobj.currVal=_ease(tobj.time,from,diff,duration,easing);
					elStyle[prop]=Math.round(tobj.currVal)+"px";
				}else{
					elStyle[prop]=to+"px";
				}
				onUpdate.call();
			}
			function _startTween(){
				_delay=1000/60;
				tobj.time=progress+_delay;
				_request=(!window.requestAnimationFrame) ? function(f){_tween(); return setTimeout(f,0.01);} : window.requestAnimationFrame;
				tobj.id=_request(_step);
			}
			function _cancelTween(){
				if(tobj.id==null){return;}
				if(!window.requestAnimationFrame){clearTimeout(tobj.id);
				}else{window.cancelAnimationFrame(tobj.id);}
				tobj.id=null;
			}
			function _ease(t,b,c,d,type){
				switch(type){
					case "linear": case "mcsLinear":
						return c*t/d + b;
						break;
					case "mcsLinearOut":
						t/=d; t--; return c * Math.sqrt(1 - t*t) + b;
						break;
					case "easeInOutSmooth":
						t/=d/2;
						if(t<1) return c/2*t*t + b;
						t--;
						return -c/2 * (t*(t-2) - 1) + b;
						break;
					case "easeInOutStrong":
						t/=d/2;
						if(t<1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
						t--;
						return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
						break;
					case "easeInOut": case "mcsEaseInOut":
						t/=d/2;
						if(t<1) return c/2*t*t*t + b;
						t-=2;
						return c/2*(t*t*t + 2) + b;
						break;
					case "easeOutSmooth":
						t/=d; t--;
						return -c * (t*t*t*t - 1) + b;
						break;
					case "easeOutStrong":
						return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
						break;
					case "easeOut": case "mcsEaseOut": default:
						var ts=(t/=d)*t,tc=ts*t;
						return b+c*(0.499999999999997*tc*ts + -2.5*ts*ts + 5.5*tc + -6.5*ts + 4*t);
				}
			}
		},
		/* -------------------- */
		
		
		/* returns current time */
		_getTime=function(){
			if(window.performance && window.performance.now){
				return window.performance.now();
			}else{
				if(window.performance && window.performance.webkitNow){
					return window.performance.webkitNow();
				}else{
					if(Date.now){return Date.now();}else{return new Date().getTime();}
				}
			}
		},
		/* -------------------- */
		
		
		/* stops a tween */
		_stopTween=function(){
			var el=this;
			if(!el._mTween){el._mTween={top:{},left:{}};}
			var props=["top","left"];
			for(var i=0; i<props.length; i++){
				var prop=props[i];
				if(el._mTween[prop].id){
					if(!window.requestAnimationFrame){clearTimeout(el._mTween[prop].id);
					}else{window.cancelAnimationFrame(el._mTween[prop].id);}
					el._mTween[prop].id=null;
					el._mTween[prop].stop=1;
				}
			}
		},
		/* -------------------- */
		
		
		/* deletes a property (avoiding the exception thrown by IE) */
		_delete=function(c,m){
			try{delete c[m];}catch(e){c[m]=null;}
		},
		/* -------------------- */
		
		
		/* detects left mouse button */
		_mouseBtnLeft=function(e){
			return !(e.which && e.which!==1);
		},
		/* -------------------- */
		
		
		/* detects if pointer type event is touch */
		_pointerTouch=function(e){
			var t=e.originalEvent.pointerType;
			return !(t && t!=="touch" && t!==2);
		},
		/* -------------------- */
		
		
		/* checks if value is numeric */
		_isNumeric=function(val){
			return !isNaN(parseFloat(val)) && isFinite(val);
		},
		/* -------------------- */
		
		
		/* returns element position according to content */
		_childPos=function(el){
			var p=el.parents(".mCSB_container");
			return [el.offset().top-p.offset().top,el.offset().left-p.offset().left];
		},
		/* -------------------- */
		
		
		/* checks if browser tab is hidden/inactive via Page Visibility API */
		_isTabHidden=function(){
			var prop=_getHiddenProp();
			if(!prop) return false;
			return document[prop];
			function _getHiddenProp(){
				var pfx=["webkit","moz","ms","o"];
				if("hidden" in document) return "hidden"; //natively supported
				for(var i=0; i<pfx.length; i++){ //prefixed
				    if((pfx[i]+"Hidden") in document) 
				        return pfx[i]+"Hidden";
				}
				return null; //not supported
			}
		};
		/* -------------------- */
		
	
	
	
	
	/* 
	----------------------------------------
	PLUGIN SETUP 
	----------------------------------------
	*/
	
	/* plugin constructor functions */
	$.fn[pluginNS]=function(method){ /* usage: $(selector).mCustomScrollbar(); */
		if(methods[method]){
			return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		}else if(typeof method==="object" || !method){
			return methods.init.apply(this,arguments);
		}else{
			$.error("Method "+method+" does not exist");
		}
	};
	$[pluginNS]=function(method){ /* usage: $.mCustomScrollbar(); */
		if(methods[method]){
			return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		}else if(typeof method==="object" || !method){
			return methods.init.apply(this,arguments);
		}else{
			$.error("Method "+method+" does not exist");
		}
	};
	
	/* 
	allow setting plugin default options. 
	usage: $.mCustomScrollbar.defaults.scrollInertia=500; 
	to apply any changed default options on default selectors (below), use inside document ready fn 
	e.g.: $(document).ready(function(){ $.mCustomScrollbar.defaults.scrollInertia=500; });
	*/
	$[pluginNS].defaults=defaults;
	
	/* 
	add window object (window.mCustomScrollbar) 
	usage: if(window.mCustomScrollbar){console.log("custom scrollbar plugin loaded");}
	*/
	window[pluginNS]=true;
	
	$(window).bind("load",function(){
		
		$(defaultSelector)[pluginNS](); /* add scrollbars automatically on default selector */
		
		/* extend jQuery expressions */
		$.extend($.expr[":"],{
			/* checks if element is within scrollable viewport */
			mcsInView:$.expr[":"].mcsInView || function(el){
				var $el=$(el),content=$el.parents(".mCSB_container"),wrapper,cPos;
				if(!content.length){return;}
				wrapper=content.parent();
				cPos=[content[0].offsetTop,content[0].offsetLeft];
				return 	cPos[0]+_childPos($el)[0]>=0 && cPos[0]+_childPos($el)[0]<wrapper.height()-$el.outerHeight(false) && 
						cPos[1]+_childPos($el)[1]>=0 && cPos[1]+_childPos($el)[1]<wrapper.width()-$el.outerWidth(false);
			},
			/* checks if element or part of element is in view of scrollable viewport */
			mcsInSight:$.expr[":"].mcsInSight || function(el,i,m){
				var $el=$(el),elD,content=$el.parents(".mCSB_container"),wrapperView,pos,wrapperViewPct,
					pctVals=m[3]==="exact" ? [[1,0],[1,0]] : [[0.9,0.1],[0.6,0.4]];
				if(!content.length){return;}
				elD=[$el.outerHeight(false),$el.outerWidth(false)];
				pos=[content[0].offsetTop+_childPos($el)[0],content[0].offsetLeft+_childPos($el)[1]];
				wrapperView=[content.parent()[0].offsetHeight,content.parent()[0].offsetWidth];
				wrapperViewPct=[elD[0]<wrapperView[0] ? pctVals[0] : pctVals[1],elD[1]<wrapperView[1] ? pctVals[0] : pctVals[1]];
				return 	pos[0]-(wrapperView[0]*wrapperViewPct[0][0])<0 && pos[0]+elD[0]-(wrapperView[0]*wrapperViewPct[0][1])>=0 && 
						pos[1]-(wrapperView[1]*wrapperViewPct[1][0])<0 && pos[1]+elD[1]-(wrapperView[1]*wrapperViewPct[1][1])>=0;
			},
			/* checks if element is overflowed having visible scrollbar(s) */
			mcsOverflow:$.expr[":"].mcsOverflow || function(el){
				var d=$(el).data(pluginPfx);
				if(!d){return;}
				return d.overflowed[0] || d.overflowed[1];
			}
		});
	
	});

}))}));
/* ========================================================================
 * Bootstrap: tooltip.js v3.4.0
 * https://getbootstrap.com/docs/3.4/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2018 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null
    this.inState    = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.4.0'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $(document).find($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
    this.inState   = { click: false, hover: false, focus: false }

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in'
      return
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true
    }

    return false
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
    }

    if (self.isInStateTrue()) return

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo($(document).find(this.options.container)) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      if (that.$element) { // TODO: Check whether guarding this code with this `if` is really necessary.
        that.$element
          .removeAttr('aria-describedby')
          .trigger('hidden.bs.' + that.type)
      }
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var isSvg = window.SVGElement && el instanceof window.SVGElement
    // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
    // See https://github.com/twbs/bootstrap/issues/20280
    var elOffset  = isBody ? { top: 0, left: 0 } : (isSvg ? null : $element.offset())
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    if (e) {
      self.inState.click = !self.inState.click
      if (self.isInStateTrue()) self.enter(self)
      else self.leave(self)
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
      that.$element = null
    })
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.4.0
 * https://getbootstrap.com/docs/3.4/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2018 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.4.0'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
        o.content.call($e[0]) :
        o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.4.0
 * https://getbootstrap.com/docs/3.4/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2018 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.4.0'

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(document).find(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
    })
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)
    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger($.Event('shown.bs.dropdown', relatedTarget))
    }
    //是否是表单的下拉菜单
    if($this.attr('data-type') === 'select'){
      var optionList = $this.siblings('.option-list');
      if(optionList.length && !$parent.data('selectClick')){
        optionList.data('toggle') === 'customScroll' && optionList.mCustomScrollbar('scrollTo', ['top', 'left']);
        $parent.data('selectClick', 1);
        $parent.on('click.dropdown.select', function(ev){
          var cTargetDom = $(ev.target),
              curItem = cTargetDom.closest('dd');
          if(curItem.length){
            if(curItem.hasClass('disabled')){
              ev.stopPropagation();
            }else{
              if($this.attr('data-multiple') * 1){
                $this.find('input[type="hidden"]').val(curItem.attr('data-value'));
                $this.find('input[type="text"]').val(cTargetDom.text());
              }else{
                curItem.addClass('active').siblings('.active').removeClass('active');
                $this.find('input[type="hidden"]').val(curItem.attr('data-value'));
                $this.find('input[type="text"]').val(cTargetDom.text());
              }
            }
          }
        });
      }else if(optionList.length){
        optionList.data('toggle') === 'customScroll' && optionList.mCustomScrollbar('scrollTo',['top','left']);
      }
    }
    return false
  }

  Dropdown.prototype.keydown = function (e) {

    // if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)
    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' dd:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return
    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus');
    if(e.which === 13){
      $items.eq(index).trigger('click');
    }
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);

var ppppp = null;
// Popup
(function (window, $) {
  var Popup = function (j_) {
    var that = this;
    that.topWindow= window.top;
    that.topDocument= window.top.document;
    if(j_){
      var jd = {
          addTarget: $('body'),
          type: 1,
          win: window,
          className: "",
          shade: {bgColor: '#000000', opacity: 0.5, close: false},
          size: {full: 0, width: 'auto', height: 'auto'},
          position: {fixed: 1, pos: 'm-c'},
          animate: ['zoomIn', 'zoomOut'],
          autoClose: false,
          move: 0,
          head: '默认标题',
          opBtn: {close: 1, min: 1, max: 1},
          con: {
            html: "提示信息",
            icon: 1,
            src: null,
            btn: null
          },
          closeCallBack: null
        };
      j_.addTarget = j_.addTarget || $('body');
      that.j = $.extend(true, {}, jd, j_);
      that.createDom();
    }
  };
  Popup.prototype = {
    constructor: Popup,
    popupId: 0,
    allPopupList: null,
    alertType: ['alert', 'html', 'iframe', 'loading', 'taps', 'tab'],
    alertIcon: ['<i class="evicon evicon-right-1 text-success"></i>', '<i class="evicon evicon-close-2 text-warning"></i>', '<i class="evicon evicon-point-2 text-info"></i>', '<i class="evicon load-wait-1"></i>'],
    //得到窗口的宽高，dom的宽高，elemnet的宽高
    winAttr: function () {
      var that = this,
        win = $(window),
        doc = $(document);
      return {
        winW: win.width(),
        winH: win.height(),
        docW: doc.width(),
        docH: doc.height(),
        docST: doc.scrollTop(),
        docSL: doc.scrollLeft(),
        popupW: that.popup.width(),
        popupH: that.popup.height()
      };
    },
    randomS: function (len) {
      var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
        maxPos = chars.length,
        pwd = '',i;
      len = len || 5;
      for (i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
      }
      return pwd;
    },
    // 计算页面最大层
    maxZindex: function () {
      var that = this;
      var arr = [];
      that.j.addTarget.children().each(function (i, dom) {
        dom = $(dom);
        var z = dom.css('z-index');
        !isNaN(z) && arr.push(z * 1);
      });
      return Math.max(Math.max.apply(null, arr), 1000);
    },
    // 创建弹窗dom元素
    createDom: function () {
      var that = this,
        j = that.j,
        popupHArray = [],
        popupOpArray = [],
        popupBArray = [];

      //这里创建来源对象
      that.originWindow= j.win;
      that.originDocument= j.win.document;
      that.popupId = that.randomS(5);
      that.maxZindex();
      that.zIndex = that.maxZindex() + 1;
      var evPopup = that.topWindow.evPopup,
        tag = true;
      evPopup && evPopup['popup_' + that.popupId] && (that.popupId = that.randomS(5));
      evPopup && $.each(evPopup, function(i, v){
        if(v){
          tag = null;
          return false;
        }
      });
      tag && (evPopup = that.topWindow.evPopup = {});
      evPopup['popup_' + that.popupId] = that;
      //添加遮罩
      if (j.shade) {
        (function () {
          var style = ['z-index:' + (that.zIndex++)];
          !!j.shade.bgColor && style.push(' background-color:' + j.shade.bgColor);
          !isNaN(j.shade.opacity) && (typeof(j.shade.opacity) === 'string' || typeof(j.shade.opacity) === 'number') && style.push(' opacity:' + j.shade.opacity);
          that.popupShade = $("<div/>", {
            "class": "popup-shade",
            "id": "popupShade_" + that.popupId,
            "style": style.join(';')
          }).appendTo(j.addTarget);
          if(j.shade.close){
            that.popupShade.on('click', function(){
              that.popupClose();
            });
          }
        }());
      }
      //添加标题和按钮
      if (j.head) {
        popupHArray.push('<div class="popup-head"><span class="popup-title">' + (j.head || '') + '</span></div>');
      }
      if (j.opBtn) {
        popupOpArray.push('<div class="popup-option">');
        !!j.opBtn.min && popupOpArray.push('<i class="evicon evicon-resize-xs-1" data-action="min" title="最小化"></i>');
        !!j.opBtn.max && popupOpArray.push('<i class="evicon evicon-resize-lg-1" data-action="max" title="最大化"></i><i class="evicon evicon-resize-orig-1" data-action="orig" title="还原"></i>');
        !!j.opBtn.close && popupOpArray.push('<i class="evicon evicon-close-1" data-action="close" title="关闭"></i>');
        popupOpArray.push('</div>');
      }
      //构建弹窗内容
      (function () {
        popupBArray.push('<div class="popup-body"><div class="popup-body-inside">');
        //根据不同类型，判断内容区域
        switch (j.type) {
          case 1 :
            popupBArray.push('<div class="popup-alert-con"><div class="popup-hint-info">');
            j.con.icon && popupBArray.push(that.alertIcon[j.con.icon - 1] || that.alertIcon[0]);
            j.con.html && popupBArray.push(j.con.html);
            popupBArray.push('</div></div>');
            if (j.con.btn) {
              popupBArray.push('<div class="popup-but-area"><span class="popup-but">');
              $.each(j.con.btn, function (i, v) {
                popupBArray.push('<a href="javascript:;" data-btn-index="' + i + '" data-action="btn" class="btn btn-sm ' +( v.className || '' )+ '">' + v.text + '</a>');
              });
              popupBArray.push('</span></div>');
            }
            break;
          case 2:
            popupBArray.push('<div class="popup-layer-con">');
            popupBArray.push(j.con.html ? ((j.con.html instanceof jQuery) ? j.con.html.html() : j.con.html) : '<p>html代码</p>');
            popupBArray.push('</div>');
            break;
          case 3:
            popupBArray.push('<div class="popup-iframe-con"><div class="popup-loading-wait"></div>');
            popupBArray.push('<iframe src="' + j.con.src + '" frameborder="0" allowTransparency="true" name="popup_' + that.popupId + '" id="popup_' + that.popupId + '"></iframe>');
            popupBArray.push('</div>');
            break;
          case 4:
            popupBArray.push('<div class="popup-loading-con"><div class="loading-type-' + j.con.icon + '"></div></div>');
            break;
        }
        popupBArray.push('</div></div>');
      }());
      //构建弹窗
      (function () {
        var style = ['z-index:' + (that.zIndex++)];
        !isNaN(j.size.width) && style.push(' width:' + j.size.width + 'px');
        !isNaN(j.size.height) && style.push(' height:' + j.size.height + 'px');
        that.popup = $("<div/>", {
          "class": 'popup popup-' + that.alertType[j.type - 1] + (j.className ? (' ' + j.className) : '') + ((j.animate && j.animate.length) ? (' ' + j.animate[0]) : ''),
          "style": style.join(';'),
          "id": 'popup_' + that.popupId,
          html: popupOpArray.join('') + popupHArray.join('') + popupBArray.join('')
        });
        j.animate && j.animate.length && that.popup.attr('data-animated', j.animate);
        that.popup.appendTo(j.addTarget);
        that.popup.on({
          'click': function () {
            var targetDom = $(this);
            switch (targetDom.data('action')) {
              case 'min':
                that.popupMin();
                break;
              case 'max':
                that.popupMax();
                break;
              case 'orig':
                that.popupOrig();
                break;
              case 'close':
                that.popupClose();
                break;
              case 'btn':
                j.con.btn && j.con.btn[targetDom.data('btnIndex')]['callBack'] && j.con.btn[targetDom.data('btnIndex')]['callBack'](targetDom, that.popup);
                if(!j.con.btn[targetDom.data('btnIndex')]['noClose']){
                  that.popupClose();
                }
                break;
            }
          }
        }, '.popup-option .evicon,.popup-but .btn');
        setTimeout(function(){
          that.popupCountWH();
          that.popupOffset();
          that.popupDrag();
          if(j.size.full){
            that.popupMax();
          }
        });
      }());
      if(!isNaN(j.autoClose) && (typeof(j.autoClose) === 'string' || typeof(j.autoClose) === 'number')){
        setTimeout(function(){
          that.popupClose();
        }, j.autoClose * 1000);
      }
      Popup.prototype.allPopupList = Popup.prototype.allPopupList || {};
      Popup.prototype.allPopupList['popup_' + that.popupId] = that;
    },
    // 计算弹窗的位置
    popupOffset: function () {
      var that = this,
        j = that.j,
        pos = {
          't-l': {'left': 0, 'top': 0},
          't-c': {'left': '50%', 'top': 0, 'margin-left': -that.popup.width() / 2 + 'px'},
          't-r': {'right': 0, 'top': 0},
          'm-l': {'left': 0, 'top': '50%', 'margin-top': -that.popup.height() / 2 + 'px'},
          'm-c': {
            'left': '50%',
            'top': '50%',
            'margin-top': -that.popup.height() / 2 + 'px',
            'margin-left': -that.popup.width() / 2 + 'px'
          },
          'm-r': {'right': 0, 'top': '50%', 'margin-top': -that.popup.height() / 2 + 'px'},
          'b-l': {'left': 0, 'bottom': 0},
          'b-c': {'left': '50%', 'bottom': 0, 'margin-left': -that.popup.width() / 2 + 'px'},
          'b-r': {'right': 0, 'bottom': 0}
        };
      j.position.fixed === false && that.popup.css({"position": "absolute"});
      that.popup.css(pos[j.position.pos] || pos['m-c']);
    },
    // 计算弹窗宽高
    popupCountWH: function () {
      var that = this,
        j = that.j,
        winAttr = that.winAttr();
      switch (j.type) {
        case 3:
          (function () {
            var iframes = that.popup.find('iframe');
            iframes.on('load.resize', function () {
              iframes.siblings('.popup-loading-wait').remove();
              iframes[0].contentWindow.iframeNumber = that.popupId;
              iframes[0].contentWindow.popup = that;
              if(!j.size.full){
                iframes.css({
                  "width": (j.size.width === 'auto' ? iframes.contents().width() : j.size.width) + "px",
                  "height": (j.size.height === 'auto' ? iframes.contents().height() : (j.size.height - (j.head ? that.popup.find('.popup-head').outerHeight() + 5 : 0))) + "px"
                });
              }else{
                iframes.css({
                  width: '100%',
                  height: that.popup.height() -  (j.head ? that.popup.find('.popup-head').outerHeight()+5 : 0) + 'px'
                });
              }
              (function(){
                var w = j.size.width,
                  h = j.size.height;
                w = (w === 'auto' ? that.popup.width() : w);
                h = (h === 'auto' ? that.popup.height() : h);
                w = (w > winAttr.winW) ? (winAttr.winW - 10) : w;
                h = (h > winAttr.winH) ? (winAttr.winH - 10) : h;
                that.popup.css({width: w + 'px', height: h + 'px'});
                iframes.css({
                  width: w + 'px',
                  height: (h - (j.head ? that.popup.find('.popup-head').outerHeight() + 5 : 0)) + 'px'
                });
              }());
              that.popupOffset();
            });
          }());
          break;
        default:
          (function(){
            var w = j.size.width,
              h = j.size.height;
            if(j.size.width !== 'auto'){
              w = (w > winAttr.winW) ? (winAttr.winW - 10) : w;
              that.popup.css('width', w + 'px');
            }
            if(h !== 'auto'){
              h = (h > winAttr.winH) ? (winAttr.winH - 10) : h;
              that.popup.css('height', h + 'px');
            }
          }());
          break;
      }
    },
    // 最小化弹窗
    popupMin: function () {
      var that = this,
        j = that.j;
      !that.originStyle && (that.originStyle = that.popup.attr('style'));
      var zIndex = that.popup.css('z-index'),
        newStyle = 'bottom: 0; left:' + (j.addTarget.find('.popup-size-min').length * (200 + 10)) + 'px; margin: 0; z-index:' + zIndex + ';';
      that.popup.addClass('popup-size-min').removeClass('popup-size-max').attr({'style': newStyle});
      that.popupShade && that.popupShade.hide();
    },
    // 最大化弹窗
    popupMax: function () {
      var that = this;
      !that.originStyle && (that.originStyle = that.popup.attr('style'));
      var zIndex = that.popup.css('z-index'),
        newStyle = 'z-index:' + zIndex + ';';
      that.popup.addClass('popup-size-max').removeClass('popup-size-min').attr({'style': newStyle});
      that.popupShade && that.popupShade.show();
    },
    // 还原弹窗
    popupOrig: function () {
      var that = this,
          j = that.j;
      that.popup.removeClass('popup-size-max popup-size-min').attr({'style': that.originStyle});
      that.popupShade && that.popupShade.show();
      if(j.size.full && j.opBtn && j.opBtn.max){
        that.popupOffset();
      }
    },
    popupHide: function(){
      var that = this,
        j = that.j;
      j.animate && j.animate.length && that.popup.removeClass(j.animate[0]||'').addClass(j.animate[1]||'');
      setTimeout(function(){
        that.popup.hide();
        that.popupShade && that.popupShade.hide();
      }, j.animate[1] ? 210 : 0);
    },
    popupShow: function(){
      var that = this,
        j = that.j;
      that.popup.show();
      that.popupShade && that.popupShade.show();
      j.animate && j.animate.length && that.popup.removeClass(j.animate[1]||'').addClass(j.animate[0]||'');
    },
    // 关闭弹窗
    popupClose: function () {
      var that = this,
        j = that.j;
      j.animate && j.animate.length && that.popup.removeClass(j.animate[0]||'').addClass(j.animate[1]||'');
      setTimeout(function(){
        typeof(j.closeCallBack) === 'function' && j.closeCallBack();
        that.popup.remove();
        that.popupShade && that.popupShade.remove();
        // that.popup = null;
        that.allPopupList && (that.allPopupList['popup_' + that.popupId] = null);
        that.topWindow.evPopup && (that.topWindow.evPopup['popup_' + that.popupId] = null);
        that = null;
      }, j.animate[1] ? 210 : 0);
    },
    popupCloseAll: function(){
      var that = this;
      if(that.allPopupList){
        $.each(that.allPopupList, function(i, v){
          v && v.popupClose();
        });
      }
    },
    popupCloseWinAll: function(){
      var that = this;
      if(that.topWindow.evPopup){
        $.each(that.topWindow.evPopup, function(i, v){
          v && v.popupClose();
        });
      }
    },
    popupDrag: function(){
      var that = this,
          j = that.j;
      if(j.head){
        that.popup.drag({
          // parent:'parent', //定义拖动不能超出的外框,拖动范围
          randomPosition:false, //初始化随机位置
          direction:'all', //方向
          handler:'.popup-head' //拖动进行中 x,y为当前坐标
        });
      }
    }
  };
  $.evPopup = function (j) {
    return new Popup(j);
  };
  //alert
  $.evPopupAlert = function(j){
    var j_ = {
      type: 1,
      position: {pos: 'm-c'},
      shade:{close:0},
      opBtn: {close: 1, min: 0, max: 0},
      size: {width: 300},
      con: {
        html: "提示信息",
        icon: 3,
        btn:{'btn0':{text:'确定', className:'btn-primary'}}
      }
    };
    j.head && (j_.head = j.head);
    j.hint && (j_.con.html = j.hint);
    j.icon && (j_.con.icon = j.icon);
    j.win && (j_.win = j.win);
    j.position && (j_.position.pos = j.position);
    if(j.shade != undefined){
      j_.shade = j.shade ? $.extend(true,{}, j_.shade, j.shade) : j.shade;
    }
    if(j.btn){
      if($.isArray(j.btn)){
        $.each(j.btn, function(i, v){
          j_.con.btn['btn' + i] = $.extend(true,{}, j_.con.btn['btn' + i], v);
        });
      }else{
        j_.con.btn.btn0 = $.extend(true,{}, j_.con.btn.btn0, j.btn);
      }
    }
    j.closeCallBack && (j_.closeCallBack = j_.closeCallBack);
    return new Popup(j_);
  };
  //Point
  $.evPopupPoint = function(j){
    var className = false,
      j_ = {
        type: 1,
        head: false,
        className: '',
        shade:{close:0},
        position: {pos: 'm-c'},
        opBtn: false,
        con: {
          html: '<span class="hint-text">提示信息</span>',
          icon: 1,
          btn: false
        },
        autoClose: 1
      };
    j.hint && (j_.con.html = (j.hint.indexOf('<') !== -1 ? j.hint : '<span class="hint-text">' + j.hint + '</span>'));
    j.icon !== undefined && (j_.con.icon = j.icon);
    if(j.shade !== undefined){
      j_.shade = j.shade ? $.extend(true,{}, j_.shade, j.shade) : j.shade;
    }
    j.position && (j_.position.pos = j.position);
    switch(j.style){
      case 'block':
        className = ' block';
        j_.animate = ['fadeInDown', 'fadeOutUp'];
        j_.shade = false;
        j_.position.pos = j.position ? j.position : 't-c';
        break;
    }
    j.className && (j_.className = j.className + ' point');
    className && (j_.className = (j_.className + className));
    j.closeTime && (j_.autoClose = j.closeTime);
    j.closeCallBack && (j_.closeCallBack = j.closeCallBack);
    return new Popup(j_);
  };
  //confirm
  $.evPopupConfirm = function(j){
    var btn = [{text:'确定', className:'btn-primary'},{text:'取消', className:'btn-outline-danger'}];
    if(j.btn && $.isArray(j.btn)){
      $.each(j.btn, function(i, v) {
        j.btn[i] = $.extend({},btn[i], v);
      });
    };
    $.evPopupAlert(j);
  };
  // Prompt
  $.evPopupPrompt = function(j){
    var input = $('input'),
      j_ = {
      type: 1,
      position: {pos: 'm-c'},
      opBtn: {close: 1, min: 0, max: 0},
      size: {width: 300},
      con: {
        icon: 1,
        btn:{
          'btn1':{text:'确定', className:'btn-primary'},
          'btn2':{text:'取消', className:'btn-outline-danger'}
        }
      }
    };
    if($.isArray(j)){
      j = {
        head: j[0],
        con:{
          text: j[1],
          btn:{
            'btn1':{callBack: j[2]},
            'btn2':{callBack: j[3]}
          }
        },
        closeCallBack: j[3]
      }
    }
    return new Popup($.extend(true, {}, j_, j))
  };
  // Html代码形式
  $.evPopupHtml = function(j){
    var j_ = {
      type: 2,
      head: "HTML层",
      position: {pos: 'm-c'},
      opBtn: {close: 1, min: 0, max: 0},
      size:{width: 'auto', height: 'auto'},
      win: window,
      con: {
        html: '<p>这是html代码</p>'
      }
    };
    var getHtml = function(str){
        if(str instanceof jQuery){
          str = str.html()
        }else if(typeof(str) === 'string' && $.inArray(str.substr(0, 1), ['.', '#']) != -1 && $(str).length) {
          str = $(str).html();
        }
        return str;
      };
    j.head && (j_.con.head = j.head);
    j.html && (j_.con.html = getHtml(j.html));
    j.width && (j_.size.width = j.width);
    j.full && (j_.size.full = j.full);
    j.win && (j_.win = j.win);
    j.height && (j_.size.height = j.height);
    if(j.shade != undefined){
      j_.shade = j.shade ? $.extend(true,{}, j_.shade, j.shade) : j.shade;
    }
    j.closeCallBack && (j_.closeCallBack = j.closeCallBack);
    return new Popup(j_);
  };
  //Loading
  $.evPopupLoading = function (j) {
    var j_ = {
      type: 4,
      head: false,
      shade: {close: 0},
      position: {pos: 'm-c'},
      opBtn: false,
      con: {
        icon: 1
      }
    };
    j.icon && (j_.con.icon = j.icon);
    j.closeTime && (j_.autoClose = j.closeTime);
    if(j.shade != undefined){
      j_.shade = j.shade ? $.extend(true,{}, j_.shade, j.shade) : j.shade;
    }
    j.closeCallBack && (j_.closeCallBack = j.closeCallBack);
    return new Popup($.extend(true, {}, j_, j));
  };
  //Iframe
  $.evPopupIframe = function(j){
    var j_ = {
      type: 3,
      position: {pos: 'm-c'},
      size:{},
      opBtn: {close: 1, max: 0, min: 0},
      con: {
        src: 'http://www.evyun.cn'
      }
    };
    j.head && (j_.head = j.head);
    j.width && (j_.size.width = j.width);
    j.height && (j_.size.height = j.height);
    j.full && (j_.size.full = j.full);
    j.win && (j_.win = j.win);
    j.src && (j_.con.src = j.src);
    if(j.shade != undefined){
      j_.shade = j.shade ? $.extend(true,{}, j_.shade, j.shade) : j.shade;
    }
    j.closeCallBack && (j_.closeCallBack = j.closeCallBack);
    return new Popup(j_);
  };
  // 关闭当前iframe中的弹窗
  $.evPopupCloseAll = function(){
    var popup = new Popup();
    popup.popupCloseAll();
    popup = null;
  };
  // 关闭所有的弹窗
  $.evPopupCloseWinAll = function(){
    var popup = new Popup();
    popup.popupCloseWinAll();
    popup = null;
  };
})(window, jQuery);
(function () {
  $(document).on('click.evPopup', '[data-toggle="popup"]', function (ev) {
    var $this = $(this),
        domDate = $this.data();
    switch(domDate.popupType){
      case 'alert':
        $.evPopupAlert({
          head:domDate.popupHead,
          hint: domDate.popupHint
        });
        break;
      case 'point':
        $.evPopupPoint({
          icon: domDate.popupIcontype,
          hint: '<span class="hint-text">' + domDate.popupHint + '</span>',
          closeTime: domDate.popupClosetime
        });
        break;
      case 'html':
        $.evPopupHtml({
          head:domDate.popupHead,
          html: domDate.popupTarget,
          width:domDate.popupWidth,
          height: domDate.popupHeight
        });
        break;
      case 'loading':
        $.evPopupLoading({
          icon: domDate.popupIcontype,
          closeTime: domDate.popupClosetime
        });
        break;
      case 'iframe':
        $.evPopupIframe({
          head:domDate.popupHead,
          src: domDate.popupSrc,
          width: domDate.popupWidth,
          height: domDate.popupHeight
        });
        break;
    }
  });
}());

//! moment.js
//! version : 2.10.6
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
			global.moment = factory()
}(this, function () {
	'use strict';

	var hookCallback;

	function utils_hooks__hooks() {
		return hookCallback.apply(null, arguments);
	}

	// This is done to register the method called with moment()
	// without creating circular dependencies.
	function setHookCallback(callback) {
		hookCallback = callback;
	}

	function isArray(input) {
		return Object.prototype.toString.call(input) === '[object Array]';
	}

	function isDate(input) {
		return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
	}

	function map(arr, fn) {
		var res = [], i;
		for (i = 0; i < arr.length; ++i) {
			res.push(fn(arr[i], i));
		}
		return res;
	}

	function hasOwnProp(a, b) {
		return Object.prototype.hasOwnProperty.call(a, b);
	}

	function extend(a, b) {
		for (var i in b) {
			if (hasOwnProp(b, i)) {
				a[i] = b[i];
			}
		}

		if (hasOwnProp(b, 'toString')) {
			a.toString = b.toString;
		}

		if (hasOwnProp(b, 'valueOf')) {
			a.valueOf = b.valueOf;
		}

		return a;
	}

	function create_utc__createUTC(input, format, locale, strict) {
		return createLocalOrUTC(input, format, locale, strict, true).utc();
	}

	function defaultParsingFlags() {
		// We need to deep clone this object.
		return {
			empty: false,
			unusedTokens: [],
			unusedInput: [],
			overflow: -2,
			charsLeftOver: 0,
			nullInput: false,
			invalidMonth: null,
			invalidFormat: false,
			userInvalidated: false,
			iso: false
		};
	}

	function getParsingFlags(m) {
		if (m._pf == null) {
			m._pf = defaultParsingFlags();
		}
		return m._pf;
	}

	function valid__isValid(m) {
		if (m._isValid == null) {
			var flags = getParsingFlags(m);
			m._isValid = !isNaN(m._d.getTime()) &&
				flags.overflow < 0 &&
				!flags.empty &&
				!flags.invalidMonth &&
				!flags.invalidWeekday &&
				!flags.nullInput &&
				!flags.invalidFormat &&
				!flags.userInvalidated;

			if (m._strict) {
				m._isValid = m._isValid &&
					flags.charsLeftOver === 0 &&
					flags.unusedTokens.length === 0 &&
					flags.bigHour === undefined;
			}
		}
		return m._isValid;
	}

	function valid__createInvalid(flags) {
		var m = create_utc__createUTC(NaN);
		if (flags != null) {
			extend(getParsingFlags(m), flags);
		}
		else {
			getParsingFlags(m).userInvalidated = true;
		}

		return m;
	}

	var momentProperties = utils_hooks__hooks.momentProperties = [];

	function copyConfig(to, from) {
		var i, prop, val;

		if (typeof from._isAMomentObject !== 'undefined') {
			to._isAMomentObject = from._isAMomentObject;
		}
		if (typeof from._i !== 'undefined') {
			to._i = from._i;
		}
		if (typeof from._f !== 'undefined') {
			to._f = from._f;
		}
		if (typeof from._l !== 'undefined') {
			to._l = from._l;
		}
		if (typeof from._strict !== 'undefined') {
			to._strict = from._strict;
		}
		if (typeof from._tzm !== 'undefined') {
			to._tzm = from._tzm;
		}
		if (typeof from._isUTC !== 'undefined') {
			to._isUTC = from._isUTC;
		}
		if (typeof from._offset !== 'undefined') {
			to._offset = from._offset;
		}
		if (typeof from._pf !== 'undefined') {
			to._pf = getParsingFlags(from);
		}
		if (typeof from._locale !== 'undefined') {
			to._locale = from._locale;
		}

		if (momentProperties.length > 0) {
			for (i in momentProperties) {
				prop = momentProperties[i];
				val = from[prop];
				if (typeof val !== 'undefined') {
					to[prop] = val;
				}
			}
		}

		return to;
	}

	var updateInProgress = false;

	// Moment prototype object
	function Moment(config) {
		copyConfig(this, config);
		this._d = new Date(config._d != null ? config._d.getTime() : NaN);
		// Prevent infinite loop in case updateOffset creates new moment
		// objects.
		if (updateInProgress === false) {
			updateInProgress = true;
			utils_hooks__hooks.updateOffset(this);
			updateInProgress = false;
		}
	}

	function isMoment(obj) {
		return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
	}

	function absFloor(number) {
		if (number < 0) {
			return Math.ceil(number);
		} else {
			return Math.floor(number);
		}
	}

	function toInt(argumentForCoercion) {
		var coercedNumber = +argumentForCoercion,
			value = 0;

		if (coercedNumber !== 0 && isFinite(coercedNumber)) {
			value = absFloor(coercedNumber);
		}

		return value;
	}

	function compareArrays(array1, array2, dontConvert) {
		var len = Math.min(array1.length, array2.length),
			lengthDiff = Math.abs(array1.length - array2.length),
			diffs = 0,
			i;
		for (i = 0; i < len; i++) {
			if ((dontConvert && array1[i] !== array2[i]) ||
				(!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
				diffs++;
			}
		}
		return diffs + lengthDiff;
	}

	function Locale() {
	}

	var locales = {};
	var globalLocale;

	function normalizeLocale(key) {
		return key ? key.toLowerCase().replace('_', '-') : key;
	}

	// pick the locale from the array
	// try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
	// substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
	function chooseLocale(names) {
		var i = 0, j, next, locale, split;

		while (i < names.length) {
			split = normalizeLocale(names[i]).split('-');
			j = split.length;
			next = normalizeLocale(names[i + 1]);
			next = next ? next.split('-') : null;
			while (j > 0) {
				locale = loadLocale(split.slice(0, j).join('-'));
				if (locale) {
					return locale;
				}
				if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
					//the next array item is better than a shallower substring of this one
					break;
				}
				j--;
			}
			i++;
		}
		return null;
	}

	function loadLocale(name) {
		var oldLocale = null;
		// TODO: Find a better way to register and load all the locales in Node
		if (!locales[name] && typeof module !== 'undefined' &&
			module && module.exports) {
			try {
				oldLocale = globalLocale._abbr;
				require('./locale/' + name);
				// because defineLocale currently also sets the global locale, we
				// want to undo that for lazy loaded locales
				locale_locales__getSetGlobalLocale(oldLocale);
			} catch (e) { }
		}
		return locales[name];
	}

	// This function will load locale and then set the global locale.  If
	// no arguments are passed in, it will simply return the current global
	// locale key.
	function locale_locales__getSetGlobalLocale(key, values) {
		var data;
		if (key) {
			if (typeof values === 'undefined') {
				data = locale_locales__getLocale(key);
			}
			else {
				data = defineLocale(key, values);
			}

			if (data) {
				// moment.duration._locale = moment._locale = data;
				globalLocale = data;
			}
		}

		return globalLocale._abbr;
	}

	function defineLocale(name, values) {
		if (values !== null) {
			values.abbr = name;
			locales[name] = locales[name] || new Locale();
			locales[name].set(values);

			// backwards compat for now: also set the locale
			locale_locales__getSetGlobalLocale(name);

			return locales[name];
		} else {
			// useful for testing
			delete locales[name];
			return null;
		}
	}

	// returns locale data
	function locale_locales__getLocale(key) {
		var locale;

		if (key && key._locale && key._locale._abbr) {
			key = key._locale._abbr;
		}

		if (!key) {
			return globalLocale;
		}

		if (!isArray(key)) {
			//short-circuit everything else
			locale = loadLocale(key);
			if (locale) {
				return locale;
			}
			key = [key];
		}

		return chooseLocale(key);
	}

	var aliases = {};

	function addUnitAlias(unit, shorthand) {
		var lowerCase = unit.toLowerCase();
		aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
	}

	function normalizeUnits(units) {
		return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
	}

	function normalizeObjectUnits(inputObject) {
		var normalizedInput = {},
			normalizedProp,
			prop;

		for (prop in inputObject) {
			if (hasOwnProp(inputObject, prop)) {
				normalizedProp = normalizeUnits(prop);
				if (normalizedProp) {
					normalizedInput[normalizedProp] = inputObject[prop];
				}
			}
		}

		return normalizedInput;
	}

	function makeGetSet(unit, keepTime) {
		return function (value) {
			if (value != null) {
				get_set__set(this, unit, value);
				utils_hooks__hooks.updateOffset(this, keepTime);
				return this;
			} else {
				return get_set__get(this, unit);
			}
		};
	}

	function get_set__get(mom, unit) {
		return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
	}

	function get_set__set(mom, unit, value) {
		return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
	}

	// MOMENTS

	function getSet(units, value) {
		var unit;
		if (typeof units === 'object') {
			for (unit in units) {
				this.set(unit, units[unit]);
			}
		} else {
			units = normalizeUnits(units);
			if (typeof this[units] === 'function') {
				return this[units](value);
			}
		}
		return this;
	}

	function zeroFill(number, targetLength, forceSign) {
		var absNumber = '' + Math.abs(number),
			zerosToFill = targetLength - absNumber.length,
			sign = number >= 0;
		return (sign ? (forceSign ? '+' : '') : '-') +
			Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
	}

	var formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

	var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

	var formatFunctions = {};

	var formatTokenFunctions = {};

	// token:    'M'
	// padded:   ['MM', 2]
	// ordinal:  'Mo'
	// callback: function () { this.month() + 1 }
	function addFormatToken(token, padded, ordinal, callback) {
		var func = callback;
		if (typeof callback === 'string') {
			func = function () {
				return this[callback]();
			};
		}
		if (token) {
			formatTokenFunctions[token] = func;
		}
		if (padded) {
			formatTokenFunctions[padded[0]] = function () {
				return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
			};
		}
		if (ordinal) {
			formatTokenFunctions[ordinal] = function () {
				return this.localeData().ordinal(func.apply(this, arguments), token);
			};
		}
	}

	function removeFormattingTokens(input) {
		if (input.match(/\[[\s\S]/)) {
			return input.replace(/^\[|\]$/g, '');
		}
		return input.replace(/\\/g, '');
	}

	function makeFormatFunction(format) {
		var array = format.match(formattingTokens), i, length;

		for (i = 0, length = array.length; i < length; i++) {
			if (formatTokenFunctions[array[i]]) {
				array[i] = formatTokenFunctions[array[i]];
			} else {
				array[i] = removeFormattingTokens(array[i]);
			}
		}

		return function (mom) {
			var output = '';
			for (i = 0; i < length; i++) {
				output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
			}
			return output;
		};
	}

	// format date using native date object
	function formatMoment(m, format) {
		if (!m.isValid()) {
			return m.localeData().invalidDate();
		}

		format = expandFormat(format, m.localeData());
		formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

		return formatFunctions[format](m);
	}

	function expandFormat(format, locale) {
		var i = 5;

		function replaceLongDateFormatTokens(input) {
			return locale.longDateFormat(input) || input;
		}

		localFormattingTokens.lastIndex = 0;
		while (i >= 0 && localFormattingTokens.test(format)) {
			format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
			localFormattingTokens.lastIndex = 0;
			i -= 1;
		}

		return format;
	}

	var match1 = /\d/;            //       0 - 9
	var match2 = /\d\d/;          //      00 - 99
	var match3 = /\d{3}/;         //     000 - 999
	var match4 = /\d{4}/;         //    0000 - 9999
	var match6 = /[+-]?\d{6}/;    // -999999 - 999999
	var match1to2 = /\d\d?/;         //       0 - 99
	var match1to3 = /\d{1,3}/;       //       0 - 999
	var match1to4 = /\d{1,4}/;       //       0 - 9999
	var match1to6 = /[+-]?\d{1,6}/;  // -999999 - 999999

	var matchUnsigned = /\d+/;           //       0 - inf
	var matchSigned = /[+-]?\d+/;      //    -inf - inf

	var matchOffset = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z

	var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

	// any word (or two) characters or numbers including two/three word month in arabic.
	var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;

	var regexes = {};

	function isFunction(sth) {
		// https://github.com/moment/moment/issues/2325
		return typeof sth === 'function' &&
			Object.prototype.toString.call(sth) === '[object Function]';
	}


	function addRegexToken(token, regex, strictRegex) {
		regexes[token] = isFunction(regex) ? regex : function (isStrict) {
			return (isStrict && strictRegex) ? strictRegex : regex;
		};
	}

	function getParseRegexForToken(token, config) {
		if (!hasOwnProp(regexes, token)) {
			return new RegExp(unescapeFormat(token));
		}

		return regexes[token](config._strict, config._locale);
	}

	// Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
	function unescapeFormat(s) {
		return s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
			return p1 || p2 || p3 || p4;
		}).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	}

	var tokens = {};

	function addParseToken(token, callback) {
		var i, func = callback;
		if (typeof token === 'string') {
			token = [token];
		}
		if (typeof callback === 'number') {
			func = function (input, array) {
				array[callback] = toInt(input);
			};
		}
		for (i = 0; i < token.length; i++) {
			tokens[token[i]] = func;
		}
	}

	function addWeekParseToken(token, callback) {
		addParseToken(token, function (input, array, config, token) {
			config._w = config._w || {};
			callback(input, config._w, config, token);
		});
	}

	function addTimeToArrayFromToken(token, input, config) {
		if (input != null && hasOwnProp(tokens, token)) {
			tokens[token](input, config._a, config, token);
		}
	}

	var YEAR = 0;
	var MONTH = 1;
	var DATE = 2;
	var HOUR = 3;
	var MINUTE = 4;
	var SECOND = 5;
	var MILLISECOND = 6;

	function daysInMonth(year, month) {
		return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
	}

	// FORMATTING

	addFormatToken('M', ['MM', 2], 'Mo', function () {
		return this.month() + 1;
	});

	addFormatToken('MMM', 0, 0, function (format) {
		return this.localeData().monthsShort(this, format);
	});

	addFormatToken('MMMM', 0, 0, function (format) {
		return this.localeData().months(this, format);
	});

	// ALIASES

	addUnitAlias('month', 'M');

	// PARSING

	addRegexToken('M', match1to2);
	addRegexToken('MM', match1to2, match2);
	addRegexToken('MMM', matchWord);
	addRegexToken('MMMM', matchWord);

	addParseToken(['M', 'MM'], function (input, array) {
		array[MONTH] = toInt(input) - 1;
	});

	addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
		var month = config._locale.monthsParse(input, token, config._strict);
		// if we didn't find a month name, mark the date as invalid.
		if (month != null) {
			array[MONTH] = month;
		} else {
			getParsingFlags(config).invalidMonth = input;
		}
	});

	// LOCALES

	var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
	function localeMonths(m) {
		return this._months[m.month()];
	}

	var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
	function localeMonthsShort(m) {
		return this._monthsShort[m.month()];
	}

	function localeMonthsParse(monthName, format, strict) {
		var i, mom, regex;

		if (!this._monthsParse) {
			this._monthsParse = [];
			this._longMonthsParse = [];
			this._shortMonthsParse = [];
		}

		for (i = 0; i < 12; i++) {
			// make the regex if we don't have it already
			mom = create_utc__createUTC([2000, i]);
			if (strict && !this._longMonthsParse[i]) {
				this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
				this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
			}
			if (!strict && !this._monthsParse[i]) {
				regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
				this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
			}
			// test the regex
			if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
				return i;
			} else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
				return i;
			} else if (!strict && this._monthsParse[i].test(monthName)) {
				return i;
			}
		}
	}

	// MOMENTS

	function setMonth(mom, value) {
		var dayOfMonth;

		// TODO: Move this out of here!
		if (typeof value === 'string') {
			value = mom.localeData().monthsParse(value);
			// TODO: Another silent failure?
			if (typeof value !== 'number') {
				return mom;
			}
		}

		dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
		mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
		return mom;
	}

	function getSetMonth(value) {
		if (value != null) {
			setMonth(this, value);
			utils_hooks__hooks.updateOffset(this, true);
			return this;
		} else {
			return get_set__get(this, 'Month');
		}
	}

	function getDaysInMonth() {
		return daysInMonth(this.year(), this.month());
	}

	function checkOverflow(m) {
		var overflow;
		var a = m._a;

		if (a && getParsingFlags(m).overflow === -2) {
			overflow =
				a[MONTH] < 0 || a[MONTH] > 11 ? MONTH :
					a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
						a[HOUR] < 0 || a[HOUR] > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
							a[MINUTE] < 0 || a[MINUTE] > 59 ? MINUTE :
								a[SECOND] < 0 || a[SECOND] > 59 ? SECOND :
									a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
										-1;

			if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
				overflow = DATE;
			}

			getParsingFlags(m).overflow = overflow;
		}

		return m;
	}

	function warn(msg) {
		if (utils_hooks__hooks.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
			console.warn('Deprecation warning: ' + msg);
		}
	}

	function deprecate(msg, fn) {
		var firstTime = true;

		return extend(function () {
			if (firstTime) {
				warn(msg + '\n' + (new Error()).stack);
				firstTime = false;
			}
			return fn.apply(this, arguments);
		}, fn);
	}

	var deprecations = {};

	function deprecateSimple(name, msg) {
		if (!deprecations[name]) {
			warn(msg);
			deprecations[name] = true;
		}
	}

	utils_hooks__hooks.suppressDeprecationWarnings = false;

	var from_string__isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

	var isoDates = [
		['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
		['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
		['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
		['GGGG-[W]WW', /\d{4}-W\d{2}/],
		['YYYY-DDD', /\d{4}-\d{3}/]
	];

	// iso time formats and regexes
	var isoTimes = [
		['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
		['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
		['HH:mm', /(T| )\d\d:\d\d/],
		['HH', /(T| )\d\d/]
	];

	var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

	// date from iso format
	function configFromISO(config) {
		var i, l,
			string = config._i,
			match = from_string__isoRegex.exec(string);

		if (match) {
			getParsingFlags(config).iso = true;
			for (i = 0, l = isoDates.length; i < l; i++) {
				if (isoDates[i][1].exec(string)) {
					config._f = isoDates[i][0];
					break;
				}
			}
			for (i = 0, l = isoTimes.length; i < l; i++) {
				if (isoTimes[i][1].exec(string)) {
					// match[6] should be 'T' or space
					config._f += (match[6] || ' ') + isoTimes[i][0];
					break;
				}
			}
			if (string.match(matchOffset)) {
				config._f += 'Z';
			}
			configFromStringAndFormat(config);
		} else {
			config._isValid = false;
		}
	}

	// date from iso format or fallback
	function configFromString(config) {
		var matched = aspNetJsonRegex.exec(config._i);

		if (matched !== null) {
			config._d = new Date(+matched[1]);
			return;
		}

		configFromISO(config);
		if (config._isValid === false) {
			delete config._isValid;
			utils_hooks__hooks.createFromInputFallback(config);
		}
	}

	utils_hooks__hooks.createFromInputFallback = deprecate(
		'moment construction falls back to js Date. This is ' +
		'discouraged and will be removed in upcoming major ' +
		'release. Please refer to ' +
		'https://github.com/moment/moment/issues/1407 for more info.',
		function (config) {
			config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
		}
	);

	function createDate(y, m, d, h, M, s, ms) {
		//can't just apply() to create a date:
		//http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
		var date = new Date(y, m, d, h, M, s, ms);

		//the date constructor doesn't accept years < 1970
		if (y < 1970) {
			date.setFullYear(y);
		}
		return date;
	}

	function createUTCDate(y) {
		var date = new Date(Date.UTC.apply(null, arguments));
		if (y < 1970) {
			date.setUTCFullYear(y);
		}
		return date;
	}

	addFormatToken(0, ['YY', 2], 0, function () {
		return this.year() % 100;
	});

	addFormatToken(0, ['YYYY', 4], 0, 'year');
	addFormatToken(0, ['YYYYY', 5], 0, 'year');
	addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

	// ALIASES

	addUnitAlias('year', 'y');

	// PARSING

	addRegexToken('Y', matchSigned);
	addRegexToken('YY', match1to2, match2);
	addRegexToken('YYYY', match1to4, match4);
	addRegexToken('YYYYY', match1to6, match6);
	addRegexToken('YYYYYY', match1to6, match6);

	addParseToken(['YYYYY', 'YYYYYY'], YEAR);
	addParseToken('YYYY', function (input, array) {
		array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
	});
	addParseToken('YY', function (input, array) {
		array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
	});

	// HELPERS

	function daysInYear(year) {
		return isLeapYear(year) ? 366 : 365;
	}

	function isLeapYear(year) {
		return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	}

	// HOOKS

	utils_hooks__hooks.parseTwoDigitYear = function (input) {
		return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
	};

	// MOMENTS

	var getSetYear = makeGetSet('FullYear', false);

	function getIsLeapYear() {
		return isLeapYear(this.year());
	}

	addFormatToken('w', ['ww', 2], 'wo', 'week');
	addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

	// ALIASES

	addUnitAlias('week', 'w');
	addUnitAlias('isoWeek', 'W');

	// PARSING

	addRegexToken('w', match1to2);
	addRegexToken('ww', match1to2, match2);
	addRegexToken('W', match1to2);
	addRegexToken('WW', match1to2, match2);

	addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
		week[token.substr(0, 1)] = toInt(input);
	});

	// HELPERS

	// firstDayOfWeek       0 = sun, 6 = sat
	//                      the day of the week that starts the week
	//                      (usually sunday or monday)
	// firstDayOfWeekOfYear 0 = sun, 6 = sat
	//                      the first week is the week that contains the first
	//                      of this day of the week
	//                      (eg. ISO weeks use thursday (4))
	function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
		var end = firstDayOfWeekOfYear - firstDayOfWeek,
			daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
			adjustedMoment;


		if (daysToDayOfWeek > end) {
			daysToDayOfWeek -= 7;
		}

		if (daysToDayOfWeek < end - 7) {
			daysToDayOfWeek += 7;
		}

		adjustedMoment = local__createLocal(mom).add(daysToDayOfWeek, 'd');
		return {
			week: Math.ceil(adjustedMoment.dayOfYear() / 7),
			year: adjustedMoment.year()
		};
	}

	// LOCALES

	function localeWeek(mom) {
		return weekOfYear(mom, this._week.dow, this._week.doy).week;
	}

	var defaultLocaleWeek = {
		dow: 0, // Sunday is the first day of the week.
		doy: 6  // The week that contains Jan 1st is the first week of the year.
	};

	function localeFirstDayOfWeek() {
		return this._week.dow;
	}

	function localeFirstDayOfYear() {
		return this._week.doy;
	}

	// MOMENTS

	function getSetWeek(input) {
		var week = this.localeData().week(this);
		return input == null ? week : this.add((input - week) * 7, 'd');
	}

	function getSetISOWeek(input) {
		var week = weekOfYear(this, 1, 4).week;
		return input == null ? week : this.add((input - week) * 7, 'd');
	}

	addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

	// ALIASES

	addUnitAlias('dayOfYear', 'DDD');

	// PARSING

	addRegexToken('DDD', match1to3);
	addRegexToken('DDDD', match3);
	addParseToken(['DDD', 'DDDD'], function (input, array, config) {
		config._dayOfYear = toInt(input);
	});

	// HELPERS

	//http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
	function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
		var week1Jan = 6 + firstDayOfWeek - firstDayOfWeekOfYear, janX = createUTCDate(year, 0, 1 + week1Jan), d = janX.getUTCDay(), dayOfYear;
		if (d < firstDayOfWeek) {
			d += 7;
		}

		weekday = weekday != null ? 1 * weekday : firstDayOfWeek;

		dayOfYear = 1 + week1Jan + 7 * (week - 1) - d + weekday;

		return {
			year: dayOfYear > 0 ? year : year - 1,
			dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
		};
	}

	// MOMENTS

	function getSetDayOfYear(input) {
		var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
		return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
	}

	// Pick the first defined of two or three arguments.
	function defaults(a, b, c) {
		if (a != null) {
			return a;
		}
		if (b != null) {
			return b;
		}
		return c;
	}

	function currentDateArray(config) {
		var now = new Date();
		if (config._useUTC) {
			return [now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()];
		}
		return [now.getFullYear(), now.getMonth(), now.getDate()];
	}

	// convert an array to a date.
	// the array should mirror the parameters below
	// note: all values past the year are optional and will default to the lowest possible value.
	// [year, month, day , hour, minute, second, millisecond]
	function configFromArray(config) {
		var i, date, input = [], currentDate, yearToUse;

		if (config._d) {
			return;
		}

		currentDate = currentDateArray(config);

		//compute day of the year from weeks and weekdays
		if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
			dayOfYearFromWeekInfo(config);
		}

		//if the day of the year is set, figure out what it is
		if (config._dayOfYear) {
			yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

			if (config._dayOfYear > daysInYear(yearToUse)) {
				getParsingFlags(config)._overflowDayOfYear = true;
			}

			date = createUTCDate(yearToUse, 0, config._dayOfYear);
			config._a[MONTH] = date.getUTCMonth();
			config._a[DATE] = date.getUTCDate();
		}

		// Default to current date.
		// * if no year, month, day of month are given, default to today
		// * if day of month is given, default month and year
		// * if month is given, default only year
		// * if year is given, don't default anything
		for (i = 0; i < 3 && config._a[i] == null; ++i) {
			config._a[i] = input[i] = currentDate[i];
		}

		// Zero out whatever was not defaulted, including time
		for (; i < 7; i++) {
			config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
		}

		// Check for 24:00:00.000
		if (config._a[HOUR] === 24 &&
			config._a[MINUTE] === 0 &&
			config._a[SECOND] === 0 &&
			config._a[MILLISECOND] === 0) {
			config._nextDay = true;
			config._a[HOUR] = 0;
		}

		config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
		// Apply timezone offset from input. The actual utcOffset can be changed
		// with parseZone.
		if (config._tzm != null) {
			config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
		}

		if (config._nextDay) {
			config._a[HOUR] = 24;
		}
	}

	function dayOfYearFromWeekInfo(config) {
		var w, weekYear, week, weekday, dow, doy, temp;

		w = config._w;
		if (w.GG != null || w.W != null || w.E != null) {
			dow = 1;
			doy = 4;

			// TODO: We need to take the current isoWeekYear, but that depends on
			// how we interpret now (local, utc, fixed offset). So create
			// a now version of current config (take local/utc/offset flags, and
			// create now).
			weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
			week = defaults(w.W, 1);
			weekday = defaults(w.E, 1);
		} else {
			dow = config._locale._week.dow;
			doy = config._locale._week.doy;

			weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
			week = defaults(w.w, 1);

			if (w.d != null) {
				// weekday -- low day numbers are considered next week
				weekday = w.d;
				if (weekday < dow) {
					++week;
				}
			} else if (w.e != null) {
				// local weekday -- counting starts from begining of week
				weekday = w.e + dow;
			} else {
				// default to begining of week
				weekday = dow;
			}
		}
		temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

		config._a[YEAR] = temp.year;
		config._dayOfYear = temp.dayOfYear;
	}

	utils_hooks__hooks.ISO_8601 = function () { };

	// date from string and format string
	function configFromStringAndFormat(config) {
		// TODO: Move this to another part of the creation flow to prevent circular deps
		if (config._f === utils_hooks__hooks.ISO_8601) {
			configFromISO(config);
			return;
		}

		config._a = [];
		getParsingFlags(config).empty = true;

		// This array is used to make a Date, either with `new Date` or `Date.UTC`
		var string = '' + config._i,
			i, parsedInput, tokens, token, skipped,
			stringLength = string.length,
			totalParsedInputLength = 0;

		tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

		for (i = 0; i < tokens.length; i++) {
			token = tokens[i];
			parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
			if (parsedInput) {
				skipped = string.substr(0, string.indexOf(parsedInput));
				if (skipped.length > 0) {
					getParsingFlags(config).unusedInput.push(skipped);
				}
				string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
				totalParsedInputLength += parsedInput.length;
			}
			// don't parse if it's not a known token
			if (formatTokenFunctions[token]) {
				if (parsedInput) {
					getParsingFlags(config).empty = false;
				}
				else {
					getParsingFlags(config).unusedTokens.push(token);
				}
				addTimeToArrayFromToken(token, parsedInput, config);
			}
			else if (config._strict && !parsedInput) {
				getParsingFlags(config).unusedTokens.push(token);
			}
		}

		// add remaining unparsed input length to the string
		getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
		if (string.length > 0) {
			getParsingFlags(config).unusedInput.push(string);
		}

		// clear _12h flag if hour is <= 12
		if (getParsingFlags(config).bigHour === true &&
			config._a[HOUR] <= 12 &&
			config._a[HOUR] > 0) {
			getParsingFlags(config).bigHour = undefined;
		}
		// handle meridiem
		config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

		configFromArray(config);
		checkOverflow(config);
	}


	function meridiemFixWrap(locale, hour, meridiem) {
		var isPm;

		if (meridiem == null) {
			// nothing to do
			return hour;
		}
		if (locale.meridiemHour != null) {
			return locale.meridiemHour(hour, meridiem);
		} else if (locale.isPM != null) {
			// Fallback
			isPm = locale.isPM(meridiem);
			if (isPm && hour < 12) {
				hour += 12;
			}
			if (!isPm && hour === 12) {
				hour = 0;
			}
			return hour;
		} else {
			// this is not supposed to happen
			return hour;
		}
	}

	function configFromStringAndArray(config) {
		var tempConfig,
			bestMoment,

			scoreToBeat,
			i,
			currentScore;

		if (config._f.length === 0) {
			getParsingFlags(config).invalidFormat = true;
			config._d = new Date(NaN);
			return;
		}

		for (i = 0; i < config._f.length; i++) {
			currentScore = 0;
			tempConfig = copyConfig({}, config);
			if (config._useUTC != null) {
				tempConfig._useUTC = config._useUTC;
			}
			tempConfig._f = config._f[i];
			configFromStringAndFormat(tempConfig);

			if (!valid__isValid(tempConfig)) {
				continue;
			}

			// if there is any input that was not parsed add a penalty for that format
			currentScore += getParsingFlags(tempConfig).charsLeftOver;

			//or tokens
			currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

			getParsingFlags(tempConfig).score = currentScore;

			if (scoreToBeat == null || currentScore < scoreToBeat) {
				scoreToBeat = currentScore;
				bestMoment = tempConfig;
			}
		}

		extend(config, bestMoment || tempConfig);
	}

	function configFromObject(config) {
		if (config._d) {
			return;
		}

		var i = normalizeObjectUnits(config._i);
		config._a = [i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond];

		configFromArray(config);
	}

	function createFromConfig(config) {
		var res = new Moment(checkOverflow(prepareConfig(config)));
		if (res._nextDay) {
			// Adding is smart enough around DST
			res.add(1, 'd');
			res._nextDay = undefined;
		}

		return res;
	}

	function prepareConfig(config) {
		var input = config._i,
			format = config._f;

		config._locale = config._locale || locale_locales__getLocale(config._l);

		if (input === null || (format === undefined && input === '')) {
			return valid__createInvalid({ nullInput: true });
		}

		if (typeof input === 'string') {
			config._i = input = config._locale.preparse(input);
		}

		if (isMoment(input)) {
			return new Moment(checkOverflow(input));
		} else if (isArray(format)) {
			configFromStringAndArray(config);
		} else if (format) {
			configFromStringAndFormat(config);
		} else if (isDate(input)) {
			config._d = input;
		} else {
			configFromInput(config);
		}

		return config;
	}

	function configFromInput(config) {
		var input = config._i;
		if (input === undefined) {
			config._d = new Date();
		} else if (isDate(input)) {
			config._d = new Date(+input);
		} else if (typeof input === 'string') {
			configFromString(config);
		} else if (isArray(input)) {
			config._a = map(input.slice(0), function (obj) {
				return parseInt(obj, 10);
			});
			configFromArray(config);
		} else if (typeof (input) === 'object') {
			configFromObject(config);
		} else if (typeof (input) === 'number') {
			// from milliseconds
			config._d = new Date(input);
		} else {
			utils_hooks__hooks.createFromInputFallback(config);
		}
	}

	function createLocalOrUTC(input, format, locale, strict, isUTC) {
		var c = {};

		if (typeof (locale) === 'boolean') {
			strict = locale;
			locale = undefined;
		}
		// object construction must be done this way.
		// https://github.com/moment/moment/issues/1423
		c._isAMomentObject = true;
		c._useUTC = c._isUTC = isUTC;
		c._l = locale;
		c._i = input;
		c._f = format;
		c._strict = strict;

		return createFromConfig(c);
	}

	function local__createLocal(input, format, locale, strict) {
		return createLocalOrUTC(input, format, locale, strict, false);
	}

	var prototypeMin = deprecate(
		'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
		function () {
			var other = local__createLocal.apply(null, arguments);
			return other < this ? this : other;
		}
	);

	var prototypeMax = deprecate(
		'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
		function () {
			var other = local__createLocal.apply(null, arguments);
			return other > this ? this : other;
		}
	);

	// Pick a moment m from moments so that m[fn](other) is true for all
	// other. This relies on the function fn to be transitive.
	//
	// moments should either be an array of moment objects or an array, whose
	// first element is an array of moment objects.
	function pickBy(fn, moments) {
		var res, i;
		if (moments.length === 1 && isArray(moments[0])) {
			moments = moments[0];
		}
		if (!moments.length) {
			return local__createLocal();
		}
		res = moments[0];
		for (i = 1; i < moments.length; ++i) {
			if (!moments[i].isValid() || moments[i][fn](res)) {
				res = moments[i];
			}
		}
		return res;
	}

	// TODO: Use [].sort instead?
	function min() {
		var args = [].slice.call(arguments, 0);

		return pickBy('isBefore', args);
	}

	function max() {
		var args = [].slice.call(arguments, 0);

		return pickBy('isAfter', args);
	}

	function Duration(duration) {
		var normalizedInput = normalizeObjectUnits(duration),
			years = normalizedInput.year || 0,
			quarters = normalizedInput.quarter || 0,
			months = normalizedInput.month || 0,
			weeks = normalizedInput.week || 0,
			days = normalizedInput.day || 0,
			hours = normalizedInput.hour || 0,
			minutes = normalizedInput.minute || 0,
			seconds = normalizedInput.second || 0,
			milliseconds = normalizedInput.millisecond || 0;

		// representation for dateAddRemove
		this._milliseconds = +milliseconds +
			seconds * 1e3 + // 1000
			minutes * 6e4 + // 1000 * 60
			hours * 36e5; // 1000 * 60 * 60
		// Because of dateAddRemove treats 24 hours as different from a
		// day when working around DST, we need to store them separately
		this._days = +days +
			weeks * 7;
		// It is impossible translate months into days without knowing
		// which months you are are talking about, so we have to store
		// it separately.
		this._months = +months +
			quarters * 3 +
			years * 12;

		this._data = {};

		this._locale = locale_locales__getLocale();

		this._bubble();
	}

	function isDuration(obj) {
		return obj instanceof Duration;
	}

	function offset(token, separator) {
		addFormatToken(token, 0, 0, function () {
			var offset = this.utcOffset();
			var sign = '+';
			if (offset < 0) {
				offset = -offset;
				sign = '-';
			}
			return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
		});
	}

	offset('Z', ':');
	offset('ZZ', '');

	// PARSING

	addRegexToken('Z', matchOffset);
	addRegexToken('ZZ', matchOffset);
	addParseToken(['Z', 'ZZ'], function (input, array, config) {
		config._useUTC = true;
		config._tzm = offsetFromString(input);
	});

	// HELPERS

	// timezone chunker
	// '+10:00' > ['10',  '00']
	// '-1530'  > ['-15', '30']
	var chunkOffset = /([\+\-]|\d\d)/gi;

	function offsetFromString(string) {
		var matches = ((string || '').match(matchOffset) || []);
		var chunk = matches[matches.length - 1] || [];
		var parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
		var minutes = +(parts[1] * 60) + toInt(parts[2]);

		return parts[0] === '+' ? minutes : -minutes;
	}

	// Return a moment from input, that is local/utc/zone equivalent to model.
	function cloneWithOffset(input, model) {
		var res, diff;
		if (model._isUTC) {
			res = model.clone();
			diff = (isMoment(input) || isDate(input) ? +input : +local__createLocal(input)) - (+res);
			// Use low-level api, because this fn is low-level api.
			res._d.setTime(+res._d + diff);
			utils_hooks__hooks.updateOffset(res, false);
			return res;
		} else {
			return local__createLocal(input).local();
		}
	}

	function getDateOffset(m) {
		// On Firefox.24 Date#getTimezoneOffset returns a floating point.
		// https://github.com/moment/moment/pull/1871
		return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
	}

	// HOOKS

	// This function will be called whenever a moment is mutated.
	// It is intended to keep the offset in sync with the timezone.
	utils_hooks__hooks.updateOffset = function () { };

	// MOMENTS

	// keepLocalTime = true means only change the timezone, without
	// affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
	// 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
	// +0200, so we adjust the time as needed, to be valid.
	//
	// Keeping the time actually adds/subtracts (one hour)
	// from the actual represented time. That is why we call updateOffset
	// a second time. In case it wants us to change the offset again
	// _changeInProgress == true case, then we have to adjust, because
	// there is no such time in the given timezone.
	function getSetOffset(input, keepLocalTime) {
		var offset = this._offset || 0,
			localAdjust;
		if (input != null) {
			if (typeof input === 'string') {
				input = offsetFromString(input);
			}
			if (Math.abs(input) < 16) {
				input = input * 60;
			}
			if (!this._isUTC && keepLocalTime) {
				localAdjust = getDateOffset(this);
			}
			this._offset = input;
			this._isUTC = true;
			if (localAdjust != null) {
				this.add(localAdjust, 'm');
			}
			if (offset !== input) {
				if (!keepLocalTime || this._changeInProgress) {
					add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
				} else if (!this._changeInProgress) {
					this._changeInProgress = true;
					utils_hooks__hooks.updateOffset(this, true);
					this._changeInProgress = null;
				}
			}
			return this;
		} else {
			return this._isUTC ? offset : getDateOffset(this);
		}
	}

	function getSetZone(input, keepLocalTime) {
		if (input != null) {
			if (typeof input !== 'string') {
				input = -input;
			}

			this.utcOffset(input, keepLocalTime);

			return this;
		} else {
			return -this.utcOffset();
		}
	}

	function setOffsetToUTC(keepLocalTime) {
		return this.utcOffset(0, keepLocalTime);
	}

	function setOffsetToLocal(keepLocalTime) {
		if (this._isUTC) {
			this.utcOffset(0, keepLocalTime);
			this._isUTC = false;

			if (keepLocalTime) {
				this.subtract(getDateOffset(this), 'm');
			}
		}
		return this;
	}

	function setOffsetToParsedOffset() {
		if (this._tzm) {
			this.utcOffset(this._tzm);
		} else if (typeof this._i === 'string') {
			this.utcOffset(offsetFromString(this._i));
		}
		return this;
	}

	function hasAlignedHourOffset(input) {
		input = input ? local__createLocal(input).utcOffset() : 0;

		return (this.utcOffset() - input) % 60 === 0;
	}

	function isDaylightSavingTime() {
		return (
			this.utcOffset() > this.clone().month(0).utcOffset() ||
			this.utcOffset() > this.clone().month(5).utcOffset()
		);
	}

	function isDaylightSavingTimeShifted() {
		if (typeof this._isDSTShifted !== 'undefined') {
			return this._isDSTShifted;
		}

		var c = {};

		copyConfig(c, this);
		c = prepareConfig(c);

		if (c._a) {
			var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
			this._isDSTShifted = this.isValid() &&
				compareArrays(c._a, other.toArray()) > 0;
		} else {
			this._isDSTShifted = false;
		}

		return this._isDSTShifted;
	}

	function isLocal() {
		return !this._isUTC;
	}

	function isUtcOffset() {
		return this._isUTC;
	}

	function isUtc() {
		return this._isUTC && this._offset === 0;
	}

	var aspNetRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/;

	// from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
	// somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
	var create__isoRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;

	function create__createDuration(input, key) {
		var duration = input,
			// matching against regexp is expensive, do it on demand
			match = null,
			sign,
			ret,
			diffRes;

		if (isDuration(input)) {
			duration = {
				ms: input._milliseconds,
				d: input._days,
				M: input._months
			};
		} else if (typeof input === 'number') {
			duration = {};
			if (key) {
				duration[key] = input;
			} else {
				duration.milliseconds = input;
			}
		} else if (!!(match = aspNetRegex.exec(input))) {
			sign = (match[1] === '-') ? -1 : 1;
			duration = {
				y: 0,
				d: toInt(match[DATE]) * sign,
				h: toInt(match[HOUR]) * sign,
				m: toInt(match[MINUTE]) * sign,
				s: toInt(match[SECOND]) * sign,
				ms: toInt(match[MILLISECOND]) * sign
			};
		} else if (!!(match = create__isoRegex.exec(input))) {
			sign = (match[1] === '-') ? -1 : 1;
			duration = {
				y: parseIso(match[2], sign),
				M: parseIso(match[3], sign),
				d: parseIso(match[4], sign),
				h: parseIso(match[5], sign),
				m: parseIso(match[6], sign),
				s: parseIso(match[7], sign),
				w: parseIso(match[8], sign)
			};
		} else if (duration == null) {// checks for null or undefined
			duration = {};
		} else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
			diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));

			duration = {};
			duration.ms = diffRes.milliseconds;
			duration.M = diffRes.months;
		}

		ret = new Duration(duration);

		if (isDuration(input) && hasOwnProp(input, '_locale')) {
			ret._locale = input._locale;
		}

		return ret;
	}

	create__createDuration.fn = Duration.prototype;

	function parseIso(inp, sign) {
		// We'd normally use ~~inp for this, but unfortunately it also
		// converts floats to ints.
		// inp may be undefined, so careful calling replace on it.
		var res = inp && parseFloat(inp.replace(',', '.'));
		// apply sign while we're at it
		return (isNaN(res) ? 0 : res) * sign;
	}

	function positiveMomentsDifference(base, other) {
		var res = { milliseconds: 0, months: 0 };

		res.months = other.month() - base.month() +
			(other.year() - base.year()) * 12;
		if (base.clone().add(res.months, 'M').isAfter(other)) {
			--res.months;
		}

		res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

		return res;
	}

	function momentsDifference(base, other) {
		var res;
		other = cloneWithOffset(other, base);
		if (base.isBefore(other)) {
			res = positiveMomentsDifference(base, other);
		} else {
			res = positiveMomentsDifference(other, base);
			res.milliseconds = -res.milliseconds;
			res.months = -res.months;
		}

		return res;
	}

	function createAdder(direction, name) {
		return function (val, period) {
			var dur, tmp;
			//invert the arguments, but complain about it
			if (period !== null && !isNaN(+period)) {
				deprecateSimple(name, 'moment().' + name + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
				tmp = val; val = period; period = tmp;
			}

			val = typeof val === 'string' ? +val : val;
			dur = create__createDuration(val, period);
			add_subtract__addSubtract(this, dur, direction);
			return this;
		};
	}

	function add_subtract__addSubtract(mom, duration, isAdding, updateOffset) {
		var milliseconds = duration._milliseconds,
			days = duration._days,
			months = duration._months;
		updateOffset = updateOffset == null ? true : updateOffset;

		if (milliseconds) {
			mom._d.setTime(+mom._d + milliseconds * isAdding);
		}
		if (days) {
			get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
		}
		if (months) {
			setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
		}
		if (updateOffset) {
			utils_hooks__hooks.updateOffset(mom, days || months);
		}
	}

	var add_subtract__add = createAdder(1, 'add');
	var add_subtract__subtract = createAdder(-1, 'subtract');

	function moment_calendar__calendar(time, formats) {
		// We want to compare the start of today, vs this.
		// Getting start-of-today depends on whether we're local/utc/offset or not.
		var now = time || local__createLocal(),
			sod = cloneWithOffset(now, this).startOf('day'),
			diff = this.diff(sod, 'days', true),
			format = diff < -6 ? 'sameElse' :
				diff < -1 ? 'lastWeek' :
					diff < 0 ? 'lastDay' :
						diff < 1 ? 'sameDay' :
							diff < 2 ? 'nextDay' :
								diff < 7 ? 'nextWeek' : 'sameElse';
		return this.format(formats && formats[format] || this.localeData().calendar(format, this, local__createLocal(now)));
	}

	function clone() {
		return new Moment(this);
	}

	function isAfter(input, units) {
		var inputMs;
		units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
		if (units === 'millisecond') {
			input = isMoment(input) ? input : local__createLocal(input);
			return +this > +input;
		} else {
			inputMs = isMoment(input) ? +input : +local__createLocal(input);
			return inputMs < +this.clone().startOf(units);
		}
	}

	function isBefore(input, units) {
		var inputMs;
		units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
		if (units === 'millisecond') {
			input = isMoment(input) ? input : local__createLocal(input);
			return +this < +input;
		} else {
			inputMs = isMoment(input) ? +input : +local__createLocal(input);
			return +this.clone().endOf(units) < inputMs;
		}
	}

	function isBetween(from, to, units) {
		return this.isAfter(from, units) && this.isBefore(to, units);
	}

	function isSame(input, units) {
		var inputMs;
		units = normalizeUnits(units || 'millisecond');
		if (units === 'millisecond') {
			input = isMoment(input) ? input : local__createLocal(input);
			return +this === +input;
		} else {
			inputMs = +local__createLocal(input);
			return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
		}
	}

	function diff(input, units, asFloat) {
		var that = cloneWithOffset(input, this),
			zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4,
			delta, output;

		units = normalizeUnits(units);

		if (units === 'year' || units === 'month' || units === 'quarter') {
			output = monthDiff(this, that);
			if (units === 'quarter') {
				output = output / 3;
			} else if (units === 'year') {
				output = output / 12;
			}
		} else {
			delta = this - that;
			output = units === 'second' ? delta / 1e3 : // 1000
				units === 'minute' ? delta / 6e4 : // 1000 * 60
					units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
						units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
							units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
								delta;
		}
		return asFloat ? output : absFloor(output);
	}

	function monthDiff(a, b) {
		// difference in months
		var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
			// b is in (anchor - 1 month, anchor + 1 month)
			anchor = a.clone().add(wholeMonthDiff, 'months'),
			anchor2, adjust;

		if (b - anchor < 0) {
			anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
			// linear across the month
			adjust = (b - anchor) / (anchor - anchor2);
		} else {
			anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
			// linear across the month
			adjust = (b - anchor) / (anchor2 - anchor);
		}

		return -(wholeMonthDiff + adjust);
	}

	utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';

	function toString() {
		return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
	}

	function moment_format__toISOString() {
		var m = this.clone().utc();
		if (0 < m.year() && m.year() <= 9999) {
			if ('function' === typeof Date.prototype.toISOString) {
				// native implementation is ~50x faster, use it when we can
				return this.toDate().toISOString();
			} else {
				return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
			}
		} else {
			return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
		}
	}

	function format(inputString) {
		var output = formatMoment(this, inputString || utils_hooks__hooks.defaultFormat);
		return this.localeData().postformat(output);
	}

	function from(time, withoutSuffix) {
		if (!this.isValid()) {
			return this.localeData().invalidDate();
		}
		return create__createDuration({ to: this, from: time }).locale(this.locale()).humanize(!withoutSuffix);
	}

	function fromNow(withoutSuffix) {
		return this.from(local__createLocal(), withoutSuffix);
	}

	function to(time, withoutSuffix) {
		if (!this.isValid()) {
			return this.localeData().invalidDate();
		}
		return create__createDuration({ from: this, to: time }).locale(this.locale()).humanize(!withoutSuffix);
	}

	function toNow(withoutSuffix) {
		return this.to(local__createLocal(), withoutSuffix);
	}

	function locale(key) {
		var newLocaleData;

		if (key === undefined) {
			return this._locale._abbr;
		} else {
			newLocaleData = locale_locales__getLocale(key);
			if (newLocaleData != null) {
				this._locale = newLocaleData;
			}
			return this;
		}
	}

	var lang = deprecate(
		'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
		function (key) {
			if (key === undefined) {
				return this.localeData();
			} else {
				return this.locale(key);
			}
		}
	);

	function localeData() {
		return this._locale;
	}

	function startOf(units) {
		units = normalizeUnits(units);
		// the following switch intentionally omits break keywords
		// to utilize falling through the cases.
		switch (units) {
			case 'year':
				this.month(0);
			/* falls through */
			case 'quarter':
			case 'month':
				this.date(1);
			/* falls through */
			case 'week':
			case 'isoWeek':
			case 'day':
				this.hours(0);
			/* falls through */
			case 'hour':
				this.minutes(0);
			/* falls through */
			case 'minute':
				this.seconds(0);
			/* falls through */
			case 'second':
				this.milliseconds(0);
		}

		// weeks are a special case
		if (units === 'week') {
			this.weekday(0);
		}
		if (units === 'isoWeek') {
			this.isoWeekday(1);
		}

		// quarters are also special
		if (units === 'quarter') {
			this.month(Math.floor(this.month() / 3) * 3);
		}

		return this;
	}

	function endOf(units) {
		units = normalizeUnits(units);
		if (units === undefined || units === 'millisecond') {
			return this;
		}
		return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
	}

	function to_type__valueOf() {
		return +this._d - ((this._offset || 0) * 60000);
	}

	function unix() {
		return Math.floor(+this / 1000);
	}

	function toDate() {
		return this._offset ? new Date(+this) : this._d;
	}

	function toArray() {
		var m = this;
		return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
	}

	function toObject() {
		var m = this;
		return {
			years: m.year(),
			months: m.month(),
			date: m.date(),
			hours: m.hours(),
			minutes: m.minutes(),
			seconds: m.seconds(),
			milliseconds: m.milliseconds()
		};
	}

	function moment_valid__isValid() {
		return valid__isValid(this);
	}

	function parsingFlags() {
		return extend({}, getParsingFlags(this));
	}

	function invalidAt() {
		return getParsingFlags(this).overflow;
	}

	addFormatToken(0, ['gg', 2], 0, function () {
		return this.weekYear() % 100;
	});

	addFormatToken(0, ['GG', 2], 0, function () {
		return this.isoWeekYear() % 100;
	});

	function addWeekYearFormatToken(token, getter) {
		addFormatToken(0, [token, token.length], 0, getter);
	}

	addWeekYearFormatToken('gggg', 'weekYear');
	addWeekYearFormatToken('ggggg', 'weekYear');
	addWeekYearFormatToken('GGGG', 'isoWeekYear');
	addWeekYearFormatToken('GGGGG', 'isoWeekYear');

	// ALIASES

	addUnitAlias('weekYear', 'gg');
	addUnitAlias('isoWeekYear', 'GG');

	// PARSING

	addRegexToken('G', matchSigned);
	addRegexToken('g', matchSigned);
	addRegexToken('GG', match1to2, match2);
	addRegexToken('gg', match1to2, match2);
	addRegexToken('GGGG', match1to4, match4);
	addRegexToken('gggg', match1to4, match4);
	addRegexToken('GGGGG', match1to6, match6);
	addRegexToken('ggggg', match1to6, match6);

	addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
		week[token.substr(0, 2)] = toInt(input);
	});

	addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
		week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
	});

	// HELPERS

	function weeksInYear(year, dow, doy) {
		return weekOfYear(local__createLocal([year, 11, 31 + dow - doy]), dow, doy).week;
	}

	// MOMENTS

	function getSetWeekYear(input) {
		var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
		return input == null ? year : this.add((input - year), 'y');
	}

	function getSetISOWeekYear(input) {
		var year = weekOfYear(this, 1, 4).year;
		return input == null ? year : this.add((input - year), 'y');
	}

	function getISOWeeksInYear() {
		return weeksInYear(this.year(), 1, 4);
	}

	function getWeeksInYear() {
		var weekInfo = this.localeData()._week;
		return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
	}

	addFormatToken('Q', 0, 0, 'quarter');

	// ALIASES

	addUnitAlias('quarter', 'Q');

	// PARSING

	addRegexToken('Q', match1);
	addParseToken('Q', function (input, array) {
		array[MONTH] = (toInt(input) - 1) * 3;
	});

	// MOMENTS

	function getSetQuarter(input) {
		return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
	}

	addFormatToken('D', ['DD', 2], 'Do', 'date');

	// ALIASES

	addUnitAlias('date', 'D');

	// PARSING

	addRegexToken('D', match1to2);
	addRegexToken('DD', match1to2, match2);
	addRegexToken('Do', function (isStrict, locale) {
		return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
	});

	addParseToken(['D', 'DD'], DATE);
	addParseToken('Do', function (input, array) {
		array[DATE] = toInt(input.match(match1to2)[0], 10);
	});

	// MOMENTS

	var getSetDayOfMonth = makeGetSet('Date', true);

	addFormatToken('d', 0, 'do', 'day');

	addFormatToken('dd', 0, 0, function (format) {
		return this.localeData().weekdaysMin(this, format);
	});

	addFormatToken('ddd', 0, 0, function (format) {
		return this.localeData().weekdaysShort(this, format);
	});

	addFormatToken('dddd', 0, 0, function (format) {
		return this.localeData().weekdays(this, format);
	});

	addFormatToken('e', 0, 0, 'weekday');
	addFormatToken('E', 0, 0, 'isoWeekday');

	// ALIASES

	addUnitAlias('day', 'd');
	addUnitAlias('weekday', 'e');
	addUnitAlias('isoWeekday', 'E');

	// PARSING

	addRegexToken('d', match1to2);
	addRegexToken('e', match1to2);
	addRegexToken('E', match1to2);
	addRegexToken('dd', matchWord);
	addRegexToken('ddd', matchWord);
	addRegexToken('dddd', matchWord);

	addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config) {
		var weekday = config._locale.weekdaysParse(input);
		// if we didn't get a weekday name, mark the date as invalid
		if (weekday != null) {
			week.d = weekday;
		} else {
			getParsingFlags(config).invalidWeekday = input;
		}
	});

	addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
		week[token] = toInt(input);
	});

	// HELPERS

	function parseWeekday(input, locale) {
		if (typeof input !== 'string') {
			return input;
		}

		if (!isNaN(input)) {
			return parseInt(input, 10);
		}

		input = locale.weekdaysParse(input);
		if (typeof input === 'number') {
			return input;
		}

		return null;
	}

	// LOCALES

	var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
	function localeWeekdays(m) {
		return this._weekdays[m.day()];
	}

	var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
	function localeWeekdaysShort(m) {
		return this._weekdaysShort[m.day()];
	}

	var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
	function localeWeekdaysMin(m) {
		return this._weekdaysMin[m.day()];
	}

	function localeWeekdaysParse(weekdayName) {
		var i, mom, regex;

		this._weekdaysParse = this._weekdaysParse || [];

		for (i = 0; i < 7; i++) {
			// make the regex if we don't have it already
			if (!this._weekdaysParse[i]) {
				mom = local__createLocal([2000, 1]).day(i);
				regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
				this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
			}
			// test the regex
			if (this._weekdaysParse[i].test(weekdayName)) {
				return i;
			}
		}
	}

	// MOMENTS

	function getSetDayOfWeek(input) {
		var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
		if (input != null) {
			input = parseWeekday(input, this.localeData());
			return this.add(input - day, 'd');
		} else {
			return day;
		}
	}

	function getSetLocaleDayOfWeek(input) {
		var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
		return input == null ? weekday : this.add(input - weekday, 'd');
	}

	function getSetISODayOfWeek(input) {
		// behaves the same as moment#day except
		// as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
		// as a setter, sunday should belong to the previous week.
		return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
	}

	addFormatToken('H', ['HH', 2], 0, 'hour');
	addFormatToken('h', ['hh', 2], 0, function () {
		return this.hours() % 12 || 12;
	});

	function meridiem(token, lowercase) {
		addFormatToken(token, 0, 0, function () {
			return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
		});
	}

	meridiem('a', true);
	meridiem('A', false);

	// ALIASES

	addUnitAlias('hour', 'h');

	// PARSING

	function matchMeridiem(isStrict, locale) {
		return locale._meridiemParse;
	}

	addRegexToken('a', matchMeridiem);
	addRegexToken('A', matchMeridiem);
	addRegexToken('H', match1to2);
	addRegexToken('h', match1to2);
	addRegexToken('HH', match1to2, match2);
	addRegexToken('hh', match1to2, match2);

	addParseToken(['H', 'HH'], HOUR);
	addParseToken(['a', 'A'], function (input, array, config) {
		config._isPm = config._locale.isPM(input);
		config._meridiem = input;
	});
	addParseToken(['h', 'hh'], function (input, array, config) {
		array[HOUR] = toInt(input);
		getParsingFlags(config).bigHour = true;
	});

	// LOCALES

	function localeIsPM(input) {
		// IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
		// Using charAt should be more compatible.
		return ((input + '').toLowerCase().charAt(0) === 'p');
	}

	var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
	function localeMeridiem(hours, minutes, isLower) {
		if (hours > 11) {
			return isLower ? 'pm' : 'PM';
		} else {
			return isLower ? 'am' : 'AM';
		}
	}


	// MOMENTS

	// Setting the hour should keep the time, because the user explicitly
	// specified which hour he wants. So trying to maintain the same hour (in
	// a new timezone) makes sense. Adding/subtracting hours does not follow
	// this rule.
	var getSetHour = makeGetSet('Hours', true);

	addFormatToken('m', ['mm', 2], 0, 'minute');

	// ALIASES

	addUnitAlias('minute', 'm');

	// PARSING

	addRegexToken('m', match1to2);
	addRegexToken('mm', match1to2, match2);
	addParseToken(['m', 'mm'], MINUTE);

	// MOMENTS

	var getSetMinute = makeGetSet('Minutes', false);

	addFormatToken('s', ['ss', 2], 0, 'second');

	// ALIASES

	addUnitAlias('second', 's');

	// PARSING

	addRegexToken('s', match1to2);
	addRegexToken('ss', match1to2, match2);
	addParseToken(['s', 'ss'], SECOND);

	// MOMENTS

	var getSetSecond = makeGetSet('Seconds', false);

	addFormatToken('S', 0, 0, function () {
		return ~~(this.millisecond() / 100);
	});

	addFormatToken(0, ['SS', 2], 0, function () {
		return ~~(this.millisecond() / 10);
	});

	addFormatToken(0, ['SSS', 3], 0, 'millisecond');
	addFormatToken(0, ['SSSS', 4], 0, function () {
		return this.millisecond() * 10;
	});
	addFormatToken(0, ['SSSSS', 5], 0, function () {
		return this.millisecond() * 100;
	});
	addFormatToken(0, ['SSSSSS', 6], 0, function () {
		return this.millisecond() * 1000;
	});
	addFormatToken(0, ['SSSSSSS', 7], 0, function () {
		return this.millisecond() * 10000;
	});
	addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
		return this.millisecond() * 100000;
	});
	addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
		return this.millisecond() * 1000000;
	});


	// ALIASES

	addUnitAlias('millisecond', 'ms');

	// PARSING

	addRegexToken('S', match1to3, match1);
	addRegexToken('SS', match1to3, match2);
	addRegexToken('SSS', match1to3, match3);

	var token;
	for (token = 'SSSS'; token.length <= 9; token += 'S') {
		addRegexToken(token, matchUnsigned);
	}

	function parseMs(input, array) {
		array[MILLISECOND] = toInt(('0.' + input) * 1000);
	}

	for (token = 'S'; token.length <= 9; token += 'S') {
		addParseToken(token, parseMs);
	}
	// MOMENTS

	var getSetMillisecond = makeGetSet('Milliseconds', false);

	addFormatToken('z', 0, 0, 'zoneAbbr');
	addFormatToken('zz', 0, 0, 'zoneName');

	// MOMENTS

	function getZoneAbbr() {
		return this._isUTC ? 'UTC' : '';
	}

	function getZoneName() {
		return this._isUTC ? 'Coordinated Universal Time' : '';
	}

	var momentPrototype__proto = Moment.prototype;

	momentPrototype__proto.add = add_subtract__add;
	momentPrototype__proto.calendar = moment_calendar__calendar;
	momentPrototype__proto.clone = clone;
	momentPrototype__proto.diff = diff;
	momentPrototype__proto.endOf = endOf;
	momentPrototype__proto.format = format;
	momentPrototype__proto.from = from;
	momentPrototype__proto.fromNow = fromNow;
	momentPrototype__proto.to = to;
	momentPrototype__proto.toNow = toNow;
	momentPrototype__proto.get = getSet;
	momentPrototype__proto.invalidAt = invalidAt;
	momentPrototype__proto.isAfter = isAfter;
	momentPrototype__proto.isBefore = isBefore;
	momentPrototype__proto.isBetween = isBetween;
	momentPrototype__proto.isSame = isSame;
	momentPrototype__proto.isValid = moment_valid__isValid;
	momentPrototype__proto.lang = lang;
	momentPrototype__proto.locale = locale;
	momentPrototype__proto.localeData = localeData;
	momentPrototype__proto.max = prototypeMax;
	momentPrototype__proto.min = prototypeMin;
	momentPrototype__proto.parsingFlags = parsingFlags;
	momentPrototype__proto.set = getSet;
	momentPrototype__proto.startOf = startOf;
	momentPrototype__proto.subtract = add_subtract__subtract;
	momentPrototype__proto.toArray = toArray;
	momentPrototype__proto.toObject = toObject;
	momentPrototype__proto.toDate = toDate;
	momentPrototype__proto.toISOString = moment_format__toISOString;
	momentPrototype__proto.toJSON = moment_format__toISOString;
	momentPrototype__proto.toString = toString;
	momentPrototype__proto.unix = unix;
	momentPrototype__proto.valueOf = to_type__valueOf;

	// Year
	momentPrototype__proto.year = getSetYear;
	momentPrototype__proto.isLeapYear = getIsLeapYear;

	// Week Year
	momentPrototype__proto.weekYear = getSetWeekYear;
	momentPrototype__proto.isoWeekYear = getSetISOWeekYear;

	// Quarter
	momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;

	// Month
	momentPrototype__proto.month = getSetMonth;
	momentPrototype__proto.daysInMonth = getDaysInMonth;

	// Week
	momentPrototype__proto.week = momentPrototype__proto.weeks = getSetWeek;
	momentPrototype__proto.isoWeek = momentPrototype__proto.isoWeeks = getSetISOWeek;
	momentPrototype__proto.weeksInYear = getWeeksInYear;
	momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;

	// Day
	momentPrototype__proto.date = getSetDayOfMonth;
	momentPrototype__proto.day = momentPrototype__proto.days = getSetDayOfWeek;
	momentPrototype__proto.weekday = getSetLocaleDayOfWeek;
	momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
	momentPrototype__proto.dayOfYear = getSetDayOfYear;

	// Hour
	momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;

	// Minute
	momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;

	// Second
	momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;

	// Millisecond
	momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;

	// Offset
	momentPrototype__proto.utcOffset = getSetOffset;
	momentPrototype__proto.utc = setOffsetToUTC;
	momentPrototype__proto.local = setOffsetToLocal;
	momentPrototype__proto.parseZone = setOffsetToParsedOffset;
	momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
	momentPrototype__proto.isDST = isDaylightSavingTime;
	momentPrototype__proto.isDSTShifted = isDaylightSavingTimeShifted;
	momentPrototype__proto.isLocal = isLocal;
	momentPrototype__proto.isUtcOffset = isUtcOffset;
	momentPrototype__proto.isUtc = isUtc;
	momentPrototype__proto.isUTC = isUtc;

	// Timezone
	momentPrototype__proto.zoneAbbr = getZoneAbbr;
	momentPrototype__proto.zoneName = getZoneName;

	// Deprecations
	momentPrototype__proto.dates = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
	momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
	momentPrototype__proto.years = deprecate('years accessor is deprecated. Use year instead', getSetYear);
	momentPrototype__proto.zone = deprecate('moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779', getSetZone);

	var momentPrototype = momentPrototype__proto;

	function moment__createUnix(input) {
		return local__createLocal(input * 1000);
	}

	function moment__createInZone() {
		return local__createLocal.apply(null, arguments).parseZone();
	}

	var defaultCalendar = {
		sameDay: '[Today at] LT',
		nextDay: '[Tomorrow at] LT',
		nextWeek: 'dddd [at] LT',
		lastDay: '[Yesterday at] LT',
		lastWeek: '[Last] dddd [at] LT',
		sameElse: 'L'
	};

	function locale_calendar__calendar(key, mom, now) {
		var output = this._calendar[key];
		return typeof output === 'function' ? output.call(mom, now) : output;
	}

	var defaultLongDateFormat = {
		LTS: 'h:mm:ss A',
		LT: 'h:mm A',
		L: 'MM/DD/YYYY',
		LL: 'MMMM D, YYYY',
		LLL: 'MMMM D, YYYY h:mm A',
		LLLL: 'dddd, MMMM D, YYYY h:mm A'
	};

	function longDateFormat(key) {
		var format = this._longDateFormat[key],
			formatUpper = this._longDateFormat[key.toUpperCase()];

		if (format || !formatUpper) {
			return format;
		}

		this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
			return val.slice(1);
		});

		return this._longDateFormat[key];
	}

	var defaultInvalidDate = 'Invalid date';

	function invalidDate() {
		return this._invalidDate;
	}

	var defaultOrdinal = '%d';
	var defaultOrdinalParse = /\d{1,2}/;

	function ordinal(number) {
		return this._ordinal.replace('%d', number);
	}

	function preParsePostFormat(string) {
		return string;
	}

	var defaultRelativeTime = {
		future: 'in %s',
		past: '%s ago',
		s: 'a few seconds',
		m: 'a minute',
		mm: '%d minutes',
		h: 'an hour',
		hh: '%d hours',
		d: 'a day',
		dd: '%d days',
		M: 'a month',
		MM: '%d months',
		y: 'a year',
		yy: '%d years'
	};

	function relative__relativeTime(number, withoutSuffix, string, isFuture) {
		var output = this._relativeTime[string];
		return (typeof output === 'function') ?
			output(number, withoutSuffix, string, isFuture) :
			output.replace(/%d/i, number);
	}

	function pastFuture(diff, output) {
		var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
		return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
	}

	function locale_set__set(config) {
		var prop, i;
		for (i in config) {
			prop = config[i];
			if (typeof prop === 'function') {
				this[i] = prop;
			} else {
				this['_' + i] = prop;
			}
		}
		// Lenient ordinal parsing accepts just a number in addition to
		// number + (possibly) stuff coming from _ordinalParseLenient.
		this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
	}

	var prototype__proto = Locale.prototype;

	prototype__proto._calendar = defaultCalendar;
	prototype__proto.calendar = locale_calendar__calendar;
	prototype__proto._longDateFormat = defaultLongDateFormat;
	prototype__proto.longDateFormat = longDateFormat;
	prototype__proto._invalidDate = defaultInvalidDate;
	prototype__proto.invalidDate = invalidDate;
	prototype__proto._ordinal = defaultOrdinal;
	prototype__proto.ordinal = ordinal;
	prototype__proto._ordinalParse = defaultOrdinalParse;
	prototype__proto.preparse = preParsePostFormat;
	prototype__proto.postformat = preParsePostFormat;
	prototype__proto._relativeTime = defaultRelativeTime;
	prototype__proto.relativeTime = relative__relativeTime;
	prototype__proto.pastFuture = pastFuture;
	prototype__proto.set = locale_set__set;

	// Month
	prototype__proto.months = localeMonths;
	prototype__proto._months = defaultLocaleMonths;
	prototype__proto.monthsShort = localeMonthsShort;
	prototype__proto._monthsShort = defaultLocaleMonthsShort;
	prototype__proto.monthsParse = localeMonthsParse;

	// Week
	prototype__proto.week = localeWeek;
	prototype__proto._week = defaultLocaleWeek;
	prototype__proto.firstDayOfYear = localeFirstDayOfYear;
	prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;

	// Day of Week
	prototype__proto.weekdays = localeWeekdays;
	prototype__proto._weekdays = defaultLocaleWeekdays;
	prototype__proto.weekdaysMin = localeWeekdaysMin;
	prototype__proto._weekdaysMin = defaultLocaleWeekdaysMin;
	prototype__proto.weekdaysShort = localeWeekdaysShort;
	prototype__proto._weekdaysShort = defaultLocaleWeekdaysShort;
	prototype__proto.weekdaysParse = localeWeekdaysParse;

	// Hours
	prototype__proto.isPM = localeIsPM;
	prototype__proto._meridiemParse = defaultLocaleMeridiemParse;
	prototype__proto.meridiem = localeMeridiem;

	function lists__get(format, index, field, setter) {
		var locale = locale_locales__getLocale();
		var utc = create_utc__createUTC().set(setter, index);
		return locale[field](utc, format);
	}

	function list(format, index, field, count, setter) {
		if (typeof format === 'number') {
			index = format;
			format = undefined;
		}

		format = format || '';

		if (index != null) {
			return lists__get(format, index, field, setter);
		}

		var i;
		var out = [];
		for (i = 0; i < count; i++) {
			out[i] = lists__get(format, i, field, setter);
		}
		return out;
	}

	function lists__listMonths(format, index) {
		return list(format, index, 'months', 12, 'month');
	}

	function lists__listMonthsShort(format, index) {
		return list(format, index, 'monthsShort', 12, 'month');
	}

	function lists__listWeekdays(format, index) {
		return list(format, index, 'weekdays', 7, 'day');
	}

	function lists__listWeekdaysShort(format, index) {
		return list(format, index, 'weekdaysShort', 7, 'day');
	}

	function lists__listWeekdaysMin(format, index) {
		return list(format, index, 'weekdaysMin', 7, 'day');
	}

	locale_locales__getSetGlobalLocale('en', {
		ordinalParse: /\d{1,2}(th|st|nd|rd)/,
		ordinal: function (number) {
			var b = number % 10,
				output = (toInt(number % 100 / 10) === 1) ? 'th' :
					(b === 1) ? 'st' :
						(b === 2) ? 'nd' :
							(b === 3) ? 'rd' : 'th';
			return number + output;
		}
	});

	// Side effect imports
	utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
	utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);

	var mathAbs = Math.abs;

	function duration_abs__abs() {
		var data = this._data;

		this._milliseconds = mathAbs(this._milliseconds);
		this._days = mathAbs(this._days);
		this._months = mathAbs(this._months);

		data.milliseconds = mathAbs(data.milliseconds);
		data.seconds = mathAbs(data.seconds);
		data.minutes = mathAbs(data.minutes);
		data.hours = mathAbs(data.hours);
		data.months = mathAbs(data.months);
		data.years = mathAbs(data.years);

		return this;
	}

	function duration_add_subtract__addSubtract(duration, input, value, direction) {
		var other = create__createDuration(input, value);

		duration._milliseconds += direction * other._milliseconds;
		duration._days += direction * other._days;
		duration._months += direction * other._months;

		return duration._bubble();
	}

	// supports only 2.0-style add(1, 's') or add(duration)
	function duration_add_subtract__add(input, value) {
		return duration_add_subtract__addSubtract(this, input, value, 1);
	}

	// supports only 2.0-style subtract(1, 's') or subtract(duration)
	function duration_add_subtract__subtract(input, value) {
		return duration_add_subtract__addSubtract(this, input, value, -1);
	}

	function absCeil(number) {
		if (number < 0) {
			return Math.floor(number);
		} else {
			return Math.ceil(number);
		}
	}

	function bubble() {
		var milliseconds = this._milliseconds;
		var days = this._days;
		var months = this._months;
		var data = this._data;
		var seconds, minutes, hours, years, monthsFromDays;

		// if we have a mix of positive and negative values, bubble down first
		// check: https://github.com/moment/moment/issues/2166
		if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
			(milliseconds <= 0 && days <= 0 && months <= 0))) {
			milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
			days = 0;
			months = 0;
		}

		// The following code bubbles up values, see the tests for
		// examples of what that means.
		data.milliseconds = milliseconds % 1000;

		seconds = absFloor(milliseconds / 1000);
		data.seconds = seconds % 60;

		minutes = absFloor(seconds / 60);
		data.minutes = minutes % 60;

		hours = absFloor(minutes / 60);
		data.hours = hours % 24;

		days += absFloor(hours / 24);

		// convert days to months
		monthsFromDays = absFloor(daysToMonths(days));
		months += monthsFromDays;
		days -= absCeil(monthsToDays(monthsFromDays));

		// 12 months -> 1 year
		years = absFloor(months / 12);
		months %= 12;

		data.days = days;
		data.months = months;
		data.years = years;

		return this;
	}

	function daysToMonths(days) {
		// 400 years have 146097 days (taking into account leap year rules)
		// 400 years have 12 months === 4800
		return days * 4800 / 146097;
	}

	function monthsToDays(months) {
		// the reverse of daysToMonths
		return months * 146097 / 4800;
	}

	function as(units) {
		var days;
		var months;
		var milliseconds = this._milliseconds;

		units = normalizeUnits(units);

		if (units === 'month' || units === 'year') {
			days = this._days + milliseconds / 864e5;
			months = this._months + daysToMonths(days);
			return units === 'month' ? months : months / 12;
		} else {
			// handle milliseconds separately because of floating point math errors (issue #1867)
			days = this._days + Math.round(monthsToDays(this._months));
			switch (units) {
				case 'week': return days / 7 + milliseconds / 6048e5;
				case 'day': return days + milliseconds / 864e5;
				case 'hour': return days * 24 + milliseconds / 36e5;
				case 'minute': return days * 1440 + milliseconds / 6e4;
				case 'second': return days * 86400 + milliseconds / 1000;
				// Math.floor prevents floating point math errors here
				case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
				default: throw new Error('Unknown unit ' + units);
			}
		}
	}

	// TODO: Use this.as('ms')?
	function duration_as__valueOf() {
		return (
			this._milliseconds +
			this._days * 864e5 +
			(this._months % 12) * 2592e6 +
			toInt(this._months / 12) * 31536e6
		);
	}

	function makeAs(alias) {
		return function () {
			return this.as(alias);
		};
	}

	var asMilliseconds = makeAs('ms');
	var asSeconds = makeAs('s');
	var asMinutes = makeAs('m');
	var asHours = makeAs('h');
	var asDays = makeAs('d');
	var asWeeks = makeAs('w');
	var asMonths = makeAs('M');
	var asYears = makeAs('y');

	function duration_get__get(units) {
		units = normalizeUnits(units);
		return this[units + 's']();
	}

	function makeGetter(name) {
		return function () {
			return this._data[name];
		};
	}

	var milliseconds = makeGetter('milliseconds');
	var seconds = makeGetter('seconds');
	var minutes = makeGetter('minutes');
	var hours = makeGetter('hours');
	var days = makeGetter('days');
	var months = makeGetter('months');
	var years = makeGetter('years');

	function weeks() {
		return absFloor(this.days() / 7);
	}

	var round = Math.round;
	var thresholds = {
		s: 45,  // seconds to minute
		m: 45,  // minutes to hour
		h: 22,  // hours to day
		d: 26,  // days to month
		M: 11   // months to year
	};

	// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
	function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
		return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
	}

	function duration_humanize__relativeTime(posNegDuration, withoutSuffix, locale) {
		var duration = create__createDuration(posNegDuration).abs();
		var seconds = round(duration.as('s'));
		var minutes = round(duration.as('m'));
		var hours = round(duration.as('h'));
		var days = round(duration.as('d'));
		var months = round(duration.as('M'));
		var years = round(duration.as('y'));

		var a = seconds < thresholds.s && ['s', seconds] ||
			minutes === 1 && ['m'] ||
			minutes < thresholds.m && ['mm', minutes] ||
			hours === 1 && ['h'] ||
			hours < thresholds.h && ['hh', hours] ||
			days === 1 && ['d'] ||
			days < thresholds.d && ['dd', days] ||
			months === 1 && ['M'] ||
			months < thresholds.M && ['MM', months] ||
			years === 1 && ['y'] || ['yy', years];

		a[2] = withoutSuffix;
		a[3] = +posNegDuration > 0;
		a[4] = locale;
		return substituteTimeAgo.apply(null, a);
	}

	// This function allows you to set a threshold for relative time strings
	function duration_humanize__getSetRelativeTimeThreshold(threshold, limit) {
		if (thresholds[threshold] === undefined) {
			return false;
		}
		if (limit === undefined) {
			return thresholds[threshold];
		}
		thresholds[threshold] = limit;
		return true;
	}

	function humanize(withSuffix) {
		var locale = this.localeData();
		var output = duration_humanize__relativeTime(this, !withSuffix, locale);

		if (withSuffix) {
			output = locale.pastFuture(+this, output);
		}

		return locale.postformat(output);
	}

	var iso_string__abs = Math.abs;

	function iso_string__toISOString() {
		// for ISO strings we do not use the normal bubbling rules:
		//  * milliseconds bubble up until they become hours
		//  * days do not bubble at all
		//  * months bubble up until they become years
		// This is because there is no context-free conversion between hours and days
		// (think of clock changes)
		// and also not between days and months (28-31 days per month)
		var seconds = iso_string__abs(this._milliseconds) / 1000;
		var days = iso_string__abs(this._days);
		var months = iso_string__abs(this._months);
		var minutes, hours, years;

		// 3600 seconds -> 60 minutes -> 1 hour
		minutes = absFloor(seconds / 60);
		hours = absFloor(minutes / 60);
		seconds %= 60;
		minutes %= 60;

		// 12 months -> 1 year
		years = absFloor(months / 12);
		months %= 12;


		// inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
		var Y = years;
		var M = months;
		var D = days;
		var h = hours;
		var m = minutes;
		var s = seconds;
		var total = this.asSeconds();

		if (!total) {
			// this is the same as C#'s (Noda) and python (isodate)...
			// but not other JS (goog.date)
			return 'P0D';
		}

		return (total < 0 ? '-' : '') +
			'P' +
			(Y ? Y + 'Y' : '') +
			(M ? M + 'M' : '') +
			(D ? D + 'D' : '') +
			((h || m || s) ? 'T' : '') +
			(h ? h + 'H' : '') +
			(m ? m + 'M' : '') +
			(s ? s + 'S' : '');
	}

	var duration_prototype__proto = Duration.prototype;

	duration_prototype__proto.abs = duration_abs__abs;
	duration_prototype__proto.add = duration_add_subtract__add;
	duration_prototype__proto.subtract = duration_add_subtract__subtract;
	duration_prototype__proto.as = as;
	duration_prototype__proto.asMilliseconds = asMilliseconds;
	duration_prototype__proto.asSeconds = asSeconds;
	duration_prototype__proto.asMinutes = asMinutes;
	duration_prototype__proto.asHours = asHours;
	duration_prototype__proto.asDays = asDays;
	duration_prototype__proto.asWeeks = asWeeks;
	duration_prototype__proto.asMonths = asMonths;
	duration_prototype__proto.asYears = asYears;
	duration_prototype__proto.valueOf = duration_as__valueOf;
	duration_prototype__proto._bubble = bubble;
	duration_prototype__proto.get = duration_get__get;
	duration_prototype__proto.milliseconds = milliseconds;
	duration_prototype__proto.seconds = seconds;
	duration_prototype__proto.minutes = minutes;
	duration_prototype__proto.hours = hours;
	duration_prototype__proto.days = days;
	duration_prototype__proto.weeks = weeks;
	duration_prototype__proto.months = months;
	duration_prototype__proto.years = years;
	duration_prototype__proto.humanize = humanize;
	duration_prototype__proto.toISOString = iso_string__toISOString;
	duration_prototype__proto.toString = iso_string__toISOString;
	duration_prototype__proto.toJSON = iso_string__toISOString;
	duration_prototype__proto.locale = locale;
	duration_prototype__proto.localeData = localeData;

	// Deprecations
	duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
	duration_prototype__proto.lang = lang;

	// Side effect imports

	addFormatToken('X', 0, 0, 'unix');
	addFormatToken('x', 0, 0, 'valueOf');

	// PARSING

	addRegexToken('x', matchSigned);
	addRegexToken('X', matchTimestamp);
	addParseToken('X', function (input, array, config) {
		config._d = new Date(parseFloat(input, 10) * 1000);
	});
	addParseToken('x', function (input, array, config) {
		config._d = new Date(toInt(input));
	});

	// Side effect imports


	utils_hooks__hooks.version = '2.10.6';

	setHookCallback(local__createLocal);

	utils_hooks__hooks.fn = momentPrototype;
	utils_hooks__hooks.min = min;
	utils_hooks__hooks.max = max;
	utils_hooks__hooks.utc = create_utc__createUTC;
	utils_hooks__hooks.unix = moment__createUnix;
	utils_hooks__hooks.months = lists__listMonths;
	utils_hooks__hooks.isDate = isDate;
	utils_hooks__hooks.locale = locale_locales__getSetGlobalLocale;
	utils_hooks__hooks.invalid = valid__createInvalid;
	utils_hooks__hooks.duration = create__createDuration;
	utils_hooks__hooks.isMoment = isMoment;
	utils_hooks__hooks.weekdays = lists__listWeekdays;
	utils_hooks__hooks.parseZone = moment__createInZone;
	utils_hooks__hooks.localeData = locale_locales__getLocale;
	utils_hooks__hooks.isDuration = isDuration;
	utils_hooks__hooks.monthsShort = lists__listMonthsShort;
	utils_hooks__hooks.weekdaysMin = lists__listWeekdaysMin;
	utils_hooks__hooks.defineLocale = defineLocale;
	utils_hooks__hooks.weekdaysShort = lists__listWeekdaysShort;
	utils_hooks__hooks.normalizeUnits = normalizeUnits;
	utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;

	var _moment = utils_hooks__hooks;

	return _moment;

}));
;(function ($) {
  var defaultOptions = {
    min: false,
    max: false,
    format: 'YYYY-MM-DD HH:mm:ss',
    isRange: false,
    hasShortcut: false,
    shortcutOptions: [],
    between: false,
    hide: function () {
    },
    show: function () {
    }
  };
  var API = {
    timeReg: function (_this) {
      var format = _this.config.format.split(' ')[1];
      var regText = format.replace(/HH/, '([0-9]{1,2})').replace(/:/g, '(:?)').replace(/(mm|ss)/g, '([0-9]{1,2})');
      return new RegExp('^' + regText + '$');
    },
    dayReg: function (_this) {
      var format = _this.config.format.split(' ')[0];
      var splitStrReg = new RegExp(_this.splitStr, 'g');
      var regText = format.replace(/YYYY/, '([1-9]{1}[0-9]{3})').replace(splitStrReg, '(' + _this.splitStr + '?)').replace(/(MM|DD)/g, '([0-9]{1,2})');
      return new RegExp('^' + regText + '$');
    },
    fixedFill: function (dayResult) {
      if (dayResult[3] == 0) {
        dayResult[3] = dayResult[5];
        dayResult[5] = '01';
      }
      if (dayResult[3].length == 1 && dayResult[5] == 0) {
        dayResult[3] = dayResult[3] + '0';
        dayResult[5] = '01';
      }
      if (dayResult[3].length == 2 && dayResult[5] == 0) {
        dayResult[5] = '01';
      }
      return dayResult;
    },
    getMonthDay: function (month, year) {
      var prevMonth = month - 1 < 0 ? 11 : month - 1;
      return month === 2 && year % 4 === 0 ? '29' : EVERYMONTHHASDAY[prevMonth];
    },
    getFormat: function (format) {
      var arr = ['YYYY', 'MM', 'DD', 'HH', 'mm', 'ss'];
      var result = [];
      for (var i = 0; i < arr.length; i++) {
        result.push(format.indexOf(arr[i]) !== -1);
      }
      return result;
    },
    getPicker: function ($el, type) {
      type = type || 'picker';
      return $el.parents('.c-datepicker-picker').data(type);
    },
    fillTime: function (val) {
      return Number(val) < 10 ? '0' + Number(val) : val;
    },
    fillMonth: function (month, year) {
      if (month < 1) {
        month = 12;
        year = year - 1;
      } else if (month > 12) {
        month = 1;
        year = year + 1;
      }
      return {
        month: month,
        year: year
      }
    },
    getTimeFormat: function (_moment) {
      return {
        year: _moment.year(),
        month: _moment.month() + 1,
        day: _moment.date()
      }
    },
    newDateFixed: function (_this, temp) {
      var reg = new RegExp(_this.splitStr, 'g');
      return temp ? new Date(temp.replace(reg, '/')) : new Date();
    },
    getRangeTimeFormat: function (_this, $input) {
      var temp;
      var val = $input.val();
      temp = val;
      var result = temp ? moment(API.newDateFixed(_this, temp)) : moment();
      return API.getTimeFormat(result);
    },
    minMaxFill: function (_this, result, index, type) {
      var val;
      if (type === 'month') {
        val = result.year + _this.splitStr + API.fillTime(result.month);
      } else if (type === 'year') {
        val = result.year + '';
      } else {
        val = result.year + _this.splitStr + API.fillTime(result.month) + _this.splitStr + API.fillTime(result.day);
      }
      if (_this.hasTime) {
        val += ' ' + _this.$container.find('.c-datePicker__input-time').eq(index).val();
      }
      if (!_this.config.min && !_this.config.max) {
        val = val.split(' ')[0];
        return {
          val: val,
          result: result
        };
      }
      var nowMoment = moment(API.newDateFixed(_this, val));
      var minMoment = moment(API.newDateFixed(_this, _this.config.min));
      var maxMoment = moment(API.newDateFixed(_this, _this.config.max));
      var isBefore = nowMoment.isBefore(minMoment);
      var isAfter = nowMoment.isAfter(maxMoment);
      if (isBefore && _this.config.min) {
        val = minMoment.format(_this.config.format).split(' ')[0];
        result = API.getTimeFormat(minMoment);
      }
      if (isAfter && _this.config.max) {
        val = maxMoment.format(_this.config.format).split(' ')[0];
        result = API.getTimeFormat(maxMoment);
      }
      val = val.split(' ')[0];
      return {
        val: val,
        result: result
      }
    },
    timeCheck: function (time) {
      var arr = time.split(':');
      var checkArr = [23, 59, 59];
      for (var i = 0; i < arr.length; i++) {
        if (Number(arr[i]) > checkArr[i]) {
          arr[i] = checkArr[i];
        }
      }
      return arr.join(':');
    },
    maxMonth: function (val) {
      return val > 12;
    },
    minMonth: function (val) {
      return val < 1;
    },
    judgeTimeRange: function (_this, $day, $time, index) {
      index = index || 0;
      var day = $day.val();
      var time = $time.val();
      if (!day) {
        return;
      }
      var val = day + ' ' + time;
      var _moment = moment(API.newDateFixed(_this, val));
      var isBefore = _this.config.min ? _moment.isBefore((API.newDateFixed(_this, _this.config.min))) : false;
      var isAfter = _this.config.max ? _moment.isAfter((API.newDateFixed(_this, _this.config.max))) : false;
      if (!isBefore && !isAfter) {
        return;
      }
      if (isBefore && _this.config.min) {
        val = _this.config.min;
        $time.val(val.split(' ')[1]);
      } else if (isAfter && _this.config.max) {
        val = _this.config.max;
        $time.val(val.split(' ')[1]);
      }
      if (!_this.config.isRange) {
        _this.$input.eq(index).val(val);
      }
    },
    timeVal: function (_this, type) {
      var timeFormat = _this.config.format.split(' ')[1];
      return type === 'min' ? timeFormat.replace(/HH/, '00').replace(/mm/, '00').replace(/ss/, '00') : timeFormat.replace(/HH/, '23').replace(/mm/, '59').replace(/ss/, '59');
    },
    getScrollBarWidth: function () {
      var inner = document.createElement('p');
      inner.style.width = "100%";
      inner.style.height = "200px";
      var outer = document.createElement('div');
      outer.style.position = "absolute";
      outer.style.top = "0px";
      outer.style.left = "0px";
      outer.style.visibility = "hidden";
      outer.style.width = "200px";
      outer.style.height = "150px";
      outer.style.overflow = "hidden";
      outer.appendChild(inner);
      document.body.appendChild(outer);
      var w1 = inner.offsetWidth;
      outer.style.overflow = 'scroll';
      var w2 = inner.offsetWidth;
      if (w1 == w2) w2 = outer.clientWidth;
      document.body.removeChild(outer);
      var barWidth = w1 - w2;
      if (barWidth === 0) {
        barWidth = 15;
      }
      return barWidth;
    }
  };
  var JQTABLESCROLLWIDTH = API.getScrollBarWidth();
  var TEARTPL = '<table class="{{class}}" style="">' +
    '<tbody>' +
    '{{body}}' +
    '</tbody>' +
    '</table>';
  var TDTPL = '<td class="{{today}}">' +
    '<div>' +
    '<a class="cell">{{value}}</a>' +
    '</div>' +
    '</td>';
  var DAYHEADER = '<tr>' +
    '<th>日</th>' +
    '<th>一</th>' +
    '<th>二</th>' +
    '<th>三</th>' +
    '<th>四</th>' +
    '<th>五</th>' +
    '<th>六</th>' +
    '</tr>';
  var TIMELITPL = '<li class="c-datepicker-time-spinner__item {{className}}">{{time}}</li>';
  var TIMETPL = '<div class="c-datepicker-time-spinner__wrapper c-datepicker-scrollbar">' +
    '<div class="c-datepicker-scrollbar__wrap {{className}}" style="max-height: inherit; margin-bottom: -' + JQTABLESCROLLWIDTH + 'px; margin-right: -' + JQTABLESCROLLWIDTH + 'px;">' +
    '<ul class="c-datepicker-scrollbar__view c-datepicker-time-spinner__list">' +
    '{{li}}' +
    '</ul>' +
    '</div>' +
    '</div>';
  var TIMEMAINTPL = '<div class="c-datepicker-time-panel c-datepicker-popper" style="">' +
    '<div class="c-datepicker-time-panel__content has-seconds">' +
    '<div class="c-datepicker-time-spinner has-seconds">' +
    '{{time}}' +
    '</div>' +
    '</div>' +
    '<div class="c-datepicker-time-panel__footer">' +
    '<button type="button" class="c-datepicker-time-panel__btn min">0点</button>' +
    '<button type="button" class="c-datepicker-time-panel__btn max">23:59</button>' +
    '<button type="button" class="c-datepicker-time-panel__btn cancel">取消</button>' +
    '<button type="button" class="c-datepicker-time-panel__btn confirm">确定</button>' +
    '</div>' +
    '</div>';
  var SIDEBARBUTTON = '<button type="button" class="c-datepicker-picker__shortcut" data-value="{{day}}" data-time="{{time}}">{{name}}</button>';
  var SIDEBARTPL = '<div class="c-datepicker-picker__sidebar">' +
    '{{button}}' +
    '</div>';
  var PICKERFOOTERTPL = '<div class="c-datepicker-picker__footer" style="">' +
    '<button type="button" class="c-datepicker-button c-datepicker-picker__link-btn c-datepicker-button--text c-datepicker-button--mini {{className}}">' +
    '<span>' +
    '{{text}}' +
    '</span>' +
    '</button>' +
    '<button type="button" class="c-datepicker-button c-datepicker-picker__link-btn confirm c-datepicker-button--default c-datepicker-button--mini is-plain">' +
    '<span>' +
    '确定' +
    '</span>' +
    '</button>' +
    '</div>';
  var PICKERARROWTPL = '<div x-arrow="" class="popper__arrow" style="left: 35px;"></div>';
  var PICKERHEADERTPL = '<div class="{{className}}__header">' +
    '{{prev}}' +
    '<span role="button" class="{{className}}__header-label {{className}}__header-year"><span>{{year}}</span> 年</span>' +
    '<span role="button" class="{{className}}__header-label {{className}}__header-month"><span>{{month}}</span> 月</span>' +
    '{{next}}' +
    '</div>';
  PICKERHEADERPREVTPL = '<i class="kxiconfont icon-first c-datepicker-picker__icon-btn {{className}}__prev-btn year" aria-label="前一年"></i>' +
    '<i class="kxiconfont icon-left c-datepicker-picker__icon-btn {{className}}__prev-btn month" aria-label="上个月"></i>';
  PICKERHEADERNEXTTPL = '<i class="kxiconfont icon-right c-datepicker-picker__icon-btn {{className}}__next-btn month" aria-label="下个月"></i>' +
    '<i class="kxiconfont icon-last c-datepicker-picker__icon-btn {{className}}__next-btn year" aria-label="后一年"></i>';
  PICKERHEADERNEXTSINGLETPL = '<i class="kxiconfont icon-last c-datepicker-picker__icon-btn {{className}}__next-btn year" aria-label="后一年"></i>' +
    '<i class="kxiconfont icon-right c-datepicker-picker__icon-btn {{className}}__next-btn month" aria-label="下个月"></i>';
  var PICKERTIMEHEADERTPL = '<span class="{{className}}__editor-wrap">' +
    '<div class="c-datepicker-input c-datepicker-input--small">' +
    '<input type="text" autocomplete="off" placeholder="选择日期" class="c-datepicker-input__inner c-datePicker__input-day">' +
    '</div>' +
    '</span>' +
    '<span class="{{className}}__editor-wrap">' +
    '<div class="c-datepicker-input c-datepicker-input--small">' +
    '<input type="text" autocomplete="off" placeholder="选择时间" class="c-datepicker-input__inner c-datePicker__input-time">' +
    '</div>' +
    '</span>';
  var RANGEPICKERMAINTPL = '<div class="c-datepicker-picker c-datepicker-date-range-picker c-datepicker-popper {{hasTime}} {{hasSidebar}}" x-placement="top-start">' +
    '<div class="c-datepicker-picker__body-wrapper">' +
    '{{sidebar}}' +
    '<div class="c-datepicker-picker__body">' +
    '<div class="c-datepicker-date-range-picker__time-header">' +
    '<div class="c-datepicker-date-range-picker__time-content">' +
    PICKERTIMEHEADERTPL.replace(/{{className}}/g, 'c-datepicker-date-range-picker') +
    '</div>' +
    '<span class="kxiconfont icon-right"></span>' +
    '<div class="c-datepicker-date-range-picker__time-content">' +
    PICKERTIMEHEADERTPL.replace(/{{className}}/g, 'c-datepicker-date-range-picker') +
    '</div>' +
    '</div>' +
    '<div class="c-datepicker-picker__body-content">' +
    '<div class="c-datepicker-date-range-picker-panel__wrap is-left">' +
    PICKERHEADERTPL.replace(/{{prev}}/g, PICKERHEADERPREVTPL).replace(/{{next}}/g, '').replace(/{{className}}/g, 'c-datepicker-date-range-picker') +
    '<div class="c-datepicker-picker__content">' +
    '{{table}}' +
    '</div>' +
    '</div>' +
    '<div class="c-datepicker-date-range-picker-panel__wrap is-right">' +
    PICKERHEADERTPL.replace(/{{prev}}/g, '').replace(/{{next}}/g, PICKERHEADERNEXTTPL).replace(/{{year}}/g, '{{yearEnd}}').replace(/{{month}}/g, '{{monthEnd}}').replace(/{{className}}/g, 'c-datepicker-date-range-picker') +
    '<div class="c-datepicker-picker__content">' +
    '{{table}}' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    PICKERFOOTERTPL.replace(/{{className}}/g, 'c-datepicker-picker__btn-clear').replace(/{{text}}/g, '清空') +
    PICKERARROWTPL +
    '</div>';
  var PICKERFOOTERNOWBUTTON = PICKERFOOTERTPL.replace(/{{className}}/g, 'c-datepicker-picker__btn-now').replace(/{{text}}/g, '此刻');
  var PICKERFOOTERCLEARBUTTON = PICKERFOOTERTPL.replace(/{{className}}/g, 'c-datepicker-picker__btn-clear').replace(/{{text}}/g, '清空');
  var DATEPICKERMAINTPL = '<div class="c-datepicker-picker c-datepicker-date-picker c-datepicker-popper {{hasTime}} {{hasSidebar}}" x-placement="top-start">' +
    '<div class="c-datepicker-picker__body-wrapper">' +
    '{{sidebar}}' +
    '<div class="c-datepicker-picker__body">' +
    '<div class="c-datepicker-date-picker__time-header">' +
    PICKERTIMEHEADERTPL.replace(/{{className}}/g, 'c-datepicker-date-picker') +
    '</div>' +
    PICKERHEADERTPL.replace(/{{prev}}/g, PICKERHEADERPREVTPL).replace(/{{next}}/g, PICKERHEADERNEXTSINGLETPL).replace(/{{className}}/g, 'c-datepicker-date-picker') +
    ' <div class="c-datepicker-picker__content">' +
    '{{table}}' +
    '</div>' +
    '</div>' +
    '</div>' +
    '{{footerButton}}' +
    PICKERARROWTPL +
    '</div>';
  var EVERYMONTHHASDAY = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var MONTHWORDS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  var o = $({});
  $.sub = function () {
    o.on.apply(o, arguments);
  };
  $.unsub = function () {
    o.off.apply(o, arguments);
  };
  $.pub = function () {
    o.trigger.apply(o, arguments);
  };

  function Year(picker) {
    this.picker = picker;
    this.init();
  }

  $.extend(Year.prototype, {
    init: function () {
    },
    event: function () {
      if (!this.picker.config.isRange) {
        this.picker.$container.on('click', '.c-datepicker-year-table td.available', function () {
          if ($(this).hasClass('disabled')) {
            return;
          }
          var _this = API.getPicker($(this), 'year');
          var activeNum = $(this).text();
          _this.picker.$container.find('.c-datepicker-date-picker__header-year span').text(activeNum);
          if (_this.picker.params.isYear) {
            _this.picker.$input.val(activeNum);
            _this.picker.$container.find('.c-datepicker-year-table td.current').removeClass('current');
            $(this).addClass('current');
            _this.picker.datePickerObject.hide();
          } else {
            _this.picker.monthObject.render();
            _this.hide();
          }
        })
      }
    },
    show: function () {
      this.picker.$container.find('.c-datepicker-date-table,.c-datepicker-month-table,.c-datepicker-date-picker__header-month').hide();
      this.picker.$container.find('.c-datepicker-year-table').show();
    },
    hide: function () {
      this.picker.$container.find('.c-datepicker-year-table').hide();
      this.picker.$container.find('.c-datepicker-date-picker__prev-btn.year,.c-datepicker-date-picker__next-btn.year').removeClass('is-year');
    },
    render: function (year) {
      var html = this.renderHtml(year);
      var $year = this.picker.$container.find('.c-datepicker-year-table');
      if (!$year.length) {
        this.picker.$container.find('.c-datepicker-picker__content').append(html);
        this.picker.$container.data('year', this);
        this.show();
        this.event();
      } else {
        $year.replaceWith(html);
        this.show();
      }
      this.picker.$container.find('.c-datepicker-date-picker__prev-btn.month,.c-datepicker-date-picker__next-btn.month').hide();
      this.picker.$container.find('.c-datepicker-date-picker__prev-btn.year,.c-datepicker-date-picker__next-btn.year').addClass('is-year');
    },
    renderHtml: function (year) {
      year = year || moment().year();
      var min = Number(parseInt(year / 10) + '0');
      var temp = '';
      var html = '';
      var val = this.picker.$input.val();
      var activeYear = val ? API.getTimeFormat(moment(API.newDateFixed(this.picker, val))).year : false;
      this.picker.$container.find('.c-datepicker-date-picker__header-year span').text(min + '年-' + (min + 9));
      for (var index = 0; index < 10; index++) {
        var _val = min + index;
        var className = _val == activeYear ? 'current available' : 'available';
        if (_val < this.picker.minJson.year || _val > this.picker.maxJson.year) {
          className += ' disabled';
        }
        temp += TDTPL.replace('{{value}}', _val).replace('{{today}}', className);
        if ((index + 1) % 4 === 0) {
          html += '<tr>' + temp + '</tr>';
          temp = '';
        }
      }
      if (temp) {
        html += '<tr>' + temp + '</tr>';
      }
      html = TEARTPL.replace('{{body}}', html).replace('{{class}}', 'c-datepicker-year-table');
      return html;
    }
  });

  function Month(picker) {
    this.picker = picker;
    this.init();
  }

  $.extend(Month.prototype, {
    init: function () {
    },
    event: function () {
      if (!this.picker.config.isRange) {
        this.picker.$container.on('click', '.c-datepicker-month-table td.available', function () {
          if ($(this).hasClass('disabled')) {
            return;
          }
          var _this = API.getPicker($(this), 'month');
          var year = _this.picker.$container.find('.c-datepicker-date-picker__header-year span').text();
          var month = _this.picker.$container.find('.c-datepicker-month-table td').index($(this)) + 1;
          _this.picker.$container.find('.c-datepicker-date-picker__header-month span').text(month);
          if (_this.picker.params.isMonth) {
            var val = year + _this.picker.splitStr + API.fillTime(month);
            _this.picker.$input.val(val);
            _this.picker.$container.find('.c-datepicker-month-table td.current').removeClass('current');
            $(this).addClass('current');
            _this.picker.datePickerObject.hide();
          } else {
            _this.picker.dayObject.renderSingle(year, month, false, true);
            _this.hide();
          }
        })
      }
    },
    show: function () {
      this.picker.$container.find('.c-datepicker-month-table').show();
      this.picker.$container.find('.c-datepicker-date-table,.c-datepicker-year-table').hide();
    },
    hide: function () {
      this.picker.$container.find('.c-datepicker-date-picker__prev-btn.month,.c-datepicker-date-picker__next-btn.month').show();
      this.picker.$container.find('.c-datepicker-date-picker__header-month').show();
      this.picker.$container.find('.c-datepicker-month-table').hide();
      this.picker.$container.find('.c-datepicker-date-picker__prev-btn.year,.c-datepicker-date-picker__next-btn.year').removeClass('is-month');
    },
    render: function () {
      var html = this.renderHtml();
      var $month = this.picker.$container.find('.c-datepicker-month-table');
      if (!$month.length) {
        this.picker.$container.find('.c-datepicker-picker__content').append(html);
        this.picker.$container.data('month', this);
        this.show();
        this.event();
      } else {
        $month.replaceWith(html);
        this.show();
      }
      this.picker.$container.find('.c-datepicker-date-picker__prev-btn.year,.c-datepicker-date-picker__next-btn.year').addClass('is-month');
    },
    renderHtml: function () {
      var min = 1;
      var temp = '';
      var html = '';
      var nowYear = this.picker.$container.find('.c-datepicker-date-picker__header-year span').text();
      var minYear = this.picker.minJson.year;
      var maxYear = this.picker.maxJson.year;
      var disabledName = '';
      var isSame = false;
      if (nowYear < minYear || nowYear > maxYear) {
        disabledName = ' disabled';
      } else if (nowYear == minYear || nowYear == maxYear) {
        isSame = true;
        var minMonth, maxMonth;
        if (maxYear == minYear) {
          minMonth = this.picker.minJson.month;
          maxMonth = this.picker.maxJson.month;
        } else if (nowYear == minYear) {
          minMonth = this.picker.minJson.month;
          maxMonth = 13;
        } else if (nowYear == maxYear) {
          minMonth = 0;
          maxMonth = this.picker.maxJson.month;
        }
      }
      var val = this.picker.$input.val();
      var formatResult = API.getTimeFormat(moment(API.newDateFixed(this.picker, val)));
      var activeMonth = val && (formatResult.year == nowYear) ? formatResult.month : false;
      for (var index = 0; index < 12; index++) {
        var _val = min + index;
        var className = _val === activeMonth ? 'current available' : 'available';
        className += disabledName;
        if (isSame && (_val < minMonth || _val > maxMonth)) {
          className += ' disabled';
        }
        temp += TDTPL.replace('{{value}}', MONTHWORDS[index]).replace('{{today}}', className);
        if ((index + 1) % 4 === 0) {
          html += '<tr>' + temp + '</tr>';
          temp = '';
        }
      }
      html = TEARTPL.replace('{{body}}', html).replace('{{class}}', 'c-datepicker-month-table');
      return html;
    }
  });

  function Day(picker) {
    this.picker = picker;
    this.init();
  }

  $.extend(Day.prototype, {
    init: function () {
      this.current = 0;
    },
    eventSingle: function () {
      this.picker.$container.on('click', '.c-datepicker-date-table td.available', function (event) {
        event.stopPropagation();
        var $this = $(this);
        var _this = API.getPicker($this, 'day');
        if ($this.hasClass('disabled')) {
          return;
        }
        if (_this.picker.isBlur) {
          var $wrap = $this.parents('.c-datepicker-picker__content');
          var index = $wrap.find('.c-datepicker-date-table td').index($this);
          $.sub('datapickerClick', function (e) {
            $this = $wrap.find('.c-datepicker-date-table td').eq(index);
            clickDate(_this, $this);
            $.unsub('datapickerClick');
          });
          $.pub('datapickerRenderPicker');
        } else {
          clickDate(_this, $this);
        }
      })

      function clickDate(_this, $target) {
        var activeNum = $target.text();
        _this.picker.$container.find('.c-datepicker-date-table td.current').removeClass('current');
        $target.addClass('current');
        var val = _this.picker.$container.find('.c-datePicker__input-day').val();
        if (!val) {
          var time = moment().format(_this.picker.config.format).split(' ')[1];
          _this.picker.$container.find('.c-datePicker__input-time').val(time);
          setValue.call(_this, activeNum, moment(), moment());
        } else {
          var inputVal = _this.picker.$input.val();
          setValue.call(_this, activeNum, moment(API.newDateFixed(_this.picker, val)), moment(API.newDateFixed(_this.picker, inputVal)));
        }
        if (!_this.picker.hasTime) {
          _this.picker.datePickerObject.hide();
        } else {
          API.judgeTimeRange(_this.picker, _this.picker.$container.find('.c-datePicker__input-day'), _this.picker.$container.find('.c-datePicker__input-time'));
        }
      }

      function setValue(activeNum, input, inputDay) {
        var year = this.picker.$container.find('.c-datepicker-date-picker__header-year span').text();
        var month = this.picker.$container.find('.c-datepicker-date-picker__header-month span').text() - 1;
        val = input.set({
          'year': year,
          'month': month,
          'date': activeNum
        }).format(this.picker.config.format.split(' ')[0]);
        this.picker.$container.find('.c-datePicker__input-day').val(val);
        var inputVal = inputDay.set({
          'year': year,
          'month': month,
          'date': activeNum
        }).format(this.picker.config.format);
        this.picker.$input.val(inputVal);
      }
    },
    eventRange: function () {
      this.picker.$container.on('click', '.c-datepicker-date-table td.available', function (event) {
        event.stopPropagation();
        var $this = $(this);
        if ($this.hasClass('disabled')) {
          return;
        }
        var _this = API.getPicker($this, 'day');
        if (_this.picker.isBlur) {
          var $wrap = $this.parents('.c-datepicker-date-range-picker-panel__wrap');
          var index = $wrap.find('td').index($this);
          $.sub('datapickerClick', function (e) {
            $this = $wrap.find('td').eq(index);
            clickDateRange(_this, $this);
            $.unsub('datapickerClick');
          });
          $.pub('datapickerRenderPicker');
        } else {
          clickDateRange(_this, $this);
        }
      })

      function clickDateRange(_this, $target) {
        var $wrap = _this.picker.$container.find('.c-datepicker-date-range-picker-panel__wrap');
        $wrap.find('td.current.hover').removeClass('current hover');
        var $current = $wrap.find('td.current');
        var $activeWrap = $target.parents('.c-datepicker-date-range-picker-panel__wrap');
        var date = $target.find('.cell').text();
        var $day = _this.picker.$container.find('.c-datePicker__input-day');
        var $time = _this.picker.$container.find('.c-datePicker__input-time');
        var year = $activeWrap.find('.c-datepicker-date-range-picker__header-year span').text();
        var month = $activeWrap.find('.c-datepicker-date-range-picker__header-month span').text() - 1;
        if (_this.current >= 2) {
          $current.removeClass('current');
          $wrap.find('td.in-range').removeClass('in-range');
          $current = $wrap.find('td.current');
          _this.current = 0;
        }
        if (!_this.current) {
          $target.addClass('current');
          var inputVal = moment().set({
            'year': year,
            'month': month,
            'date': date
          }).format(_this.picker.config.format.split(' ')[0]);
          $day.val(inputVal);
          $time.eq(0).val(_this.picker.timeMin);
          $time.eq(1).val(_this.picker.timeMax);
          _this.current = 1;
        } else if (_this.current == 1) {
          $target.addClass('current');
          var existDate = $day.eq(0).val();
          var inputVal = moment().set({
            'year': year,
            'month': month,
            'date': date
          }).format(_this.picker.config.format.split(' ')[0]);
          var a = moment(API.newDateFixed(_this.picker, existDate));
          var b = moment(API.newDateFixed(_this.picker, inputVal));
          if (!_this.picker.hasTime) {
            if (b.diff(a) < 0) {
              var temp = inputVal;
              inputVal = existDate;
              existDate = temp;
            }
            _this.current = 2;
            _this.picker.$inputBegin.val(existDate);
            _this.picker.$inputEnd.val(inputVal);
            _this.picker.datePickerObject.hide();
          } else {
            if (b.diff(a) < 0) {
              $day.eq(0).val(inputVal);
              $day.eq(1).val(existDate);
            } else {
              $day.eq(1).val(inputVal);
            }
            _this.current = 2;
            _this.addRangeClass();
          }
        }
        if (_this.current) {
          var index = _this.current - 1;
          API.judgeTimeRange(_this.picker, _this.picker.$container.find('.c-datePicker__input-day').eq(index), _this.picker.$container.find('.c-datePicker__input-time').eq(index), index);
        }
      }

      this.picker.$container.on('mouseenter', '.c-datepicker-date-table td.available', function () {
        var _this = API.getPicker($(this), 'day');
        if (_this.current != 1) {
          return;
        }
        _this.picker.$container.find('td.current.hover').removeClass('current hover');
        $(this).addClass('current hover');
        var $wrap = $(this).parents('.c-datepicker-date-range-picker-panel__wrap');
        var $start = _this.picker.$container.find('.c-datePicker__input-day').eq(0);
        var year = $wrap.find('.c-datepicker-date-range-picker__header-year span').text();
        var month = $wrap.find('.c-datepicker-date-range-picker__header-month span').text();
        var date = $(this).find('.cell').text();
        var start = $start.val();
        var end = year + _this.picker.splitStr + month + _this.picker.splitStr + date;
        if (moment(API.newDateFixed(_this.picker, start)).isAfter(API.newDateFixed(_this.picker, end))) {
          var temp = start;
          start = end;
          end = temp;
        }
        _this.addRangeClass(moment(API.newDateFixed(_this.picker, start)), moment(API.newDateFixed(_this.picker, end)), true);
      })
    },
    show: function () {
      this.picker.$container.find('.c-datepicker-year-table,.c-datepicker-month-table').hide();
      this.picker.$container.find('.c-datepicker-date-table').show();
    },
    hide: function () {
      this.picker.$container.find('.c-datepicker-date-table').hide();
    },
    render: function (year, month, today, baseEnd, reRender) {
      if (this.picker.config.isRange) {
        this.renderRange(year, month, today, baseEnd, reRender);
      } else {
        this.renderSingle(year, month, today, reRender);
      }
    },
    renderSingle: function (year, month, today, reRender) {
      var html = this.renderHtml(year, month, today);
      var $year = this.picker.$container.find('.c-datepicker-date-table');
      if ($year.length && !reRender) {
        this.addCurrentSingle();
        this.show();
      } else {
        var $content = this.picker.$container.find('.c-datepicker-picker__content');
        var $year = this.picker.$container.find('.c-datepicker-date-picker__header-year span');
        var $month = this.picker.$container.find('.c-datepicker-date-picker__header-month span');
        $year.text(year);
        $month.text(month);
        if (!$content.find('.c-datepicker-date-table').length) {
          $content.append(html);
        } else {
          $content.find('.c-datepicker-date-table').replaceWith(html);
        }
        if (!this.picker.$container.data('day')) {
          this.picker.$container.data('day', this);
        }
        this.addCurrentSingle();
        this.show();
        if (!reRender) {
          this.eventSingle();
        }
      }
    },
    addCurrentSingle: function () {
      var val = this.picker.$input.val();
      if (!val) {
        return;
      }
      if (!API.dayReg(this.picker).test(val.split(' ')[0])) {
        return;
      }
      var result = API.getTimeFormat(moment(API.newDateFixed(this.picker, val)));
      var year = this.picker.$container.find('.c-datepicker-date-picker__header-year span').text();
      var month = this.picker.$container.find('.c-datepicker-date-picker__header-month span').text();
      if (result.year == year && result.month == month) {
        var $day = this.picker.$container.find('.c-datepicker-date-table td.available');
        $day.removeClass('current');
        $day.eq(result.day - 1).addClass('current');
      }
    },
    renderRange: function (year, month, today, baseEnd, reRender) {
      var $dateTable = this.picker.$container.find('.c-datepicker-date-table');
      if ($dateTable.length && !reRender) {
        this.show();
      } else {
        var index = 0,
          distance = 1,
          countFn = API.maxMonth,
          initMonth = 1;
        var html = this.renderHtml(year[index], month[index], false);
        var monthEnd = month[index] + distance;
        var yearEnd = year[index];
        if (countFn(monthEnd)) {
          monthEnd = initMonth;
          yearEnd = yearEnd + distance;
        }
        var htmlEnd = this.renderHtml(yearEnd, monthEnd, false);
        var $dateTable = this.picker.$container.find('.c-datepicker-date-range-picker__header-year');
        var $month = this.picker.$container.find('.c-datepicker-date-range-picker__header-month');
        $dateTable.eq(index).find('span').text(year[index]);
        $month.eq(index).find('span').text(month[index]);
        $dateTable.eq(1 - index).find('span').text(yearEnd);
        $month.eq(1 - index).find('span').text(monthEnd);
        this.picker.$container.find('.c-datepicker-picker__content').eq(index).html(html);
        this.picker.$container.find('.c-datepicker-picker__content').eq(1 - index).html(htmlEnd);
        if (!this.picker.$container.data('day')) {
          this.picker.$container.data('day', this);
        }
        this.addRangeClass();
        if (!reRender) {
          this.eventRange();
        }
      }
    },
    prevNextSingle: function (moveType, type) {
      var $year = this.picker.$container.find('.c-datepicker-date-picker__header-year');
      var $month = this.picker.$container.find('.c-datepicker-date-picker__header-month');
      var year = Number($year.find('span').text());
      var month = Number($month.find('span').text());
      var day = this.picker.$container.find('.c-datePicker__input-day').val();
      var dayFormat = API.getTimeFormat(moment(API.newDateFixed(this.picker, day)));
      var count = 1;
      if (moveType === 'prev') {
        count = -1;
      }
      if (type === 'year') {
        year = year + count;
      } else if (type === 'month') {
        month = month + count;
        var result = API.fillMonth(month, year);
        month = result.month;
        year = result.year;
      }
      var date = false;
      if (dayFormat.year == year && dayFormat.month == month) {
        date = dayFormat.day;
      }
      var html = this.renderHtml(year, month, date);
      $year.find('span').text(year);
      $month.find('span').text(month);
      var $content = this.picker.$container.find('.c-datepicker-picker__content');
      var $table = $content.find('.c-datepicker-date-table');
      this.picker.$container.find('.c-datepicker-month-table,.c-datepicker-year-table').hide();
      if ($table.length) {
        $table.replaceWith(html);
      } else {
        $content.append(html);
      }
    },
    prevNextRender: function (moveType, type) {
      var $year = this.picker.$container.find('.c-datepicker-date-range-picker__header-year');
      var $month = this.picker.$container.find('.c-datepicker-date-range-picker__header-month');
      var year = Number($year.eq(0).find('span').text());
      var month = Number($month.eq(0).find('span').text());
      var count = 1;
      var endYear, endMonth;
      if (moveType === 'prev') {
        count = -1;
      }
      if (type === 'year') {
        year = year + count;
      } else if (type === 'month') {
        month = month + count;
      }
      var result = API.fillMonth(month, year);
      month = result.month;
      year = result.year;
      endMonth = month + 1;
      var endResult = API.fillMonth(endMonth, year);
      endMonth = endResult.month;
      endYear = endResult.year;
      var html = this.renderHtml(year, month, false);
      var htmlEnd = this.renderHtml(endYear, endMonth, false);
      $year.eq(0).find('span').text(year);
      $month.eq(0).find('span').text(month);
      $year.eq(1).find('span').text(endYear);
      $month.eq(1).find('span').text(endMonth);
      this.picker.$container.find('.c-datepicker-picker__content').eq(0).html(html);
      this.picker.$container.find('.c-datepicker-picker__content').eq(1).html(htmlEnd);
      this.addRangeClass(false, false, true);
    },
    renderHtml: function (year, month, activeDay) {
      var _moment = moment();
      month = month || _moment.month() + 1;
      year = year || _moment.year();
      var today = (_moment.month() + 1 === month) && (_moment.year() === year) ? _moment.date() : '';
      var prevMonthDay = API.getMonthDay(month - 1, year);
      var day = API.getMonthDay(month, year);
      var weekday = moment().set({
        'year': year,
        'month': month - 1,
        'date': 1
      }).weekday();
      var weekdayLast = moment().set({
        'year': year,
        'month': month - 1,
        'date': day
      }).weekday();
      var html = DAYHEADER;
      var min = 1;
      var temp = '';
      var row = 0;
      if (weekday != 0) {
        for (var prev = weekday - 1; prev >= 0; prev--) {
          var className = 'prev-month';
          temp += TDTPL.replace('{{value}}', prevMonthDay - prev).replace('{{today}}', className);
          if ((weekday - prev) % 7 === 0) {
            html += '<tr>' + temp + '</tr>';
            temp = '';
            row += 1;
          }
        }
      }
      var begin = weekday % 7;
      var hasMin = this.picker.minJson ? true : false;
      var hasMax = this.picker.maxJson ? true : false;
      var minMonth = hasMin ? moment(API.newDateFixed(this.picker, this.picker.minJson.year + this.picker.splitStr + this.picker.minJson.month + this.picker.splitStr + 1)) : false;
      var maxMonth = hasMax ? moment(API.newDateFixed(this.picker, this.picker.maxJson.year + this.picker.splitStr + this.picker.maxJson.month + this.picker.splitStr + 1)) : false;
      var disabledName = '';
      var isSame = false;
      var nowDate = moment(API.newDateFixed(this.picker, year + this.picker.splitStr + month + this.picker.splitStr + 1));
      if ((hasMin && nowDate.isBefore(minMonth)) || (hasMax && nowDate.isAfter(maxMonth))) {
        disabledName = ' disabled';
      } else if ((hasMin && nowDate.isSame(minMonth)) || (hasMax && nowDate.isSame(maxMonth))) {
        isSame = true;
        var minDay, maxDay;
        if (hasMin && hasMax && maxMonth.isSame(minMonth)) {
          minDay = this.picker.minJson.day;
          maxDay = this.picker.maxJson.day;
        } else if (hasMin && nowDate.isSame(minMonth)) {
          minDay = this.picker.minJson.day;
          maxDay = 32;
        } else if (hasMax && nowDate.isSame(maxMonth)) {
          minDay = 0;
          maxDay = this.picker.maxJson.day;
        }
      }
      for (var index = 0; index < day; index++) {
        var className = 'available' + disabledName;
        var _val = min + index;
        if (_val === today) {
          className += ' today';
        }
        if (_val === activeDay) {
          className += ' current';
        }
        if (isSame && (_val < minDay || _val > maxDay)) {
          className += ' disabled';
        }
        temp += TDTPL.replace('{{value}}', _val).replace('{{today}}', className);
        if ((begin + index + 1) % 7 === 0) {
          html += '<tr>' + temp + '</tr>';
          temp = '';
          if (index != (day - 1)) {
            row += 1;
          }
        }
      }
      begin = (weekday + day) % 7;
      var nextMax = (6 - row - 1) * 7 + (6 - weekdayLast);
      for (var next = 0; next < nextMax; next++) {
        var className = 'next-month';
        temp += TDTPL.replace('{{value}}', 1 + next).replace('{{today}}', className);
        if ((begin + next + 1) % 7 === 0) {
          html += '<tr>' + temp + '</tr>';
          temp = '';
        }
      }
      html = TEARTPL.replace('{{body}}', html).replace('{{class}}', 'c-datepicker-date-table');
      return html;
    },
    addRangeClass: function (defaultStart, defaultEnd, isHover) {
      var $wrap = this.picker.$container.find('.c-datepicker-date-range-picker-panel__wrap');
      $wrap.find('td.available').removeClass('in-range start-date end-date');
      var $days = this.picker.$container.find('.c-datePicker__input-day');
      var $years = this.picker.$container.find('.c-datepicker-date-range-picker__header-year');
      var $months = this.picker.$container.find('.c-datepicker-date-range-picker__header-month');
      var start = defaultStart || $days.eq(0).val();
      var end = defaultEnd || $days.eq(1).val();
      if (!start || !end) {
        return;
      }
      if (!isHover) {
        this.current = 2;
      }
      var startMoment = defaultStart || moment(API.newDateFixed(this.picker, $days.eq(0).val()));
      var endMoment = defaultEnd || moment(API.newDateFixed(this.picker, $days.eq(1).val()));
      var startYear = $years.eq(0).find('span').text();
      var endYear = $years.eq(1).find('span').text();
      var startMonth = $months.eq(0).find('span').text();
      var endMonth = $months.eq(1).find('span').text();
      var startRangeDate = startYear + this.picker.splitStr + startMonth + this.picker.splitStr + 1;
      var endRangeDate = endYear + this.picker.splitStr + endMonth + this.picker.splitStr + API.getMonthDay(endMonth, endYear);
      var isStartBetween = !(startMoment.isBefore(API.newDateFixed(this.picker, startRangeDate)) || startMoment.isAfter(API.newDateFixed(this.picker, endRangeDate)));
      ;
      var isEndBetween = !(endMoment.isBefore(API.newDateFixed(this.picker, startRangeDate)) || endMoment.isAfter(API.newDateFixed(this.picker, endRangeDate)));
      var index;
      var isBefore = startMoment.isBefore(API.newDateFixed(this.picker, startRangeDate)) && startMoment.isBefore(API.newDateFixed(this.picker, endRangeDate)) && endMoment.isBefore(API.newDateFixed(this.picker, startRangeDate)) && endMoment.isBefore(API.newDateFixed(this.picker, endRangeDate));
      var isAfter = startMoment.isAfter(API.newDateFixed(this.picker, startRangeDate)) && startMoment.isAfter(API.newDateFixed(this.picker, endRangeDate)) && endMoment.isAfter(API.newDateFixed(this.picker, startRangeDate)) && endMoment.isAfter(API.newDateFixed(this.picker, endRangeDate));
      if (isAfter || isBefore) {
        return;
      }
      if (isStartBetween) {
        index = (startMoment.month() + 1) == startMonth ? 0 : 1;
        $wrap.eq(index).find('td.available').eq(startMoment.date() - 1).addClass('current start-date');
      }
      if (isEndBetween) {
        index = (endMoment.month() + 1) == startMonth ? 0 : 1;
        $wrap.eq(index).find('td.available').eq(endMoment.date() - 1).addClass('current end-date');
      }
      var $current = $wrap.find('td.current');
      var $start = $wrap.find('.start-date');
      var $end = $wrap.find('.end-date');
      $current.addClass('in-range');
      if ($start.is($end)) {
        $start.addClass('in-range');
        return;
      } else if ($current.length === 2) {
        var $startTr = $start.parents('tr');
        var $endTr = $end.parents('tr');
        if ($start.parents('.c-datepicker-date-range-picker-panel__wrap').is($end.parents('.c-datepicker-date-range-picker-panel__wrap'))) {
          if ($startTr.is($endTr)) {
            var $tds = $start.nextAll('td.available');
            $tds.each(function (i, _td) {
              $(_td).addClass('in-range');
              if ($(_td).is($end)) {
                return false;
              }
            })
            return;
          }
          $start.nextAll('td.available').addClass('in-range');
          $end.prevAll('td.available').addClass('in-range');
          var $startTrs = $startTr.nextAll('tr');
          var $endTr = $endTr.prev('tr');
          if ($startTr.is($endTr)) {
            return;
          }
          $startTrs.each(function (i, tr) {
            $(tr).find('td.available').addClass('in-range');
            if ($(tr).is($endTr)) {
              return false;
            }
          })
          return;
        }
        $start.nextAll('td.available').addClass('in-range');
        $end.prevAll('td.available').addClass('in-range');
        $startTr.nextAll('tr').find('td.available').addClass('in-range');
        $endTr.prevAll('tr').find('td.available').addClass('in-range');
      } else if ($start.length) {
        var $startTr = $start.parents('tr');
        $start.nextAll('td.available').addClass('in-range');
        $startTr.nextAll('tr').find('td.available').addClass('in-range');
        if (index === 0) {
          $wrap.eq(1).find('td.available').addClass('in-range');
        }
      } else if ($end.length) {
        var $endTr = $end.parents('tr');
        $end.prevAll('td.available').addClass('in-range');
        $endTr.prevAll('tr').find('td.available').addClass('in-range');
        if (index === 1) {
          $wrap.eq(0).find('td.available').addClass('in-range');
        }
      } else {
        $wrap.find('td.available').addClass('in-range');
      }
    }
  });

  function Time(picker) {
    this.picker = picker;
    this.init();
  }

  $.extend(Time.prototype, {
    init: function () {
    },
    event: function () {
      this.picker.$container.on('click', '.c-datepicker-time-panel__btn.cancel', function () {
        var _this = API.getPicker($(this), 'time');
        var $time = _this.picker.activeTimeWrap.find('.c-datePicker__input-time');
        var index = _this.picker.$container.find('.c-datePicker__input-time').index($time);
        if (!_this.picker.config.isRange) {
          var day = _this.picker.$container.find('.c-datePicker__input-day').eq(index).val();
          _this.picker.$input.val(day + ' ' + _this.prevValue);
        }
        _this.picker.$container.find('.c-datePicker__input-time').eq(index).val(_this.prevValue);
        _this.hide();
      });
      this.picker.$container.on('click', '.c-datepicker-time-panel__btn.confirm', function () {
        var _this = API.getPicker($(this), 'time');
        _this.hide();
      });
      this.picker.$container.on('click', '.c-datepicker-time-panel__btn.min', function () {
        var _this = API.getPicker($(this), 'time');
        _this.updateTimeInput(_this.picker.timeMin);
      });
      this.picker.$container.on('click', '.c-datepicker-time-panel__btn.max', function () {
        var _this = API.getPicker($(this), 'time');
        _this.updateTimeInput(_this.picker.timeMax);
      });
      this.picker.$container.on('click', function () {
        var _this = $(this).data('time');
        _this.hide();
      });
      var timerArr = {
        timer0: '',
        timer1: '',
        timer2: ''
      };
      this.picker.$container.find('.c-datepicker-scrollbar__wrap').scroll(function () {
        var _this = API.getPicker($(this), 'time');
        var index = _this.picker.$container.find('.c-datepicker-scrollbar__wrap').index($(this));
        clearTimeout(timerArr['timer' + index]);
        timerArr['timer' + index] = setTimeout(function () {
          var top = $(this).scrollTop();
          var num = Math.round(top / 32);
          var len = $(this).find('li').length - 1;
          if (num >= len) {
            num = len;
          }
          top = num * 32;
          $(this).scrollTop(top);
          var index = _this.picker.activeTimeWrap.find('.c-datepicker-scrollbar__wrap').index($(this));
          var $time = _this.picker.activeTimeWrap.find('.c-datePicker__input-time');
          var day = _this.picker.activeTimeWrap.find('.c-datePicker__input-day').val();
          var val = $time.val();
          val = val.split(':');
          val[index] = API.fillTime(num);
          val = val.join(':');
          $time.val(val);
          if (!_this.picker.config.isRange) {
            _this.picker.$input.val(day + ' ' + val);
          }
        }.bind(this), 100);
      })
    },
    updateTimeInput: function (val) {
      this.picker.activeTimeWrap.find('.c-datePicker__input-time').val(val);
      if (!this.picker.config.isRange) {
        var day = this.picker.$input.val().split(' ')[0];
        this.picker.$input.val(day + ' ' + val);
      }
    },
    updateTimePanel: function (isShow) {
      var $wrap = this.picker.activeTimeWrap.find('.c-datepicker-scrollbar__wrap');
      var val = this.picker.activeTimeWrap.find('.c-datePicker__input-time').val();
      var format = this.picker.config.format.split(' ')[1];
      var regText = format.replace(/HH/, '[0-9]{2}').replace(/(mm|ss)/g, '[0-9]{2}');
      var reg = new RegExp('^' + regText + '$');
      var isMatch = reg.test(val);
      if (isMatch) {
        if (isShow) {
          this.prevValue = val;
        }
        val = val.split(':');
        $.each($wrap, function (i, el) {
          $(el).scrollTop(Number(val[i]) * 32).addClass('active');
        });
      }
      return isMatch;
    },
    show: function () {
      this.picker.activeTimeWrap.find('.c-datepicker-time-panel').show();
      this.updateTimePanel(true);
    },
    hide: function () {
      this.picker.$container.find('.c-datepicker-time-panel').hide();
    },
    render: function (type, hour, minute, second) {
      if (this.picker.config.isRange) {
        this.renderRange(type, hour, minute, second);
      } else {
        this.renderSingle(type, hour, minute, second);
      }
    },
    renderSingle: function (type, hour, minute, second) {
      var html = this.renderHtml(type, hour, minute, second);
      var $time = this.picker.activeTimeWrap.find('.c-datepicker-time-panel');
      if (!$time.length) {
        this.picker.activeTimeWrap.find('.c-datepicker-date-picker__editor-wrap').eq(1).append(html);
        this.picker.$container.data('time', this);
        this.event();
        this.show();
      } else {
        this.show();
      }
    },
    renderRange: function (type, hour, minute, second) {
      var html = this.renderHtml(type, hour, minute, second);
      var $time = this.picker.activeTimeWrap.find('.c-datepicker-time-panel');
      if (!$time.length) {
        var $content = this.picker.$container.find('.c-datepicker-date-range-picker__time-content');
        $content.eq(0).find('.c-datepicker-date-range-picker__editor-wrap').eq(1).append(html);
        $content.eq(1).find('.c-datepicker-date-range-picker__editor-wrap').eq(1).append(html);
        this.picker.$container.find('.c-datepicker-time-panel').hide();
        this.picker.$container.data('time', this);
        this.event();
        this.show();
      } else {
        this.show();
      }
    },
    renderHtml: function (type, hour, minute, second) {
      hour = hour || moment().hour();
      minute = minute || moment().minute();
      second = second || moment().second();
      var li = '';
      var html = '';
      if (type[0]) {
        for (var i = 0; i < 24; i++) {
          var className = hour === i ? 'active' : '';
          li += TIMELITPL.replace('{{time}}', API.fillTime(i)).replace('{{className}}', className);
        }
        html += TIMETPL.replace('{{li}}', li).replace('{{className}}', 'hour');
        li = '';
      }
      if (type[1]) {
        for (var j = 0; j < 60; j++) {
          var className = minute === j ? 'active' : '';
          li += TIMELITPL.replace('{{time}}', API.fillTime(j)).replace('{{className}}', className);
        }
        html += TIMETPL.replace('{{li}}', li).replace('{{className}}', 'minute');
        li = '';
      }
      if (type[2]) {
        for (var k = 0; k < 60; k++) {
          var className = second === k ? 'active' : '';
          li += TIMELITPL.replace('{{time}}', API.fillTime(k)).replace('{{className}}', className);
        }
        html += TIMETPL.replace('{{li}}', li).replace('{{className}}', 'second');
      }
      html = TIMEMAINTPL.replace('{{time}}', html);
      return html;
    }
  });
  $('body').on('click.datePicker', function () {
    $('.c-datepicker-picker').each(function (i, panel) {
      var _this = $(panel).data('picker');
      if ($(panel).css('display') === 'block') {
        if (_this.config.isRange && (!_this.$inputBegin.val() && !_this.$inputEnd.val())) {
          $(panel).find('td.available').removeClass('current in-range');
        }
        if (_this.hasTime) {
          $(panel).find('.c-datepicker-time-panel').hide();
        }
        _this.config.hide.call(_this);
        _this.datePickerObject.betweenHandle();
      }
    })
    $('.c-datepicker-picker').hide();
  });
  $('.c-datepicker-box').scroll(scrollSetContainerPos);

  function scrollSetContainerPos() {
    $('.c-datepicker-picker').each(function (i, panel) {
      var _this = $(panel).data('picker');
      if ($(panel).css('display') === 'block') {
        setContainerPos(_this.datePickerObject);
      }
    })
  }

  var DATEPICKERAPI = {
    initShowObject: function (_this, dataFormat) {
      var year, month, dayYear, dayMonth, dayDate;
      if (_this.config.isRange) {
        _this.fillDefault();
        dayYear = [dataFormat[0].year, dataFormat[1].year];
        dayMonth = [dataFormat[0].month, dataFormat[1].month];
        dayDate = [dataFormat[0].day, dataFormat[1].day];
        year = dataFormat[0].year;
        month = dataFormat[0].month;
      } else {
        var inputVal = _this.$input.val();
        year = dataFormat.year;
        month = dataFormat.month;
        dayYear = year;
        dayMonth = month;
        dayDate = inputVal ? dataFormat.day : false;
        if (_this.params.format[0]) {
          _this.yearObject = new Year(_this);
          if (!_this.params.format[2] && !_this.params.format[1]) {
            _this.yearObject.render(year);
          }
        }
        if (_this.params.format[1]) {
          _this.monthObject = new Month(_this);
          if (!_this.params.format[2]) {
            _this.$container.find('.c-datepicker-date-picker__prev-btn.month,.c-datepicker-date-picker__next-btn.month').hide();
            _this.monthObject.render(month);
          }
        }
      }
      if (_this.params.format[2]) {
        _this.dayObject = new Day(_this);
        _this.dayObject.render(dayYear, dayMonth, dayDate);
      }
      if (_this.params.format[3] || _this.params.format[4] || _this.params.format[5]) {
        _this.timeObject = new Time(_this);
      }
    },
    initParams: function (_this) {
      _this.splitStr = _this.config.format.replace(/[YMDhms:\s]/g, '').split('')[0];
      _this.params.format = API.getFormat(_this.config.format);
      _this.minJson = _this.config.min ? API.getTimeFormat(moment(API.newDateFixed(_this, _this.config.min))) : false;
      _this.maxJson = _this.config.max ? API.getTimeFormat(moment(API.newDateFixed(_this, _this.config.max))) : false;
    },
    renderPicker: function (target, isBlur) {
      var _this = API.getPicker($(target));
      if (_this.config.isRange) {
        DATEPICKERAPI.renderPickerRange(target, isBlur);
      } else {
        DATEPICKERAPI.renderPickerSingle(target, isBlur);
      }
    },
    renderPickerRange: function (target, isBlur) {
      var _this = API.getPicker($(target));
      var val = target.value;
      var format = _this.config.format.split(' ')[0];
      var regText = format.replace(/YYYY/, '[0-9]{4}').replace(/(MM|DD)/g, '[0-9]{2}');
      var reg = new RegExp('^' + regText + '$');
      if (reg.test(val)) {
        var $days = _this.$container.find('.c-datePicker__input-day');
        var $times = _this.$container.find('.c-datePicker__input-time');
        var index = $days.index($(target));
        var isBaseEnd = index === 1;
        var anotherVal = $days.eq(1 - index).val();
        var _moment = moment(API.newDateFixed(_this, val));
        var _momentAnother = moment(API.newDateFixed(_this, anotherVal));
        var orderFail = index === 0 ? _moment.isAfter(_momentAnother) : _moment.isBefore(_momentAnother);
        if (orderFail) {
          var temp = val;
          val = anotherVal;
          anotherVal = temp;
          _moment = moment(API.newDateFixed(_this, val));
          _momentAnother = moment(API.newDateFixed(_this, anotherVal));
          $days.eq(index).val(val);
          $days.eq(1 - index).val(anotherVal);
        }
        if (_this.hasTime && !isBlur) {
          $times.eq(0).val(_this.timeMin);
          $times.eq(1).val(_this.timeMax);
        }
        var resultAnother = API.getTimeFormat(_momentAnother);
        var result = API.getTimeFormat(_moment);
        var resultJson = API.minMaxFill(_this, result, index);
        result = resultJson.result;
        target.value = resultJson.val;
        var rangeYears = [],
          rangeMonths = [],
          rangeDates = [];
        rangeYears[index] = result.year;
        rangeMonths[index] = result.month;
        rangeDates[index] = result.day;
        rangeYears[1 - index] = resultAnother.year;
        rangeMonths[1 - index] = resultAnother.month;
        rangeDates[1 - index] = resultAnother.day;
        _this.dayObject.renderRange(rangeYears, rangeMonths, rangeDates, isBaseEnd, true);
      }
    },
    renderPickerSingle: function (target) {
      var _this = API.getPicker($(target));
      var val = target.value;
      var format = _this.config.format.split(' ')[0];
      var regText = format.replace(/YYYY/, '[0-9]{4}').replace(/(MM|DD)/g, '[0-9]{2}');
      var reg = new RegExp('^' + regText + '$');
      if (reg.test(val)) {
        var $time = _this.$container.find('.c-datePicker__input-time');
        var _moment = moment(API.newDateFixed(_this, val));
        var result = API.getTimeFormat(_moment);
        var resultJson = API.minMaxFill(_this, result, 0);
        result = resultJson.result;
        val = resultJson.val;
        target.value = val;
        if (_this.hasTime) {
          val += ' ' + $time.val();
        }
        _this.$input.val(val);
        _this.dayObject.renderSingle(result.year, result.month, result.day, true);
      }
    },
    cancelBlur: function (_this) {
      $.unsub('datapickerRenderPicker');
      _this.isBlur = false;
    }
  };

  function SingleDatePicker(datePickerObject) {
    this.datePickerObject = datePickerObject;
    this.datePickerObject.pickerObject = null;
    this.$input = datePickerObject.$target.find('input[type="text"]');
    this.config = datePickerObject.config;
    this.params = {};
    this.hasTime = this.config.format.split(' ').length > 1;
    if (this.hasTime) {
      this.timeMin = API.timeVal(this, 'min');
      this.timeMax = API.timeVal(this, 'max');
    }
    // this.init();
  }

  $.extend(SingleDatePicker.prototype, {
    init: function () {
      this.initShow();
      this.event();
    },
    initShow: function () {
      DATEPICKERAPI.initParams(this);
      this.params.isYear = this.params.format[0] && !this.params.format[1];
      this.params.isMonth = this.params.format[0] && this.params.format[1] && !this.params.format[2];
      var table = '';
      var inputVal = this.$input.val();
      var result = inputVal ? moment(API.newDateFixed(this, inputVal)) : moment();
      var dataFormat = API.getTimeFormat(result);
      var sidebar = '';
      var hasSidebar = '';
      var hasTime = '';
      if (this.params.format[3] || this.params.format[4] || this.params.format[5]) {
        hasTime = 'has-time';
      }
      if (this.config.hasShortcut) {
        hasSidebar = 'has-sidebar';
        sidebar = rederSidebar(this);
      }
      var renderTpl = DATEPICKERMAINTPL;
      if (this.params.isYear || this.params.isMonth) {
        renderTpl = renderTpl.replace(/{{footerButton}}/g, PICKERFOOTERCLEARBUTTON);
      } else {
        renderTpl = renderTpl.replace(/{{footerButton}}/g, PICKERFOOTERNOWBUTTON);
      }
      var $datePickerHtml = $(renderTpl.replace(/{{table}}/g, table).replace(/{{year}}/g, dataFormat.year).replace(/{{month}}/g, dataFormat.month).replace('{{sidebar}}', sidebar).replace('{{hasTime}}', hasTime).replace('{{hasSidebar}}', hasSidebar));
      $('body').append($datePickerHtml);
      this.$container = $datePickerHtml;
      this.$container.data('picker', this);
      if (!this.hasTime) {
        this.$container.find('.c-datepicker-date-picker__time-header').hide();
      }
      DATEPICKERAPI.initShowObject(this, dataFormat);
      var val = this.$input.val().split(' ');
      this.$container.find('.c-datePicker__input-day').val(val[0]);
      this.$container.find('.c-datePicker__input-time').val(val[1]);
    },
    event: function () {
      if (this.hasTime) {
        this.eventHasTime();
      }
      this.datePickerObject.$target.on('click', function (event) {
        event.stopPropagation();
      });
      this.$container.on('click', function (event) {
        event.stopPropagation();
      });
      this.$container.on('click', '.c-datepicker-date-picker__header-year', function (event) {
        event.stopPropagation();
        var _this = API.getPicker($(this));
        if (_this.isBlur) {
          DATEPICKERAPI.cancelBlur(_this);
        }
        if ($(this).hasClass('disabled')) {
          return;
        }
        var val = _this.$input.val();
        if (!val) {
          val = moment();
        } else {
          val = moment(API.newDateFixed(_this, val));
        }
        _this.yearObject.render(val.year());
      });
      this.$container.on('click', '.c-datepicker-date-picker__header-month', function (event) {
        event.stopPropagation();
        var _this = API.getPicker($(this));
        if (_this.isBlur) {
          DATEPICKERAPI.cancelBlur(_this);
        }
        if ($(this).hasClass('disabled')) {
          return;
        }
        var val = _this.$input.val();
        if (!val) {
          val = moment();
        } else {
          val = moment(API.newDateFixed(_this, val));
        }
        _this.monthObject.render(val.month() + 1);
      });
      this.$container.on('click', '.c-datepicker-date-picker__next-btn.month', function (event) {
        event.stopPropagation();
        var _this = API.getPicker($(this));
        renderYearMonth(_this, 'next', 'month');
      });
      this.$container.on('click', '.c-datepicker-date-picker__prev-btn.month', function (event) {
        event.stopPropagation();
        var _this = API.getPicker($(this));
        renderYearMonth(_this, 'prev', 'month');
      });
      this.$container.on('click', '.c-datepicker-date-picker__next-btn.year', function (event) {
        event.stopPropagation();
        var _this = API.getPicker($(this));
        if ($(this).hasClass('is-year')) {
          var newYear = Number(_this.$container.find('.c-datepicker-year-table td.available').first().find('.cell').text()) + 10;
          _this.yearObject.render(newYear);
        } else if ($(this).hasClass('is-month')) {
          var $year = _this.$container.find('.c-datepicker-date-picker__header-year span');
          $year.text(Number($year.text()) + 1);
          _this.monthObject.render();
        } else {
          renderYearMonth(_this, 'next', 'year');
        }
      });
      this.$container.on('click', '.c-datepicker-date-picker__prev-btn.year', function (event) {
        event.stopPropagation();
        var _this = API.getPicker($(this));
        if ($(this).hasClass('is-year')) {
          var newYear = Number(_this.$container.find('.c-datepicker-year-table td.available').first().find('.cell').text()) - 10;
          _this.yearObject.render(newYear);
        } else if ($(this).hasClass('is-month')) {
          var $year = _this.$container.find('.c-datepicker-date-picker__header-year span');
          $year.text(Number($year.text()) - 1);
          _this.monthObject.render();
        } else {
          renderYearMonth(_this, 'prev', 'year');
        }
      });

      function renderYearMonth(_this, dire, type) {
        if (_this.isBlur) {
          _this.dayObject.prevNextSingle(dire, type);
          $.unsub('datapickerRenderPicker');
          _this.isBlur = false;
        } else {
          _this.dayObject.prevNextSingle(dire, type);
        }
      }

      this.$container.on('click', '.c-datepicker-picker__btn-now', function () {
        var _this = API.getPicker($(this));
        setValue(_this, moment().format(_this.config.format));
        _this.datePickerObject.hide();
      });
      this.$container.on('click', '.c-datepicker-picker__btn-clear', function () {
        var _this = API.getPicker($(this));
        _this.clear();
      });
      this.$container.on('click', '.c-datepicker-picker__shortcut', function () {
        var _this = API.getPicker($(this));
        var day = $(this).data('value');
        var result = moment().add(day, 'day').format(_this.config.format);
        if (_this.hasTime) {
          var time = $(this).data('time');
          if (time) {
            result = result.split(' ')[0] + ' ' + time;
          }
        }
        setValue(_this, result);
        _this.datePickerObject.hide();
      });
      this.$container.on('click', '.c-datepicker-picker__link-btn.confirm', function () {
        var _this = API.getPicker($(this));
        if (!_this.$input.val()) {
          setValue(_this, moment().format(_this.config.format));
        }
        _this.datePickerObject.hide();
      });
    },
    eventHasTime: function () {
      this.$container.on('keyup', '.c-datePicker__input-time', function () {
        var _this = API.getPicker($(this));
        var isMatch = _this.timeObject.updateTimePanel();
        if (isMatch) {
          var time = this.value;
          var day = _this.$container.find('.c-datePicker__input-day').val();
          _this.$input.val(day + ' ' + time);
        }
      });
      this.$container.on('click', '.c-datePicker__input-time', function (event) {
        event.stopPropagation();
      });
      this.$container.on('keyup', '.c-datePicker__input-day', function () {
        DATEPICKERAPI.renderPickerSingle(this);
      });
      this.$container.on('blur', '.c-datePicker__input-day', function (event) {
        var _this = API.getPicker($(this));
        fillDay(_this, $(this));
        API.judgeTimeRange(_this, $(this), _this.$container.find('.c-datePicker__input-time'));
      });
      this.$container.on('blur', '.c-datePicker__input-time', function (event) {
        var _this = API.getPicker($(this));
        fillTime(_this, $(this));
        API.judgeTimeRange(_this, _this.$container.find('.c-datePicker__input-day'), $(this));
      });
      this.$container.on('focus', '.c-datePicker__input-time', function (event) {
        event.stopPropagation();
        var _this = API.getPicker($(this));
        if (!_this.$input.val() && !this.value) {
          var now = moment().format(_this.config.format);
          _this.$input.val(now);
          now = now.split(' ');
          _this.$container.find('.c-datePicker__input-day').val(now[0]);
          $(this).val(now[1]);
        }
        _this.activeTimeWrap = $(this).parents('.c-datepicker-date-picker__time-header');
        var val = this.value.split(':');
        _this.showTimeSelect(val[0], val[1], val[2]);
      });
      this.$container.on('focus', '.c-datePicker__input-day', function () {
        var _this = API.getPicker($(this));
        if (!_this.$input.val()) {
          var now = moment().format(_this.config.format).split(' ');
          $(this).val(now[0]);
          if (now.length > 1) {
            _this.$container.find('.c-datePicker__input-time').val(now[1]);
          }
        }
      });
    },
    clear: function () {
      this.$input.val('');
      this.$container.find('td.available').removeClass('current');
    },
    show: function () {
      if (this.params.format[2]) {
        var val = API.getRangeTimeFormat(this, this.$input);
        this.dayObject.render(val.year, val.month, val.day, true);
      }
      this.$container.show();
    },
    reRenderDay: function () {
      if (this.params.format[2]) {
        var result = API.getRangeTimeFormat(this, this.$input);
        var _val = this.$input.val() ? result.day : false;
        this.dayObject.render(result.year, result.month, _val, true);
      }
    },
    renderYear: function () {
      this.yearObject.render();
    },
    renderMonth: function () {
      this.monthObject.render();
    },
    showTimeSelect: function (year, month, day) {
      if (this.params.format[3] || this.params.format[4] || this.params.format[5]) {
        this.timeObject.render(this.params.format.slice(3), year, month, day);
      }
    }
  });

  function RangeDatePicker(datePickerObject) {
    this.datePickerObject = datePickerObject;
    this.datePickerObject.pickerObject = null;
    this.$input = datePickerObject.$target.find('input');
    this.$inputBegin = this.$input.eq(0);
    this.$inputEnd = this.$input.eq(1);
    this.config = datePickerObject.config;
    this.params = {};
    this.hasTime = this.config.format.split(' ').length > 1;
    if (this.hasTime) {
      this.timeMin = API.timeVal(this, 'min');
      this.timeMax = API.timeVal(this, 'max');
    }
    this.init();
  }

  $.extend(RangeDatePicker.prototype, {
    init: function () {
      this.initShow();
      this.event();
    },
    initShow: function () {
      DATEPICKERAPI.initParams(this);
      var table = '';
      var dataFormat = [];
      dataFormat[0] = API.getRangeTimeFormat(this, this.$input.eq(0));
      dataFormat[1] = API.getRangeTimeFormat(this, this.$input.eq(1));
      var sidebar = '';
      var hasSidebar = '';
      var hasTime = '';
      if (this.params.format[3] || this.params.format[4] || this.params.format[5]) {
        hasTime = 'has-time';
      }
      if (this.config.hasShortcut) {
        hasSidebar = 'has-sidebar';
        sidebar = rederSidebar(this);
      }
      var $datePickerHtml = $(RANGEPICKERMAINTPL.replace(/{{table}}/g, table).replace(/{{year}}/g, dataFormat[0].year).replace(/{{month}}/g, dataFormat[0].month).replace(/{{yearEnd}}/g, dataFormat[1].year).replace(/{{monthEnd}}/g, dataFormat[1].month).replace('{{sidebar}}', sidebar).replace('{{hasTime}}', hasTime).replace('{{hasSidebar}}', hasSidebar));
      $('body').append($datePickerHtml);
      this.$container = $datePickerHtml;
      this.$container.data('picker', this);
      if (!this.hasTime) {
        this.$container.find('.c-datepicker-date-range-picker__time-header').hide();
      }
      DATEPICKERAPI.initShowObject(this, dataFormat);
    },
    fillDefault: function () {
      var valBegin = this.$inputBegin.val().split(' ');
      var valEnd = this.$inputEnd.val().split(' ');
      var $day = this.$container.find('.c-datePicker__input-day');
      var $time = this.$container.find('.c-datePicker__input-time');
      if (valBegin) {
        $day.eq(0).val(valBegin[0]);
        $time.eq(0).val(valBegin[1]);
      }
      if (valEnd) {
        $day.eq(1).val(valEnd[0]);
        $time.eq(1).val(valEnd[1]);
      }
    },
    event: function () {
      if (this.hasTime) {
        this.eventHasTime();
      }
      this.$container.on('click', function (event) {
        event.stopPropagation();
      });
      this.datePickerObject.$target.on('click', function (event) {
        event.stopPropagation();
      });
      this.$container.on('click', '.c-datepicker-date-range-picker__next-btn.month', function () {
        var _this = API.getPicker($(this));
        renderYearMonth(_this, 'next', 'month');
      })
      this.$container.on('click', '.c-datepicker-date-range-picker__prev-btn.month', function () {
        var _this = API.getPicker($(this));
        renderYearMonth(_this, 'prev', 'month');
      })
      this.$container.on('click', '.c-datepicker-date-range-picker__next-btn.year', function () {
        var _this = API.getPicker($(this));
        renderYearMonth(_this, 'next', 'year');
      })
      this.$container.on('click', '.c-datepicker-date-range-picker__prev-btn.year', function () {
        var _this = API.getPicker($(this));
        renderYearMonth(_this, 'prev', 'year');
      })

      function renderYearMonth(_this, dire, type) {
        if (_this.isBlur) {
          $.sub('datapickerClick', function (e) {
            _this.dayObject.prevNextRender(dire, type);
            $.unsub('datapickerClick');
          });
          $.pub('datapickerRenderPicker');
        } else {
          _this.dayObject.prevNextRender(dire, type);
        }
      }

      this.$container.on('click', '.c-datepicker-picker__btn-clear', function () {
        var _this = API.getPicker($(this));
        _this.clear();
      })
      this.$container.on('click', '.c-datepicker-picker__shortcut', function () {
        var _this = API.getPicker($(this));
        var days = $(this).data('value').split(',');
        var begin = moment().add(days[0], 'day').format(_this.config.format);
        var end = moment().add(days[1], 'day').format(_this.config.format);
        if (_this.hasTime) {
          var times = $(this).data('time').split(',');
          if (times[0]) {
            begin = begin.split(' ')[0] + ' ' + times[0];
          }
          if (times[1]) {
            end = end.split(' ')[0] + ' ' + times[1];
          }
        }
        _this.$inputBegin.val(begin);
        _this.$inputEnd.val(end);
        _this.datePickerObject.hide();
      });
      this.$container.on('click', '.c-datepicker-picker__link-btn.confirm', function () {
        var _this = API.getPicker($(this));
        var $days = _this.$container.find('.c-datePicker__input-day');
        var $times = _this.$container.find('.c-datePicker__input-time');
        var start = $days.eq(0).val();
        var end = $days.eq(1).val();
        if (!start || !end) {
          _this.datePickerObject.hide();
          return;
        }
        if (_this.hasTime) {
          start += ' ' + $times.eq(0).val();
          end += ' ' + $times.eq(1).val();
        }
        _this.$inputBegin.val(start);
        _this.$inputEnd.val(end);
        _this.datePickerObject.hide();
      });
    },
    eventHasTime: function () {
      this.$container.on('keyup', '.c-datePicker__input-time', function () {
        var _this = API.getPicker($(this));
        _this.timeObject.updateTimePanel();
      })
      this.$container.on('keyup', '.c-datePicker__input-day', function () {
        DATEPICKERAPI.renderPicker(this);
      });
      this.$container.on('click', '.c-datePicker__input-time', function (event) {
        event.stopPropagation();
      });
      this.$container.on('focus', '.c-datePicker__input-time', function (event) {
        event.stopPropagation();
        var _this = API.getPicker($(this));
        if (!_this.$input.val() && !this.value) {
          var now = moment().format(_this.config.format);
          now = now.split(' ');
          _this.$container.find('.c-datePicker__input-day').val(now[0]);
          _this.$container.find('.c-datePicker__input-time').val(now[1]);
        }
        _this.activeTimeWrap = $(this).parents('.c-datepicker-date-range-picker__time-content');
        _this.showTimeSelect();
        $(this).trigger('keyup');
      });
      this.$container.on('focus', '.c-datePicker__input-day,.c-datePicker__input-time', function () {
        var _this = API.getPicker($(this));
        var $day = _this.$container.find('.c-datePicker__input-day');
        if (!$(this).val()) {
          var now = moment().format(_this.config.format).split(' ');
          $day.val(now[0]);
          if (now.length > 1) {
            _this.$container.find('.c-datePicker__input-time').val(now[1]);
          }
        }
      });
      this.$container.on('blur', '.c-datePicker__input-day', function (event) {
        var _this = API.getPicker($(this));
        var index = _this.$container.find('.c-datePicker__input-day').index($(this));
        fillDay(_this, $(this));
        API.judgeTimeRange(_this, $(this), _this.$container.find('.c-datePicker__input-time').eq(index), index);
      });
      this.$container.on('blur', '.c-datePicker__input-time', function (event) {
        var _this = API.getPicker($(this));
        var index = _this.$container.find('.c-datePicker__input-time').index($(this));
        fillTime(_this, $(this));
        API.judgeTimeRange(_this, _this.$container.find('.c-datePicker__input-day').eq(index), $(this), index);
      });
    },
    show: function () {
      this.fillDefault();
      var dataFormat = [];
      dataFormat[0] = API.getRangeTimeFormat(this, this.$input.eq(0));
      dataFormat[1] = API.getRangeTimeFormat(this, this.$input.eq(1));
      var yearArr = [dataFormat[0].year, dataFormat[1].year];
      var monthArr = [dataFormat[0].month, dataFormat[1].month];
      var dayArr = [dataFormat[0].day, dataFormat[1].day];
      if (this.params.format[2]) {
        this.dayObject.render(yearArr, monthArr, dayArr, false, true);
      }
      this.$container.show();
    },
    clear: function () {
      this.$inputBegin.val('');
      this.$inputEnd.val('');
      this.$container.find('.c-datePicker__input-day,.c-datePicker__input-time').val('');
      this.$container.find('td.available').removeClass('current in-range');
    },
    renderYear: function () {
      this.yearObject.render();
    },
    renderMonth: function () {
      this.monthObject.render();
    },
    showTimeSelect: function () {
      if (this.params.format[3] || this.params.format[4] || this.params.format[5]) {
        this.timeObject.render(this.params.format.slice(3));
      }
    }
  });

  function DatePicker(options, ele) {
    this.$target = ele;
    this.config = $.extend({}, defaultOptions, options);
    this.params = {};
    this.init();
  }

  $.extend(DatePicker.prototype, {
    init: function () {
      if (!this.config.isRange) {
        this.pickerObject = new SingleDatePicker(this);
      } else {
        this.pickerObject = new RangeDatePicker(this);
      }
      this.pickerObject.$input.data('datepicker', this);
      this.event();
    },
    event: function () {
      var that = this,
        $target = that.$target,
        bindFun = function(){
          that.pickerObject.$input.on('focus', function () {
            var _this = $(this).data('datepicker');
            _this.initInputVal = this.value;
          });
          that.pickerObject.$container.on('click', function () {
            var _this = $(this).data('picker');
            if (_this.isBlur) {
              $.unsub('datapickerClick');
              $.pub('datapickerRenderPicker');
              _this.isBlur = false;
            }
          });
          that.pickerObject.$input.on('blur', function () {
            if (!this.value) {
              return;
            }
            var _this = $(this).data('datepicker');
            var index = _this.pickerObject.$input.index($(this));
            var valArr = this.value.split(' ');
            var day = valArr[0];
            var $container = _this.pickerObject.$container;
            if (_this.pickerObject.hasTime) {
              var dayReg = API.dayReg(_this.pickerObject);
              var time = valArr[1] ? API.timeCheck(valArr[1]) : false;
              var $time = $container.find('.c-datePicker__input-time');
              var $day = $container.find('.c-datePicker__input-day');
              var timeResult = time && time.match(API.timeReg(_this));
              var dayResult = day.match(dayReg);
              if (!time || !timeResult || !dayResult) {
                day = _this.initInputVal.split(' ')[0];
                time = _this.initInputVal.split(' ')[1];
                this.value = _this.initInputVal;
              } else {
                if (dayResult) {
                  dayResult = API.fixedFill(dayResult);
                  day = dayResult[1] + _this.pickerObject.splitStr + API.fillTime(dayResult[3]) + _this.pickerObject.splitStr + API.fillTime(dayResult[5])
                }
                if (timeResult) {
                  time = timeResult[5] ? timeResult[1] + ':' + API.fillTime(timeResult[3]) + ':' + API.fillTime(timeResult[5]) : timeResult[1] + ':' + API.fillTime(timeResult[3]);
                }
                this.value = day + ' ' + time;
              }
              $time.eq(index).val(time);
              $day.eq(index).val(day);
              _this.pickerObject.isBlur = true;
              $.sub('datapickerRenderPicker', function () {
                DATEPICKERAPI.renderPicker($day.eq(index)[0], true);
                _this.pickerObject.isBlur = false;
                $.pub('datapickerClick');
                $.unsub('datapickerRenderPicker');
              });
            } else {
              if (_this.pickerObject.params.isMonth) {
                var _moment = moment(API.newDateFixed(_this.pickerObject, day + _this.pickerObject.splitStr + '01'));
                var result = API.getTimeFormat(_moment);
                var resultJson = API.minMaxFill(_this.pickerObject, result, 0, 'month');
                val = resultJson.val;
                $(this).val(val);
              } else if (_this.pickerObject.params.isYear) {
                if (_this.config.min && day < _this.config.min) {
                  day = _this.config.min;
                }
                if (_this.config.max && day > _this.config.max) {
                  day = _this.config.max;
                }
                $(this).val(day);
              } else {
                var dayReg = API.dayReg(_this.pickerObject);
                var dayResult = day.match(dayReg);
                if (!dayResult) {
                  this.value = _this.initInputVal;
                } else {
                  dayResult = API.fixedFill(dayResult);
                  day = dayResult[1] + _this.pickerObject.splitStr + API.fillTime(dayResult[3]) + _this.pickerObject.splitStr + API.fillTime(dayResult[5]);
                  this.value = day;
                }
              }
            }
          });
        };
      that.pickerObject.$input.on('click', function () {
        if(!$target.data('loadDatepicker')){
          that.pickerObject.init();
          bindFun();
          $target.data('loadDatepicker', 1);
        }
        $(this).data('datepicker').show();
      });

    },
    show: function () {
      setContainerPos(this);
      $('.c-datepicker-picker').hide();
      this.pickerObject.show();
      this.config.show.call(this.pickerObject);
    },
    hide: function () {
      this.pickerObject.$container.find('.td.available').removeClass('current in-range');
      this.pickerObject.$container.find('.c-datepicker-time-panel').hide();
      this.pickerObject.$container.hide();
      this.betweenHandle();
      this.config.hide.call(this.pickerObject);
    },
    betweenHandle: function () {
      var _config = this.config;
      if (!_config.isRange || !_config.between) {
        return false;
      }
      var start = this.pickerObject.$inputBegin.val();
      var end = this.pickerObject.$inputEnd.val();
      if (!start || !end) {
        return false;
      }
      var beginMoment = moment(API.newDateFixed(this.pickerObject, start));
      var endMoment = moment(API.newDateFixed(this.pickerObject, end));
      var beginFormat = API.getTimeFormat(beginMoment);
      var endFormat = API.getTimeFormat(endMoment);
      if (_config.between === 'month') {
        if (beginFormat.year !== endFormat.year || beginFormat.month !== endFormat.month) {
          var val = beginMoment.set({
            'year': endFormat.year,
            'month': endFormat.month - 1,
            'date': 1
          }).format(_config.format);
          this.pickerObject.$inputBegin.val(val);
        }
        return;
      }
      if (_config.between === 'year') {
        if (beginFormat.year !== endFormat.year) {
          var val = beginMoment.set({
            'year': endFormat.year,
            'month': 0,
            'date': 1
          }).format(_config.format);
          this.pickerObject.$inputBegin.val(val);
        }
        return;
      }
      if (Number.isInteger(Number(_config.between))) {
        var endRangeMoment = endMoment.add(-Number(_config.between), 'day');
        if (endRangeMoment.isAfter(beginMoment)) {
          var val = endRangeMoment.format(_config.format);
          this.pickerObject.$inputBegin.val(val);
        }
      }
    }
  });

  function setContainerPos(_this) {
    var offset = _this.$target.offset();
    var height = _this.$target.outerHeight();
    _this.pickerObject.$container.css({
      top: offset.top + height,
      left: offset.left
    });
  }

  function fillTime(_this, $time) {
    var time = $time.val();
    var timeResult = time && time.match(API.timeReg(_this));
    if (!time || !timeResult) {
      return;
    } else {
      if (timeResult) {
        time = _this.config.format.split(' ')[1].replace(/HH/, timeResult[1]).replace(/mm/, API.fillTime(timeResult[3])).replace(/ss/, API.fillTime(timeResult[5]))
        $time.val(time);
        if (!_this.config.isRange) {
          $time.trigger('keyup');
        }
      }
    }
  }

  function fillDay(_this, $day) {
    var day = $day.val();
    var reg = API.dayReg(_this);
    var dayResult = day.match(reg);
    if (!day || !dayResult) {
      return;
    } else {
      if (dayResult) {
        dayResult = API.fixedFill(dayResult);
        day = dayResult[1] + _this.splitStr + API.fillTime(dayResult[3]) + _this.splitStr + API.fillTime(dayResult[5]);
        $day.val(day);
        if (!_this.config.isRange) {
          $day.trigger('keyup');
        }
      }
    }
  }

  function rederSidebar(_this) {
    var html = '';
    var options = _this.config.shortcutOptions;
    for (var i = 0; i < options.length; i++) {
      var time = options[i].time || '';
      html += SIDEBARBUTTON.replace('{{name}}', options[i].name).replace('{{day}}', options[i].day).replace('{{time}}', time);
    }
    return SIDEBARTPL.replace('{{button}}', html);
  }

  function setValue(_this, date) {
    _this.$container.find('.c-datepicker-date-table td.current').removeClass('current');
    var timeArr = date.split(' ');
    _this.$input.val(date);
    _this.$container.find('.c-datePicker__input-day').val(timeArr[0]);
    if (timeArr.length > 1) {
      _this.$container.find('.c-datePicker__input-time').val(timeArr[1]);
    }
  }

  $.fn.datePicker = function (options) {
    return this.each(function () {
      new DatePicker(options, $(this));
    });
  };
}(jQuery));

$(function(){
  $('[data-toggle]').each(function(i, dom){
    dom = $(dom);
    var domDate = dom.data();
    switch(domDate.toggle){
      case 'tooltip':
        dom.tooltip({
          'container':'body',
          'delay':100
        });
        break;
      case 'popover':
        dom.popover({
          'container':'body',
          'delay':100
        });
        break;
      case 'customScroll':
        if (!dom.data('cscroll')) {
          var j = {
            axis : domDate.axis,
            scrollbarPosition : domDate.position,
            theme : domDate.theme,
            scrollButtons: {
              enable: !!(domDate.scrollbtn * 1)
            }
          };
          domDate.height && (j.setHeight = domDate.height);
          var j_ = {
            axis:"x",
            scrollEasing: "none",
            scrollInertia: 150,
            scrollbarPosition: 'outside',
            theme: "dark-3",
            autoHideScrollbar: false,
            mouseWheel: {preventDefault: true},
            scrollButtons: {
              enable: true
            }
          };
          j_ = $.extend(j_, j);
          dom.mCustomScrollbar(j_);
          dom.data('cscroll', 1);
        } else {
          dom.mCustomScrollbar("update");
        }
        break;
      case 'datePicker':
        (function(){
          var j_ = {
                hasShortcut: false
              },
              j = {};
          domDate.dateMax && (j.max = domDate.dateMax + '');
          domDate.dateMin && (j.min = domDate.dateMin + '');
          domDate.dateType && (j.format = domDate.dateType);
          domDate.dateIsrange && (j.isRange = !!domDate.dateIsrange);
          dom.datePicker($.extend(true, j_, j));
        }());
        break;
    }
  });
});
