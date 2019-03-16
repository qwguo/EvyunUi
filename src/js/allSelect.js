/**
 @Name：EvyunUi.allSelect 全选组件
 @Author：qwguo
 @github：https://github.com/qwguo/
 @Date: 2018/12/18
 */

/**
 * user HTML Element add attribute
 * data-toggle="allSelect"    表示这个元素是全选元素，内部有要全选的对象
 * data-all-name="value1,value2"      表示元素内，用来单击全选的元素 input checkbox元素的name名称，多个用逗号分开
 * data-target-name="value,value2" 表示要选中或者取消选中的目标元素 input checkbox元素元素的name名称，多个用逗号分开
 * 其中多个all-name和target-name需要一一对应
 * */
(function ($) {
    $(document).on('click.allSelect', '[data-toggle="allSelect"]', function (ev) {
        var $this = $(this),
            clickTarget = $(ev.target);
        if (clickTarget[0].tagName.toLowerCase() === 'input' && clickTarget.attr('type') === 'checkbox') {
            var $thisDate = $this.data(),
                num = -1,
                tag = -1,
                allName = $thisDate.allName.split(','),
                targetName = $thisDate.targetName.split(','),
                curName = clickTarget.attr('name');
            if(curName){
                var flag = clickTarget.prop('checked'),
                    flag_ = true;
                num = targetName.indexOf(curName);
                if(num === -1){
                    num = allName.indexOf(curName);
                    if(num !== -1){
                        tag = 1;
                    }
                }else{
                    tag = 0;
                }
                if(num !== -1 && tag !== -1){
                    switch(tag){
                        case 0:
                            $this.find('input[type="checkbox"][name="' + targetName[num] + '"]').each(function (i, dom) {
                                !$(dom).prop('checked') && (flag_ = false);
                            });
                            $this.find('input[type="checkbox"][name="' + allName[num] + '"]').prop('checked', flag_);
                            break;
                        case 1:
                            $this.find('input[type="checkbox"][name="' + targetName[num] + '"]').prop('checked', flag);
                            break;
                    }
                }
            }
        }
    });
})(jQuery);
