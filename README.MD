#MSelectDBox - jQuery plugin for interactive dropdown lists.

#Features
--------------------------------------
- Multiselect
- Events
- Autocomplete
- Could be attached to any target element

#Example
--------------------------------------
```
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
```

#Argument's options
--------------------------------------
####list (Array)####
Array of list items.
Where list items should be:
- Object with two strings properties: value, label. 

Example:

`var list = [{"label": "Apple", "value": "0"},  {"label": "Orange", "value": "1"},  {"label": "banana", "value": "2"}];`
- String

Example:

`var list = ["Apple", "Orange", "Banana"];`
	
####multiple (Boolean)####
Enable or disable multiple selection of list items.

Default: false.


####autoComplete (Boolean)####
Only if target element is text input or textarea. 

Enable or disable auto compelete.

Default: false.


####name (String)####
Name of instance. Uses for search initialized instance by name;

Default: undefined


#Events
--------------------------------------
####onselect####
Fires when list item is selected


####onchange####
Fires when text input was changed


####onkeydown####
Same as original onkeydown event


####onkeyup####
Same as original onkeyup event


####input:empty####
Fires when text input become empty


####focus####


####focusout####
Same as blur

--------------------------------------

Events may be attached in two ways.

Example:
```
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
```

Example:
```
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
```

#Methods
--------------------------------------
####getInstances(Object arg)####
Search initialized instances by name.
Return array of matched instances.

Example:
```
var dbox = $.prototype.mSelectDBox.prototype.getInstaces({"name":"instanceName"});
```

####trigger(String eventName)####
Fires predefined event.

Example:
```
var dbox = $.prototype.mSelectDBox.prototype.getInstaces({"name":"instanceName"})[0];
dbox.trigger("select");
```

####on(String eventName, Function callback)####
Add custom event listener.

Example:
```
var dbox = $.prototype.mSelectDBox.prototype.getInstaces({"name":"instanceName"})[0];
dbox.on(
	"select", 
	function(msdbContext, event){
		console.log(arguments);
	}
);
```

####select(Object arg)####
Select list items by value or label.

`arg = {"label": Array|String};`

or

`arg = {"value": Array|String};`

Example:
```
var dbox = $.prototype.mSelectDBox.prototype.getInstaces({"name":"instanceName"})[0];
dbox.select({"label": ["100", "200"]});
dbox.select({"label": "100"});
dbox.select({"value": "0"});
```

####selectAll(void)####
Only if multiple = true.

####deselectAll(void)####

####open(void)####
Show list box.

####close(void)####
Hide list box.

####isActive(void)####
Return true if list box is visible.

####get(String key)####
Returns property of MSelectDBox instance

####set(String key, Any value)####
Sets new or update property of MSelectDBox instance

#TODO
--------------------------------------
- Groups
- Changable appearence
- README.MD