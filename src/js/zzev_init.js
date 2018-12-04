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
          var j_ = {
            axis:"yx",
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
      case 'selectDate':
        dom.datePicker({
          hasShortcut: true,
          format:'YYYY-MM-DD',
          shortcutOptions: [{
            name: '今天',
            day: '0'
          }, {
            name: '昨天',
            day: '-1'
          }, {
            name: '一周前',
            day: '-7'
          }]
        });
        break;
    }
  });
});
