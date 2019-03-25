/**
 @Name：EvyunUi.allSelect 全选组件
 @Author：qwguo
 @github：https://github.com/qwguo/
 @Date: 2018/12/18
 */

/**
 *dataTotal: //总数据条数,
 *pageDataNum: 页码数显示个数-->数字类型,
 *curPage: 当前页码-->数字类型,
 *pagepageGroups: 页码分组-->数字类型,
 *skip: false：是否显示选择页码下拉组件-->Boolean,
    //  *hash: false：是否显示哈希值,
 *callBack: null 回调函数 --> Function
 * */
(function ($) {
    function Page(options) {
        this.config = {
            dataTotal: 5,
            pageDataNum: 5,
            curPage: 1,
            pagepageGroups: 1,
            skip: false,
            hash: false,
            text: {
                next: '下一页',
                prev: '上一页',
                sum: '共&页',
                skip: '到底&页'
            },
            callBack: null
        };
        this.config = $.extend(this.config, options);
        this.render(true);
    }
    //分页视图
    Page.prototype.view = function () {
        var that = this,
            conf = that.config,
            view = [],
            dict = {},
            hostNameHref,
            hash = location.hash,
            reg,
            search = location.search;
        if (search) {
            if (search.indexOf('?p_m_page') === 0) {
                reg = /\?p_m_page=(\d+)-(\d+)/g;
            } else if (search.indexOf('&p_m_page') > 0) {
                reg = /&p_m_page=(\d+)-(\d+)/g;
            }
            search = search.replace(reg, '');
        }

        hostNameHref = location.pathname + search + (search ? '&' : '?');

        if (conf.pageSum <= 1) {
            return '';
        }
        if (conf.pageGroups > conf.pageSum) {
            conf.pageGroups = conf.pageSum;
        }

        //计算当前组
        dict.index = Math.ceil((conf.curPage + ((conf.pageGroups > 1 && conf.pageGroups !== conf.pageSum) ? 1 : 0)) / (conf.pageGroups === 0 ? 1 : conf.pageGroups));
        //当前页非首页，则输出上一页
        view.push('<span class="page-number">');
        if(conf.curPage > 1){
            view.push('<a href="###" data-page="' + (conf.curPage - 1) + '">' + conf.text.prev + '</a>');
        }else{
            view.push('<a href="###" class="disabled">' + conf.text.prev + '</a>');
        }
        //当前组非首组，则输出首页
        if (dict.index > 1 && conf.pageGroups !== 0) {
            view.push('<a href="###" data-page="1">1</a><i>&#x2026;</i>');
        }
        //输出当前页组
        dict.poor = Math.floor((conf.pageGroups - 1) / 2);
        dict.start = dict.index > 1 ? conf.curPage - dict.poor : 1;
        dict.end = dict.index > 1 ? (function () {
            var max = conf.curPage + (conf.pageGroups - dict.poor - 1);
            return max > conf.pageSum ? conf.pageSum : max;
        }()) : conf.pageGroups;
        if (dict.end - dict.start < conf.pageGroups - 1) { //最后一组状态
            dict.start = dict.end - conf.pageGroups + 1;
        }
        for (; dict.start <= dict.end; dict.start++) {
            if (dict.start === conf.curPage) {
                view.push('<b>' + dict.start + '</b>');
            } else {
                view.push('<a href="###" data-page="' + dict.start + '">' + dict.start + '</a>');
            }
        }

        //总页数大于连续分页数，且当前组最大页小于总页，输出尾页
        if (conf.pageSum > conf.pageGroups && dict.end < conf.pageSum && conf.pageGroups !== 0) {
            view.push('<i class="page-ellipsis">&#x2026;</i><a href="###"  data-page="' + conf.pageSum + '">' + conf.pageSum + '</a>');
        }
        //当前页不为尾页时，输出下一页
        dict.flow = !conf.prev && conf.pageGroups === 0;
        if (conf.curPage !== conf.pageSum || dict.flow) {
            view.push((function () {
                return (dict.flow && conf.curPage === conf.pageSum) ?
                    '<a href="###" class="disabled">' + conf.text.next + '</a>' :
                    '<a href="###" data-page="' + (conf.curPage + 1) + '">' + conf.text.next + '</a>';
            }()));
        } else {
            view.push('<a class="disabled">' + conf.text.next + '</a>');
        }
        view.push('</span>');
        view.unshift('<span class="page-sum">'+conf.text.sum.split('&')[0]+'<em>' + conf.pageSum + '</em>'+conf.text.sum.split('&')[1]+'</span>');
        return view.join('');
    };

    //跳页
    Page.prototype.callBack = function (elem) {
        if (!elem) return;
        var that = this,
            conf = that.config;
        !elem.data('bindevent') && elem.on({
            click: function () {
                var $this = $(this),
                    curPage = null;
                switch (true) {
                    case (!$this.hasClass('disabled')):
                        curPage = $this.attr('data-page') | 0;
                        conf.curPage = curPage;
                        that.render();
                        break;
                    case $this.hasClass('page-enter-btn'):
                        curPage = elem.find('input.page-num-input').val().replace(/\s|\D/g, '') | 0;
                        curPage > conf.pageSum && (curPage = conf.pageSum);
                        if (curPage && curPage <= conf.pageSum) {
                            conf.curPage = curPage;
                            that.render();
                        }
                        break;
                }
                return false;
            }
        }, 'a,em').data('click', 1);
    };
    //渲染分页
    Page.prototype.render = function (load) {
        var that = this,
            conf = that.config,
            view = that.view();
        conf.eleDom.html(view);
        conf.eleDom.data('click') && conf.callBack && conf.callBack(conf, load);
        !conf.eleDom.data('click') && that.callBack(conf.eleDom);
        if (conf.hash && !load) {
            location.hash = '!' + conf.hash + '=' + conf.curPage;
        }
    };
    $.fn.extend({
        pagination: function (options) {
            options.eleDom = $(this);
            options.pageSum = Math.ceil(options.dataTotal / options.pageDataNum);
            options.curPage > options.pageSum && (options.curPage = options.pageSum);
            var page = new Page(options);
        }
    });
})(jQuery);
