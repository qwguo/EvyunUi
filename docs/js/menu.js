var menu = new Vue({
  el: '#mainMenu',
  data: {
    list: [{
      'title': '网格系统',
      'name': 'grid',
      'cur': 1,
      'sub': [
        {'title': '基本布局', 'name': 'column_gird', 'href': 'gird/column_gird.html'},
        {'title': '布局列偏移', 'name': 'column_gird_offset', 'href': 'gird/column_gird_offset.html'}
      ]
    }, {
      'title': '布局系统',
      'name': 'layout',
      'cur': 0,
      'sub': [
        {'title': '布局', 'name': 'layout_tow_columns', 'href': 'layout/layout_tow_columns.html'}
      ]
    }, {
      'title': '全局类',
      'name': 'globalClass',
      'cur': 0,
      'sub': [
        {'title': '全局样式', 'name': 'global_class', 'href': 'globalClass/globalClass.html'}
      ]
    }, {
      'title': '表格',
      'name': 'table',
      'cur': 0,
      'sub': [
        {'title': '基本表格', 'name': 'base_table', 'href': 'table/base_table.html'},
        {'title': '表格嵌套', 'name': 'nesting_table', 'href': 'table/nesting_table.html'}
      ]
    }, {
      'title': '按钮',
      'name': 'button',
      'cur': 0,
      'sub': [
        {'title': '基本按钮', 'name': 'base_button', 'href': 'button/base_button.html'}
        // {'title': '按钮组', 'name': 'base_button', 'href': 'button/group_button.html'}
      ]
    }, {
      'title': '文字，图标，图片',
      'name': 'text',
      'cur': 0,
      'sub': [
        {'title': '标题', 'name': 'heading', 'href': 'text/heading.html'},
        {'title': '文本', 'name': 'text', 'href': 'text/text.html'},
        {'title': '图片', 'name': 'image', 'href': 'text/image.html'},
        {'title': '徽标', 'name': 'badge', 'href': 'text/badge.html'},
        {'title': '提示框文字', 'name': 'alert_text', 'href': 'text/alert_text.html'},
        {'title': '所有图标', 'name': 'font_icon', 'href': 'text/font_icon.html'}
      ]
    }, {
      'title': '表单',
      'name': 'forms',
      'cur': 0,
      'sub': [
        {'title': '表单布局结构', 'name': 'forms_layout', 'href': 'forms/forms_layout.html'},
        {'title': '输入框', 'name': 'input_element', 'href': 'forms/input_element.html'},
        {'title': '多行输入框', 'name': 'textarea_element', 'href': 'forms/textarea_element.html'},
        {'title': '单选按钮', 'name': 'radio_element', 'href': 'forms/radio_element.html'},
        {'title': '复选按钮', 'name': 'checkbox_element', 'href': 'forms/checkbox_element.html'},
        {'title': '开关', 'name': 'switch_element', 'href': 'forms/switch_element.html'},
        {'title': '下拉菜单', 'name': 'select_element', 'href': 'forms/select_element.html'},
        {'title': '上传组件', 'name': 'upload_element', 'href': 'forms/upload_element.html'},
        {'title': '日期选择', 'name': 'datePicker_element', 'href': 'forms/datePicker_element.html'}
      ]
    }, {
      'title': '分组',
      'name': 'panel',
      'cur': 0,
      'sub': [
        {'title': '面板', 'name': 'panel', 'href': 'panel/panel.html'},
        {'title': '标签切换面板', 'name': 'tabpanel', 'href': 'panel/tab_panel.html'},
        // {'title': '折叠面板', 'name': 'fold_panel', 'href': 'panel/fold_panel.html'},
        {'title': '分组区块', 'name': 'fieldset', 'href': 'panel/fieldset.html'},
        {'title': '分割线', 'name': 'hr', 'href': 'panel/hr.html'}
      ]
    }, {
      'title': '导航',
      'name': 'nav',
      'cur': 0,
      'sub': [
        // {'title': '基本导航', 'name': 'panel', 'href': 'nav/base_nav.html'},
        {'title': '面包屑', 'name': 'panel', 'href': 'nav/breadcrumb.html'}
      ]
    }, {
      'title': '列表',
      'name': 'list',
      'cur': 0,
      'sub': [
        {'title': '列表', 'name': 'text_list', 'href': 'list/base_list.html'},
        // {'title': '列表组', 'name': 'list_group', 'href': 'list/list_group.html'},
        {'title': '图文列表', 'name': 'media_list', 'href': 'list/media_list.html'},
        {'title': '橱窗展示', 'name': 'thumbnail', 'href': 'list/thumbnail.html'},
        {'title': '树形结构列表', 'name': 'list_tree', 'href': 'list/list_tree.html'}
      ]
    }, {
      'title': '工具',
      'name': 'tool',
      'cur': 0,
      'sub': [
        {'title': '进度条', 'name': 'progress', 'href': 'tool/progress.html'},
        {'title': '工具提示', 'name': 'tooltips', 'href': 'tool/tooltips.html'},
        {'title': '模态框', 'name': 'popup', 'href': 'tool/popup.html'},
        {'title': '高级提示', 'name': 'popover', 'href': 'tool/popover.html'},
        // {'title': '显示隐藏', 'name': 'collapse', 'href': 'tool/collapse.html'},
        {'title': '滚动条', 'name': 'scroll', 'href': 'tool/scroll.html'},
        {'title': '页码', 'name': 'pagination', 'href': 'tool/pagination.html'}
      ]
    }/*, {
      'title': '测试',
      'name': 'test',
      'cur': 0,
      'sub': [
        {'title': '测试', 'name': 'test', 'href': 'test/index.html'}
      ]
    }*/]
  },
  methods: {
    details: function (id) {
      this.list.map(function (i, v) {
        if (v !== id) {
          i.cur = 0;
        }
      });
      this.list[id].cur = !this.list[id].cur;
    }
  }
});
