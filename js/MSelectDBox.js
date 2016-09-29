
	// ========== Диалогбокс ==========

	(function($){
		"use strict";

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
			 * @param {Object=} arg - optional arguments (deprecated),
			 * @param {Boolean=} e - event trigger on|off. If "false"  then "get" won't trigger event
			 * @memberof MSelectDBox
			 * @return {*}
			 * */
			"get" : function(key, arg, e){

				if (typeof key != "string") return;

				key = key.toLowerCase();

				if (e || e === void 0) {
					this.trigger("get");
					this.trigger("get:" + key);
				}

				return this._props[key];

			},


			/**
			 * @param {String} key - key of instance property
			 * @param {*} value
			 * @param {Object=} arg - optional arguments (deprecated),
			 * @param {Boolean=} e - event trigger on|off. If "false"  then "set" won't trigger event
			 * @memberof MSelectDBox
			 * @return {Boolean}
			 * */
			"set" : function(key, value, arg, e){

				if (!key) return false;

				// ...... множественное присваивание ......

				if ( typeof key == "object" ) {
					var return_ = Object.create(null);

					for(var prop in key){
						if (!Object.prototype.hasOwnProperty.call(key, prop)) continue;
						return_[prop] = this.set(prop, key[prop], null, e);
					}

					return return_;
				}

				// ...........................................................

				if (typeof key != "string") return false;

				key = key.toLowerCase();

				var triggerArg = { value: value };

				if (typeof e == "undefined") e = true;

				if (e) {
					this.trigger("set", triggerArg);
					this.trigger("set:" + key, triggerArg);
					this.trigger("beforeSet:" + key, triggerArg);
				}

				this._props[key] = value;

				e && this.trigger("afterSet:" + key, triggerArg);

				return true;

			},


			/**
			 * @description return instance of class
			 * @memberof MSelectDBox
			 * @return {Array}
			 * */
			"getInstances": function(arg){
				// TODO this.fx.filter
				if (!arguments.length) return this.instances;

				if (typeof arg != "object") arg = Object.create(null);

				var name = (  $.inArray(typeof arg.name, ["string","number"]) > -1 ? arg.name : null );
				// TODO name !=== null - это что за херня?

				var tmp = [];
				for(var c=0; c<this.instances.length; c++){
					if (name !== null && this.instances[c].get("name", void 0, false) != name ){
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
				// TODO this.fx.filter
				if (typeof arg != "object"){
					return;
				}
				var name = typeof arg.name != "string" ? null : arg.name;
				var tmp = [];
				for(var c=0; c<this.instances.length; c++){
					if (  this.instances[c].get("name", void 0, false) == name  ){
						$(this.instances[c].get("dbox", void 0, false)).detach();
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

				var
					self						= this,
					target					= self.get("target", null, 0),
					dboxInput				= self.get("dbox_input", null, 0),
					keyCode				= e.keyCode,
					list						= self.get("list", null, 0),
					dbox						= self.get("dbox", null, 0),
					contextElement		= e.currentTarget,
					serviceKeyCodes		= [37,38,39,40,9,13,18,17,16,20,27];

				// Трансфер строки из target в dbox_input и наоборот
				// ------------------------------------------------------------------------------------
				if (  self._isDBoxInput(e.target)  ){
					if (  self.fx.isTextInput(target)  ) {
						target.value = dboxInput.value;
					}
				} else if (contextElement == target) {
					if (  $.inArray(e.keyCode, serviceKeyCodes) == -1  ){
						dboxInput.value = target.value;
					}
				}

				// ------------------------------------------------------------------------------------

				clearTimeout(self._timers.autoComplete);

				self._timers.autoComplete = setTimeout(function(){
					var value, v, elem, selectedIds;

					// ... autoComplete
					if (  self.get("autoComplete", null, 0)  ){

						// left arrow, up arrow, right arrow, down arrow, tab, enter, alt, ctrl, shift, caps lock, escape
						if (  $.inArray(keyCode, serviceKeyCodes) < 0 ) {

							value = contextElement.value.toLowerCase().split(/[;,]/ig);
							value = value[value.length - 1];

							// var pattern = new RegExp(value.trim());

							for(v=0; v<list.length; v++){
								// jqLi = $(list[v].elem);
								elem = [list[v].elem];

								if (  !value  ){
									$.fn.removeClass.call(elem, 'm-select-d-box__list-item_hidden');

								} else if (  !self._optionFiltersMatcher(self.get("optionFilters", null, 0), value, list[v].label)  ){
									$.fn.addClass.call(elem, 'm-select-d-box__list-item_hidden');

								} else {
									$.fn.removeClass.call(elem, 'm-select-d-box__list-item_hidden');
								}

								$.fn.removeClass.call(elem, 'm-select-d-box__list-item_hover');
							}

							if (  !self._isMobileState()  ){
								self.calcPosition();
							}

						}

					}


					if (  self.get("multiple", null, 0)  ){

						if (  keyCode == 8  ){
							// keycode 8 - backspace;
							value = self.fx.trim(contextElement.value, " ;,").split(/[,;]/ig);
							selectedIds = self.getSelectedKeys();

							for(v=0; v<value.length; v++) value[v] = value[v].trim();

							self._selectByLabel(value, 1);

							self.applySelectedToList(
								self._getItemsByID(
									selectedIds.concat(self.getSelectedKeys())
								)
							);
							self.applySelectedToInput();
						}

					}

				},500);

			},


			/**
			 * @ignore
			 * */
			"_eventDefaultKeyDownMultipleFalse": function(e){

				var
					self = this,
					list = this.get("list", null, 0),
					selectedCache = this.get("selectedCache", null, 0),
					selected = selectedCache[Object.keys(selectedCache)[0]],
					exSelected = selected,
					dbox = self.get("dbox", null, 0),
					target = self.get("target", null, 0);

				// Если список без множественного выделения
				if (  self.get("multiple", null, 0)  ) return; // close.if.!multiple

				if (  $.inArray(e.keyCode, [37,39,9,18,17,16,20,27]) > -1  ){
					// left, right, tab, alt, ctrl, shift, caps, esc

				} else if ( e.keyCode == 13 ){
					// 13 = Enter

					if (  !self.isActive()  ){
						self.open();
						self._eventFocus.call(target, self, e);

					} else {
						self.close();
					}

				} else if (  $.inArray(e.keyCode, [38,39,40]) > -1 ) {

					// other keys

					if (  !self.isActive()  ) return;

					if (!selected) {
						selected = list[0];

					} else if ( e.keyCode == 38 ){
						// up
						selected = this._getPrevAvailItem(selected) || selected;

					} else if ( e.keyCode == 40 ){
						// down
						selected = this._getNextAvailItem(selected) || selected;

					} else {
						return;
					}

					// TODO вызывать рендер
					self._selectByID(selected.id, 1);
					self.applySelectedToInput();
					self.applySelectedToList([exSelected, selected]);

					self._calcScrollBarPosition();

					self.trigger("select", e);

				} // close.if.keys in [38,39,40]


			},


			/**
			 * @ignore
			 * */
			"_eventDefaultKeyDownMultipleTrue": function(e){

				var self = this, c, L;
				var list = self.get("list", null, 0);
				var dbox = self.get("dbox", null, 0);
				var msdbid, hoveredLi, selectedIds;

				if (  self.get("multiple")  ){
					if (  $.inArray(e.keyCode, [37,39,9,18,17,16,20,27]) > -1  ){
						// left, right, tab, alt, ctrl, shift, caps, esc

					} else if (  e.keyCode == 13  ){
						// Enter
						// TODO кешировать hover ref_1
						hoveredLi = $(".m-select-d-box__list-item_hover", dbox);

						if (  !hoveredLi.length  ) return;

						msdbid = +hoveredLi.attr("data-msdbid");

						selectedIds = self.getSelectedKeys();

						list[msdbid].selected
							? self._deselectByID(msdbid)
							: self._selectByID(msdbid);

						selectedIds = selectedIds.concat(selectedIds, self.getSelectedKeys());

						self.applySelectedToInput();
						self.applySelectedToList(self._getItemsByID(selectedIds));

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
			"_eventFocus": function(context,e) {
				var c, v, value, msdb_value,
					self = this,
					selectedIds = self.getSelectedKeys(),
					list = self.get("list", null, 0),
					dbox	= self.get("dbox", null, 0),
					contextElement = e.currentTarget || (this instanceof Element ? this : null);

				self.open();

				if (  self.fx.isTextInput(contextElement)  ) {
					msdb_value = contextElement.getAttribute('data-msdb-value');
					if ( msdb_value ) msdb_value = msdb_value.trim();

					// Если в инпуте уже есть значения, отметить их в списке как выбранные
					if (!msdb_value){
						value = self.fx.trim(contextElement.value,",; ").split(/[;,]/ig);

						for(c=0; c<value.length; c++) value[c] = value[c].trim();

						self._selectByLabel(value, 1);

					} else {
						msdb_value = msdb_value.split(/[;,]/ig);

						for(c=0; c<msdb_value.length; c++) msdb_value[c] = msdb_value[c].trim();

						self._selectByValue(msdb_value, 1);
					}
				}

				// TODO ref_1. Перебирать кешированный список
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

				selectedIds = selectedIds.concat(self.getSelectedKeys());

				// Записать value внутри инпута
				if (  !self.get("freeWrite")  ){
					self.applySelectedToInput();
				}

				// Отметить выбранные строки
				self.applySelectedToList(self._getItemsByID(selectedIds));

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
			 * @param {Event | Object} e - Event or data object
			 * @memberof MSelectDBox
			 * */
			"trigger": function(eventName, e){

				if (typeof eventName != "string") return;

				eventName = eventName.toLowerCase();

				if (
					typeof this.events[eventName] == "object"
					&& Array.isArray(this.events[eventName])
				){

					// window.CustomEvent может оказаться undefined
					// и тогда оператор выбросит ошибку
					if (
						!e
						|| (
							e instanceof (window.CustomEvent || Function) == false
							&& e instanceof (window.Event || Function) == false
							&& e instanceof $.Event == false
						)
					){
						e = $.Event(eventName, e);

					} else if (e instanceof $.Event == false) {
						e = $.Event(eventName, e);
					}

					var events = this.events[eventName];

					for(var c=0; c<events.length; c++){

						if (typeof events[c] != "function") continue;

						events[c].call(this, this, e);

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


			_lastLang: "",


			"_texts": {
				".m-select-d-box-fade__outside-click-label-text": {
					"ru": "Нажмите чтобы закрыть",
					"en": "Tap to close"
				},
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
			"_globalStyles": (function() {
				var styles = {
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
					".m-select-d-box-fade__outside-click-label": {
						position: "absolute", width: "100%", bottom: 0, "padding": "10px", background: "black", color: "white", "text-align": "center", "font-size": "1em", "box-sizing": "border-box"
					},
					".m-select-d-box-fade__outside-click-label-text": {},
					".m-select-d-box-fade__outside-click-label-icon": {
						position: "relative", "border-radius": "50%", "margin-right": "5px", border: "2px solid white", display: "inline-block", height: "16px", width: "16px", "vertical-align": "middle"
					},
					".m-select-d-box-fade__outside-click-label-icon:after": {
						content:'\'\'', position: "absolute", top: "50%", left: "50%", height: "80%", width: "2px", transform: "rotate(45deg)", "margin-left": "-1px", "margin-top": "-40%", background: "white"
					},
					".m-select-d-box-fade__outside-click-label-icon:before": {
						content:'\'\'', position: "absolute", top: "50%", left: "50%", height: "80%", width: "2px", transform: "rotate(-45deg)", "margin-left": "-1px", "margin-top": "-40%", background: "white"
					},
					"@media screen and (max-width: 640px)": {
						".m-select-d-box": {
							position: "fixed", width: "80% !important", padding: "0 !important", left: "10% !important", top:"5% !important", "max-height": "90%", "box-shadow": "none", "border-radius": "0px", "box-sizing": "border-box"
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

				};

				// Копируется мобильные стили для устройств с высокой плотностью точек
				styles["@media screen and (max-width: 740px)"]["@media screen and (min-resolution: 2dppx)"] = styles["@media screen and (max-width: 640px)"];

				return styles;
			})(),


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

				this.set({
					firstItem: void 0,
					lastItem: void 0,
					selectedCache: Object.create(null),
					valuesCache: Object.create(null),
					labelsCache: Object.create(null)
				}, null, 0);

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
							'<div class="m-select-d-box-fade__outside-click-label">' +
								'<div class="m-select-d-box-fade__outside-click-label-icon"></div>' +
								'<span class="m-select-d-box-fade__outside-click-label-text">' +
									this.getText(".m-select-d-box-fade__outside-click-label-text") +
								'<span>' +
							'</div>' +
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

				var list = this.get("list", null, 0);

				if (  !$.isArray(list)  ) {
					this.set("list", [], null, false);
					return false;
				}

				var c, listItem, prev,
					labelCache = Object.create(null),
					valueCache = Object.create(null),
					self = this,
					dbox = this.get("dbox", null, 0),
					ul = $(".m-select-d-box__list-container", dbox).get(0);

				!this._onItemClick && (this._onItemClick = function(e) {
					clearTimeout(self._timers.focusoutInputs);

					var msdbid = this.getAttribute('data-msdbid');
					var list = self.get("list", null, 0);
					var selectedIds = self.getSelectedKeys().concat(msdbid);

					if (  self.get("multiple", null, 0)  ) {
						list[msdbid].selected
							? self._deselectByID(msdbid)
							: self._selectByID(msdbid, 0);

					} else {
						self._selectByID(msdbid, 1);
					}

					self.applySelectedToInput();
					self.applySelectedToList(self._getItemsByID(selectedIds));

					self.trigger("select", e);

					self.calcPosition();

					if (!self.get("multiple", null, 0)) self.close();
				});

				!this._onMouseLeave && (this._onMouseLeave = function() {
					var jqThis = $(this);
					if (  jqThis.hasClass("m-select-d-box__list-item_hover")  ){
						jqThis.removeClass("m-select-d-box__list-item_hover");
					}
				});

				ul.innerHTML = "";

				for (c=0; c<list.length; c++) {

					if (  $.inArray(typeof list[c], ["number","string"]) > -1  ) {
						list[c] = {
							"value": list[c] + "",
							"label": list[c] + "",
							"selected": false
						};

					} else if ( typeof list[c] == "object" ) {
						if (
							this.fx.hop(list[c], "value")
							&& this.fx.hop(list[c], "label")
						) {
							if (  typeof list[c].selected == "undefined"  ) {
								list[c].selected = false;

							} else {
								list[c].selected = Boolean(list[c].selected);
							}
						}
					}

					list[c].id = c;
					valueCache[list[c].value] = list[c];
					labelCache[list[c].label] = list[c];

					if (prev) {
						prev.next = list[c];
						list[c].prev = prev;
					}

					prev = list[c];

					// ------------------------------------------------------------

					listItem = list[c];
					listItem.elem = document.createElement("li");
					listItem.elem.className = "m-select-d-box__list-item";
					listItem.elem.setAttribute('data-msdbid', c);

					// addEventListener || attachEvent
					$(listItem.elem).bind("click", this._onItemClick, null);

					// addEventListener || attachEvent
					$(listItem.elem).bind("mouseleave", this._onMouseLeave, null);

					listItem.elem.innerHTML = listItem.label;
					ul.appendChild(listItem.elem);

				} // close.list.for

				this.set('firstItem', list[0], null, 0);
				this.set("lastItem", list[list.length - 1], null, 0);
				this.set("labelsCache", labelCache, null, 0);
				this.set("valuesCache", valueCache, null, 0);

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

				var target = this.get("target", null, 0);

				// --------------------------------------------------------------------------------
				// Контейнер списка

				var dbox = this.get("dbox", null, 0);

				// --------------------------------------------------------------------------------

				if (  self.get("name", null, 0)  ){
					target.setAttribute("data-msdb-name", self.get("name", null, 0));
					dbox.setAttribute("data-msdb-name", self.get("name", null, 0));
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

				// --------------------------------------------------------------
				// Инициализация матчеров строк

				if (  !self.get("optionFilters", null, 0)  ){
					self.set(
						"optionFilters",
						[self.defaultOptionFilters.default],
						null, false
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
			 * Применяет языковые настройки к глобальным (общим) элементам имеющие подписи
			 * @param {String} lang - устанавливаемый язык
			 * */
			_applyLang: function(lang) {
				if (this._lastLang == lang) return;

				Object.getPrototypeOf(this)._lastLang = lang;

				$(this._globalElems.fade)
					.find(".m-select-d-box-fade__outside-click-label-text")
					.html(this.getText(".m-select-d-box-fade__outside-click-label-text"));
			},

			/**
			 * @description Calculate position of list container
			 * @memberof MSelectDBox
			 * */
			"calcPosition" : function(){
				var self = this;
				var body = $("body").get(0);
				var target = this.get("target", null, 0);
				var dbox = this.get("dbox", null, 0);
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
				var dbox = this.get("dbox", null, 0);

				var ul = $(".m-select-d-box__list-container",dbox).get(0);

				if (  !this.get("multiple", null, 0)  ){
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
				var listContainer = $(this.get("dbox", null, 0)).find(".m-select-d-box__list-container").get(0);
				if (  this._isMobileState()  ){
					var vh = window.innerHeight / 100;
					listContainer.style.maxHeight = ((vh * 90) - 64 - 40) + "px";
					return;
				}
				if (  listContainer.style.maxHeight  ) listContainer.style.maxHeight = "";
			},


			/**
			 * @ignore
			 * */
			"_isDBoxElement": function(element){
				var dbox = this.get("dbox", null, 0);

				return !!$(dbox).find(element).length || dbox == element
			},


			/**
			 * @ignore
			 * */
			"_isTargetElement": function(element){
				var target = this.get("target", null, 0);

				return !!$(target).find(element).length || target == element
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
				return Object.keys(this.get('selectedCache', null, 0));
			},


			/**
			 * @description Return values of selected options
			 * @memberof MSelectDBox
			 * @return {Array}
			 * */
			"getSelectedValues": function(){
				var values = [], cache = this.get("selectedCache", null, 0);

				for (var c in cache) {
					values.push(cache[c].value);
				}

				return values;
			},


			/**
			 * @description Return labels of selected options
			 * @memberof MSelectDBox
			 * @return {Array}
			 * */
			"getSelectedLabels": function(){
				var label = [], cache = this.get("selectedCache", null, 0);

				for (var c in cache) {
					label.push(cache[c].label);
				}

				return label;
			},


			/**
			 * @description check existence of value in list
			 * @param {String} value
			 * @memberof MSelectDBox
			 * @return {Boolean}
			 * */
			"hasValue": function(value){
				var cache = this.get("valuesCache", null, 0);

				return !!cache[value];
			},


			/**
			 * @description check existence of label in list
			 * @param {String} label
			 * @memberof MSelectDBox
			 * @return {Boolean}
			 * */
			"hasLabel": function(label){
				var cache = this.get("labelsCache", null, 0);

				return !!cache[label];
			},


			"applySelectedToList" : function(list){
				!list && (list = this.get("list", null, 0));

				for (var c in list) {
					if (  !this.fx.hop(list, c)  ) continue;
					if (!list[c]) continue;

					$.fn[list[c].selected ? "addClass" : "removeClass"]
						.call([list[c].elem], "m-select-d-box__list-item_selected")
				}
			},


			"applySelectedToInput" : function(){

				var self = this,
					listValue = self.getSelectedValues(),
					listLabel = self.getSelectedLabels(),
					target = this.get("target", null, 0),
					dboxInput = this.get("dbox_input", null, 0);

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

				target.setAttribute("data-msdb-value", listValue.join(";") + (!listValue.length || !this.get("multiple", null, 0) ? "" : ";"));

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
				var selectedIds = this.getSelectedKeys();

				this._select(arg);

				this.applySelectedToList(
					this._getItemsByID(
						selectedIds.concat(this.getSelectedKeys())
					)
				);
				this.applySelectedToInput();
			},


			_select: function(arg) {
				if (typeof arg != "object" || $.isArray(arg)) return;

				var value, key, blank = true;

				if (arg.blank) blank = !!arg.blank;

				if (  !isNaN(arg.id) || $.isArray(arg.id)  ){
					this._selectByID(arg.id, 1);
					return;
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

				} else if (  !(typeof value == "object" && $.isArray(value))  ) {
					return null;
				}

				if (!this.get("multiple", null, 0) && value.length > 1) return null;

				if (key == "value") this._selectByValue(value, blank);
				else if (key == "label") this._selectByLabel(value, blank);
			},


			_selectByValue: function(value, reset) {
				reset && this._deselectAll();

				var c, valuesCache = this.get("valuesCache", null, 0);
				var selectedCache = this.get("selectedCache", null, 0);

				for (c=0; c<value.length; c++) {
					if (!this.fx.hop(valuesCache, value[c])) continue;
					valuesCache[value[c]].selected = true;
					selectedCache[valuesCache[value[c]].id] = valuesCache[value[c]];
				}
			},


			_selectByLabel: function(label, reset) {
				reset && this._deselectAll();

				var c, labelsCache = this.get("labelsCache");
				var selectedCache = this.get("selectedCache", null, 0);

				for (c=0; c<label.length; c++) {
					if (!this.fx.hop(labelsCache, label[c])) continue;
					labelsCache[label[c]].selected = true;
					selectedCache[labelsCache[label[c]].id] = labelsCache[label[c]];
				}
			},


			_getItemsByID: function(ids) {
				var c, obj = Object.create(null),
					list = this.get("list", null, 0);

				for (c=0; c<ids.length; c++) {
					obj[ids[c]] = list[ids[c]];
				}

				return obj;
			},


			_getNextAvailItem: function(item) {
				if (!item.next) return;

				if (  item.next.elem.className.match(/m-select-d-box__list-item_hidden/i)  )
					return this._getNextAvailItem(item.next);

				return item.next;
			},


			_getPrevAvailItem: function(item) {
				if (!item.prev) return;

				if (  item.prev.elem.className.match(/m-select-d-box__list-item_hidden/i)  )
					return this._getPrevAvailItem(item.prev);

				return item.prev;
			},


			/**
			 * @description Выделяет пункт из списка по ключу. Каждый раз определяет новую выборку.
			 * @memberof MSelectDBox
			 * @ignore
			 * */
			"_selectByID": function(arg, reset){
				if (  !isNaN(arg)  ){
					arg = [arg];

				} else if (  !$.isArray(arg) || !arg.length  ) {
					return;
				}

				var c, list = this.get("list", null, 0);
				var cache = this.get("selectedCache", null, 0);

				reset && this._deselectAll();

				for(c=0; c<arg.length; c++) {
					if (isNaN(arg[c])) continue;
					if (  !list.hasOwnProperty(arg[c])  ) continue;

					list[arg[c]].selected = true;
					cache[arg[c]] = list[arg[c]];
				}
			},


			/**
			 * @description Сниманиет выделение только с указанной выборки, не затрагивая остальные
			 * @memberof MSelectDBox
			 * @ignore
			 * */
			"_deselectByID": function(arg){
				if (  !isNaN(arg)  ){
					arg = [parseInt(arg)];

				} else if (  !$.isArray(arg) || !arg.length  ) {
					return;
				}

				var c, list = this.get("list", null, 0);
				var cache = this.get("selectedCache", null, 0);

				for(c=0; c<arg.length; c++){
					if (isNaN(arg[c])) continue;
					if (  !list.hasOwnProperty(arg[c])  ) continue;

					list[arg[c]].selected = false;
					delete cache[arg[c]];
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
					if (  filters[c].call(this, matcherStr, matchedStr)  ){
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


			/**
			 * @description Deselect all options in list
			 * @memberof MSelectDBox
			 * */
			"deselectAll" : function(){
				this._deselectAll();
				this.applySelectedToList();
				this.applySelectedToInput();
			},


			"_deselectAll": function() {
				var cache = this.get("selectedCache", null, 0);

				for (var c in cache) {
					cache[c].selected = false;
					delete cache[c];
				}
			},


			/**
			 * @description Select all options in list
			 * @memberof MSelectDBox
			 * */
			"selectAll" : function(){
				if (!this.get("multiple", null, 0)) return;

				var c, list = this.get("list", null, 0);

				for (c = 0; c < list.length; c++) {
					list[c].selected = true;
				}

				this.applySelectedToList();
				this.applySelectedToInput();
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
				var dbox = this.get("dbox", null, 0);

				$("ul",dbox).detach();

				this._initList();
			},


			/**
			 * @description hide list
			 * @memberof MSelectDBox
			 * */
			"close" : function(){
				var dbox = this.get("dbox", null, 0);
				$(dbox).addClass("m-select-d-box_hidden");
				this._closeFade();
			},


			/**
			 * @description show list
			 * @memberof MSelectDBox
			 * */
			"open" : function(){
				var dbox = this.get("dbox", null, 0);
				$(dbox).removeClass("m-select-d-box_hidden");
				this.calcPosition();
				this._openFade();
				this._applyLang(this.get("language", null, 0));
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

				"trim" : function(str, ch, di) {
					var regEx = [];

					if (!di || di == "left")
						regEx.push("^[" + ch + "]+");

					if (!di || di == "right")
						regEx.push("[" + ch + "]+$");

					return str.replace(new RegExp(regEx.join("|"), "g"), '');
				},

				"rest": function(arr, n){
					if (typeof arr != "object") return [];
					if (typeof n != "number") return [];
					return Array.prototype.slice.call(arr, n);
				},

				// hasOwnProperty
				"hop": function(obj, prop) {
					if ("hasOwnProperty" in obj) {
						return Object.prototype.hasOwnProperty.call(obj, prop);
					}
					return prop in obj;
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