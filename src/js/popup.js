var ppppp = null;
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
  };
  Popup.prototype = {
    constructor: Popup,
    numbers: 0,
    allPopupList: null,
    alertType: ['alert', 'html', 'iframe', 'loading', 'taps', 'tab'],
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
      that.numbers = Popup.prototype.numbers++;
      that.maxZindex();
      that.zIndex = that.maxZindex() + 1;
      //这里创建来源对象
      that.winObject = {
        originWindow: window,
        originDocument: window.document,
        parWindow: window.parent,
        parDocument: window.parent.document,
        topWindow:window.top,
        topDocument: window.top.document
      };
      //添加遮罩
      if (j.shade) {
        (function () {
          var style = ['z-index:' + (that.zIndex++)];
          !!j.shade.bgColor && style.push(' background-color:' + j.shade.bgColor);
          !isNaN(j.shade.opacity) && (typeof(j.shade.opacity) === 'string' || typeof(j.shade.opacity) === 'number') && style.push(' opacity:' + j.shade.opacity);
          that.popupShade = $("<div/>", {
            "class": "popup-shade",
            "id": "popupShade_" + that.numbers,
            "data-index": that.numbers,
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
                popupBArray.push('<a href="javascript:;" data-btn-index="' + i + '" data-action="btn" class="btn btn-sm ' + v.className + '">' + v.text + '</a>');
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
            popupBArray.push('<iframe src="' + j.con.src + '" frameborder="0" allowTransparency="true" name="popup_' + that.numbers + '" id="popupIframe_' + that.numbers + '"></iframe>');
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
          "data-index": that.numbers,
          "id": 'popup_' + that.numbers,
          html: popupOpArray.join('') + popupHArray.join('') + popupBArray.join('')
        });
        j.animate && j.animate.length && that.popup.attr('data-animated', j.animate);
        that.popup.appendTo(j.addTarget);
        that.popupCountWH();
        that.popupOffset();
        // that.popupDrag();
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
                j.con.btn && j.con.btn[targetDom.data('btnIndex')]['callBack'] && j.con.btn[targetDom.data('btnIndex')]['callBack']();
                if(!j.con.btn[targetDom.data('btnIndex')]['noClose']){
                  that.popupClose();
                }
                break;
            }
          }
        }, '.popup-option .evicon,.popup-but .btn');
        if(j.size.full && j.opBtn && j.opBtn.max){
          that.popupMax();
        }
      }());
      if(!isNaN(j.autoClose) && (typeof(j.autoClose) === 'string' || typeof(j.autoClose) === 'number')){
        setTimeout(function(){
          that.popupClose();
        }, j.autoClose * 1000);
      }
      /*Popup.prototype.allPopupList = Popup.prototype.allPopupList || {};
      Popup.prototype.allPopupList['popup_'+Popup.prototype.numbers] = that;*/
      var evPopup = that.winObject.topWindow.evPopup,
          tag = true;
      evPopup && $.each(evPopup, function(i, v){
        if(v){
          tag = null;
          return false;
        }
      });
      tag && (evPopup = that.winObject.topWindow.evPopup = []);
      that.topWindowIndex = evPopup.length;
      evPopup[evPopup.length] = that;
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
              iframes[0].contentWindow.iframeNumber = that.numbers;
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
            w = (w === 'auto' ? that.popup.width() : w);
            h = (h === 'auto' ? that.popup.height() : h);
            w = (w > winAttr.winW) ? (winAttr.winW - 10) : w;
            h = (h > winAttr.winH) ? (winAttr.winH - 10) : h;
            that.popup.css({width: w + 'px', height: h + 'px'});
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
    // 关闭弹窗
    popupClose: function () {
      var that = this,
        j = that.j;
      j.animate && j.animate.length && that.popup.removeClass(j.animate[0]).addClass(j.animate[1]);
      setTimeout(function(){
        typeof(j.closeCallBack) === 'function' && j.closeCallBack();
        that.popup.remove();
        that.popupShade && that.popupShade.remove();
        // that.popup = null;
        that.winObject.topWindow.evPopup[that.topWindowIndex] = null;
        that = null;
      },210);
    }/*,
    popupCloseAll: function(){
      var that = this;
      if(that.allPopupList){
        $.each(that.allPopupList, function(i, v){
          console.log(v);
          v.popupClose();
        });
      }
    }*/,
    popupDrag: function(){
      var that = this,
          j = that.j;
      if(j.head){
        that.popup.drag({
          parent:'parent', //定义拖动不能超出的外框,拖动范围
          randomPosition:false, //初始化随机位置
          direction:'all', //方向
          handler:'.popup-head' //拖动进行中 x,y为当前坐标
        });
      }
    }
  };
  $.popup = function (j) {
    return new Popup(j);
  };
  //alert
  $.popupAlert = function(j){
    var j_ = {
      type: 1,
      position: {pos: 'm-c'},
      opBtn: {close: 1, min: 0, max: 0},
      size: {width: 300},
      con: {
        html: "提示信息",
        icon: 3,
        btn:{'btn1':{text:'确定', className:'btn-primary'}}
      }
    };
    switch(true){
      case $.isArray(j):
        j = {
          head: j[0],
          con:{
            html: j[1],
            btn:{'btn1':{callBack: j[2]}}
          }
        };
      break;
      case $.isPlainObject(j):
          j.type = 1;
      break;
    }
    return new Popup($.extend(true, {}, j_, j));
  };
  //Point
  $.popupPoint = function(j){
    var j_ = {
      type: 1,
      head: false,
      shade:{close:0},
      position: {pos: 'm-c'},
      opBtn: false,
      con: {
        html: "提示信息",
        icon: 1,
        btn: false
      },
      autoClose: 1
    };
    if($.isArray(j)){
      j = {
        con:{
          html: j[0],
          icon: j[1]
        },
        autoClose: j[2],
        closeCallBack: j[3]
      }
    }
    return new Popup($.extend(true, {}, j_, j));
  };
  //confirm
  $.popupConfirm = function(j){
    var j_ = {
      type: 1,
      position: {pos: 'm-c'},
      opBtn: {close: 1, min: 0, max: 0},
      size: {width: 300},
      con: {
        html: "提示信息",
        icon: 3,
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
          html: j[1],
          btn:{
            'btn1':{callBack: j[2]},
            'btn2':{callBack: j[3]}
          }
        }
      }
    }
    return new Popup($.extend(true, {}, j_, j))
  };
  // Prompt
  $.popupPrompt = function(j){
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
  $.popupHtml = function(j){
    var j_ = {
      type: 2,
      head: "HTML层",
      position: {pos: 'm-c'},
      opBtn: {close: 1, min: 0, max: 1},
      con: {
        html: '<p>这是html代码</p>'
      }
    };
    var win = $(window),
      getHtml = function(str){
        if(str instanceof jQuery){
          str = str.html()
        }else{
          if(typeof(str) === 'string') {
            if($.inArray(str.substr(0, 1), ['.', '#']) != -1){
              if($(str).length){
                str = $(str).html();
              }
            }
          }
        }
        return str;
      };
    switch(true){
      case $.isArray(j):
        j = {
          head: j[0],
          con:{
            html: getHtml(j[1])
          },
          size:{
            width: (function(){
              var w = 'auto';
              if(j[2]){
                w = (j[2] > win.width()) ? (win.width() - 20) : j[2];
              }
              return w;
            }()), height: (function(){
              var h = 'auto';
              if(j[3]){
                h = (j[3] > win.width()) ? (win.width() - 20) : j[3];
              }
              return h;
            }())
          },
          closeCallBack: j[4]
        };
      break;
      case $.isPlainObject(j):
          j.type = 2;
          j.con.html = getHtml(j.con.html);
      break;
    }
    return new Popup($.extend(true, {}, j_, j));
  };
  //Iframe
  $.popupIframe = function(j){
    var j_ = {
      type: 3,
      position: {pos: 'm-c'},
      opBtn: {close: 1, max: 0, min: 0},
      con: {
        src: 'http://www.evyun.cn'
      }
    },
    win = $(window);
    if($.isArray(j)){
      j = {
        head: j[0],
        con:{
          src: j[1]
        },
        size:{
          width: (function(){
            var w = 'auto';
            if(j[2]){
              w = (j[2] > win.width()) ? (win.width() - 20) : j[2];
            }
            return w;
          }()), height: (function(){
            var h = 'auto';
            if(j[3]){
              h = (j[3] > win.width()) ? (win.width() - 20) : j[3];
            }
            return h;
          }())
        },
        closeCallBack: j[4]
      }
    }
    return new Popup($.extend(true, {}, j_, j))
  };
  //Loading
  $.popupLoading = function (j) {
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
    if($.isArray(j)){
      j = {
        con: {
          icon: j[0]
        },
        autoClose: j[1],
        closeCallBack: j[2] || null
      }
    }
    return new Popup($.extend(true, {}, j_, j));
  };
})(window, jQuery);
(function () {
  $(document).on('click.popup', '[data-toggle="popup"]', function (ev) {
    var $this = $(this),
        domDate = $this.data();
    switch(domDate.popupType){
      case 'alert':
        $.popupAlert([domDate.popupHead, domDate.popupHint]);
        break;
      case 'point':
        $.popupPoint([domDate.popupHint, domDate.popupIcontype, domDate.popupClosetiem]);
        break;
      case 'html':
        $.popupHtml([domDate.popupHead, domDate.popupTarget, domDate.popupWidth, domDate.popupHeight]);
        break;
      case 'loading':
        $.popupLoading([domDate.popupIcontype, domDate.popupClosetiem]);
        break;
      case 'iframe':
        $.popupIframe([domDate.popupHead, domDate.popupSrc, domDate.popupWidth, domDate.popupHeight]);
        break;
    }
  });
}());
