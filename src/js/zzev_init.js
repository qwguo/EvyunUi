$(function(){
  $('[data-toggle]').each(function(i, dom){
    dom = $(dom);
    var toggle = dom.attr('data-toggle');
    switch(toggle){
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
          var j = {};
          var j_ = {
            axis:"yx",
            scrollInertia: 150,
            scrollbarPosition: 'outside',
            theme: "dark-3",
            autoHideScrollbar: false,
            mouseWheel: {preventDefault: true},
            scrollButtons: {
              enable: false
            }
          };
          if (j) {
            j_ = $.extend(j_, j);
          }
          dom.mCustomScrollbar(j_);
          dom.data('cscroll', 1);
        } else {
          dom.mCustomScrollbar("update");
        }
        break;
    }
  });
});
