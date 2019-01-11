/**
 @Name：EvyunUi.numberLimit 输入框字数限制组件
 @Author：qwguo
 @github：https://github.com/qwguo/
 @Date: 2019/1/10
 */

/**
 * user HTML Element add attribute
 * data-toggle="numberLimit"    表示这个元素是全选元素，内部有要全选的对象
 * data-max="30"      表示最大可输入个数
 * data-min="0"       表示最小个数
 * */
(function ($) {
  var curDom = null,
    curDomData = null,
    inputDom = null,
    valLength = null,
    changeFun = function(){
      if (valLength <= curDomData.max * 1) {
        curDom.find('.number-limit b').eq(0).text(valLength);
      }
    };
  $(document).on({
    'keydown.numberLimit': function (event) {
      curDom = $(this);
      curDomData = curDom.data();
      inputDom = curDom.find('input').length ? curDom.find('input').eq(0) : curDom.find('textarea').eq(0);
      valLength = inputDom.val().length;
      changeFun();
      if(!event.ctrlKey){
        if (valLength >= curDomData.max * 1 && event.keyCode !== 8 && event.keyCode !== 116) {
          return false;
        }
      }
    },
    'keyup.numberLimit': function () {
      var upVal = inputDom.val(),
        upValLength = upVal.length;
        (upValLength >= curDomData.max) && inputDom.val(upVal.substring(0, curDomData.max));
        valLength = inputDom.val().length;
      changeFun();
    }
  }, '[data-toggle="numberLimit"]');
})(jQuery);
