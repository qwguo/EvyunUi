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
