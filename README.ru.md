#MSelectDialogBox - jQuery плагин для интерактивных выпадающих списков.

Возможности
----------------------------------
- Множественный выбор
- События
- Автопоиск варинтов из списка при наборе
- Собственные фильтры автопоиска. Например для исправления раскладки с англ. на рус.
- Можно привязать к любому элементу
- Адаптировано под мобильные устройства
- API предлагает возможность кастомизировать контрол (см. [демо](https://eugenegantz.github.io/MSelectDialogBox/examples/example-1.html))
- Подписи на двух языках (Английский, Русский).
Возможность переопределять подписи на встроенных языках и доопределять подписи для других языков.

#### [Демо](https://eugenegantz.github.io/MSelectDialogBox/examples/example-1.html) ####
#### [Скачать MSelectDialogBox.js](https://raw.githubusercontent.com/eugenegantz/MSelectDialogBox/master/dist/m-select-d-box.js) ####
#### [Скачать MSelectDBox.min.js](https://raw.githubusercontent.com/eugenegantz/MSelectDialogBox/master/dist/m-select-d-box.min.js) ####
#### [JSDoc документация (подробное API)](https://github.com/eugenegantz/MSelectDialogBox/blob/master/docs/m-select-d-box.md) ####

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
$("#selector").mSelectDBox(
	"set",
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

* [Boolean] `multiple` - вкл. (true) или выкл (false) множественный выбор из списка.
По-умолчанию: false.


* [Boolean] `autoComplete` - вкл (true) или выкл (false) автопоиск по списку. Только если список прикреплен к текстовому \<input\> или \<textarea\>.
По-умолчанию: false.

* [Boolean] `openOnFocus` - вкл (true) или выкл (false) открытие выпадающего списка по событию onFocus на элементе.
Default: true.

* [String] `name` - используется для поиска по имени инициализированного экземпляра списка (см. методы).
По-умолчанию: undefined.

* [Array] `optionFilters` - фильтры для автопоиска. Переключение на русскую раскладку по-умолчанию не включено.
По-умолчанию: `[$.prototype.mSelectDBox.prototype.defaultOptionFilters.default]`

* [Boolean] `embeddedInput` - вкл. (true) или выкл. (false) поле для ввода внутри выпадающего списка.
По-умолчанию = false

* [String] `width` - ширина выпадающего списка. Пример: `"10px"` or `"auto"`

* [Number] `zIndex` - значения для свойства стиля `z-index` выпадающего списка

* [String] `language` - установить язык для экземпляра списка (en | ru)

Фильтры автопоиска
----------------------------------
Фильтр - Функция.
Составляющая автопоиска.
Сравнивает каждый пункт списка со значением ввода.
Возвращает `true` если удовлетворяет условию поиска, `false` если нет.

Пример такой функции:
~~~~~ javascript
/**
* @param {String} inputString
* @param {String | Number} optionString
*/
function(inputString, optionString){
	var pattern = new RegExp(inputString.trim(),"ig");
	optionString = String(optionString);
	return Boolean(optionString.match(pattern));
}
~~~~~

Передаются через конструктор при создании экземпляра (парам. "optionFilters"). Или добавляются после инициализации через `instance.get("optionFilters").push(function(matcherStr, matchedStr){...})`

Из коробки доступны фильтры:
* `$.prototype.mSelectDBox.prototype.defaultOptionFilters.default` - поиск по-умолчанию
* `$.prototype.mSelectDBox.prototype.defaultOptionFilters.russianKeyboard` - поиск с исправлением раскладки на русскую

Языковая поддержка
----------------------------------
Язык выпадающего списка устанавливается в конструкторе ключем `language`

Если язык не указан, библиотека попробует определить язык по настройкам операционной системы.

Предустановленные ключи language:
* en - Английский
* ru - Русский

Пример:
~~~~~ javascript
$("#selector").mSelectDBox({
	"list": [1, 2, 3],
	"language": "en" // Английский
});
~~~~~

Чтобы доопределить или переопределить подписи для конкретного языка можно использовать метод `setText`
~~~~~ javascript
// Уже инициализированный экземпляр списка
$("#selector").mSelectDBox("setText", "Tap to close", ".m-select-d-box-fade__outside-click-label-text", "en");
~~~~~

Тот же способ если необходимо доопределить язык невходящий в комплект
~~~~~ javascript
// Уже инициализированный экземпляр списка
$("#selector").mSelectDBox("setText", "kapatmak için dokunun", ".m-select-d-box-fade__outside-click-label-text", "tr"); // Турецкий
~~~~~

Коды подписей:
* `.m-select-d-box-fade__outside-click-label-text` - "Нажмите чтобы закрыть"
* `.m-select-d-box__search-input` - поле поиска

События
----------------------------------
* `init` - Выполняется после инициализации списка

* `onselect` - Выполняется когда выбран элемент из списка

* `onchange` - Выполняется когда \<input\> был изменен. Аналог оригинального события onchange

* `onkeydown` - То же что оригинальный onkeydown

* `onkeyup` - То же что оригинальный onkeyup

* `input:empty` - Выполняется когда \<input\> становится пустым

* `autocomplete:empty` - выполняется когда функция автозаполнения (живой поиск) не находит совпадений и возвращает пустой список

* `autocomplete:not-empty` - выполняется когда функция автозаполнения (живой поиск) находит совпадения

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
### .getInstances() ###
`getInstances([Object] arg)` — поиск по имени инициализированных экземпляров списка.
Возвращает массив подходящих экземпляров списка.

Пример:
```
var dbox = $.prototype.mSelectDBox.prototype.getInstances({"name":"instanceName"});
```

Альтернатива:
```
var dbox = $("#selector").mSelectDBox();
```
----------------------------------
Следующие методы можно вызывать как методы экземпляра так и в качестве параметра для метода mSelectDBox.
```
var dbox = $.prototype.mSelectDBox.prototype.getInstances({"name":"instanceName"})[0];
dbox.method(...);
```

Альтернатива:
```
$("#selector").mSelectDBox("method", ...);
```

### .on() ###
`on([String] eventName, [Function] callback)`, `.("on", [String] eventName, [Function] callback)` — устанавливает событие с указанным именем.

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

Альтернатива:
~~~~~ javascript
$("#selector").mSelectDBox(
	"on",
	"select",
	function(msdbContext, event){
		console.log(arguments);
    }
);
~~~~~

### .trigger() ###
`trigger([String] eventName)`, `.("trigger", [String] eventName)` — запускает указанное событие. (Если оно разумеется заранее установлено)

Пример:
~~~~~ javascript
var dbox = $.prototype.mSelectDBox.prototype.getInstances({"name":"instanceName"})[0];
dbox.trigger("select");
~~~~~

Альтернатива:
~~~~~ javascript
$("#selector").mSelectDBox("trigger","select");
~~~~~

### .select() ###
`select([Object] arg)`, `.("select", [Object] arg)` — выделяет из списка элемент по указанному имени или значению.

`arg = {"label": Array|String};` или `arg = {"value": Array|String};`

Пример:
~~~~~ javascript
var dbox = $.prototype.mSelectDBox.prototype.getInstances({"name":"instanceName"})[0];
dbox.select({"label": ["100", "200"]});
dbox.select({"label": "100"});
dbox.select({"value": "0"});
~~~~~

Альтернатива:
~~~~~ javascript
$("#selector").mSelectDBox("select",{"label": ["100", "200"]});
~~~~~

### .getSelectedLabels() ###
Возвращает массив названий (label) выбранных элементов списка
~~~~~ javascript
var array = $("#selector").mSelectDBox("getSelectedLabels");
~~~~~

Альтернатива:
~~~~~ javascript
var array = $("#selector").mSelectDBox().getSelectedLabels();
~~~~~

### .getSelectedValues() ###
Возвращает массив значений (value) выбранных элементов списка
~~~~~ javascript
var array = $("#selector").mSelectDBox("getSelectedValues");
~~~~~

Альтернатива:
~~~~~ javascript
var array = $("#selector").mSelectDBox().getSelectedValues();
~~~~~

### .selectAll() ###
`selectAll(void)` — выбрать все элементы из списка. Только если multiple = true.

### .deselectAll() ###
`deselectAll(void)`

### .open() ###
`open(void)` — показать список.

### .close() ###
`close(void)` — скрыть список.

### .isActive() ###
`isActive(void)` — возвращает true если список активен (не скрыт).

### .get() ###
`get([String] key)` — получить свойство экземпляра MSelectDBox (в том числе параметры конструктора)

### .set() ###
`set([String] key, [Any] value)` — обновить, устанавить новое свойство экземпляра MSelectDBox

TODO
--------------------------------------
- Группы
- README.MD
