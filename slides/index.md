# Data Binding [R]evolution

[leobalter](http://twitter.com/leobalter) @ BrazilJS 2014

---

> Data binding is the process that establishes a connection between the application UI and business logic.

---

> **the underlying data will reflect that change.**

---

## ES5: data integrity + meta object programming intrinsics

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

In essence the object's surface is made effectively **immutable**.

???

eg. O.f will not "freeze" a Map instance. It will just make the methods and properties frozen, but the internal [[MapData]] is not frozen.

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

# Customized Properties

### [Object.defineProperty(obj, prop, desc)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
### [Object.defineProperties(obj, props)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties)

---

# Property descriptors

```js
Object.defineProperties(obj, {
  "property1": {
    value: "foo",
    writable: true
  }
}
```

---

# The Immutable way

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

## Evolution on TC-39

### ES6 and ES7

```js
var z, y;
y = "Well, you know We all want to change the world";
z = [
   "You say you want a revolution",
   "You tell me that it's evolution"
].map(x => `${x} \n  ${y} \n`).join("");
```

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

```js
var proxObj = new Proxy( obj, handler );
```

## meta object programming evolves into proxy programming



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

```js
Object.observe( object, changesCallback );
```

## A native, highly optimized implementation on which data binding strategies can be built. [*](http://twitter.com/rwaldron)

.footnote.right[\* [Rick Waldron](http://twitter.com/rwaldron)]

???

Modern web applications are generally built using one of these—primarily for some degree of data-binding, along with additional goodies to simplify the workload.

Note: by default, get/set accessors won’t notify, but you can create custom notifiers, which I will show you below.


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

## Super basic two way data binding example:

```html
<input type="text" id="name" value="">
```

```js
var model = {
  name: { value: "Rick" }
};
var view = {
  name: document.getElementById("name")
};
```
---

```js
Object.keys( model ).forEach(function( key ) {
  Object.observe( model[ key ], function( changes ) {
    changes.forEach(function( record ) {
      view[ key ].value = record.object.value;
    });
  });

  view[ key ].oninput = function( event ) {
    model[ key ].value = event.target.value;
  };

  view[ key ].value = model[ key ].value;
});

```

[Demo](./examples/twoway.html)

---

# Proxy !== O.o

- Proxy implements property traps

???

Object.observe doesn't create another object to place **property traps** as Proxy does

---

# Proxy !== O.o

- Proxy implements property traps
- O.o observers an object properties

???

Object.observe doesn't create another object to place property traps as Proxy does, instead it just **observe an object**

---

# Proxy !== O.o

- Proxy implements property traps
- O.o observers an object properties and register changes

???

Object.observe doesn't create another object to place property traps as Proxy does, instead it just observe an object and **register changes in an object**.

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

- wire up relationships between Objects as **models** and Elements as **views**
- WYSIWYG workarounds
- collection of bolted-on code mostly

.footnote[
Refs:
- [Data-binding Revolutions with Object.observe()](http://www.html5rocks.com/en/tutorials/es7/observe/#toc-importance) by [Addy Osmani](https://twitter.com/addyosmani)
- [Why Javascript Developers Should Get Excited About Object.observe()](http://readwrite.com/2014/07/24/object-observe-javascript-api-impact) by [Lauren Orsini](http://readwrite.com/author/lauren-orsini)
]

???

Addy:

*Data-binding is particularly useful when you have a complex user-interface where you need to wire up relationships between multiple properties in your data models with multiple elements in your views. This is pretty common in the single-page applications we’re building today.*

Lauren:

*Various JavaScript **frameworks offer workarounds** that developers can use to get a WYSIWYG (What You See Is What You Get) display based on exactly what their app is doing. But these workarounds add more code that can slow the app down, alter the flow of its execution and potentially introduce new bugs.*

*Object.observe() would simplify the problem by creating a direct pipeline between an app's data structures and its display. It can do this more easily because it's an actual change baked into the structure of the JavaScript language itself, and **not just a collection of bolted-on code**.*

---

# Dirty checking

## Every time you change your model, the framework/library does a checking to see what changed.

### Object Wrappers can also be included to serve objects as a listener.

---

# Gotchas

## Object.observe is still a proposal on TC-39 to the ES7.

???

it's unlikely that it will change, but devs that chose to use it should also make sure they keep up to date with its progress

---

# More gotchas

## [ES6 Proxy](http://kangax.github.io/compat-table/es6/) is implemented only on Firefox

## [ES7 Object.observe](http://kangax.github.io/compat-table/es7/) is only on Chrome

## [Traceur](https://github.com/google/traceur-compiler) doesn't support any of them.

---

# So what should I do?

## You should play, experiment, and give it a try

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

# The Music Player Demo

## [WIP]

---

# Don't you know it's gonna be all right?

.footnote.right[
## leobalter @ [Twitter](https://twitter.com/leobalter)/[Github](https://github.com/leobalter)
]
