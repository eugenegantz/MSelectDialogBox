#MSelectDBox - jQuery plugin for interactive dropdown lists.

Features
----------------------------------
- Multiselect
- Events
- Autocomplete
- Custom function of autocomplete filter. Example: correction of keyboard language layout
- Could be attached to any target element

###[Demo](http://eugenegantz.ru/demo/MSelectDBox/example.html)###

Example
----------------------------------
~~~~~ javascript
$("#selector").mSelectDBox({
	"list": (function(){
		var arr = [];
		for(var c=0; c<30; c++){
			arr.push(Math.round(Math.random() * 10000));
		}
		return arr;
	})(),
	"multiple": false,
	"autoComplete": true,
	"name": "a"
});
~~~~~

Constructor arguments
----------------------------------
Passing as single object with keys:

* [Array] `list` - where list items may be key-value object with two string type properties `{label:String(1),value:String(1)}` or string

Example:
```
var list = [
	{"label": "Apple", "value": "0"},
	{"label": "Orange", "value": "1"},
	{"label": "Banana", "value": "2"}
];
```

Example:
```
var list = ["Apple", "Orange", "Banana"];
```

if need after initialization you can reassign the list by assigning a new array through a "set" method.
Example:
~~~~~ javascript
var instance = $.prototype.mSelectDBox.prototype.getInstances({"name":"instanceName"})[0];
instance.set(
	"list",
	[
		"alpha",
		"beta",
		"gamma",
		"delta",
		"epsilon"
	]
);
~~~~~
	
* [Boolean] `multiple` - enable or disable multiple selection of items in list.
Default: false.


* [Boolean] `autoComplete` - enable or disable auto compelete. Only if target element is text input or textarea.
Default: false.


* [String] `name` - name of instance. Used for search initialized instance by name.
Default: undefined


* [Array] `optionFilters` - autocomplete filters.
Default: `[$.prototype.mSelectDBox.prototype.defaultOptionFilters.default]`

Events
----------------------------------
* `onselect` - fires when list item is selected

* `onchange` - fires when text input was changed

* `onkeydown` - same as original onkeydown event

* `onkeyup` - same as original onkeyup event

* `input:empty` - fires when text input become empty

* `focus` - you know... focus

* `focusout` - same as blur

* `set` - Fires when calling set method. Example: instance.set("fieldName", 100);

* `set:field` - Fires when calling "set" method with specified key. Example: instance.set("field", 100);

* `get` - Fires when calling "get" method. Example: instance.get("fieldName");

* `get:field` -  Fires when calling "get" method with specified key. Example: instance.get("field", 100);

* `afterSet:field` - Fires after "get" method was called with specified key. The event ensures that the function will be executed after the assignment and will have access to new value;

* `beforeSet:field` - Fires before "get" method will be called with specified key.

--------------------------------------

Events may be attached in two ways:

Example:
~~~~~ javascript
$("#selector").mSelectDBox({
	"list": [1,2,3],
	"onchange": function(msdbContext, event){
		console.log(arguments);
	},
	"onselect": function(msdbContext, event){
		console.log(arguments);
	},
	"input:empty": function(msdbContext, event){
		console.log(arguments);
	}
});
~~~~~

Example:
~~~~~ javascript
$("#selector").mSelectDBox({
	"list": [1,2,3],
	"events": {
		"change": function(msdbContext, event){
			console.log(arguments);
		},
		"select": function(msdbContext, event){
			console.log(arguments);
		},
		"input:empty": function(msdbContext, event){
			console.log(arguments);
		}
	}
});
~~~~~ 

Autocomplete filters
----------------------------------
Filter it's function. Part of autocomplete module.
It compares each element of the list with the value of input.
Returns `true` if it meets the search condition,`false` otherwise.

Example:
~~~~~ javascript
function([String] matcher, [String] matched){
	if (
		typeof matcher != "string"
		|| typeof matched != "string"
	){
		return false;
	}

	var pattern = new RegExp(matcher.toLowerCase().trim());
	matched = matched.toString().toLowerCase();

	return Boolean(matched.match(pattern));
}
~~~~~

Passing through constructor (param. "optionFilters"). Or may be added after initialization `instance.get("optionFilters").push(function(matcherStr, matchedStr){...})`
Filters available by default:
* `$.prototype.mSelectDBox.prototype.defaultOptionFilters.default` - default autocomplete filter
* `$.prototype.mSelectDBox.prototype.defaultOptionFilters.russianKeyboard` - correcting layout to russian keyboard

Methods
----------------------------------
* `getInstances([Object] arg)`: search initialized instances by name.
Return array of matched instances.

Example:
```
var dbox = $.prototype.mSelectDBox.prototype.getInstances({"name":"instanceName"});
```

* `trigger([String] eventName)`: fire predefined event.

Example:
~~~~~ javascript
var dbox = $.prototype.mSelectDBox.prototype.getInstances({"name":"instanceName"})[0];
dbox.trigger("select");
~~~~~

* `on([String] eventName, [Function] callback)`: add custom event listener.

Example:
~~~~~ javascript
var dbox = $.prototype.mSelectDBox.prototype.getInstances({"name":"instanceName"})[0];
dbox.on(
	"select", 
	function(msdbContext, event){
		console.log(arguments);
	}
);
~~~~~

* `select([Object] arg)`: select list items by value or label.

`arg = {"label": Array|String};`

or

`arg = {"value": Array|String};`

Example:
~~~~~ javascript
var dbox = $.prototype.mSelectDBox.prototype.getInstances({"name":"instanceName"})[0];
dbox.select({"label": ["100", "200"]});
dbox.select({"label": "100"});
dbox.select({"value": "0"});
~~~~~

* `selectAll(void)`: select all list items. Only if multiple = true.

* `deselectAll(void)`

* `open(void)`: show list box.

* `close(void)`: hide list box.

* `isActive(void)`: return true if list box is visible.

* `get([String] key)`: returns property of MSelectDBox instance

* `set([String] key, [Any] value)`: set new or update property of MSelectDBox instance

TODO
--------------------------------------
- Custom events type
- Groups
- Changeable appearance
- README.MD
