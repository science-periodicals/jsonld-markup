jsonld-markup
=============

Pretty print [JSON-LD](http://json-ld.org/) to HTML, adding hyperlinks to the keys (from the
JSON-LD context).

jsonld-markup is adapted from
[json-markup](https://github.com/mafintosh/json-markup).


```
var code = document.querySelector('code');
var data = JSON.parse(code.textContent.trim());
code.innerHTML = jsonldMarkup(data, {'@vocab': "http://schema.org/"})
```

Note: a context must be specified (this module won't fetch an existing
context).

License
=======

Apache 2.0
