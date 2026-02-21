---
title: "JavaScript QuickStart Reference"
date: 2010-06-24T19:57:02+00:00
author: "Erik LaBianca"
draft: false
description: "A quick reference covering JavaScript basics including syntax, functions, JSON, and dynamic evaluation."
categories:
  - Information
---

I wrote this quite some time ago when I had to re-acquaint myself with JavaScript, but never posted it. It's not complete, but it's got some of the basics so I'm going to go ahead and hit publish anyway. Javascript (actually [ECMAScript](http://en.wikipedia.org/wiki/ECMAScript) nowadays) is everywhere. If you've never had to use it, you've somehow managed to avoid writing any modern web apps. The good thing is, it's really very simple! A few things you should know before getting started:

1. JavaScript uses (more or less) the standard Algol (C-like) syntax, including most C programming constructs.

    ```javascript
    if (myVar == True) { doMyFunction(1, 2); myVar = False; }
    while (myVar == True) { doMyFunction(2,3); myVar = False; }
    for ( var i = 0; i < 10; i++ ) { doMyFunction(i, 2); }
    switch(myVar) {
        case "A": doMyFunction(1, 3);
        case "B": doMyFunction(2, 1);
    }
    ```

2. In JavaScript, functions are "first-class", simply meaning they are objects. As objects, the can be passed around and modified like any other object. This functionality is key to most JavaScript idioms, so make sure you understand it.

    ```javascript
    function doMyFunction(x, y) {
        if (x % 1 != 0)
            throw new TypeError(x + " is not an integer");
      return x * y;
    }

    /*
     * This callback variable probably should be global to be useful!
     * You'll see this idiom a LOT with any sort of AJAX programming
     */
    function setCallBack(callback) {
        var callbackVar = callback;
    }
    ```

3. JavaScript itself does not provide a class library or define any runtime services. This results in JavaScript often looking more complicated than it really is because it's always intertwined with a bunch of weird browser runtime stuff. For instance, the following is probably the easiest way to write a "Hello World" in JavaScript, but note that the document object is provided by the browser!

    ```html
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
    "http://www.w3.org/TR/html4/strict.dtd">
    <html>
      <head><title>simple page</title></head>
      <body>
        <script type="text/javascript">
          document.write('Hello World!');
        </script>
        <noscript>
          <p>Your browser either does not support JavaScript, or you have JavaScript turned off.</p>
        </noscript>
      </body>
    </html>
    ```

4. JavaScript array and object literals form the basis for JavaScript Object Notation or JSON, which is commonly used as a data transport in AJAX applications. The syntax looks like this:

    ```json
    {
        "pos": {
            "x": 5,
            "y": 7
         },
        "name": "JavaScript",
        "numbers": [ "first", "second", "third" ]
    }
    ```

5. JavaScript is a dynamic language. As a dynamic language, you get the "eval" function. Eval opens the door to everything that makes JavaScript powerful, and also most of the possible security holes. Do not eval anything unless you have complete confidence that it is trustworthy code!

    ```javascript
    str = '{ "pos": { "x": 5, "y": 7 } }';
    var myObj = eval(str);
    alert(myObj.pos.x);
    ```
