String.prototype.escapeHtml = function () {
  var s = "";
  if (!this.trim().length) return;
  s = this.replace(/&/g, "&amp;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  s = s.replace(/ /g, "&nbsp;");
  s = s.replace(/\'/g, "&#39;");
  s = s.replace(/\"/g, "&quot;");
  s = s.replace(/\n/g, "<br>");
  return s;
};
var pre =  document.getElementsByTagName('pre');
for(var i = 0; i<pre.length; i++){
  if(pre[i].getAttribute('class').indexOf('html') != -1){
    pre[i].innerHTML = pre[i].innerHTML.escapeHtml();
  }
}
DlHighlight.HELPERS.highlightByName("pre", "pre", {
  showWhitespace : true,
  lineNumbers    : true
});

