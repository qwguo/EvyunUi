(function($){
  var Countdown = function(){

  };
  $.fn.countdown = function (j) {
    var r = function (t) {
        var a = t.split(' '),
          ymd = a[0],
          hms = a[1],
          str = ymd.split('-'),
          fix = hms.split(':'),
          year = str[0] - 0,
          month = str[1] - 0 - 1,
          day = str[2] - 0,
          hour = fix[0] - 0,
          minute = fix[1] - 0,
          second = fix[2] - 0,
          time = (new Date(year, month, day, hour, minute, second)).getTime();
        return parseInt(time / 1000);
      },
      o = j.o,
      st = r(j.st),
      et = r(j.et),
      nts = j.nt ? r(j.nt) : (new Date().getTime() / 1000),
      n_underway = function () {
        var y, m, d, h, mi, s, now = nts,
          c = et - now,
          html_;
        nts = nts + 1;
        if (c > 0) {
          d = Math.floor(c / (60 * 60 * 24));
          h = Math.floor((c - d * 24 * 60 * 60) / 3600);
          mi = Math.floor((c - d * 24 * 60 * 60 - h * 3600) / 60);
          s = Math.floor(c - d * 24 * 60 * 60 - h * 3600 - mi * 60);
          h = h < 10 ? '0' + h : h;
          mi = mi < 10 ? '0' + mi : mi;
          s = s < 10 ? '0' + s : s;
          html_ = '<span class="count-time"><i>' + d + '</i><em>天</em><i>' + h + '</i><em>时</em><i>' + mi + '</i><em>分</em><i>' + s + '</i><em>秒</em></span>';
          o.html(html_);
          setTimeout(function () {
            n_underway();
          }, 1000);
        } else {
          typeof j.efun == 'function' && j.efun();
          // o.html('活动已经结束！');
        }
      },
      b_underway = function () {
        var y, m, d, h, mi, s, now = nts,
          c = st - now,
          html_;
        nts = nts + 1;
        if (c > 0) {
          d = Math.floor(c / (60 * 60 * 24));
          h = Math.floor((c - d * 24 * 60 * 60) / 3600);
          mi = Math.floor((c - d * 24 * 60 * 60 - h * 3600) / 60);
          s = Math.floor(c - d * 24 * 60 * 60 - h * 3600 - mi * 60);
          h = h < 10 ? '0' + h : h;
          mi = mi < 10 ? '0' + mi : mi;
          s = s < 10 ? '0' + s : s;
          html_ = '<span class="count-time"><i>' + d + '</i><em>天</em><i>' + h + '</i><em>时</em><i>' + mi + '</i><em>分</em><i>' + s + '</i><em>秒</em></span>';
          o.html(html_);
          setTimeout(function () {
            b_underway();
          }, 1000);
        } else {
          n_underway();
          typeof j.nfun == 'function' && j.nfun();
        }
      };
    // 判断状态
    if ((st - nts) > 0) {
      typeof j.sfun == 'function' && j.sfun();
      b_underway();
    } else if ((nts - et) > 0) {
      typeof j.efun == 'function' && j.efun();
    } else {
      n_underway();
      typeof j.nfun == 'function' && j.nfun();
    }
  }
})(jQuery);

