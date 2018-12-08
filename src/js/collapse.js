/*Fold*/
+function ($) {
  var Fold = function (element) {
    this.element = $(element);
  };
  Fold.prototype.switchFun = function () {
    var $this = this.element,
      domDate = $this.date(),
      $panel = $this.closest('.panel'),
      $foldPanel = $panel.closest('.fold-panel'),
      $openType = $foldPanel.data('opentype'),
      $showtype = $foldPanel.data('showtype'),
      showFun = function (panel, action) {
        $openType = panel.data('opentype') || $openType;
        var $panelBody = panel.children('.panel-body');
        panel.data('clicked', 1);
        if ($openType) {
          var open = action == 'open' ? ['In', 'Down'] : ['Out', 'Up'];
          $panelBody[$openType + ($openType == 'fade' ? open[0] : open[1])](400, function () {
            action == 'open' ? panel.addClass('panel-open') : panel.removeClass('panel-open');
            $panelBody.css('display', '');
            panel.removeData('clicked');
          });
        } else {
          action == 'open' ? panel.addClass('panel-open') : panel.removeClass('panel-open');
          panel.removeData('clicked');
          $panelBody.css('display', '');
        }
      };
    if (!$panel.hasClass('panel-open') && !$panel.data('clicked')) {
      showFun($panel, 'open');
    } else {
      showFun($panel, 'close');
    }
    if ($showtype == 'onefold') {
      $panel.siblings('.panel.panel-open').each(function (i, dom) {
        showFun($(dom), 'close');
      });
    }
  };
  // Fold PLUGIN DEFINITION
  // =====================

  function Plugin() {
    return this.each(function () {
      var $this = $(this),
        data = $this.data('collapse');
      if (!data) {
        $this.data('collapse', (data = new Fold(this)))
      }
      data.switchFun();
    });
  }

  // Fold DATA-API
  // ============
  var clickHandler = function (e) {
    e.preventDefault();
    Plugin.call($(this));
  };
  $(document).on('click.fold', '[data-toggle="collapse"]', clickHandler)
}(jQuery);
