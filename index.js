var isUrl = require('is-url')
  , util = require('util')
  , clone = require('clone')
  , url = require('url');


function urlify(obj, ctx){
  obj = clone(obj);
  
  obj = urlifyValues(obj, ctx);
  var s = urlifyKeys(JSON.stringify(obj, null, 2), ctx);
  
  return '<pre><code>' + s + '</code></pre>';
};


function urlifyValues(x, ctx){

  if(typeof x === 'string'){    
    return _urlify(x, ctx);
  }

  for(var key in x){
    var val = x[key];
    if ( key in ctx ){
      if( (typeof val === 'string') && ( ((typeof ctx[key] === 'object') && (ctx[key]['@type'] === '@id')) || isUrl(ctx[key])) ){
        x[key] = _urlify(val, ctx);
      } else if (Array.isArray(val)){
        x[key] = val.map(function(x){
          return urlifyValues(x, ctx);
        });
      } else if (typeof val === 'object'){
        urlifyValues(val, ctx);
      }
    }
  };

  return x;
};


function urlifyKeys(s, ctx){
  ctx = _resolvePrefix(ctx);

  var re = new RegExp(Object.keys(ctx)
                      .filter(function(x) {return x.charAt(0) !== '@'; })
                      .map(function(x) {return '"(' + x + ')":';})
                      .join('|'), 'g');

  return s.replace(re, function(){
    var key = Array.prototype.slice.call(arguments, 1, arguments.length-2).filter(function(x){return x;});
    var absUrl = _urlify((typeof ctx[key] === 'string')? ctx[key] : ctx[key]['@id'], ctx, key);
    return '"' + absUrl + '":'; 
  });
};


function _urlify (x, ctx, key){
  
  var absUrl = (isUrl(x))? x: url.resolve(ctx['@base'], x);

  return util.format("<a href='%s'>%s</a>", absUrl, key || absUrl); //single quote to have valid key if we JSON.parse
};

/**
 * suppose that only values can have prefix
 */
function _resolvePrefix(ctx){
  ctx = clone(ctx);

  var ectx = {};

  for(var key in ctx){    
    if(typeof ctx[key] === 'string'){
      if(isUrl(ctx[key]) || (ctx[key].indexOf(':') === -1)){
        ectx[key] = ctx[key];
      } else { //prefix
        var splt = ctx[key].split(':');
        ectx[key] = url.resolve(ctx[splt[0]], splt[1]);  
      }
    } else {

      if(isUrl(ctx[key]['@id']) || (ctx[key]['@id'].indexOf(':') === -1)){
        ectx[key] = ctx[key];
      } else { //prefix
        var splt = ctx[key]['@id'].split(':');
        ectx[key] = ctx[key];
        ectx[key]['@id'] = url.resolve(ctx[splt[0]], splt[1]);  
      }
     
    }
  }
  
  return ectx;
};



exports.urlify = urlify;
exports.urlifyValues = urlifyValues;
exports.urlifyKeys = urlifyKeys;
 
