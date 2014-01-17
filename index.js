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

function urlifyValues(x, ctx, isId){
  ctx = _resolvePrefix(ctx);

  if(typeof x === 'string' && isId){    
    return _urlify(x, ctx);
  }

  for(var key in x){
    var val = x[key];
    if ( key in ctx ){
      if( (typeof val === 'string') && (typeof ctx[key] === 'object') && (ctx[key]['@type'] === '@id') ){
        x[key] = _urlify(val, ctx);
      } else if (Array.isArray(val)){
        x[key] = val.map(function(x){
          return urlifyValues(x, ctx, (typeof ctx[key] === 'object') && (ctx[key]['@type'] === '@id'));
        });
      } else if (typeof val === 'object'){
        urlifyValues(val, ctx);
      }
    } else if(key === '@id'){
      x[key] = _urlify(val, ctx, {class: 'jsonld-id'});
    } else  if(key === '@type') {      
      if(ctx[val] || isUrl(val)){
        x[key] = _urlify( ctx[val]['@id'] || val, ctx, {key:val, class: 'jsonld-type'});
      }
    }
  };

  return x;
};


function urlifyKeys(s, ctx){
  ctx = _resolvePrefix(ctx);

  var re = new RegExp(Object.keys(ctx)
                      .filter(function(x) {return x.charAt(0) !== '@'; })
                      .concat(['@id', '@type'])
                      .map(function(x) {return '"(' + x + ')":';})
                      .join('|'), 'g');

  return s.replace(re, function(){
    var key = Array.prototype.slice.call(arguments, 1, arguments.length-2).filter(function(x){return x;})[0];

    if(key === '@id'){
      return util.format('"' + "<span class='jsonld-id'>%s</span>" + '":', key);
    } else if (key === '@type'){
      return util.format('"' + "<span class='jsonld-type'>%s</span>" + '":', key);
    } else {
      var absUrl = _urlify((typeof ctx[key] === 'string')? ctx[key] : ctx[key]['@id'], ctx, {key:key, class: 'jsonld-key'});
      return '"' + absUrl + '":'; 
    }

  });
};


function _urlify (x, ctx, opts){
  
  opts = opts || {};

  //TODO fix isUrl for localhost:3000 <- return false
  var absUrl;
  try{
    absUrl = (isUrl(x))? x: url.resolve(ctx['@base'], x);
  } catch(e){
    absUrl = x;
  }
  return util.format("<a %shref='%s'>%s</a>", (opts.class) ? "class='" + opts.class + "' ": '',  absUrl, opts.key || absUrl); //single quote to have valid key if we JSON.parse
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
        ectx[key] = (splt[0] in ctx) ? url.resolve(ctx[splt[0]] , splt[1]) : ctx[key];  
      }
    } else {

      if(isUrl(ctx[key]['@id']) || (ctx[key]['@id'].indexOf(':') === -1)){
        ectx[key] = ctx[key];
      } else { //prefix
        var splt = ctx[key]['@id'].split(':');
        ectx[key] = ctx[key];
        ectx[key]['@id'] = (splt[0] in ctx) ? url.resolve(ctx[splt[0]] , splt[1]) : ctx[key]['@id'];  
      }
     
    }
  }
  
  return ectx;
};


var x = { name: 'stanfordVsHarvard',
  description: 'Do Stanford grads found significantly more unicorns than Harvard ones?',
  isBasedOnUrl: [ 'founders-analysis/0.0.0/analytics/propTest#L4' ],
  distribution: 
   { contentData: 
      { '@context': [Object],
        '@type': 'Proportion',
        estimate: 0.61905,
        statTest: [Object] },
     contentUrl: 'founders-analysis/0.0.0/dataset/stanfordVsHarvard/stanfordVsHarvard.jsonld',
     contentSize: 176,
     encodingFormat: 'jsonld',
     hashAlgorithm: 'md5',
     hashValue: '874d3fc438764968824352526f077c0c',
     uploadDate: '2014-01-12T19:14:45.330Z',
     '@type': 'DataDownload' },
  '@id': 'founders-analysis/0.0.0/dataset/stanfordVsHarvard',
  '@type': 'Dataset',
  catalog: 
   { name: 'founders-analysis',
     version: '0.0.0',
     url: 'founders-analysis/0.0.0' } };


var ctx =  { '@base': 'http://localhost:3000/',
  dpkg: 'http://standardanalytics.io/datapackage/',
  sch: 'http://schema.org/',
  nfo: 'http://www.semanticdesktop.org/ontologies/nfo/#',
  dc: 'http://purl.org/dc/terms/',
  repository: { '@id': 'dpkg:code', '@container': '@set' },
  analytics: { '@id': 'dpkg:analytics', '@container': '@list' },
  input: { '@id': 'dpkg:input', '@type': '@id', '@container': '@set' },
  output: { '@id': 'dpkg:output', '@type': '@id', '@container': '@set' },
  path: 'dpkg:path',
  contentPath: 'dpkg:contentPath',
  contentData: 'dpkg:contentData',
  license: 'dc:license',
  email: { '@id': 'http://xmlns.com/foaf/0.1/mbox' },
  hashAlgorithm: 'nfo:hashAlgorithm',
  hashValue: 'nfo:hashValue',
  keywords: { '@id': 'sch:keywords', '@container': '@list' },
  isBasedOnUrl: 
   { '@id': 'sch:isBasedOnUrl',
     '@type': '@id',
     '@container': '@list' },
  citation: { '@id': 'sch:citation', '@container': '@list' },
  contributor: { '@id': 'sch:contributor', '@container': '@list' },
  dataset: { '@id': 'sch:dataset', '@container': '@list' },
  codeRepository: { '@id': 'sch:codeRepository', '@type': '@id' },
  discussionUrl: { '@id': 'sch:discussionUrl', '@type': '@id' },
  targetProduct: { '@id': 'sch:targetProduct', '@type': '@id' },
  url: { '@id': 'sch:url', '@type': '@id' },
  contentUrl: { '@id': 'sch:contentUrl', '@type': '@id' },
  name: 'sch:name',
  about: 'sch:about',
  version: 'sch:version',
  description: 'sch:description',
  distribution: 'sch:distribution',
  author: 'sch:author',
  encoding: 'sch:encoding',
  runtime: 'sch:runtime',
  programmingLanguage: 'sch:programmingLanguage',
  operatingSystem: 'sch:operatingSystem',
  sampleType: 'sch:sampleType',
  contentSize: 'sch:contentSize',
  encodingFormat: 'sch:encodingFormat',
  catalog: 'sch:catalog',
  datePublished: 'sch:datePublished',
  uploadDate: 'sch:uploadDate',
  MediaObject: { '@id': 'sch:MediaObject', '@type': '@id' },
  Person: { '@id': 'sch:Person', '@type': '@id' },
  Organization: { '@id': 'sch:Person', '@type': '@id' },
  DataCatalog: { '@id': 'sch:DataCatalog', '@type': '@id' },
  DataDownload: { '@id': 'sch:DataDownload', '@type': '@id' },
  Dataset: { '@id': 'sch:Dataset', '@type': '@id' },
  Code: { '@id': 'sch:Code', '@type': '@id' },
  SoftwareApplication: { '@id': 'sch:SoftwareApplication', '@type': '@id' } }

console.log(urlify(x, ctx));

exports.urlify = urlify;
exports.urlifyValues = urlifyValues;
exports.urlifyKeys = urlifyKeys;
 
