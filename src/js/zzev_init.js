(function () {
    // 计算父级的iframe的高度 主要是为了解决咱们的后台的iframe宽度不同意的问题
    var winP = window.parent,
        winName = window.name;
    if (winName === 'navigate_iframe') {
        var htmlDom = $('html'),
            iframe = $('iframe[name="' + winName + '"]', winP.document);
        iframe.closest('.admin_main').addClass('new-admin-main');
        var realTime = function () {
            var h_ = htmlDom.height(),
                h = htmlDom.data('h');
            if (h_ !== h) {
                htmlDom.data('h', h_);
                iframe.length && iframe.height(h_);
            }
            setTimeout(realTime, 100);
        };
        realTime();
        /* if(iframe.attr('onload') !== 'SetWinHeight()'){
        } */
    }
}());
$(function () {
    $('[data-toggle]').each(function (i, dom) {
        dom = $(dom);
        var domDate = dom.data();
        switch (domDate.toggle) {
            case 'tooltip':
                dom.tooltip({
                    'container': dom.data('container') || 'body',
                    'delay': dom.data('delay') || 100,
                    'skin': dom.data('skin'),
                    'size': dom.data('size')
                });
                break;
            case 'popover':
                dom.popover({
                    'container': 'body',
                    'delay': 100
                });
                break;
            case 'customScroll':
                if (!dom.data('cscroll')) {
                    var j = {
                        axis: domDate.axis,
                        scrollbarPosition: domDate.position,
                        theme: domDate.theme,
                        scrollButtons: {
                            enable: !!(domDate.scrollbtn * 1)
                        }
                    };
                    domDate.height && (j.setHeight = domDate.height);
                    var j_ = {
                        axis: "x",
                        scrollEasing: "none",
                        scrollInertia: 150,
                        scrollbarPosition: 'outside',
                        theme: "dark-3",
                        autoHideScrollbar: false,
                        mouseWheel: {
                            preventDefault: true
                        },
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
                (function () {
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
            case 'colorPicker':
                (function(){
                    var inputDom = dom.find('input.color-input'),
                        iDom = dom.find('i.color-i');
                    if(inputDom.val()){
                        iDom.css('background-color', inputDom.val());
                    }
                    dom.on('click', function(ev){
                        var $this = $(this),
                            spContainer = null;
                        if($this.data('spectrum.id')){
                            $this.spectrum('destroy');
                            spContainer = $('#spContainer'+ $this.data('spectrum.id'));
                            spContainer.length && spContainer.remove();
                            spContainer = null;
                            $this.removeData('spectrum.id');
                        }
                        $this.spectrum({
                            color: inputDom.val(),
                            cancelText: "取消",//取消按钮,按钮文字
                            chooseText: "确定",//选择按钮,按钮文字
                            change: function(color){
                                iDom.css('background-color',color.toRgbString());
                                inputDom.val(color.toRgbString()).change();
                                spContainer.length && spContainer.remove();
                            }
                        });
                        $this.off('click.spectrum');
                        $this.spectrum('show');
                        spContainer = $('#spContainer'+ $this.data('spectrum.id'));
                        ev.preventDefault && ev.preventDefault();
                        ev.stopPropagation && ev.stopPropagation();
                        $(document).on('click.spectrum', function(){
                            spContainer.length && spContainer.remove();
                            $(document).off('click.spectrum');
                        });
                    });
                }());
            break;
        }
    });
});
