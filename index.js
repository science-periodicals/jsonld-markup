// json to html conversion is adapted from https://github.com/mafintosh/json-markup

(function() {

  function jsonldMarkup(doc, ctx, opts) {
    ctx = ctx || {};
    opts = opts || {};

    var INDENT = new Array(opts.indent || 2).join(' ');

    var indent = '';

    function forEach(list, start, end, fn, _key) {
      if (!list.length) return start + ' ' + end;

      var out = start + '\n';

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
          return '<span class="jsonld-markup-bool">' + obj + '</span>';

        case 'number':
          return '<span class="jsonld-markup-number">' + obj + '</span>';

        case 'null':
          return '<span class="jsonld-markup-null">null</span>\n';

        case 'string':
          var href;
          if (_key && ((_key === '@type') || (_key === '@id') || (_key in ctx && ((ctx[_key] === '@id') || (ctx[_key]['@type'] === '@id'))))) {
            if (isUrl(obj)) {
              href = obj;
            } else if (obj in ctx) {
              href = iri2url(ctx[obj]['@id'] || ctx[obj], ctx);
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
            mvalue = '<a href="' + href + '" target="_blank">' + obj + '</a>';
          } else {
            mvalue = escape(
              obj.replace(/\n/g, '\n' + indent)
                  .replace(/([\u0000-\u001f])/g, function (_, c) {
                    return '\\u' + pad(c.codePointAt(0).toString(16));
                  })
            );
          }

          return '<span class="jsonld-markup-string">"' + mvalue + '"</span>';

        case 'link':
          return '<span class="jsonld-markup-string">"<a href="' + escape(obj)+'" target="_blank">'+escape(obj) + '</a>"</span>';

        case 'array':
          var isList = _key && (_key in ctx && ctx[_key]['@container'] === '@list');
          var openBracket = '<span class="jsonld-markup-' + (isList ? 'list': 'set') + '">[</span>'
          var closeBracket = '<span class="jsonld-markup-' + (isList ? 'list': 'set') + '">]</span>'
          return forEach(obj, openBracket, closeBracket, visit, _key);

        case 'object':
          var keys = Object.keys(obj).filter(function(key) {
            return obj[key] !== undefined;
          });

          return forEach(keys, '{', '}', function(key) {
            var href, isKeywordMapping;
            if (key in ctx) {
              if (ctx[key]['@id']) {
                href = iri2url(ctx[key]['@id'], ctx);
              } else {
                // we protect ourselves from case where ctx[key] is for instance {"@container": "@list"}
                if (typeof ctx[key] === 'object') {
                  if (ctx['@vocab']) {
                    href = ctx['@vocab'] + key;
                  }
                } else {
                  if (ctx[key].charAt(0) === '@') {
                    // keyword mapping e.g id -> @id
                    isKeywordMapping = ctx[key];
                  } else {
                    href = iri2url(ctx[key], ctx);
                  }
                }
              }
            } else if (isUrl(key)) {
              href = key;
            } else if (~key.indexOf(':') && (key.split(':')[0] in ctx)) {
              var splt = key.split(':');
              href = (ctx[splt[0]]['@id'] || ctx[splt[0]]) + splt.slice(1).join(':');
            } else if (ctx['@vocab'] && key.charAt(0) !== '@') {
              href = ctx['@vocab'] + key;
            }

            if (isKeywordMapping) {
              return '<span class="jsonld-markup-key-' + isKeywordMapping.slice(1) + '">"'+ '<abbr title="' + isKeywordMapping + '">' + key  + '</abbr>":</span> ' + visit(obj[key], key);
            } else {
              var mkey;
              if (href) {
                mkey = '<a href="' + href + '" target="_blank">' + key + '</a>';
              } else {
                mkey = key;
              }
              return '"<span class="jsonld-markup-key' + ((key.charAt(0) === '@')? ('-' + key.slice(1)) : '' ) + '">'+ mkey + '</span>": ' + visit(obj[key], key);
            }
          });
      }

      return '';
    };

    return '<div class="jsonld-markup">' + visit(doc) + '</div>';
  };

  function isUrl(str) {
    return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(str);
  }

  function iri2url(iri, ctx) {
    if (isUrl(iri)) {
      return iri;
    } else {
      var irisplt = iri.split(':');
      if (irisplt.length > 1 && (irisplt[0] in ctx)) {
        return (ctx[irisplt[0]]['@id'] || ctx[irisplt[0]]) + irisplt.slice(1).join(':');
      }
    }
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

  function pad (str) {
    for (var i = str.length; i < 4; i++) str = '0' + str;
    return str;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = jsonldMarkup;
  } else {
    window.jsonldMarkup = jsonldMarkup;
  }

})();
