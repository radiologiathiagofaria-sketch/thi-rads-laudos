$scriptBlock = @"
<script>
// ── Intercept manual Ctrl+C inside the pre-laudo ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
  var laudoDoc = document.getElementById('laudo-doc');
  if (laudoDoc) {
    laudoDoc.addEventListener('copy', function(event) {
      var selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

      var range = selection.getRangeAt(0);
      var fragment = range.cloneContents();

      var tempWrapper = document.createElement('div');
      tempWrapper.style.position = 'fixed';
      tempWrapper.style.left = '-99999px';
      tempWrapper.style.top = '0';
      tempWrapper.style.opacity = '0';
      tempWrapper.style.pointerEvents = 'none';
      tempWrapper.style.fontFamily = 'Helvetica, Arial, sans-serif';
      tempWrapper.style.fontSize = '10pt';
      tempWrapper.style.lineHeight = '1.65';
      
      tempWrapper.appendChild(fragment);
      document.body.appendChild(tempWrapper);

      var COPY_PROPS = [
        'font-family', 'font-size', 'font-weight', 'font-style',
        'line-height', 'text-align', 'text-indent', 'text-decoration',
        'vertical-align', 'white-space', 'display',
        'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'list-style', 'list-style-type',
        'border-collapse', 'border-spacing'
      ];

      function _inlineCopyStyles(el, props, isRoot) {
        if (!el || el.nodeType !== 1) return;
        var computed = window.getComputedStyle(el);
        for (var i = 0; i < props.length; i++) {
          var prop = props[i];
          var val  = computed.getPropertyValue(prop);
          if (val && val !== 'none' && val !== 'normal' && val !== '0px') {
            el.style.setProperty(prop, val);
          }
        }
        var bgColor = computed.getPropertyValue('background-color');
        if (bgColor) {
          var bgRgb = (function(colorStr) {
            if (!colorStr) return null;
            var m = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
            if (m) return { r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3]) };
            if (colorStr.charAt(0) === '#') {
              var hex = colorStr.replace('#', '');
              if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
              if (hex.length === 6) return { r: parseInt(hex.substr(0,2),16), g: parseInt(hex.substr(2,2),16), b: parseInt(hex.substr(4,2),16) };
            }
            return null;
          })(bgColor);
          var isTransparent = (function(colorStr) {
            if (!colorStr || colorStr === 'transparent') return true;
            var m = colorStr.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
            if (m && parseFloat(m[4]) === 0) return true;
            return false;
          })(bgColor);
          
          if (!bgRgb || isTransparent) {
            el.style.backgroundColor = 'transparent';
          } else if (bgRgb.r > 200 && bgRgb.g > 200 && bgRgb.b > 200) {
            el.style.backgroundColor = '#ffffff';
          } else {
            el.style.backgroundColor = isRoot ? '#ffffff' : 'transparent';
          }
        }
        var textColor = computed.getPropertyValue('color');
        if (textColor) {
          var textRgb = (function(colorStr) {
            if (!colorStr) return null;
            var m = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
            if (m) return { r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3]) };
            if (colorStr.charAt(0) === '#') {
              var hex = colorStr.replace('#', '');
              if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
              if (hex.length === 6) return { r: parseInt(hex.substr(0,2),16), g: parseInt(hex.substr(2,2),16), b: parseInt(hex.substr(4,2),16) };
            }
            return null;
          })(textColor);
          if (!textRgb || textRgb.r > 100 || textRgb.g > 100 || textRgb.b > 100) {
            el.style.color = '#000000';
          } else {
            el.style.color = textColor;
          }
        }
        var tag = el.tagName.toLowerCase();
        if (tag === 'td' || tag === 'th' || tag === 'table') {
          var borderProps = ['border-top', 'border-right', 'border-bottom', 'border-left', 'border'];
          for (var j = 0; j < borderProps.length; j++) {
            var bv = computed.getPropertyValue(borderProps[j]);
            if (bv) el.style.setProperty(borderProps[j], bv);
          }
        }
        el.removeAttribute('class');
      }

      var allEls = tempWrapper.querySelectorAll('*');
      _inlineCopyStyles(tempWrapper, COPY_PROPS, true);
      for (var i = 0; i < allEls.length; i++) {
        _inlineCopyStyles(allEls[i], COPY_PROPS, false);
      }

      tempWrapper.style.backgroundColor = '#ffffff';
      tempWrapper.style.color = '#000000';

      var htmlContent = tempWrapper.innerHTML;
      var plainText = tempWrapper.innerText || tempWrapper.textContent || '';

      document.body.removeChild(tempWrapper);

      event.clipboardData.setData('text/html', htmlContent);
      event.clipboardData.setData('text/plain', plainText);
      event.preventDefault();
    });
  }
});
</script>
</body>
"@

$utf8NoBom = New-Object System.Text.UTF8Encoding $False
$files = Get-ChildItem -Path "C:\Users\thiag\Downloads\obs\acrescente" -Filter "*.html"

foreach ($file in $files) {
    # Read correctly as UTF8 No BOM
    $content = [System.IO.File]::ReadAllText($file.FullName, $utf8NoBom)
    
    if ($content -notmatch "Intercept manual Ctrl\+C inside the pre-laudo") {
        # Perform replacement
        $content = $content -replace "(?i)</body>", $scriptBlock
        # Write correctly as UTF8 No BOM
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        Write-Host "Updated $($file.Name)"
    } else {
        Write-Host "Already updated $($file.Name)"
    }
}