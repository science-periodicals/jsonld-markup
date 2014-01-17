var assert = require('assert')
  , clone = require('clone')
  , jsonldHtmlView = require('..');

describe('jsonld-html-view', function(){

  var ctx = {
    '@base': 'http://base.com/',
    ex: 'http://ex.com/',
    a: 'http://ex.com/a',
    b: 'ex:b',
    url1: {'@id': 'ex:1', '@type': '@id'},
    url2: {'@id': 'ex:2', '@type': '@id'},
    url3: {'@id': 'ex:3', '@type': '@id'},
    url4: {'@id': 'http://ex.com/4', '@type': '@id'}
  };

  var x = {
    a: 'http://ex.com/',
    b: { x: 1, url1: 'a' },
    url1: 'aa',
    url2: ['a', 'b', 'c'],
    url3: [ { a: 1, url1: 'a'} ],
    url4: {
      x: 1,
      url1: {
        url2: 'a',
        url3: ['a', 'b', {a: 'v', b: ['a', 'b']}]
      }
    }
  };
  
  
  it('should urlify values', function(){
    var obj = jsonldHtmlView.urlifyValues(clone(x), ctx);

    var expected = { 
      a: '<a href=\'http://ex.com/\'>http://ex.com/</a>',
      b: { x: 1, url1: '<a href=\'http://base.com/a\'>http://base.com/a</a>' },
      url1: '<a href=\'http://base.com/aa\'>http://base.com/aa</a>',
      url2: [
        '<a href=\'http://base.com/a\'>http://base.com/a</a>',
        '<a href=\'http://base.com/b\'>http://base.com/b</a>',
        '<a href=\'http://base.com/c\'>http://base.com/c</a>' 
      ],
      url3: [ { a: 1, url1: '<a href=\'http://base.com/a\'>http://base.com/a</a>' } ],
      url4: {
        x: 1,
        url1: {
          url2: '<a href=\'http://base.com/a\'>http://base.com/a</a>',
          url3: [
            '<a href=\'http://base.com/a\'>http://base.com/a</a>',
            '<a href=\'http://base.com/b\'>http://base.com/b</a>',
            { a: '<a href=\'http://base.com/v\'>http://base.com/v</a>',
              b: [ 
                '<a href=\'http://base.com/a\'>http://base.com/a</a>',
                '<a href=\'http://base.com/b\'>http://base.com/b</a>'
              ] 
            } 
          ] 
        }
      }
    };

    assert.deepEqual(obj, expected);
  });

  it('should urlify keys of a JSON string', function(){
    var s = jsonldHtmlView.urlifyKeys(JSON.stringify(x, null, 2), ctx);

    var expected = [
      '<a href=\'http://ex.com/1\'>url1</a>',
      '<a href=\'http://ex.com/2\'>url2</a>',
      '<a href=\'http://ex.com/3\'>url3</a>',
      '<a href=\'http://ex.com/4\'>url4</a>',
      '<a href=\'http://ex.com/a\'>a</a>',
      '<a href=\'http://ex.com/b\'>b</a>' 
    ];
    
    assert.deepEqual(Object.keys(JSON.parse(s)).sort(), expected);
  });
  
});
