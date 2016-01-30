#MSelectDialogBox - jQuery плагин для интерактивных выпадающих списков.

Возможности
----------------------------------
- Множественный выбор
- События
- Автопоиск варинтов из списка при наборе
- Можно привязать к любому элементу

Пример
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

Параметры конструктора
----------------------------------

После инициализации, работа с параметрами конструктора доступна через методы get и set (см. методы)
Аргумент один, передается как объект с ключами:

* [Array] `list` - массив из объектов с двумя ключами типа "строка" `{label:String(1),value:String(1)}` или просто массив строк

Пример:

	`var list = [
		{"label": "Apple", "value": "0"},
		{"label": "Orange", "value": "1"},
		{"label": "Banana", "value": "2"}
	];`

Пример: `var list = ["Apple", "Orange", "Banana"];`

* [Boolean] `multiple` - вкл. или выкл множественный выбор из списка. (true = включен)
По-умолчанию: false


* [Boolean] `autoComplete` - вкл или выкл автопоиск по списку. Только если список прикреплен к текстовому <input> или <textarea>.
По-умолчанию: false

* [String] `name` - name of instance. Used for search initialized instance by name;
По-умолчанию: undefined


События
----------------------------------
* `onselect` - Выполняется когда выбран элемент из списка

* `onchange` - Выполняется когда <input> был изменен. Аналог оригинального события onchange

* `onkeydown` - то же что оригинальный onkeydown

* `onkeyup` - то же что оригинальный onkeyup

* `input:empty` - Выполняется когда <input> становится пустым

* `focus` - Выполняется когда элемент попадает в фокус

* `focusout` - Выполняется когда элемент теряет фокус

--------------------------------------

События могут быть прикреплены двумя способами:

Пример:
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

Пример:
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

Методы
----------------------------------
* `getInstances([Object] arg)`: поиск по имени инициализированных экземпляров списка.
Возвращает массив подходящих экземпляров списка.

Пример:
```
var dbox = $.prototype.mSelectDBox.prototype.getInstaces({"name":"instanceName"});
```


* `on([String] eventName, [Function] callback)`: устанавливает событие с указанным именем.

Пример:
~~~~~ javascript
var dbox = $.prototype.mSelectDBox.prototype.getInstaces({"name":"instanceName"})[0];
dbox.on(
	"select",
	function(msdbContext, event){
		console.log(arguments);
	}
);
~~~~~


* `trigger([String] eventName)`: запускает указанное событие. (Если оно разумеется заранее установлено)

Пример:
~~~~~ javascript
var dbox = $.prototype.mSelectDBox.prototype.getInstaces({"name":"instanceName"})[0];
dbox.trigger("select");
~~~~~


* `select([Object] arg)`: выделяет из списка элемент по указанному имени или значению.

`arg = {"label": Array|String};` или `arg = {"value": Array|String};`

Пример:
~~~~~ javascript
var dbox = $.prototype.mSelectDBox.prototype.getInstaces({"name":"instanceName"})[0];
dbox.select({"label": ["100", "200"]});
dbox.select({"label": "100"});
dbox.select({"value": "0"});
~~~~~


* `selectAll(void)`: выбрать все элементы из списка. Только если multiple = true.

* `deselectAll(void)`

* `open(void)`: показать список.

* `close(void)`: скрыть список.

* `isActive(void)`: возвращает true если список активен (не скрыт).

* `([String] key)`: получить свойство экземпляра MSelectDBox (в том числе параметры конструктора)

* `set([String] key, [Any] value)`: обновить, устанавить новое свойство экземпляра MSelectDBox

TODO
--------------------------------------
- Группы
- Изменяемый внешний вид
- README.MD
