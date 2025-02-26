// add delayed functionality here

async function enableSiteImprove() {
  const siteImproveScript = document.createElement('script');
  siteImproveScript.type = 'text/javascript';
  siteImproveScript.innerHTML = `
/*<![CDATA[*/
(function() {
var sz = document.createElement('script'); sz.type = 'text/javascript'; sz.async = true;
sz.src = '//siteimproveanalytics.com/js/siteanalyze_6044960.js';
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(sz, s);
})();
/*]]>*/`;
  siteImproveScript.async = true;
  document.body.append(siteImproveScript);
}
enableSiteImprove();
