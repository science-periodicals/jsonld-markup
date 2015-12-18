// json to html conversion is adapted from https://github.com/mafintosh/json-markup

(function() {

  function jsonldHtmlView(doc, ctx, opts) {
    ctx = ctx || {};
    opts = opts || {};

    var INDENT = new Array(opts.indent || 2).join(' ');

    var indent = '';

    function forEach(list, start, end, fn, _key) {
      if (!list.length) return start+' '+end;

      var out = start+'\n';

      indent += INDENT;
      list.forEach(function(key, i) {
        out += indent + fn(key, _key) + (i < list.length-1 ? ',' : '') + '\n';
      });
      indent = indent.slice(0, -INDENT.length);

      return out + indent + end;
    };

    function visit(obj, _key) {
      if (obj === undefined) return '';

      switch (type(obj)) {
        case 'boolean':
	  return '<span class="json-markup-bool">' + obj + '</span>';

        case 'number':
	  return '<span class="json-markup-number">' + obj + '</span>';

        case 'null':
	  return '<span class="json-markup-null">null</span>\n';

        case 'string':
          var href;
          if (_key && ((_key === '@type') ||  (_key in ctx && ctx[_key]['@type'] === '@id'))) {
            if (isUrl(obj)) {
              href = obj;
            } else if (~obj.indexOf(':') && (obj.split(':')[0] in ctx)) {
              var splt = obj.split(':');
              href = (ctx[splt[0]]['@id'] || ctx[splt[0]]) + splt.slice(1).join(':');
            } else if (_key === '@type' && ctx['@vocab']) {
              href = ctx['@vocab'] + obj;
            } else if (ctx['@base']) {
              href = ctx['@base'] + obj;
            }
          }
          var mvalue;
          if (href) {
            mvalue = '<a href="' + href + '">' + obj + '</a>';
          } else {
            mvalue = escape(obj.replace(/\n/g, '\n' + indent));
          }

	  return '<span class="json-markup-string">"' + mvalue + '"</span>';


        case 'link':
	  return '<span class="json-markup-string">"<a href="' + escape(obj)+'">'+escape(obj) + '</a>"</span>';

        case 'array':
	  return forEach(obj, '[', ']', visit, _key);

        case 'object':
	  var keys = Object.keys(obj).filter(function(key) {
	    return obj[key] !== undefined;
	  });

	  return forEach(keys, '{', '}', function(key) {
            var href;
            if (key in ctx) {
              href = ctx[key]['@id'] || ctx[key];
            } else if (isUrl(key)) {
              href = key;
            } else if (~key.indexOf(':') && (key.split(':')[0] in ctx)) {
              var splt = key.split(':');
              href = (ctx[splt[0]]['@id'] || ctx[splt[0]]) + splt.slice(1).join(':');
            } else if (ctx['@vocab'] && key.charAt(0) !== '@') {
              href = ctx['@vocab'] + key;
            }

            var mkey;
            if (href) {
              mkey = '<a href="' + href + '">' + key + '</a>';
            } else {
              mkey = key;
            }

	    return '<span class="json-markup' + ((key.charAt(0) === '@')? '-at-key' : '-key' ) + '">'+ mkey + ':</span> ' + visit(obj[key], key);
	  });
      }

      return '';
    };

    return '<div class="json-markup">' + visit(doc) + '</div>';
  };

  function isUrl(str) {
    return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(str);
  }

  function type(obj) {
    if (obj === null) return 'null';
    if (Array.isArray(obj)) return 'array';
    if (typeof obj === 'string' && isUrl(obj)) return 'link';

    return typeof obj;
  };

  function escape(str) {
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = jsonldVis;
  } else {
    window.jsonldHtmlView = jsonldHtmlView;
  }

})();
