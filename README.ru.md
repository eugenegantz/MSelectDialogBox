#MSelectDialogBox - jQuery плагин для интерактивных выпадающих списков.

Возможности
----------------------------------
- Множественный выбор
- События
- Автопоиск варинтов из списка при наборе
- Собственные фильтры автопоиска. Например для исправления раскладки с англ. на рус.
- Можно привязать к любому элементу

###[Demo](http://eugenegantz.ru/demo/MSelectDBox/example.html)###

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

После инициализации, работа с параметрами конструктора доступна через методы get и set (см. методы).

Аргумент один, передается как объект с ключами:

* [Array] `list` - массив из объектов с двумя ключами типа "строка" `{label:String(1),value:String(1)}` или просто массив строк

Пример:
```
var list = [
	{"label": "Apple", "value": "0"},
	{"label": "Orange", "value": "1"},
	{"label": "Banana", "value": "2"}
];
```

Пример:
```
var list = ["Apple", "Orange", "Banana"];
```

После инициализации, при желании, список можно переназначить присвоив новый массив через "set" метод.
Пример:
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

* [Boolean] `multiple` - вкл. или выкл множественный выбор из списка. (true = включен).
По-умолчанию: false.


* [Boolean] `autoComplete` - вкл или выкл автопоиск по списку. Только если список прикреплен к текстовому \<input\> или \<textarea\>.
По-умолчанию: false.


* [String] `name` - используется для поиска по имени инициализированного экземпляра списка (см. методы).
По-умолчанию: undefined.

* [Array] `optionFilters` - фильтры для автопоиска. Переключение на русскую раскладку по-умолчанию не включено.
По-умолчанию: `[$.prototype.mSelectDBox.prototype.defaultOptionFilters.default]`

Фильтры автопоиска
----------------------------------
Фильтр - Функция.
Составляющая автопоиска.
Сравнивает каждый пункт списка со значением ввода.
Возвращает `true` если удовлетворяет условию поиска, `false` если нет.

Пример такой функции:
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

Передаются через конструктор при создании экземпляра (парам. "optionFilters"). Или добавляются после инициализации через `instance.get("optionFilters").push(function(matcherStr, matchedStr){...})`

Из коробки доступны фильтры:
* `$.prototype.mSelectDBox.prototype.defaultOptionFilters.default` - поиск по-умолчанию
* `$.prototype.mSelectDBox.prototype.defaultOptionFilters.russianKeyboard` - поиск с исправлением раскладки на русскую


События
----------------------------------
* `onselect` - Выполняется когда выбран элемент из списка

* `onchange` - Выполняется когда \<input\> был изменен. Аналог оригинального события onchange

* `onkeydown` - То же что оригинальный onkeydown

* `onkeyup` - То же что оригинальный onkeyup

* `input:empty` - Выполняется когда \<input\> становится пустым

* `focus` - Выполняется когда элемент попадает в фокус

* `focusout` - Выполняется когда элемент теряет фокус

* `set` - Fires при вызове метода set. Кримеру: instance.set("fieldName", 100);

* `set:field` - Выполняется при присваивании значения через метод set по конкретному ключу. К примеру: instance.set("field", 100);

* `get` - Выполняется при вызове метода get. Кримеру: instance.get("fieldName");

* `get:field` - Выполняется при получения значения по конкретному ключу. К примеру: instance.get("field");

* `afterSet:field` - Выполняется после установки значения по конкретному ключу.
Событие гарантирует, что функция будет выполнена после присваивания и будет иметь доступ к новому значению;

* `beforeSet:field` - Выполняется перед установкой значения по конкретному ключу

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
var dbox = $.prototype.mSelectDBox.prototype.getInstances({"name":"instanceName"});
```


* `on([String] eventName, [Function] callback)`: устанавливает событие с указанным именем.

Пример:
~~~~~ javascript
var dbox = $.prototype.mSelectDBox.prototype.getInstances({"name":"instanceName"})[0];
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
var dbox = $.prototype.mSelectDBox.prototype.getInstances({"name":"instanceName"})[0];
dbox.trigger("select");
~~~~~


* `select([Object] arg)`: выделяет из списка элемент по указанному имени или значению.

`arg = {"label": Array|String};` или `arg = {"value": Array|String};`

Пример:
~~~~~ javascript
var dbox = $.prototype.mSelectDBox.prototype.getInstances({"name":"instanceName"})[0];
dbox.select({"label": ["100", "200"]});
dbox.select({"label": "100"});
dbox.select({"value": "0"});
~~~~~


* `selectAll(void)`: выбрать все элементы из списка. Только если multiple = true.

* `deselectAll(void)`

* `open(void)`: показать список.

* `close(void)`: скрыть список.

* `isActive(void)`: возвращает true если список активен (не скрыт).

* `get([String] key)`: получить свойство экземпляра MSelectDBox (в том числе параметры конструктора)

* `set([String] key, [Any] value)`: обновить, устанавить новое свойство экземпляра MSelectDBox

TODO
--------------------------------------
- Собственные типы событий. Сейчас типы событий транслируются из целевых элементов
- Группы
- Изменяемый внешний вид
- README.MD
