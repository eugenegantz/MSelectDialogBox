<a name="MSelectDBox"></a>

## MSelectDBox
**Kind**: global class  
**Author:** Eugene Gantz (EG) <EugenGantz@gmail.com>  

* [MSelectDBox](#MSelectDBox)
    * [new MSelectDBox(arg)](#new_MSelectDBox_new)
    * _instance_
        * [._coldInit](#MSelectDBox+_coldInit)
        * [.get(key, [arg], [e])](#MSelectDBox+get) ⇒ <code>\*</code>
        * [.set(key, [value], [arg], [e])](#MSelectDBox+set) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
        * [.trigger(eventName, e)](#MSelectDBox+trigger)
        * [.on(eventName, fx)](#MSelectDBox+on) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
        * [.detectLanguage()](#MSelectDBox+detectLanguage) ⇒ <code>String</code>
        * [.getText(key, [lang])](#MSelectDBox+getText) ⇒ <code>String</code>
        * [.setText(key, lang, text)](#MSelectDBox+setText) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
        * [._applyLang(lang)](#MSelectDBox+_applyLang)
        * [.calcPosition()](#MSelectDBox+calcPosition)
        * [.calcScrollBarPosition()](#MSelectDBox+calcScrollBarPosition)
        * [.getHoveredItems()](#MSelectDBox+getHoveredItems) ⇒ <code>Array</code>
        * [.getSelectedKeys()](#MSelectDBox+getSelectedKeys) ⇒ <code>Array</code>
        * [.getSelectedValues()](#MSelectDBox+getSelectedValues) ⇒ <code>Array</code>
        * [.getSelectedLabels()](#MSelectDBox+getSelectedLabels) ⇒ <code>Array</code>
        * [.getSelectedItems()](#MSelectDBox+getSelectedItems) ⇒ <code>Array</code>
        * [.hasValue(value)](#MSelectDBox+hasValue) ⇒ <code>Boolean</code>
        * [.hasLabel(label)](#MSelectDBox+hasLabel) ⇒ <code>Boolean</code>
        * [.applySelectedToList([list])](#MSelectDBox+applySelectedToList) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
        * [.applySelectedToInput()](#MSelectDBox+applySelectedToInput) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
        * [.select(arg)](#MSelectDBox+select)
        * [._selectByValue(value, reset)](#MSelectDBox+_selectByValue)
        * [._selectByLabel(label, reset)](#MSelectDBox+_selectByLabel)
        * [.deselect(arg)](#MSelectDBox+deselect)
        * [._deselect(arg)](#MSelectDBox+_deselect)
        * [._deselectByValue(argVal)](#MSelectDBox+_deselectByValue)
        * [._deselectByLabel(argLab)](#MSelectDBox+_deselectByLabel)
        * [._getItemsByID(ids)](#MSelectDBox+_getItemsByID) ⇒ <code>Object</code>
        * [.hideItem(item)](#MSelectDBox+hideItem) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
        * [.unhideItem(item)](#MSelectDBox+unhideItem) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
        * [.unhideAllItems()](#MSelectDBox+unhideAllItems)
        * [.isVisibleItem(item)](#MSelectDBox+isVisibleItem) ⇒ <code>Boolean</code>
        * [.hoverItem(item)](#MSelectDBox+hoverItem) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
        * [.unhoverItem(item)](#MSelectDBox+unhoverItem) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
        * [.unhoverAllItems()](#MSelectDBox+unhoverAllItems) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
        * [.hoverNextVisibleItem(item)](#MSelectDBox+hoverNextVisibleItem) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
        * [.hoverPrevVisibleItem(item)](#MSelectDBox+hoverPrevVisibleItem) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
        * [.getNextVisibleItem()](#MSelectDBox+getNextVisibleItem) ⇒ <code>Object</code> &#124; <code>Object</code> &#124; <code>undefined</code>
        * [.getPrevVisibleItem(item)](#MSelectDBox+getPrevVisibleItem) ⇒ <code>Object</code> &#124; <code>undefined</code>
        * [.selectNextVisibleItem(item)](#MSelectDBox+selectNextVisibleItem) ⇒ <code>Object</code>
        * [.selectPrevVisibleItem(item)](#MSelectDBox+selectPrevVisibleItem) ⇒ <code>Object</code>
        * [.getLastVisibleItem()](#MSelectDBox+getLastVisibleItem) ⇒ <code>Object</code>
        * [.getFirstVisibleItem()](#MSelectDBox+getFirstVisibleItem) ⇒ <code>Object</code>
        * [._selectByID(ids, reset)](#MSelectDBox+_selectByID)
        * [._deselectByID(ids)](#MSelectDBox+_deselectByID)
        * [.applyAutoComplete(value)](#MSelectDBox+applyAutoComplete) ⇒
        * [.deselectAll()](#MSelectDBox+deselectAll) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
        * [.selectAll()](#MSelectDBox+selectAll) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
        * [.isActive()](#MSelectDBox+isActive) ⇒ <code>Boolean</code>
        * [.close()](#MSelectDBox+close) ⇒
        * [.open()](#MSelectDBox+open) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
    * _static_
        * [._globalElems](#MSelectDBox._globalElems)
        * [._globalStyles](#MSelectDBox._globalStyles)
        * [.defaultOptionFilters](#MSelectDBox.defaultOptionFilters)
        * [.getInstances()](#MSelectDBox.getInstances) ⇒ <code>Array</code>
        * [.removeInstances(arg)](#MSelectDBox.removeInstances)

<a name="new_MSelectDBox_new"></a>

### new MSelectDBox(arg)

| Param | Type | Description |
| --- | --- | --- |
| arg | <code>Object</code> |  |
| [arg.name] | <code>String</code> | instance name |
| arg.list | <code>Array</code> | list options |
| [arg.autoComplete] | <code>Boolean</code> |  |
| [arg.multiple] | <code>Boolean</code> |  |
| [arg.zIndex] | <code>Number</code> |  |
| arg.width | <code>String</code> &#124; <code>Number</code> |  |
| [arg.optionFilters] | <code>Array</code> |  |
| arg.freeWrite | <code>Boolean</code> |  |

<a name="MSelectDBox+_coldInit"></a>

### mSelectDBox._coldInit
Индикатор холодной загрузки.После первой загрузки класса становится true

**Kind**: instance property of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+get"></a>

### mSelectDBox.get(key, [arg], [e]) ⇒ <code>\*</code>
Get instance property

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |
| [arg] | <code>Object</code> | optional arguments (deprecated), |
| [e] | <code>Boolean</code> | event trigger on|off. If "false"  then "get" won't trigger event |

<a name="MSelectDBox+set"></a>

### mSelectDBox.set(key, [value], [arg], [e]) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
Set instance property

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> &#124; <code>Object</code> | key or hash of key-value |
| [value] | <code>\*</code> |  |
| [arg] | <code>Object</code> | optional arguments (deprecated), |
| [e] | <code>Boolean</code> | event trigger on|off. If "false"  then "set" won't trigger event |

<a name="MSelectDBox+trigger"></a>

### mSelectDBox.trigger(eventName, e)
Fire specified event

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>String</code> | event name |
| e | <code>Event</code> &#124; <code>Object</code> | event or data object |

<a name="MSelectDBox+on"></a>

### mSelectDBox.on(eventName, fx) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
Attach specified event listener

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>String</code> | event name |
| fx | <code>function</code> | event handler |

<a name="MSelectDBox+detectLanguage"></a>

### mSelectDBox.detectLanguage() ⇒ <code>String</code>
Detect user language

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+getText"></a>

### mSelectDBox.getText(key, [lang]) ⇒ <code>String</code>
Returns text by specified key and language

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> |  |
| [lang] | <code>String</code> | язык выбираемого текста |

<a name="MSelectDBox+setText"></a>

### mSelectDBox.setText(key, lang, text) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
Set text to specified language

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> |  |
| lang | <code>String</code> | language |
| text | <code>String</code> | text key |

<a name="MSelectDBox+_applyLang"></a>

### mSelectDBox._applyLang(lang)
Применяет языковые настройки к глобальным (общим) элементам имеющие подписи

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| lang | <code>String</code> | устанавливаемый язык |

<a name="MSelectDBox+calcPosition"></a>

### mSelectDBox.calcPosition()
Calculate position of list container

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+calcScrollBarPosition"></a>

### mSelectDBox.calcScrollBarPosition()
Calc and apply scrollbar position of list container

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+getHoveredItems"></a>

### mSelectDBox.getHoveredItems() ⇒ <code>Array</code>
Returns hovered options (Array of objects)

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+getSelectedKeys"></a>

### mSelectDBox.getSelectedKeys() ⇒ <code>Array</code>
Return keys of selected options

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+getSelectedValues"></a>

### mSelectDBox.getSelectedValues() ⇒ <code>Array</code>
Return values of selected options

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+getSelectedLabels"></a>

### mSelectDBox.getSelectedLabels() ⇒ <code>Array</code>
Return labels of selected options

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+getSelectedItems"></a>

### mSelectDBox.getSelectedItems() ⇒ <code>Array</code>
Returns selected list options (Array of object)

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+hasValue"></a>

### mSelectDBox.hasValue(value) ⇒ <code>Boolean</code>
Check existence of value in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type |
| --- | --- |
| value | <code>String</code> | 

<a name="MSelectDBox+hasLabel"></a>

### mSelectDBox.hasLabel(label) ⇒ <code>Boolean</code>
Check existence of label in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type |
| --- | --- |
| label | <code>String</code> | 

<a name="MSelectDBox+applySelectedToList"></a>

### mSelectDBox.applySelectedToList([list]) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
Apply selected options to list container

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [list] | <code>Array</code> | in purpose of optimisation (performance) you can use specific list options. By default method uses all list options |

<a name="MSelectDBox+applySelectedToInput"></a>

### mSelectDBox.applySelectedToInput() ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
Apply selected options to control

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+select"></a>

### mSelectDBox.select(arg)
Select specified option in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| arg | <code>Object</code> |  |
| arg.value | <code>String</code> &#124; <code>Array</code> | select by value |
| arg.label | <code>String</code> &#124; <code>Array</code> | select by label |
| arg.id | <code>Number</code> | select by id |
| arg.blank | <code>Boolean</code> | reset previous selected options |

<a name="MSelectDBox+_selectByValue"></a>

### mSelectDBox._selectByValue(value, reset)
Выбрать по значению в списке

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>Array</code> |  |
| reset | <code>Boolean</code> | обнуть ранее выбранные строки |

<a name="MSelectDBox+_selectByLabel"></a>

### mSelectDBox._selectByLabel(label, reset)
Выбрать по названию строки

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
**Access:** protected  

| Param | Type | Description |
| --- | --- | --- |
| label | <code>Array</code> |  |
| reset | <code>Boolean</code> | обнуть ранее выбранные строки |

<a name="MSelectDBox+deselect"></a>

### mSelectDBox.deselect(arg)
Снять выделение с указанного элемента

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| arg | <code>Object</code> |  |
| arg.value | <code>String</code> &#124; <code>Array</code> | deselect by value |
| arg.label | <code>String</code> &#124; <code>Array</code> | deselect by label |
| arg.id | <code>Number</code> &#124; <code>String</code> &#124; <code>Array</code> | deselect by id |

<a name="MSelectDBox+_deselect"></a>

### mSelectDBox._deselect(arg)
Снять выделение

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
**Access:** protected  

| Param | Type |
| --- | --- |
| arg | <code>Object</code> | 
| arg.value | <code>Array</code> &#124; <code>String</code> | 
| arg.label | <code>Array</code> &#124; <code>String</code> | 
| arg.id | <code>Array</code> &#124; <code>String</code> &#124; <code>Number</code> | 

<a name="MSelectDBox+_deselectByValue"></a>

### mSelectDBox._deselectByValue(argVal)
Снять выделение по значению

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
**Access:** protected  

| Param | Type |
| --- | --- |
| argVal | <code>Array</code> &#124; <code>String</code> | 

<a name="MSelectDBox+_deselectByLabel"></a>

### mSelectDBox._deselectByLabel(argLab)
Снять выделение по label строки списка

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
**Access:** protected  

| Param | Type | Description |
| --- | --- | --- |
| argLab | <code>Array</code> &#124; <code>String</code> | заголовки строк списка |

<a name="MSelectDBox+_getItemsByID"></a>

### mSelectDBox._getItemsByID(ids) ⇒ <code>Object</code>
Получить элементы списка по ключам (id)

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
**Access:** protected  

| Param | Type | Description |
| --- | --- | --- |
| ids | <code>Array</code> | ключи списка |

<a name="MSelectDBox+hideItem"></a>

### mSelectDBox.hideItem(item) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
Hide specific list option

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>Object</code> | list option |

<a name="MSelectDBox+unhideItem"></a>

### mSelectDBox.unhideItem(item) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
Make visible specific list option

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>Object</code> | list option |

<a name="MSelectDBox+unhideAllItems"></a>

### mSelectDBox.unhideAllItems()
Make visible all list options

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+isVisibleItem"></a>

### mSelectDBox.isVisibleItem(item) ⇒ <code>Boolean</code>
Check visibility of list option

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>Object</code> | строка в списке |

<a name="MSelectDBox+hoverItem"></a>

### mSelectDBox.hoverItem(item) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
Apply hover to specified option in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>Object</code> | list option |

<a name="MSelectDBox+unhoverItem"></a>

### mSelectDBox.unhoverItem(item) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
Take off hover to specified option in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>Object</code> | list option |

<a name="MSelectDBox+unhoverAllItems"></a>

### mSelectDBox.unhoverAllItems() ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
Take off hover to all options in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+hoverNextVisibleItem"></a>

### mSelectDBox.hoverNextVisibleItem(item) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
Hover next option in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>Object</code> | current (relative) list option |

<a name="MSelectDBox+hoverPrevVisibleItem"></a>

### mSelectDBox.hoverPrevVisibleItem(item) ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
Hover previous option in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>Object</code> | current (relative) list option |

<a name="MSelectDBox+getNextVisibleItem"></a>

### mSelectDBox.getNextVisibleItem() ⇒ <code>Object</code> &#124; <code>Object</code> &#124; <code>undefined</code>
Get next visible option in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
**Returns**: <code>Object</code> - item - current (relative) list option<code>Object</code> &#124; <code>undefined</code>  
<a name="MSelectDBox+getPrevVisibleItem"></a>

### mSelectDBox.getPrevVisibleItem(item) ⇒ <code>Object</code> &#124; <code>undefined</code>
Get previous visible option in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>Object</code> | current (relative) list option |

<a name="MSelectDBox+selectNextVisibleItem"></a>

### mSelectDBox.selectNextVisibleItem(item) ⇒ <code>Object</code>
Select next visible option in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>Object</code> | current (relative) list option |

<a name="MSelectDBox+selectPrevVisibleItem"></a>

### mSelectDBox.selectPrevVisibleItem(item) ⇒ <code>Object</code>
Select previous visible option in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>Object</code> | current (relative) list option |

<a name="MSelectDBox+getLastVisibleItem"></a>

### mSelectDBox.getLastVisibleItem() ⇒ <code>Object</code>
Get last visible option in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+getFirstVisibleItem"></a>

### mSelectDBox.getFirstVisibleItem() ⇒ <code>Object</code>
Get first visible option in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+_selectByID"></a>

### mSelectDBox._selectByID(ids, reset)
Выделяет пункт из списка по ключу. Каждый раз определяет новую выборку.

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
**Access:** protected  

| Param | Type | Description |
| --- | --- | --- |
| ids | <code>Array</code> &#124; <code>Number</code> &#124; <code>String</code> | ключи строк списка |
| reset | <code>Boolean</code> | сбросить уже выбранные строки |

<a name="MSelectDBox+_deselectByID"></a>

### mSelectDBox._deselectByID(ids)
Сниманиет выделение только с указанной выборки, не затрагивая остальные

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
**Access:** protected  

| Param | Type | Description |
| --- | --- | --- |
| ids | <code>Array</code> &#124; <code>Number</code> &#124; <code>String</code> | ключи списка |

<a name="MSelectDBox+applyAutoComplete"></a>

### mSelectDBox.applyAutoComplete(value) ⇒
Apply autocomplete to list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
**Returns**: MSelectDBox  

| Param | Type |
| --- | --- |
| value | <code>String</code> | 

<a name="MSelectDBox+deselectAll"></a>

### mSelectDBox.deselectAll() ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
Deselect all options in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+selectAll"></a>

### mSelectDBox.selectAll() ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
Select all options in list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+isActive"></a>

### mSelectDBox.isActive() ⇒ <code>Boolean</code>
Check visible state of list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox+close"></a>

### mSelectDBox.close() ⇒
Hide list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
**Returns**: MSelectDBox  
<a name="MSelectDBox+open"></a>

### mSelectDBox.open() ⇒ <code>[MSelectDBox](#MSelectDBox)</code>
show list

**Kind**: instance method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox._globalElems"></a>

### MSelectDBox._globalElems
Global elements

**Kind**: static property of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox._globalStyles"></a>

### MSelectDBox._globalStyles
Global styles by selectors

**Kind**: static property of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox.defaultOptionFilters"></a>

### MSelectDBox.defaultOptionFilters
default autoComplete filters

**Kind**: static property of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox.getInstances"></a>

### MSelectDBox.getInstances() ⇒ <code>Array</code>
Return instance of class

**Kind**: static method of <code>[MSelectDBox](#MSelectDBox)</code>  
<a name="MSelectDBox.removeInstances"></a>

### MSelectDBox.removeInstances(arg)
Remove instances

**Kind**: static method of <code>[MSelectDBox](#MSelectDBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| arg | <code>Object</code> | arguments |
| arg.name | <code>String</code> | Instance name // msdb.get("name") |

