dom-cssom
=========

Set your CSS with javscript.

A simple example
----------------

The html

```html
<!DOCTYPE html>
<html>
<head>
    <title> test</title>
</head>
<body>
    <div class="test">Hello world</div>
    <div><p class="test2">Hello world</p></div>

    <table>
        <tr></tr>
    </table>
    <script src="code.js"></script>
</body>
</html>
```

The javascript in the *code.js* file.

```javascript
var domCSSOM = require('dom-cssom');

var cssom = domCSSOM();

cssom.add('.test', {
    border: '1px solid black',
    color: 'green'
}).add('div .test2', {
    'background-color': 'red'
}).media('(max-width: 1000px)', function(css){

    cssom.add('.test', {
        'background-color': 'blue'
    });
});
```

Constructor
-----------

### domCSSOM(selector, attributes) -> cssom

This constructor creates a style tag, appends it to the document head, and produces an object you can use to manipulate the styles belonging to that style tag.

The `selector` argument is optional. `selector` is a normal css selector.

The `attributes` argument is optional.

Set attributes to the style tag created by this constructor by passing an object to the `attributes` argument.

Methods
-------

### cssom.add(selector, styles) -> this

`selector` is a normal css selector.

`styles` is an object with style names, and values.

The style names should be the hyphenated kind like you would use in a style sheet.

### cssom.media(query, listener) -> this

Pass a media query string to the `query` argument.

`listener` is required, and should be a function.

You place code to run in the `listener` when the media query passes.

The `media` method works identically to an `@media` in a CSS file.

```javascript
cssom.media('(max-width: 1000px)', function(css){
    //This code runs when the browser is less than 1000 pixels wide.
    cssom.add('.test', {
        'background-color': 'blue'
    });
});
```

The `domCSSOM` instance tracks recent styles set inside it's listener. When the *media* changes to an unmatched state tracked styles are removed.

**Listeners are not automatically removed (except in the destroy method) so make sure to remove them when you don't need them any more.**

**Doing anything asynchronous inside a media listener has the potential to mess up the media query functionality. Just be aware of this in case styles aren't getting added, or removed correctly. The reason for this leaky functionality is the tracking of styles set through the listener relies on the cssRules numbered keys.**

### cssom.mediaRemove(query, listener) -> this

Remove a media listener set with the `media` method.

Works pretty much the same as regular event listeners.

You probably won't have to remove media listeners often as their removal defeats their purpose.

### cssom.find(criteria) -> rules

Find all the rules applied to a selector.

See the section about **Rules** below.

`criteria` can be one of these:

-	string
-	regular expression
-	array

If `criteria` is a string is must equal the selector exactly.

If `criteria` is an array it must have a length of 2, and be a zero based **range**. This **range** corresponds to the style element's **cssRules** object. This works similar to `Array.slice`.

For example:

```javascript
var style = document.querySelector('style'),
    //rangeArray is what you might pass to the find method.
    rangeArray = [2, 4];

for(var i=2; i<4; i++){
    //Print the css rule for the style.
    console.log(style.sheet.cssRules[i]);
}
```

`find` can also be used like `Array.slice` with a start index, and an end index as the second argument. The slice like functionality is not exact. `find` doesn't except negative numbers. If the second number is greater than the length of the `cssRules` the length of the `cssRules` is used instead.

### cssom.remove(criteria) -> rules;

Removes some styles based on `criteria`.

`criteria` is the same as used with the `find` method.

The returned `rules` are the same as returned from the `find` method.

### cssom.removeAll() -> this

This is the same as the `remove` method, but removes all styles.

### cssom.destroy() -> undefined

The nuclear option. Removes all media listeners, and removes the style tag created during instantiation.

The instance of `dom-css` is unusable after a call to `destroy`.

Rules
-----

An array of rules is returned from the `find` method. Each of these rules has these properties:

-	index (The index in the cssRules of the style sheet.)
-	selector (The selector string for the rule.)
-	style (Pretty much the same as a style object on a DOM node.)

You can set styles with a style object that belongs to a rule as well just like the style object found on a DOM node.

Static Properties
-----------------

### domCSSOM.document

Set a custom DOM document implementation. This could be a [jsdom](https://github.com/tmpvar/jsdom) instance.

A Warning
---------

This module uses the CSSOM which is only uniformly supported in the most modern browsers.

About
-----

`dom-css` is an attempt at making unintrustive styling easier.

Using this module is the same as writing embedded styles only with javascript. That is to say that it literally creates an embedded style tag. So use it like you do embedded styles.
