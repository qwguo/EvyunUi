// Popup
(function (window, $) {
  var Popup = function (j_) {
    var that = this,
      jd = {
        addTarget: $('body'),
        type: 1,
        className: "",
        shade: {bgColor: '#000000', opacity: 0.5, close: false},
        size: {full: 0, width: 'auto', height: 'auto'},
        position: {fixed: 1, pos: 'm-c'},
        animate: 'zoomIn',
        autoClose: 0,
        move: 0,
        head: '默认标题',
        opBtn: {close: 1, min: 1, max: 1},
        con: {
          text: "提示信息",
          icon: 1,
          src: null,
          html: "<p>这是html代码</p>",
          btn: null
        }
      };
    that.j = $.extend(true, {}, jd, j_);
    that.createDom();
  };
  Popup.prototype = {
    constructor: Popup,
    numbers: 0,
    alertType: ['alert', 'layer', 'iframe', 'loading', 'taps', 'tab'],
    alertIcon: ['<i class="evicon evicon-right-1 text-success"></i>', '<i class="evicon evicon-close-2 text-warning"></i>', '<i class="evicon evicon-point-2 text-info"></i>', '<i class="evicon load-wait"></i>'],
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
    maxZindex: function () {
      var arr = [];
      $('*').each(function (i, dom) {
        dom = $(dom);
        var z = dom.css('z-index');
        !isNaN(z) && arr.push(z * 1);
      });
      return Math.max(Math.max.apply(null, arr), 1000);
    },
    createDom: function () {
      var that = this,
        j = that.j,
        popupHArray = [],
        popupOpArray = [],
        popupBArray = [];
      that.numbers = Popup.prototype.numbers++;
      that.zIndex = that.maxZindex() + 1;
      //添加遮罩
      if (j.shade) {
        (function () {
          var style = ['z-index:' + (that.zIndex++)];
          switch (true) {
            case !!j.shade.bgColor:
              style.push(' background-color:' + j.shade.bgColor);
              break;
            case !!j.shade.opacity:
              style.push(' opacity:' + j.shade.opacity);
              break;
          }
          that.popupShade = $("<div/>", {
            "class": "popup-shade",
            "id": "popupShade_" + that.numbers,
            "data-index": that.numbers,
            "style": style.join(';')
          }).appendTo(j.addTarget);
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
            j.con.text && popupBArray.push(j.con.text);
            popupBArray.push('</div></div>');
            if (j.con.btn) {
              popupBArray.push('<div class="popup-but-area"><span class="popup-but">');
              $.each(j.con.btn, function (i, v) {
                popupBArray.push('<a href="javascript:;" class="btn btn-sm ' + v.className + '">' + v.text + '</a>');
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
            popupBArray.push('<iframe src="' + j.con.src + '" frameborder="0" scrolling="no" allowTransparency="true" name="popupIframe_' + that.numbers + '" id="popupIframe_' + that.numbers + '"></iframe>');
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
          "class": 'popup popup-' + that.alertType[j.type - 1] + (j.className ? (' ' + j.className) : '') + (j.animate ? (' ' + j.animate) : ''),
          "style": style.join(';'),
          "data-index": that.numbers,
          "id": 'popup_' + that.numbers,
          html: popupOpArray.join('') + popupHArray.join('') + popupBArray.join('')
        });
        j.animate && that.popup.attr('data-animated', j.animate);
        that.popup.appendTo(j.addTarget);
        that.popupCountWH();
        that.popupOffset();
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
            }
          }
        }, '*');
        if(j.size.full && j.opBtn && j.opBtn.max){
          that.popupMax();
        }
      }());
    },
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
    popupCountWH: function () {
      var that = this,
        j = that.j;
      switch (j.type) {
        case 3:
          (function () {
            var iframes = that.popup.find('iframe');
            iframes.on('load.resize', function () {
              iframes.siblings('.popup-loading-wait').remove();
              iframes[0].contentWindow.iframeNumber = that.numbers;
              iframes[0].contentWindow.popup = that;
              console.log(iframes[0].contentWindow.popup);
              if (j.size.width === 'auto') {
                iframes.css({
                  "width": iframes.contents().width() + "px"
                });
              }
              if (j.size.height === 'auto') {
                iframes.css({
                  "height": iframes.contents().height() + "px"
                });
              }
              that.popupOffset();
            });
          }());
          break;
      }
    },
    popupMin: function () {
      var that = this,
        j = that.j;
      !that.originStyle && (that.originStyle = that.popup.attr('style'));
      var zIndex = that.popup.css('z-index'),
        newStyle = 'bottom: 0; left:' + (j.addTarget.find('.popup-size-min').length * (200 + 10)) + 'px; margin: 0; z-index:' + zIndex + ';';
      that.popup.addClass('popup-size-min').removeClass('popup-size-max').attr({'style': newStyle});
      that.popupShade && that.popupShade.hide();
    },
    popupMax: function () {
      var that = this;
      !that.originStyle && (that.originStyle = that.popup.attr('style'));
      var zIndex = that.popup.css('z-index'),
        newStyle = 'z-index:' + zIndex + ';';
      that.popup.addClass('popup-size-max').removeClass('popup-size-min').attr({'style': newStyle});
      that.popupShade && that.popupShade.show();
    },
    popupOrig: function () {
      var that = this,
          j = that.j;
      that.popup.removeClass('popup-size-max popup-size-min').attr({'style': that.originStyle});
      that.popupShade && that.popupShade.show();
      if(j.size.full && j.opBtn && j.opBtn.max){
        that.popupOffset();
      }
    },
    popupClose: function () {
      var that = this;
      that.popup.remove();
      that.popupShade && that.popupShade.remove();
    }
  };
  $.popup = function (j) {
    return new Popup(j);
  };
  $.popupAlert = function(j){
    var j_ = {
      type: 1,
      position: {pos: 'm-c'},
      opBtn: {close: 1, min: 0, max: 0},
      size: {width: 300},
      con: {
        text: "提示信息",
        icon: 1,
        btn:[{text:'确定', className:'btn-primary'}]
      }
    };
    return new Popup($.extend(true, {}, j_, j))
  }
})(window, jQuery);

$(function () {
  $(document).on('click.popup', '[data-toggle="popup"]', function (ev) {
    var $this = $(this),
      curData = $this.data();
    /*$.popup({
      addTarget: window.top.$('body'),
      shade:true,
      size: {w: curData.popupWidth, h: curData.popupHeight},
      head: false,
      animate: curData.popupAnimate,
      con: {text:'这是提示文字', icon: 4}
    });*/
    /*var a = $.popup({
      addTarget: window.top.$('body'),
      type: 3,
      size:{full:1},
      head: '这是标题',
      animate: curData.popupAnimate,
      con: {
        // html: '<h2>这是内容</h2>'
        src: '/docs/tool/scroll.html',
        icon: 1
      }
    });*/
    var b = $.popupAlert();
    /*setTimeout(function(){
      a.popupClose();
    }, 2000);*/

  });
});
