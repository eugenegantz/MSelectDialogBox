
	// ========== Диалогбокс ==========

	(function($){

		/**
		 * @author Eugene Gantz (EG) <EugenGantz@gmail.com>
		 * @constructor
		 * @global
		 * @param {Object} arg
		 * @param {String=} arg.name - instance name
		 * @param {Array} arg.list - list options
		 * @param {Boolean=} arg.autoComplete
		 * @param {Boolean=} arg.multiple
		 * @param {Number=} arg.zIndex
		 * @param {String | Number=} arg.width
		 * @param {Array=} arg.optionFilters
		 * @param {Boolean} arg.freeWrite
		 **/
		var MSelectDBox = function(arg){
			this.init(arg);
		};

		MSelectDBox.prototype = {
			"instances": [],

			/**
			 * Индикатор холодной загрузки.
			 * После первой загрузки класса становится true
			 * */
			"_coldInit": 0,


			/**
			 * @param {String} key - key of instance property
			 * @param {Object=} arg - optional arguments,
			 * @param {Boolean=} e - event trigger on|off. If "false"  then "get" won't trigger event
			 * @memberof MSelectDBox
			 * @return {*}
			 * */
			"get" : function(key,arg,e){

				var self = this;

				if (typeof key != "string") return;

				key = key.toLowerCase();

				// .....................

				if (typeof e == "undefined") e = true;

				var eTrigger = function(name){
					if (e){
						self.trigger("get", new $.Event(name));
					}
				};

				// .....................

				eTrigger("get:"+key);

				var aliases = {};

				var methodAliases = {};

				if ( typeof aliases[key] == "string" ) {
					key = aliases[key];
				}

				if ( typeof methodAliases[key] == "function" ) {
					key = methodAliases[key];
					if (typeof this[key] != "function"){
						return;
					}
					if (typeof arg == "undefined") arg = Object.create(null);
					return this[key](arg);
				}

				if ( typeof this._props[key] != "undefined" ) {
					return this._props[key];
				}

			},


			/**
			 * @param {String} key - key of instance property
			 * @param {*} value
			 * @param {Object=} arg - optional arguments,
			 * @param {Boolean=} e - event trigger on|off. If "false"  then "set" won't trigger event
			 * @memberof MSelectDBox
			 * @return {Boolean}
			 * */
			"set" : function(key,value,arg,e){

				var self = this, tmp;

				if (typeof key == "undefined") return false;

				// Множественное присваивание
				if ( typeof key == "object" ){
					var return_ = Object.create(null);
					for(var prop in key){
						if (!key.hasOwnProperty(prop)) continue;
						return_[prop] = this.set(prop, key[prop]);
					}
					return return_;
				}

				if (typeof key != "string") return false;

				key = key.toLowerCase();

				// .....................

				if (typeof e == "undefined") e = true;

				var eTrigger = function(name){
					if (e){
						var ev = new $.Event(name);
						ev.value = value;
						self.trigger("set", ev);
					}
				};

				// .....................

				eTrigger("set:"+key);

				var aliases = {};

				var methodAliases = {};

				if ( typeof aliases[key] == "string" ) {
					key = aliases[key];
				}

				eTrigger("beforeSet:"+key);

				if ( typeof methodAliases[key] == "string" ) {
					key = methodAliases[key];
					if (typeof this[key] != "function"){
						return false;
					}
					if (typeof arg == "undefined") arg = Object.create(null);
					tmp = this[key](value,arg);
					eTrigger("afterSet:"+key);
					return tmp;
				}

				this._props[key] = value;

				eTrigger("afterSet:"+key);

				return true;

			},



			"getInstaces" : function(){
				return this.getInstances.apply(this, arguments);
			},


			/**
			 * @description return instance of class
			 * @memberof MSelectDBox
			 * @return {Array}
			 * */
			"getInstances": function(arg){
				if (!arguments.length) return this.instances;

				if (typeof arg != "object") arg = Object.create(null);

				var name = (  $.inArray(typeof arg.name, ["string","number"]) > -1 ? arg.name : null );

				var tmp = [];
				for(var c=0; c<this.instances.length; c++){
					if (name !== null && this.instances[c].get("name") != name ){
						continue;
					}
					tmp.push(this.instances[c]);
				}
				return tmp;
			},



			/**
			 * @description Remove instances
			 * @param {Object} arg - arguments
			 * @param {String} arg.name - Instance name // msdb.get("name")
			 * @memberof MSelectDBox
			 * */
			"removeInstances": function(arg){
				if (typeof arg != "object"){
					return;
				}
				var name = typeof arg.name != "string" ? null : arg.name;
				var tmp = [];
				for(var c=0; c<this.instances.length; c++){
					if (  this.instances[c].get("name") == name  ){
						$(this.instances[c].get("dbox")).detach();
						continue;
					}
					tmp.push(this.instances[c]);
				}
				this.instances = tmp;
			},


			"_targetEvents": {
				"click": {"name": "click", "event": "click"},
				"keydown": {"name": "keydown", "event": "keydown", "dbox_input": true},
				"keyup": {"name": "keyup", "event": "keyup", "dbox_input": true},
				"hover": {"name": "hover", "event": "hover"},
				"focus": {"name": "focus", "event": "focus"},
				"focusout": {"name": "focusout", "event": "focusout"},
				"change": {"name": "change", "event": "change"}
			},


			/**
			 * @ignore
			 * */
			"_eventCheckInputEmpty": function(e){
				// var target = this.get("target");
				// var list = this.get("list");
				if (
					this.fx.isTextInput(e.target)
					&& !e.target.value.trim()
				) {
					this.trigger("input:empty", e);
				}
			},


			/**
			 * @ignore
			 * */
			"_eventDefaultInputEmpty": function(){
				this.deselectAll();
			},


			/**
			 * @ignore
			 * */
			"_eventDefaultSet": function(){
				this.trigger(arguments[1].type, arguments[1]);
			},


			/**
			 * @ignore
			 * */
			"_eventDefaultGet": function(){
				this.trigger(arguments[1].type, arguments[1]);
			},


			/**
			 * @ignore
			 * */
			"_eventSetList": function(){
				var e = arguments[1];
				this.set("list", e.value, null, false);
				this.reInitList();
			},


			/**
			 * При изм. размера окна происходит пересчет положения и размеров внутри видимых списков
			 * @ignore
			 * */
			"_eventWindowResize": function(){
				for(var c=0; c<this.instances.length; c++){
					if (  this.instances[c].isActive()  ){
						this.instances[c]._calcListContainerHeight();
						this.instances[c].calcPosition();
					}
				}
			},


			/**
			 * @ignore
			 * */
			"_eventDefaultKeyUp": function(e){

				var self						= this;
				var target					= self.get("target");
				var dboxInput			= self.get("dbox_input");
				var keyCode				= e.keyCode;
				var list						= self.get("list");
				var dbox						= self.get("dbox");
				var contextElement		= e.currentTarget;

				var serviceKeyCodes = [37,38,39,40,9,13,18,17,16,20,27];

				// Трансфер строки из target в dbox_input и наоборот
				// ------------------------------------------------------------------------------------
				if (  self._isDBoxInput(e.target)  ){
					if (  self.fx.isTextInput(target)  ) {
						target.value = dboxInput.value;
					}
				} else if (contextElement == target) {
					if (  serviceKeyCodes.indexOf(e.keyCode) == -1  ){
						dboxInput.value = target.value;
					}
				}

				// ------------------------------------------------------------------------------------

				clearTimeout(self._timers.autoComplete);

				self._timers.autoComplete = setTimeout(function(){
					var value, v;

					// ... autoComplete
					if (  self.get("autoComplete")  ){

						// left arrow, up arrow, right arrow, down arrow, tab, enter, alt, ctrl, shift, caps lock, escape
						if (  $.inArray(keyCode, serviceKeyCodes) > -1 ){

						} else {

							var li	= $(".m-select-d-box__list-item", dbox);
							value	= contextElement.value.toLowerCase();
							// value	= self.fx.trim(value,";, ","both");
							value	= self.fx.msplit([';',','],value);
							value = value[value.length-1];

							// var pattern = new RegExp(value.trim());

							for(v=0; v<li.length; v++){
								var msdbid = parseInt(li[v].getAttribute("data-msdbid"));
								var jqLi = $(li[v]);

								if (  !value  ){
									jqLi.removeClass('m-select-d-box__list-item_hidden');

								} else if (
									!self._optionFiltersMatcher(self.get("optionFilters"), value, list[msdbid].label)
								){
									jqLi.addClass('m-select-d-box__list-item_hidden');

								} else {
									jqLi.removeClass('m-select-d-box__list-item_hidden');

								}

								jqLi.removeClass('m-select-d-box__list-item_hover');
							}

							if (  !self._isMobileState()  ){
								self.calcPosition();
							}
						}

					}


					if (  self.get("multiple")  ){

						if (  keyCode == 8  ){
							// keycode 8 - backspace;
							value = self.fx.trim(contextElement.value, " ;,", "both");
							value = self.fx.msplit([";",","],value);

							for(v=0; v<value.length; v++){
								value[v] = value[v].trim();
							}

							for(var prop in list){
								if (!list.hasOwnProperty(prop)) continue;
								list[prop].selected = ($.inArray(list[prop].label.trim(), value)> -1);
							}

							self.applySelectedToList();
							self.applySelectedToInput();
						}

					}

				},500);

			},


			/**
			 * @ignore
			 * */
			"_eventDefaultKeyDownMultipleFalse": function(e){

				var self = this;

				var ul, li, c, L;

				var dbox = self.get("dbox");
				var target = self.get("target");

				// Если список без множественного выделения
				if (  self.get("multiple")  ) return; // close.if.!multiple

				if (  $.inArray(e.keyCode, [37,39,9,18,17,16,20,27]) > -1  ){
					// left, right, tab, alt, ctrl, shift, caps, esc

				} else if ( e.keyCode == 13 ){
					// 13 = Enter

					if (  !self.isActive()  ){
						self.open();
						self._eventFocus.apply(target, [self, e]);

					} else {
						self.close();

					}

				} else if (  $.inArray(e.keyCode, [38,39,40]) > -1 ) {

					// other keys

					if (  !self.isActive()  ) return;

					ul = $("ul", dbox).get(0);

					li = $('li:not(.m-select-d-box__list-item_hidden)', dbox);

					var selectedLi = -1;
					var jqli;

					for(c=0, L=li.length; c<L; c++){
						jqli = $(li[c]);
						if (  jqli.hasClass("m-select-d-box__list-item_selected")  ){
							selectedLi = c;
							break;
						}
					}

					var newSelectedLi;

					if ( e.keyCode == 38 ){
						// up
						newSelectedLi = (  selectedLi - 1 < 0 ? 0 : selectedLi - 1  );
					} else if ( e.keyCode == 40 ){
						// down
						newSelectedLi = (  selectedLi + 1 > li.length - 1 ? li.length - 1 : selectedLi + 1  );
					} else if (e.keyCode == 39){
						return;
					} else {
						return;
					}

					var selectedKey = parseInt(li[newSelectedLi].getAttribute("data-msdbid"));

					self._selectByID(selectedKey);

					self._calcScrollBarPosition();

					self.trigger("select", e);

				} // close.if.keys in [38,39,40]


			},


			/**
			 * @ignore
			 * */
			"_eventDefaultKeyDownMultipleTrue": function(e){

				var self = this, c, L;
				var dbox = self.get("dbox");
				var selectedKey;

				if (  self.get("multiple")  ){
					if (  $.inArray(e.keyCode, [37,39,9,18,17,16,20,27]) > -1  ){
						// left, right, tab, alt, ctrl, shift, caps, esc

					} else if (  e.keyCode == 13  ){
						// Enter
						var hoveredLi = $(".m-select-d-box__list-item_hover",dbox);

						if (  !hoveredLi.length  ) return;

						hoveredLi = hoveredLi.get(0);

						var selectedKeys = self.getSelectedKeys();

						selectedKey = parseInt(hoveredLi.getAttribute('data-msdbid'));

						var tmp = $.inArray(selectedKey, selectedKeys);

						if (  tmp > -1  ){
							selectedKeys[tmp] = null;
						} else {
							selectedKeys.push(selectedKey);
						}

						self._selectByID(selectedKeys);

						self.trigger("select", e);

						return;
					}

					if (  $.inArray(e.keyCode, [38,40]) > -1  ) {
						// up, down

						// var ul = $(".m-select-d-box__list-container", dbox);

						var li = $('.m-select-d-box__list-item:not(.m-select-d-box__list-item_hidden)', dbox);

						hoveredLi = -1;
						var jqli;

						for(c=0, L=li.length; c<L; c++){
							jqli = $(li[c]);
							if (  jqli.hasClass("m-select-d-box__list-item_hover")  ) {
								hoveredLi = c;
							}
						}

						var newHoveredLi;

						if (e.keyCode == 38) {
							// up
							newHoveredLi = (  hoveredLi - 1 < 0 ? 0 : hoveredLi - 1  );
						} else if (e.keyCode == 40) {
							// down
							newHoveredLi = (  hoveredLi + 1 > li.length - 1 ? li.length - 1 : hoveredLi + 1  );
						} else {
							return;
						}

						$(li[newHoveredLi]).addClass("m-select-d-box__list-item_hover");

						if (hoveredLi > -1 && newHoveredLi != hoveredLi){
							$(li[hoveredLi]).removeClass("m-select-d-box__list-item_hover");
						}

						self._calcScrollBarPosition();
					}
				}
			},


			/**
			 * @ignore
			 * */
			"_eventFocus": function(context,e){
				var msdb_value, c, v;

				var self		= this;
				var list		= self.get("list");
				var dbox	= self.get("dbox");

				self.open();

				var contextElement = e.currentTarget || (this instanceof Element ? this : null);

				if (  self.fx.isTextInput(contextElement)  ){
					msdb_value = contextElement.getAttribute('data-msdb-value');
					if ( msdb_value ) msdb_value = msdb_value.trim();

					// Если в инпуте уже есть значения, отметить их в списке как выбранные
					if (!msdb_value){
						var value = self.fx.msplit([',',';'],self.fx.trim(contextElement.value,",; ","both"));
						for(c=0; c<value.length; c++){
							value[c] = value[c].trim();
							for(v=0; v<list.length; v++){
								if (list[v].label == value[c]){
									list[v].selected = true;
								}
							}
						}
					} else {
						msdb_value = self.fx.msplit([',',';'],msdb_value);
						for(c=0; c<msdb_value.length; c++){
							msdb_value[c] = msdb_value[c].trim();
							for(v=0; v<list.length; v++){
								if ( list[v].value == msdb_value[c] ){
									list[v].selected = true;
									break;
								}
							}
						}
					}
				}

				// Все строки
				var dbox_li = $("li",dbox);

				if (dbox_li.length){
					// Снять hover со строки
					dbox_li.removeClass('m-select-d-box__list-item_hidden');
					for (v=0; v<dbox_li.length; v++){
						if (
							(
								typeof contextElement.type != "undefined"
								&& $.inArray(contextElement.type.toLowerCase(), ["submit","button"]) > -1
							)
							|| (  $.inArray(contextElement.tagName.toLowerCase(), ["submit","body","select"]) > -1 )
						){

						} else {
							$(dbox_li[v]).removeClass('m-select-d-box__list-item_hover');
						}
					}
				}

				// Записать value внутри инпута
				if (  !self.get("freeWrite")  ){
					self.applySelectedToInput();
				}

				// Отметить выбранные строки
				self.applySelectedToList();

				// Положение ползунка
				self._calcScrollBarPosition();

				// Пересчет высоты внутри списка
				self._calcListContainerHeight();

				// Запустить событие
				// self.trigger("focus", e);
			},


			/**
			 * @ignore
			 * */
			"_initEvents": function(arg){
				var eventName;

				var body = $("body").get(0);

				var self = this;

				this.events = Object.create(null);

				// ----------------------------------------------------------------

				var tmpEvents = {};

				// События которые передаются в коррне обьекта-параметра
				for(eventName in arg){
					if (!arg.hasOwnProperty(eventName)) continue;
					if (typeof arg[eventName] != "function") continue;
					tmpEvents[eventName.replace(/^on/,'')] = arg[eventName];
				}

				// События которые передаются в обькте events
				for(eventName in arg.events){
					if (!arg.events.hasOwnProperty(eventName)) continue;
					if (typeof arg.events[eventName] != "function") continue;
					tmpEvents[eventName] = arg.events[eventName];
				}

				// Установка событий
				for(eventName in tmpEvents){
					if (!tmpEvents.hasOwnProperty(eventName)) continue;
					this.on(
						eventName,
						tmpEvents[eventName]
					);
				}

				// ----------------------------------------------------------------

				this.on(
					"keyup",
					function(context, e){
						self._eventCheckInputEmpty(e);
					}
				);

				this.on(
					"change",
					function(context, e){
						self._eventCheckInputEmpty(e);
					}
				);

				this.on(
					"input:empty",
					self._eventDefaultInputEmpty
				);

				this.on("focus", self._eventFocus);
				this.on("click", self._eventFocus);

				this.on(
					"focusout",
					function(context, e){
						// Хак для FireFox. В нем нет relatedTarget для focusout
						if (  !e.relatedTarget  ) {
							self._timers.focusoutInputs = setTimeout(
								function(){
									self.close();
								},
								250
							);
							return;
						}

						if (  self._isDBoxInput(e.relatedTarget)  ){
							return;
						}

						if (
							self._isDBoxElement(e.relatedTarget)
							|| self._isTargetElement(e.relatedTarget)
						){
							return;
						}

						self.close();
					}
				);

				// Отменяет таймаут для FF relatedTarget хака
				// Поскольку является частью блока-списка
				$(this.get("dbox_input")).bind("focus", function(){
					clearTimeout(self._timers.focusoutInputs);
				});

				this.on("set",this._eventDefaultSet);
				this.on("get", this._eventDefaultGet);
				this.on("afterSet:list", this._eventSetList);

				// ----------------------------------------------------------------

				// При самой первой инициализации
				if (  self._isColdInit()  ){
					window.addEventListener("resize", self._eventWindowResize.bind(self), false);
				}

				// ----------------------------------------------------------------

			},


			/**
			 * @ignore
			 * */
			"_deactivateInstances": function(e){
				for(var c=0; c<this.instances.length; c++){
					if (
						this.instances[c]._isDBoxElement(e.target)
						|| this.instances[c]._isTargetElement(e.target)
					){
						continue;
					}
					if (  this.instances[c].isActive()  ) this.instances[c].close();
				}
			},


			/**
			 * @ignore
			 * */
			"_initTarget": function(){
				var target = this.get("target");
				var c;

				if (
					target
					&& typeof target == "object"
				) {

					if (typeof target == "string") {
						target = $(target);
						this.set("target", (target.length ? target.get(0) : null));

					} else if (  target instanceof Element  ) {
						this.set("target", target);

					} else if (
						typeof target == "object"
						&& typeof target.push != "undefined"
						|| Array.isArray(target)
					) {
						for (c = 0; c < target.length; c++) {
							if (  target[c] instanceof Element  ){
								this.set("target", target[c]);
								break;
							}
						}
					}

				}
			},


			/**
			 * @description Fire specified event
			 * @param {String} eventName
			 * @param {Event} e - Event object
			 * @memberof MSelectDBox
			 * */
			"trigger": function(eventName, e){

				if (typeof eventName != "string") return;

				eventName = eventName.toLowerCase();

				if (
					typeof this.events[eventName] == "object"
					&& Array.isArray(this.events[eventName])
				){

					if (
						e instanceof CustomEvent == false
						&& e instanceof Event == false
						&& e instanceof $.Event == false
					){
						e = $.Event(eventName);
					}

					var events = this.events[eventName];

					for(var c=0; c<events.length; c++){

						if (typeof events[c] != "function") continue;

						events[c].apply(this,[this, e]);

					}

				}

			},


			/**
			 * @description attach specified event listener
			 * @param {String} eventName
			 * @param  {Function} fx - Event handler
			 * @memberof MSelectDBox
			 * @return {Boolean}
			 * @memberof MSelectDBox
			 * */
			"on": function(eventName, fx){
				var self = this;
				var target = this.get("target");
				var dboxInput = this.get("dbox_input");

				if (
					typeof eventName != "string"
					|| typeof fx != "function"
				) {
					return false;
				}

				eventName = eventName.toLowerCase();

				if (
					typeof this.events[eventName] != "object"
					|| !Array.isArray(this.events[eventName])
				){

					this.events[eventName] = [];

					if (  this._targetEvents.hasOwnProperty(eventName)  ){
						$(target).bind(
							this._targetEvents[eventName].event,
							function(e){
								self.trigger(eventName, e);
							},
							null
						);

						// Событие для встроенного элемента-ввода
						if (  this._targetEvents[eventName].dbox_input  ){
							$(dboxInput).bind(
								this._targetEvents[eventName].event,
								function(e){
									self.trigger(eventName, e);
								},
								null
							);
						}
					}

				}

				this.events[eventName].push(fx);

				return true;

			},


			"_detectLanguage": function() {
				var lang = (navigator.languages || [])[0]
					|| navigator.language
					|| navigator.systemLanguage
					|| navigator.userLanguage
		 			|| navigator.browserLanguage
					|| "en-US";
				return lang.split(/[-_]/ig)[0];
			},




			"_texts": {
				".m-select-d-box__search-input": {
					"ru": "Поиск",
					"en": "Search"
				}
			},


			/**
			 * @description Возвращает текст по указанному ключу в соответствии с настройками языка
			 * @memberof MSelectDBox
			 * @param {String} key
			 * @param {String=} lang - язык выбираемого текста
			 * @return {String}
			 * */
			getText: function(key, lang) {
				!lang && (lang = this.get("language") || this._detectLanguage());

				return (this._texts[key] || {})[lang] || "";
			},


			/**
			 * @description Привязать к текст по указанному ключу и языку
			 * @memberof MSelectDBox
			 * @param {String} key
			 * @param {String} lang - язык выбираемого текста
			 * @param {String} text - текст
			 * */
			setText: function(text, key, lang) {
				var isProto = true;
				var proto = this instanceof MSelectDBox ? !(isProto = false) && Object.getPrototypeOf(this) : this;

				!proto._texts[key] && (proto._texts[key] = {});

				!lang && (lang = (!isProto && this.get("language")) || this._detectLanguage());

				proto._texts[key][lang] = text;
			},


			/**
			 * @description global elements
			 * @memberof MSelectDBox
			 * */
			"_globalElems": {
				"fade": void 0
			},


			/**
			 * @description Global styles by selectors
			 * @memberof MSelectDBox
			 * */
			"_globalStyles": {
				// TODO Добавить overflow:hidden для body, чтобы не прокручивалась страница
				".m-select-d-box": {
					position: "absolute", display: "block", width: "168px", padding: '8px', height: "auto", "box-shadow": "0 0px 8px rgba(0, 0, 0, 0.24)", "background-color": "#FFF", "border-radius": "3px"
				},
				".m-select-d-box:after": {
					content:'\'\'', position: "absolute", "border-left": "10px solid transparent", "border-right": "9px solid transparent", "border-bottom": "10px solid white", top: "-10px", left: "50%", "margin-left": "-10px"
				},
				".m-select-d-box_bottom:after": {
					content:'\'\'', position: "absolute", "border-left": "10px solid transparent", "border-right": "9px solid transparent", "border-bottom": "none", "border-top": "10px solid white", top: "auto", bottom: "-10px", left: "50%", "margin-left": "-10px"
				},
				".m-select-d-box__list-container": {
					position: "relative", margin: "0px", padding: "0px", "max-height": "200px", "overflow-x": "hidden"
				},
				".m-select-d-box__list-item": {
					position: "relative", padding: "5px", "background-color": "none", color: "black", display: "block", "line-height": "100%", cursor: "pointer", "font-size": "12px"
				},
				".m-select-d-box__list-item:hover, .m-select-d-box__list-item_hover": {
					"background-color": "#e6e6e6"
				},
				".m-select-d-box__list-item_selected": {
					"background-color": "#C40056", color:"white"
				},
				".m-select-d-box__list-item_selected:hover, .m-select-d-box__list-item_selected.m-select-d-box__list-item_hover": {
					"background-color": "#DB2277"
				},
				".m-select-d-box__list-item_selected:before": {
					content:'\':: \''
				},
				".m-select-d-box__list-item:active, .m-select-d-box__list-item_selected:active": {
					"background-color": "#b80000", color: "white"
				},
				".m-select-d-box__list-item_hidden": {
					display:"none"
				},
				".m-select-d-box__search-input": {
					border: "1px solid #a2a2a2", width: "100%", "line-height": "100%", "font-size": "14px", "border-width": "0 0 2px 0", "padding": "8px", "box-sizing": "border-box"
				},
				".m-select-d-box__search-input-container": {
					"margin-bottom": "12px", display: "none"
				},
				".m-select-d-box__search-input-container_active": {
					display: "block"
				},
				".m-select-d-box-fade": {
					display: "none", width: 0, height: 0, left: 0, top: 0
				},
				"@media screen and (max-width: 640px)": {
					".m-select-d-box": {
						position: "fixed", width: "80% !important", padding: "0 !important", left: "10% !important", top:"10% !important", "max-height": "80%", "box-shadow": "none", "border-radius": "0px", "box-sizing": "border-box"
					},
					".m-select-d-box:after": {
						content: "none"
					},
					".m-select-d-box__list-container": {
						"max-height": "none"
					},
					".m-select-d-box__list-item": {
						padding: "1em", "font-size": "1em"
					},
					".m-select-d-box__search-input-container": {
						"margin-bottom": "12px", display: "block"
					},
					".m-select-d-box__search-input": {
						"line-height": "1em", "font-size": "1em", "padding": "1em"
					},
					".m-select-d-box-fade": {
						width: "100%", height: "100%", position: "fixed", left: 0, top: 0, "background-color": "rgba(0, 0, 0, 0.33)", display: "block"
					}
				},
				"@media screen and (max-width: 740px)": {
					"@media screen and (min-resolution: 2dppx)": {
						// Здесь копия max-width 640px
						// см._buildStyles
					}
				},

				// Стоит здесь для высшего приоритета
				".m-select-d-box_hidden": {
					display: "none"
				}

			},


			/**
			 * @ignore
			 * */
			"_initStyles": function(){

				if (  !$('#m-select-d-box-style').length  ){
					this._buildStyles();
				}

			},


			/**
			 * @ignore
			 * */
			"_buildStyles": function(){

				// Копируется мобильные стили для устройств с высокой плотностью точек
				// TODO Перенести объявление глобальных стилей в анонимную функцию вместе с этим куском кода
				this._globalStyles["@media screen and (max-width: 740px)"]["@media screen and (min-resolution: 2dppx)"] = this._globalStyles["@media screen and (max-width: 640px)"];

				// ------------------------------------------------------------------------------------------------

				var body = $("body");

				var buildCSS= function(obj){
					var str = "";
					for(var styleSelector in obj){
						if (  !Object.prototype.hasOwnProperty.call(obj, styleSelector)  ) continue;
						if (  styleSelector.match(/^@media/)  ){
							str += styleSelector + " {" + buildCSS(obj[styleSelector]) + "} ";
							continue;
						}
						str += styleSelector + " {";
						for(var styleProp in obj[styleSelector]){
							if (  !Object.prototype.hasOwnProperty.call(obj[styleSelector], styleProp)  ) continue;
							str += styleProp + ":" + obj[styleSelector][styleProp] + ";";
						}
						str += "} ";
					}
					return str;
				};

				var css = buildCSS(this._globalStyles);

				var styleElem = $('#m-select-d-box-style');

				if (  !styleElem.length  ){
					styleElem = $('<style />');
					styleElem.attr("id", "m-select-d-box-style");
					body.append(styleElem);
				}

				styleElem.html(css);

			},


			/**
			 * @ignore
			 * */
			"_initProps": function(arg){

				// var self = this;
				var c, v, prop, defaultProps = {};

				// TODO Сделать объект с ключами вместо массива
				var allowedKeys = [
					{"key":"name", "type": "string"},
					{"key":"list", "type": "array"},
					{"key":"autoApply", "type":"any", "into": "boolean"},
					{"key":"autoPosition", "type":"any", "into":"boolean"},
					{"key":"autoComplete", "type":"any", "into":"boolean"},
					{"key":"target", "type":"object"},
					{"key":"multiple", "type":"any","into":"boolean"},
					{"key":"zIndex", "type":"numeric", "into":"integer"},
					{"key":"width","type":"any"},
					{"key":"embeddedInput", "type":"any", "into": "boolean"},
					{"key":"optionFilters", "type":"array"},
					{"key": "closeButton", "type": "boolean"},
					{"key": "language", "type": "string", "default": this._detectLanguage()},
					{"key":"freeWrite", "type":"any", "into": "boolean"}
				];

				for(c=0; c<allowedKeys.length; c++){
					allowedKeys[c].key = allowedKeys[c].key.toLowerCase();
					if (  "default" in allowedKeys[c]  ) {
						defaultProps[allowedKeys[c].key] = allowedKeys[c].default;
					}
				}

				this.set(defaultProps);

				if (typeof arg != "object") return;

				for(prop in arg){

					if (  !arg.hasOwnProperty(prop)  ) continue;

					var key = prop.toLowerCase();

					var option = null;

					for(v=0; v<allowedKeys.length; v++){
						if (  allowedKeys[v].key.toLowerCase() == key  ){
							option = allowedKeys[v];
							break;
						}
					}

					if (  option  ){

						if (  option.type == "any"  ){

						} else if (  option.type == "array"  ) {
							if (  !Array.isArray(arg[prop])  ){
								throw new Error("Argument data type mismatch (key: '" + prop + "')");
							}

						} else if (  option.type == "numeric"  ){
							if (  isNaN(arg[prop])  ){
								throw new Error("Argument data type mismatch (key: '" + prop + "')");
							}

						} else {
							if (  option.type != typeof arg[prop]  ) {
								throw new Error("Argument data type mismatch (key: '" + prop + "')");
							}

						}

						if (  option.hasOwnProperty("into")  ){
							if (  option.into == "boolean"  ){
								arg[prop] = Boolean(arg[prop])

							} else if (  option.into == "integer"  ) {
								arg[prop] = parseInt(arg[prop])

							} else if (  option.into == "float"  ) {
								arg[prop] = parseFloat(arg[prop])

							}
						}


						// Исключение
						if (prop == "width"){
							arg[prop] = (
								typeof arg.width == "undefined"
									?  "min"
									: (
									$.inArray(arg.width, ["min","auto"]) > -1
										? arg.width
										: parseInt(arg.width)
								)
							)
						}


						// Запись в props
						this.set(key, arg[prop]);

					}

				}

			},


			/**
			 * @ignore
			 * */
			"_initElements": function(){

				var body = $("body").get(0);
				var lang = this.get("language");

				// --------------------------------------------------------------
				// "Фоновая тьма" для моб. устройств

				if (  this._isColdInit()  ) {
					this._globalElems.fade = $(
						'<div class="m-select-d-box-fade m-select-d-box_hidden">' +
						'</div>'
					).get(0);
					body.appendChild(this._globalElems.fade);
				}


				// --------------------------------------------------------------
				// Диалоговое окно

				var dbox = document.createElement('div');
				// var jqDBox = $(dbox);

				this.set("dbox", dbox);

				dbox.className = "m-select-d-box m-select-d-box_hidden";
				// jqDBox.addClass("m-select-d-box");
				// jqDBox.addClass("m-select-d-box_hidden");

				var searchInputContainer = $(
					'<div class="m-select-d-box__search-input-container">' +
					'<input class="m-select-d-box__search-input" placeholder="' +
						this.getText(".m-select-d-box__search-input") + '" type="text">' +
					'</div>'
				).get(0);

				this.set("dbox_input", $("input",searchInputContainer).get(0));

				dbox.appendChild(searchInputContainer);

				if (  Boolean(this.get("embeddedInput"))  ){
					searchInputContainer.className += " m-select-d-box__search-input-container_active";
				}

				this.set("dbox", dbox);

				if (  this.get("zIndex")  ) dbox.style.zIndex = this.get("zIndex");

				// --------------------------------------------------------------

				dbox.appendChild($('<ul class="m-select-d-box__list-container"></ul>').get(0));

				// --------------------------------------------------------------
				// Ширина

				var width = this.get("width");

				if (width == "auto"){
					dbox.style.width = this.get("target").clientWidth + "px";

				} else if (width == "min") {

				} else {
					dbox.style.width = width + "px";
				}

				body.appendChild(dbox);

			},


			/**
			 * @ignore
			 * */
			"_initList": function(){

				var c, L;

				if (  !$.isArray(this.get("list"))  ) {
					this.set("list", [], null, false);
					return false;
				}

				var list = this.get("list");

				var dbox = this.get("dbox");

				var tmplist = [];

				// TODO FlattenFn

				for ( c= 0, L = list.length; c<L; c++ ){
					if (  $.inArray(typeof list[c], ["number","string"]) != -1  ){

						tmplist.push({
							"value": list[c].toString(),
							"label": list[c].toString(),
							"selected": false
						});

					} else if ( typeof list[c] == "object" ) {

						if (
							list[c].hasOwnProperty("value")
							&& list[c].hasOwnProperty("label")
						){
							if (  typeof list[c].selected == "undefined"  ){
								list[c].selected = false;
							} else {
								list[c].selected = Boolean(list[c].selected);
							}
							tmplist.push(list[c]);
						}

					}
				}

				list = tmplist;
				this.set("list", tmplist, null, false);

				// -------------------------------------------------------------------

				var ul = $(".m-select-d-box__list-container", dbox).get(0);
				ul.innerHTML = "";

				var self = this;

				for(var itemKey in list ){
					if (!list.hasOwnProperty(itemKey)) continue;

					var li = document.createElement("li");

					li.className = "m-select-d-box__list-item";

					li.setAttribute('data-msdbid',itemKey);

					// addEventListener || attachEvent
					$(li).bind(
						"click",
						function(e){
							var selectedKeys = [];

							clearTimeout(self._timers.focusoutInputs);

							var msdbid = parseInt(this.getAttribute('data-msdbid'));

							if (  self.get("multiple")  ){

								list[msdbid].selected = (list[msdbid].selected == false);
								selectedKeys = self.getSelectedKeys();

							} else {

								selectedKeys = [msdbid];

							}

							self._selectByID(selectedKeys);

							self.trigger("select", e);

							self.calcPosition();

							if (!self.get("multiple")){
								self.close();
							}

						},
						null
					);

					// addEventListener || attachEvent
					$(li).bind("mouseleave",function(){
						var jqThis = $(this);
						if (  jqThis.hasClass("m-select-d-box__list-item_hover")  ){
							jqThis.removeClass("m-select-d-box__list-item_hover");
						}
					},null);

					li.innerHTML = list[itemKey].label;
					ul.appendChild(li);
				}

			},


			/**
			 * @ignore
			 * */
			"init": function(arg){

				this._props = Object.create(null);

				var self = this;

				var body = $('body').get(0);

				// --------------------------------------------------------------------------------
				/*
				* "this._initEvents" внутри использует ссылку на target.
				* target инициализируется в "this._initProps" и "this._initTarget" и внутри выполняют "this.set"
				* "this.set" внутри выполняет "this.trigger", для выполнение которого необходим инициализированный this.events
				* => парадокс того что нужно обьявить первично.
				* Решается предварительным обьявленимм this.events (Обьявляется дважды: this.initEvents, this.init)
				* */

				this.events = Object.create(null);

				this._initProps(arg);
				this._initTarget();
				this._initElements();
				this._initEvents(arg);
				this._initList();
				this._initStyles();

				// --------------------------------------------------------------------------------
				// Таймеры

				this._timers = Object.create(null);
				this._timers.autoComplete = null;
				this._timers.focusedInputs = null;
				this._timers.focusoutInputs = null;

				// --------------------------------------------------------------------------------
				// Целевой элемент

				var target = this.get("target");

				// --------------------------------------------------------------------------------
				// Контейнер списка

				var dbox = this.get("dbox");

				// --------------------------------------------------------------------------------

				if (  self.get("name")  ){
					target.setAttribute("data-msdb-name",self.get("name"));
					dbox.setAttribute("data-msdb-name", self.get("name"));
				}

				self.on(
					"keydown",
					function(context, e){
						self._eventDefaultKeyDownMultipleFalse(e);
						self._eventDefaultKeyDownMultipleTrue(e);
					}
				);

				self.on(
					"keyup",
					function(context, e){
						self._eventDefaultKeyUp(e);
					}
				);

				// ------------------------------------------------------------



				// --------------------------------------------------------------
				// Инициализация матчеров строк

				if (  !self.get("optionFilters")  ){
					self.set(
						"optionFilters",
						[self.defaultOptionFilters.default]
					);
				}

				// --------------------------------------------------------------

				if (  self._isColdInit()  ){
					$(body).bind(
						"click",
						function(e){
							self._deactivateInstances(e);
						}, null
					);
				}

				// --------------------------------------------------------------
				// instances размещен в конце для правильной работы this._isColdInit()

				this.instances.push(this);

			},


			/**
			 * @description Calculate position of list container
			 * @memberof MSelectDBox
			 * */
			"calcPosition" : function(){
				var self = this;
				var body = $("body").get(0);
				var target = this.get("target", null, null);
				var dbox = this.get("dbox", null, null);
				var jqDBox = $(dbox);
				var offset = $(target).offset();
				var thisWidth = target.clientWidth;
				var thisHeight = target.clientHeight;
				var dboxWidth = dbox.clientWidth;

				jqDBox.removeClass("m-select-d-box_bottom");

				dbox.style.left = (offset.left + (thisWidth / 2) - ((dboxWidth + (self._globalStyles[".m-select-d-box"].padding.replace(/[px]/gi,"") * 2)) / 2)) + "px";

				var scrollY = window.scrollY || body.scrollTop;

				// TODO _isBoxBottomState()
				if ( (dbox.clientHeight + offset.top + thisHeight + 12 - scrollY) > window.innerHeight){
					dbox.style.top = (offset.top - 12 - dbox.clientHeight) + "px";
					jqDBox.addClass("m-select-d-box_bottom");
				} else {
					dbox.style.top = (offset.top + thisHeight + 12) + "px";
				}
			},


			/**
			 * @ignore
			 * */
			"_calcScrollBarPosition": function(){

				var selectedLi;
				var dbox = this.get("dbox");

				var ul = $(".m-select-d-box__list-container",dbox).get(0);

				if (  !this.get("multiple")  ){
					selectedLi = $(".m-select-d-box__list-item_selected",dbox);

				} else {
					selectedLi = $(".m-select-d-box__list-item_hover",dbox);

				}

				if (!selectedLi.length) return;

				var top = selectedLi.position().top + ul.scrollTop;

				if (  top < ul.clientHeight / 2  ) {
					ul.scrollTop = 0;
					return;
				}

				ul.scrollTop = top - ul.clientHeight / 2;

			},


			/**
			 * Пересчитывает высоту для контейнера списка.
			 * Важно для мобильных устройств,
			 * где стили устанавливают макс-высоту ".m-select-d-box" относительно всего окна (80%)
			 * => как следствие контейнер списка ".m-select-d-box__list-container" не может иметь высоту 100% (ведь высота устанавливается автоматически)
			 * и сам при этом не может растягивать высоту родительского контента
			 * Для этого необходимо чтобы кто-то имел высоту.
			 * Решение: высоту получает ".m-select-d-box__list-container" он же растягивает родитель у которого height: auto и max-height: 80%
			 * @ignore
			 * */
			"_calcListContainerHeight": function(){
				var listContainer = $(this.get("dbox")).find(".m-select-d-box__list-container").get(0);
				if (  this._isMobileState()  ){
					var vh = window.innerHeight / 100;
					listContainer.style.maxHeight = ((vh * 80) - 64) + "px";
					return;
				}
				if (  listContainer.style.maxHeight  ) listContainer.style.maxHeight = "";
			},


			/**
			 * @ignore
			 * */
			"_isDBoxElement": function(element){
				var dbox = this.get("dbox", null, null);
				// var each = $("*", dbox).toArray();
				var each = $(dbox).find("*");
				if (each){
					each = Array.prototype.slice.call(each,0);
					each.push(dbox);
					for (var c=0; c<each.length; c++){
						if ( each[c] == element ) return true;
					}
				}

				return false;
			},


			/**
			 * @ignore
			 * */
			"_isTargetElement": function(element){
				var target = this.get("target", null, null);
				// var each = $("*",target).toArray();
				var each = $(target).find("*");
				if (each){
					each = Array.prototype.slice.call(each,0);
					each.push(target);
					// На случай если target не просто <input> а сложный элемент
					for(var c=0; c<each.length; c++){
						if (each[c] == element){
							return true;
						}
					}
				}

				return false;
			},


			/**
			 * @ignore
			 * */
			"_isDBoxInput": function(elem){
				return this.get("dbox_input") === elem;
			},


			/**
			 * return true если соблюдены условия для показа мобильной версии
			 * @return {Boolean}
			 * @ignore
			 * */
			"_isMobileState": function(){
				return (
					window.innerWidth <= 640
					|| (
						window.innerWidth <= 740
						&& this.fx.isHDensScreen()
					)
				);
			},


			/**
			 * Определить нужно ли инвертировать положение бокса по вертикали
			 * @ignore
			 * */
			"_isBoxBottomState": function(){
				var dbox = this.get("dbox", null, null);
				return Boolean(dbox.className.match(new RegExp("m-select-d-box_bottom")));
			},


			"_isColdInit": function(){
				return !this.instances.length;
			},


			/**
			 * @description Return keys of selected options
			 * @memberof MSelectDBox
			 * @return {Array}
			 * */
			"getSelectedKeys": function(){
				var keys = [];
				var list = this.get("list");

				for (var c=0; c<list.length; c++){
					if (
						typeof list[c]['selected'] != "undefined"
						&& list[c]['selected']
					){
						keys.push(c);
					}
				}

				return keys;
			},


			/**
			 * @description Return values of selected options
			 * @memberof MSelectDBox
			 * @return {Array}
			 * */
			"getSelectedValues": function(){
				var values = [];
				var list = this.get("list");

				for (var c=0; c<list.length; c++){
					if (
						typeof list[c]['selected'] != "undefined"
						&& list[c]['selected']
					){
						values.push(list[c].value);
					}
				}
				return values;
			},


			/**
			 * @description Return labels of selected options
			 * @memberof MSelectDBox
			 * @return {Array}
			 * */
			"getSelectedLabels": function(){
				var labels = [];
				var list = this.get("list");

				for (var c=0; c<list.length; c++){
					if (
						typeof list[c]['selected'] != "undefined"
						&& list[c]['selected']
					){
						labels.push(list[c].label);
					}
				}
				return labels;
			},


			/**
			 * @description check existence of value in list
			 * @param {String} value
			 * @memberof MSelectDBox
			 * @return {Boolean}
			 * */
			"hasValue": function(value){

				var list = this.get("list");

				for(var c=0; c<list.length; c++){
					if (  list[c].value === value  ) return true;
				}

				return false;

			},


			/**
			 * @description check existence of label in list
			 * @param {String} label
			 * @memberof MSelectDBox
			 * @return {Boolean}
			 * */
			"hasLabel": function(label){

				var list = this.get("list");

				for(var c=0; c<list.length; c++){
					if (  list[c].label === label  ) return true;
				}

				return false;

			},


			"applySelectedToList" : function(){
				// var self = this;
				var dbox = this.get("dbox");
				var list = this.get("list");

				var li = $("li",dbox);

				li.removeClass("m-select-d-box__list-item_selected");

				for(var c= 0, L=li.length; c<L; c++){
					var msdbid = li[c].getAttribute("data-msdbid");
					if (
						typeof list[msdbid] != "undefined"
						&& list[msdbid].selected
					){
						$(li[c]).addClass('m-select-d-box__list-item_selected');
					}
				}
			},


			"applySelectedToInput" : function(){

				var self			= this;
				var listValue	= self.getSelectedValues();
				var listLabel	= self.getSelectedLabels();
				var target		= this.get("target");
				var dboxInput = this.get("dbox_input");

				dboxInput.value =  listLabel.join("; ") + (!listLabel.length || !this.get("multiple") ? "" : ";");

				var tagName = target.tagName.toLowerCase();

				if ( tagName == "input" ){

					if (  self.fx.isTextInput(target)  ) target.value = dboxInput.value;

				} else if ( tagName == "textarea" ) {

					target.value = listLabel.join(";\n") + (!listLabel.length || !this.get("multiple") ? "" : ";\n");

				} else if ( tagName == "select" ) {

					for (var v=0; v<target.options.length; v++) {
						target.options[v].selected = $.inArray(target.options[v].value, listValue) > -1;
					}

				}

				target.setAttribute("data-msdb-value", listValue.join(";") + (!listValue.length || !this.get("multiple") ? "" : ";"));

			},


			/**
			 * @description Select specified option in list
			 * @param {Object} arg
			 * @param {String | Array} arg.value - select by value
			 * @param {String | Array} arg.label - select by label
			 * @param {Number} arg.id - select by id
			 * @param {Boolean} arg.blank
			 * @memberof MSelectDBox
			 * */
			"select" : function(arg){
				if (typeof arg != "object" || $.isArray(arg)) return;

				var value, key, blank = true;

				if (typeof arg.blank != "undefined") blank = Boolean(arg.blank);

				if (arg.id){
					if (  !isNaN(arg.id) || $.isArray(arg.id)  ){
						this._selectByID(parseInt(arg.id));
						return;
					}
				}

				if (arg.value) {
					value = arg.value;
					key = "value";
				} else if (arg.label) {
					value = arg.label;
					key = "label";
				} else {
					return;
				}

				if (  $.inArray(typeof value, ["number", "string"]) > -1  ) {
					value = [value];
				} else if (
					typeof value == "object"
					&& $.isArray(value)
				) {

				} else {
					return null;
				}

				if (!this.get("multiple") && value.length > 1) return null;

				var list = this.get("list");

				for(var c=0, L=list.length; c<L; c++){
					if (  $.inArray(list[c][key], value) > -1  ){
						list[c].selected = true;

					} else if ( blank ) {
						list[c].selected = false;

					}
				}

				this.applySelectedToList();
				this.applySelectedToInput();

			},

			/**
			 * @description Выделяет пункт из списка по ключу. Каждый раз определяет новую выборку.
			 * @memberof MSelectDBox
			 * @ignore
			 * */
			"_selectByID": function(arg){
				var c;

				if (  !isNaN(arg)  ){
					arg = [parseInt(arg)];
				} else if (  $.isArray(arg)  ) {

				} else {
					return;
				}

				var list = this.get("list");

				for(c=0; c<list.length; c++){
					list[c].selected = false;
				}

				for(c=0; c<arg.length; c++){
					if (isNaN(arg[c])) continue;
					if (  !list.hasOwnProperty(arg[c])  ) continue;
					list[arg[c]].selected = true;
				}

				if (arg.length) {
					this.applySelectedToInput();
					this.applySelectedToList();
				}

			},

			/**
			 * @description Сниманиет выделение только с указанной выборки, не затрагивая остальные
			 * @memberof MSelectDBox
			 * @ignore
			 * */
			"_deselectByID": function(arg){
				var c;

				if (  !isNaN(arg)  ){
					arg = [parseInt(arg)];
				} else if (  $.isArray(arg)  ) {

				} else {
					return;
				}

				var list = this.get("list");

				for(c=0; c<arg.length; c++){
					if (isNaN(arg[c])) continue;
					if (  !list.hasOwnProperty(arg[c])  ) continue;
					list[arg[c]].selected = false;
				}

				if (arg.length) {
					this.applySelectedToInput();
					this.applySelectedToList();
				}
			},


			/**
			 * @ignore
			 * */
			"_optionFiltersMatcher": function(filters, matcherStr, matchedStr){
				if (arguments.length < 3) return true;
				if (typeof filters == "function") filters = [filters];
				if (!$.isArray(filters)) return false;
				for(var c=0; c<filters.length; c++){
					if (  filters[c].apply(this, [matcherStr, matchedStr])  ){
						return true;
					}
				}
				return false;
			},


			/**
			 * @description default autoComplete filters
			 * @memberof MSelectDBox
			 * */
			"defaultOptionFilters": {
				"default": function(matcherStr, matchedStr){
					if (
						typeof matcherStr != "string"
						|| typeof matchedStr != "string"
					){
						return false;
					}

					var pattern = new RegExp(matcherStr.toLowerCase().trim());
					matchedStr = matchedStr.toString().toLowerCase();

					return Boolean(matchedStr.match(pattern));
				},

				"russianKeyboard": function(value, item_label){
					if (
						typeof value != "string"
						|| typeof item_label != "string"
					){
						return false;
					}
					var enRu = {
						"`": "ё", "~":"ё", "q":"й",
						"w":"ц", "e":"у", "r":"к",
						"t":"е", "y":"н", "u":"г",
						"i":"ш", "o":"щ", "p":"з",
						"[":"х", "{":"х", "]":"ъ",
						"}":"ъ", "a":"ф", "s":"ы",
						"d":"в", "f":"а", "g":"п",
						"h":"р", "j":"о", "k":"л",
						"l":"д", ";":"ж", ":":"э",
						"'":"э", "\"":"э", "z":"я",
						"x":"ч", "c":"с", "v":"м",
						"b":"и", "n":"т", "m":"ь",
						",":"б", "<":"б", ".":"ю",
						">":"ю"
					};
					var value2 = value.toLowerCase().split("");
					for(var c= 0, L=value2.length; c<L; c++){
						if (  enRu.hasOwnProperty(value2[c])  ){
							value2[c] = enRu[value2[c]];
						}
					}
					return this.defaultOptionFilters.default(value2.join(""), item_label);
				}
			},


			"_hideItems": function(){},


			"_unhideItems": function(){},


			/**
			 * @description Deselect all options in list
			 * @memberof MSelectDBox
			 * */
			"deselectAll" : function(){

				var list = this.get("list");

				for (var c = 0, L = list.length; c < L; c++) {
					list[c].selected = false;
				}
				this.applySelectedToList();
				this.applySelectedToInput();

			},


			/**
			 * @description Select all options in list
			 * @memberof MSelectDBox
			 * */
			"selectAll" : function(){
				var list = this.get("list");

				if (this.get("multiple")) {
					for (var c = 0, L = list.length; c < L; c++) {
						list[c].selected = true;
					}
					this.applySelectedToList();
					this.applySelectedToInput();
				} else {
					return null;
				}
			},


			/**
			 * @description check visible state of list container
			 * @memberof MSelectDBox
			 * @return {Boolean}
			 * */
			"isActive": function(){
				var dbox = this.get("dbox", null, null);
				return $(dbox).hasClass("m-select-d-box_hidden") == false
			},


			"reInitList": function(){

				var dbox = this.get("dbox", null, null);

				$("ul",dbox).detach();

				this._initList();

			},


			/**
			 * @description hide list
			 * @memberof MSelectDBox
			 * */
			"close" : function(){
				var dbox = this.get("dbox", null, null);
				$(dbox).addClass("m-select-d-box_hidden");
				this._closeFade();
			},


			/**
			 * @description show list
			 * @memberof MSelectDBox
			 * */
			"open" : function(){
				var dbox = this.get("dbox", null, null);
				$(dbox).removeClass("m-select-d-box_hidden");
				this.calcPosition();
				this._openFade();
				if (  this._isMobileState()  ) this.get("dbox_input").focus();
			},


			/**
			 * @ignore
			 * */
			"_openFade": function(){
				$(this._globalElems.fade).removeClass("m-select-d-box_hidden");
			},


			/**
			 * @ignore
			 * */
			"_closeFade": function(){
				$(this._globalElems.fade).addClass("m-select-d-box_hidden");
			},


			/**
			 * @ignore
			 * */
			"fx" : {
				"isTextInput": function(elem){
					if (elem instanceof Node === false) return false;
					var tagName = elem.tagName.toLowerCase();
					if (  tagName == "input"  ){
						if (
							elem.type
							&& $.inArray(elem.type.toLowerCase(), ["text", "password", "email", "url", "search", "tel"]) > -1
						){
							return true;
						}

					} else if (  tagName == "textarea"  ) {
						return true;
					}
					return false;
				},

				"isHDensScreen": function(){
					// http://stackoverflow.com/questions/19689715/what-is-the-best-way-to-detect-retina-support-on-a-device-using-javascript
					return (
						(
							window.matchMedia
							&& (
								window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches
								|| window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches
							)
						)
						|| (
							window.devicePixelRatio
							&& window.devicePixelRatio > 1.3
						)
					) || false
				},

				"isRetinaScreen": function(){
					return (
						(
							window.matchMedia
							&& (
								window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches
								|| window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches
							)
						)
						|| (
							window.devicePixelRatio
							&& window.devicePixelRatio >= 2
						)
					) || false
				},

				"msplit" : function(d,s){
					s = s.replace(new RegExp('['+d.join('')+']','g'),d[0]);
					return s.split(d[0]);
				},

				"trim" : function(str,_chars,_mode){
					str = str.split('');

					if ( typeof _chars == "string" ){
						_chars = _chars.split('');
					} else if ( typeof _chars == "object" && typeof _chars.push != "undefined" ){

					} else {
						return str.join('');
					}

					if ( typeof _mode == "undefined" ) _mode = 'both';

					if ( _mode == 'both' ){
						for(;;){
							if ( !str.length || !($.inArray(str[0], _chars) != -1 || $.inArray(str[str.length-1], _chars) != -1) ) break;
							if ($.inArray(str[str.length-1], _chars) != -1 ) str.pop();
							if ($.inArray(str[0], _chars) != -1 ) str.shift();
						}
					}

					if ( _mode == 'left' ){
						for(;;){
							if ( !str.length || $.inArray(str[0], _chars) == -1 ) break;
							str.shift();
						}
					}

					if ( _mode == 'right' ){
						for(;;){
							if ( !str.length || $.inArray(str[str.length-1], _chars) == -1 ) break;
							str.pop();
						}
					}

					return str.join('');
				},

				"rest": function(arr, n){
					if (typeof arr != "object") return [];
					if (typeof n != "number") return [];
					return Array.prototype.slice.call(arr, n);
				}
			}
		};

		// ---------------------------------------------------------------------------------------------------

		var methodsList = ["open","close","isActive","get","set","select","selectAll","deselectAll","on","trigger", "getSelectedLabels", "getSelectedValues", "getSelectedKeys", "getText", "setText"];

		$.fn.extend({
			"mSelectDBox":  function(arg){
				if (!this.length) return;

				// var name = this[0].getAttribute("data-msdb-name");
				var instances =  MSelectDBox.prototype.getInstances();
				var instance = void 0;
				var input = this[0];

				// TODO Получать экземпляр непосредственно из DOM элемента
				for(var c=0; c<instances.length; c++){
					if (  instances[c].get("target") == input  ){
						instance = instances[c];
						break;
					}
				}

				if (!arguments.length) {
					return instance;

				} else if (typeof arg == "string"){
					if (  $.inArray(arg, methodsList) > -1  ){
						var rest = MSelectDBox.prototype.fx.rest(arguments,1);
						if (  typeof instance[arg] == "function"  ){
							return instance[arg].apply(instance, rest);
						}
					}

				} else if (typeof arg == "object") {
					// Создать новый экземпляр и привязать его к инпуту
					arg.target = this[0];
					return new MSelectDBox(arg);

				}
			}
		});

		$.prototype.mSelectDBox.prototype = MSelectDBox.prototype;

	})(jQuery);