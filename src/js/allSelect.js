/**
 @Name：EvyunUi.allSelect 全选组件
 @Author：qwguo
 @github：https://github.com/qwguo/
 @Date: 2018/12/18
 */

/**
 * user HTML Element add attribute
 * data-toggle="allSelect"    表示这个元素是全选元素，内部有要全选的对象
 * data-all-name="value"      表示元素内，用来单击全选的元素 input checkbox元素
 * data-target-name="hobby_1" 表示要选中或者取消选中的目标元素 input checkbox元素
 * */
(function ($) {
  $(function () {
    $(document).on('click.allSelect', '[data-toggle="allSelect"]', function (ev) {
      var $this = $(this),
        clickTarget = $(ev.target);
      if (clickTarget[0].tagName.toLowerCase() === 'input' && clickTarget.attr('type') === 'checkbox') {
        var $thisDate = $this.data(),
          allName = $thisDate.allName,
          targetName = $thisDate.targetName,
          curName = clickTarget.attr('name');
        if (curName && (curName === targetName || curName === allName)) {
          var flag = clickTarget.prop('checked'),
            flag_ = true;
          if (curName === allName) {
            $this.find('input[type="checkbox"][name="' + targetName + '"]').prop('checked', flag)
          } else {
            $this.find('input[type="checkbox"][name="' + targetName + '"]').each(function (i, dom) {
              !$(dom).prop('checked') && (flag_ = false);
            });
            $this.find('input[type="checkbox"][name="' + allName + '"]').prop('checked', flag_);

          }
        }
      }
    });
  });
})(jQuery);
