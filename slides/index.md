# Data Binding [R]evolution

[leobalter](http://twitter.com/leobalter) @ BrazilJS 2014

---

> Data binding is the process that establishes a connection between the application UI and business logic.

---

> **the underlying data will reflect that change.**

---

## Evolution on TC-39

### ES6 and ES7

```js
y = "Well, you know We all want to change the world"
[
   "You say you want a revolution",
   "You tell me that it's evolution"
].map( x => x + "\n " + y ).join( "\n" );
```

---

## Function.prototype.bind

- Creates a bound function with the first given argument as its context
- The following arguments are prepended to the bound function when invoked
- PhantomJS still [doesn't support it](http://kangax.github.io/compat-table/es5/).

```js
function getX() {
	return this.x;
}

var coord = { x: 2 };

coordX = getX.bind( coord );

coordX(); // 2
```

---

## Some ES5 data features already

### [Object.freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)

### [Object.seal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal)

### [Object.preventExtensions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions)

---

## Object.preventExtensions

- prevents new properties from ever being added to an object

---

## Object.preventExtensions

```js
var obj = {
	foo: "bar"
};

Object.preventExtensions( obj );

// You can change prop values
obj.foo = "quux";

// But can't add a new properties
obj.quaxxor = "the friendly duck";

// you can still delete properties
delete obj.foo;

```

---

# Object.seal

- seals an object, preventing new properties from being added to it
- marking all existing properties as non-configurable.
- values of present properties can still be changed as long as they are writable.

---

## Object.seal

```js
var obj = {
	foo: "bar"
};

Object.seal( obj );

// You can still change prop values
obj.foo = "quux";

// But can't add a new properties
obj.quaxxor = "the friendly duck";

// non-configurable doesn't allow to delete properties
delete obj.foo;

console.log( obj ); // Object { foo: "quux" }
```

---

# Object.freeze

- prevents new properties from being added to it
- prevents existing properties from being removed
- and prevents existing properties, or their enumerability, configurability, or writability, from being changed

In essence the object is made effectively **immutable**.

---

## Object.freeze

```js
var obj = {
  foo: "bar"
};

Object.freeze(obj);

// silently does nothing
obj.foo = "quux";
obj.quaxxor = "the friendly duck";

(function() {
	"use strict";
	obj.foo = "qux"; // throws an Error
})();
```

---

# Why immutable?

Immutable data cannot be changed once created, leading to much simpler application development and enabling techniques from functional programming such as lazy evaluation.

.right-column[
	```
    But when you talk about destruction
    Don't you know that you can count me out
    Don't you know it's gonna be all right?
    All right, all right
	```
]

.footnote[[Immutable.JS](https://github.com/facebook/immutable-js)]

---

## Data binding frameworks are coming


*[React](https://facebook.github.io/react/) implements one-way reactive data flow*

[AngularJS](https://angularjs.org/): "*HTML is great for declaring static documents, but it falters when we try to use it for **declaring dynamic views** in web-applications*"

*[Backbone.js](http://backbonejs.org/) gives structure to web applications by *providing models with key-value binding* (...)*

---

# [way.js](https://github.com/gwendall/way.js)

Simple, lightweight, persistent, framework-agnostic two-way databinding Javascript library (with no to little JS code to write).

http://gwendall.github.io/way/

---

# The [TodoMVC](http://todomvc.com/) revolution

.right-column[
	```
	You say you got a real solution
	Well, you know
	We'd all love to see the plan
	```
]

---

# ES6 [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

> [intercept operations intended for the target object *](http://www.nczonline.net/blog/2014/04/22/creating-defensive-objects-with-es6-proxies/)

Through a proxy object you can intercept and implement custom handling on all operations on its properties.

```js
var proxObj = new Proxy( obj, handler );
```

.footnote.right[\* [Nicholas C. Zakas](https://twitter.com/slicknet)]

---

```js
obj = { foo: 10 };
proxObj = new Proxy( obj, {
    get: function( target, prop ) {
        if ( prop in target ) {
            return target[ property ];
        } else {
            throw new ReferenceError(
				"Property \"" + prop +
				"\" does not exist."
			);
        }
    }
});

console.log( obj.bar ); // undefined
console.log( proxObj.bar ); // Ref error

```

---

# It's a trap! *

The Proxy handler object contains traps that are methods that provide property access.

Most common are the `get` and `set` traps.

```js
proxObj.foo // triggers the get trap

proxObj.foo = "bar" // triggers the set trap
```

.footnote[\* Admiral Ackbar]

---

```js
obj = { foo: 10 };
proxObj = new Proxy( obj, {
  get: function( t, prop ) {
    console.log( "get: " + prop + " value" );
  },
  set: function( t, prop, value ) {
    console.log(
      "set: " + prop + " new value: " + value
    );
  }
});

proxObj.foo; // get: foo value

proxObj.foo = "bar"; // set: foo new value: bar
```

---

# More traps

.left-column[
- set, get
- defineProperty
- deleteProperty
- preventExtensions
- has
- enumerate
- apply
- construct
- getOwnPropertyDescriptor
- ownKeys
]

---

## Schrödinger's proxy

```js
var cat = { alive: true };

console.log( "alive" in cat ); // true
console.log( cat.alive ); // true

var box = new Proxy( cat, {
  get: function() {
    return !!(Math.floor(Math.random() * 10) % 2);
  },
  has: function() {
    return undefined;
  }
});

console.log( "alive" in box ); // you can't tell
console.log( box.alive ); // chance
```

---

Nicholas C. Zakas also introduced the [defensive pattern](http://www.nczonline.net/blog/2014/04/22/creating-defensive-objects-with-es6-proxies/)

```js
function createDefensiveObject(target) {
  var obj = new Proxy(target, {
    get: function(target, property) {
      if (property in target) {
        return target[property];
      } else {
        throw new ReferenceError("Property \"" +
          property + "\" does not exist.");
      }
    }
  });

  Object.preventExtensions(obj); // trully defensive

  return obj;
}
```

---

### that can be used to implement defensive objects:

```js
function Person( name ) {
    this.name = name;

    return createDefensiveObject( this );
}

var person = new Person( "Nicholas" );

console.log( person.age ); // Error!
```

but you can still get the instance identity
```js
console.log( person instanceof Person ); // true
```

---

# ES7 Object.observe

## A revolution is coming. [*](http://www.html5rocks.com/en/tutorials/es7/observe/)

```js
Object.observe( object, changesCallback );
```

.footnote.right[\* [Addy Osmani](https://twitter.com/addyosmani)]

---

```js
// Let's say we have a model with data
var model = {};

// Which we then observe
Object.observe(model, function(changes){

   // This asynchronous callback runs
   changes.forEach(function(change) {

      // Letting us know what changed
      console.log(
         change.type, change.name, change.oldValue
      );
   });
});

model.title = "BrazilJS"; // add title undefined
model.title = "bjs2014"; // update title BrazilJS
```

---

# Proxy !== O.o

> Object.observe doesn't create another object to place **property traps** as Proxy does

---

# Proxy !== O.o

> Object.observe doesn't create another object to place property traps as Proxy does, instead it just **observe an object**

---

# Proxy !== O.o

> Object.observe doesn't create another object to place property traps as Proxy does, instead it just observe an object and **register changes in an object**.

---

# [Code something](https://github.com/leobalter/data-binding-watch)

.right-column[
```
You ask me for a contribution
Well, you know
We're all doing what we can
```
]

---

# Frameworks today

*Various JavaScript **frameworks offer workarounds** that developers can use to get a WYSIWYG (What You See Is What You Get) display based on exactly what their app is doing. But these workarounds add more code that can slow the app down, alter the flow of its execution and potentially introduce new bugs.*

*Object.observe() would simplify the problem by creating a direct pipeline between an app's data structures and its display. It can do this more easily because it's an actual change baked into the structure of the JavaScript language itself, and **not just a collection of bolted-on code**.*

.footnote[
[Why Javascript Developers Should Get Excited About Object.observe()](http://readwrite.com/2014/07/24/object-observe-javascript-api-impact) by [Lauren Orsini](http://readwrite.com/author/lauren-orsini)
]

---

# Frameworks today

*Data-binding is particularly useful when you have a complex user-interface where you need to wire up relationships between multiple properties in your data models with multiple elements in your views. This is pretty common in the single-page applications we’re building today.*

.foonote[
[Data-binding Revolutions with Object.observe()](http://www.html5rocks.com/en/tutorials/es7/observe/#toc-importance) by [Addy Osmani](https://twitter.com/addyosmani)
]

---

# Dirty checking

## Every time you change your model, the framework/library does a checking to see what changed.

### Object Wrappers can also be included to serve objects as a listener.

---

# Gotchas

## Object.observe is still a proposal on TC-39 to the ES7.

### It will be probably landed

## not guaranteed with the same implementation as today

---

# More gotchas

## [ES6 Proxy](http://kangax.github.io/compat-table/es6/) is implemented only on Firefox

## [ES7 Object.observe](http://kangax.github.io/compat-table/es7/) is only on Chrome

## [Traceur](https://github.com/google/traceur-compiler) doesn't support any of them.

PhantomJS doesn't even support Function#bind. No pressure.

---

# So what should I do?

## You can play, you can experiment, you should give it a try

.right-column[
```
But if you want money
For people with minds that hate
All I can tell is brother you have to wait
Don't you know it's gonna be all right?
All right, all right
```
]

---

# Performance

## Native data binding is [much faster](https://mail.mozilla.org/pipermail/es-discuss/2012-September/024978.html).

### Angular became 20x-40x faster on raw tests while using Object.observe

---

# Polyfills

## [Polymer's Observe-js](https://github.com/Polymer/observe-js)

No known Proxy polyfill yet, just some dirty checking libraries around.

.right-column[
```
You say you'll change the constitution
Well, you know
We all want to change your head
You tell me it's the institution
Well, you know
You better free you mind instead
```
]

---

# Don't you know it's gonna be all right?

.footnote.right[
## leobalter @ [Twitter](https://twitter.com/leobalter)/[Github](https://github.com/leobalter)
]
