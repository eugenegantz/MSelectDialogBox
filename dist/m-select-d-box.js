	(function($) {
		"use strict";

		/**
		 * @author Eugene Gantz (EG) <EugenGantz@gmail.com>
		 * @alias MSelectDBox
		 * @constructor
		 * @param {Object}              arg
		 * @param {String=}             arg.name - instance name
		 * @param {Array}               arg.list - list of options
		 * @param {Boolean=}            arg.autoComplete - on|off autocompletion
		 * @param {Boolean=}            arg.multiple - on|off multiselection
		 * @param {Number=}             arg.zIndex - z-index of list container
		 * @param {String | Number=}    arg.width - width of list container (10px | auto)
		 * @param {Array=}              arg.optionFilters - autocomplete filter's functions
		 * @param {Boolean}             arg.freeWrite
		 * @param {String}              arg.language - language of instance
		 * @param {Boolean}             arg.embeddedInput - show text input in list container
		 **/
		var MSelectDBox = function(arg) {
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
			 * Get instance property
			 * @param {String} key - key
			 * @param {Object=} arg - optional arguments (deprecated),
			 * @param {Boolean=} e - event trigger on|off. If "false"  then "get" won't trigger event
			 * @return {*}
			 * */
			"get": function(key, arg, e) {
				if (typeof key != "string") return;

				key = key.toLowerCase();

				if (e || e === void 0) {
					this.trigger("get");
					this.trigger("get:" + key);
				}

				return this._props[key];
			},


			/**
			 * Set instance property
			 * @param {String | Object} key - key or hash of key-value
			 * @param {*=} value
			 * @param {Object=} arg - optional arguments (deprecated),
			 * @param {Boolean=} e - event trigger on|off. If "false"  then "set" won't trigger event
			 * @return {MSelectDBox}
			 * */
			"set": function(key, value, arg, e) {
				if (!key) return this;

				// ...... множественное присваивание ......

				if ( typeof key == "object" ) {
					var return_ = Object.create(null);

					for (var prop in key) {
						if (!Object.prototype.hasOwnProperty.call(key, prop)) continue;
						return_[prop] = this.set(prop, key[prop], null, e);
					}

					return this;
				}

				// ...........................................................

				if (typeof key != "string") return this;

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

				return this;
			},


			/**
			 * @description Return instance of class
			 * @memberof MSelectDBox
			 * @return {Array}
			 * */
			"getInstances": function(arg) {
				// TODO this.fx.filter
				if (!arguments.length) return this.instances;

				if (typeof arg != "object") arg = Object.create(null);

				var c, 
					tmp = [],
					name = $.inArray(typeof arg.name, ["string","number"]) > -1
						? arg.name
						: null;

				// TODO name !=== null - это что за херня?

				for (c = 0; c < this.instances.length; c++) {
					if (
						name !== null
						&& this.instances[c].get("name", void 0, false) != name
					) {
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
			"removeInstances": function(arg) {
				// TODO this.fx.filter
				if (typeof arg != "object") return this;

				var name = typeof arg.name != "string" ? null : arg.name,
					c, tmp = [];

				for (c=0; c<this.instances.length; c++) {
					if (  this.instances[c].get("name", void 0, false) == name  ) {
						$(this.instances[c].get("dbox", void 0, false)).detach();
						continue;
					}
					tmp.push(this.instances[c]);
				}

				this.instances = tmp;

				return this;
			},


			"_targetEvents": {
				"click": { "name": "click", "event": "click" },
				"keydown": { "name": "keydown", "event": "keydown", "dbox_input": true },
				"keyup": { "name": "keyup", "event": "keyup", "dbox_input": true },
				"hover": { "name": "hover", "event": "hover" },
				"focus": { "name": "focus", "event": "focus" },
				"focusout": { "name": "focusout", "event": "focusout" },
				"change": { "name": "change", "event": "change" }
			},


			"_eventCheckInputEmpty": function(e) {
				// var target = this.get("target");
				// var list = this.get("list");
				if (
					this.fx.isTextInput(e.target)
					&& !e.target.value.trim()
				) {
					this.trigger("input:empty", e);
				}
			},


			"_eventDefaultInputEmpty": function() {
				this.deselectAll();
			},


			"_eventSetList": function() {
				var e = arguments[1];
				this.set("list", e.value, null, false);
				this.reInitList();
			},


			/**
			 * При изм. размера окна происходит пересчет положения и размеров внутри видимых списков
			 * @ignore
			 * */
			"_eventWindowResize": function() {
				for (var c=0; c<this.instances.length; c++) {
					if (  this.instances[c].isActive()  ) {
						this.instances[c]._calcListContainerHeight();
						this.instances[c].calcPosition();
					}
				}
			},


			"_eventDefaultKeyUp": function(e) {
				var self                    = this,
					target                  = self.get("target", null, !1),
					dboxInput               = self.get("dbox_input", null, !1),
					keyCode                 = e.keyCode,
					list                    = self.get("list", null, !1),
					dbox                    = self.get("dbox", null, !1),
					contextElement          = e.currentTarget,
					serviceKeyCodes         = [37,38,39,40,9,13,18,17,16,20,27];

				// Трансфер строки из target в dbox_input и наоборот
				// ------------------------------------------------------------------------------------
				if (  self._isDBoxInput(e.target)  ) {
					if (  self.fx.isTextInput(target)  ) {
						target.value = dboxInput.value;
					}
				} else if (contextElement == target) {
					if (  $.inArray(e.keyCode, serviceKeyCodes) == -1  ) {
						dboxInput.value = target.value;
					}
				}

				// ------------------------------------------------------------------------------------

				clearTimeout(self._timers.autoComplete);

				self._timers.autoComplete = setTimeout(function() {
					var value, v, selectedIds;

					// ... autoComplete
					if (  self.get("autoComplete", null, !1)  ) {

						// left arrow, up arrow, right arrow, down arrow, tab, enter, alt, ctrl, shift, caps lock, escape
						if (  $.inArray(keyCode, serviceKeyCodes) < 0 ) {
							value = contextElement.value.toLowerCase().split(/[;,]/ig);
							value = value[value.length - 1];

							self.unhoverAllOpt();

							self.applyAutoComplete(value);

							!self._isMobileState() && self.calcPosition();
						}

					}

					if (  self.get("multiple", null, !1)  ) {

						if (  keyCode == 8  ) {
							// keycode 8 - backspace;
							value = self.fx.trim(contextElement.value, " ;,").split(/[,;]/ig);
							selectedIds = self.getSelectedKeys();

							for (v = 0; v < value.length; v++) value[v] = value[v].trim();

							self._selectByLabel(value, true);

							self.applySelectedToList(
								self._getItemsByID(
									selectedIds.concat(self.getSelectedKeys())
								)
							);
						}

					}
				}, self.get("autoCompleteTimeoutDelay", null, !1));
			},


			"_eventDefaultKeyDownMultipleFalse": function(e) {
				var self = this,
					selectedCache = this.get("selectedCache", null, !1),
					selected = selectedCache[Object.keys(selectedCache)[0]],
					target = self.get("target", null, !1);

				// Если список без множественного выделения
				if (  self.get("multiple", null, !1)  ) return; // close.if.!multiple

				if (  $.inArray(e.keyCode, [37,39,9,18,17,16,20,27]) > -1  ) {
					// left, right, tab, alt, ctrl, shift, caps, esc

				} else if ( e.keyCode == 13 ) {
					// 13 = Enter

					if (  !self.isActive()  ) {
						self.open();
						self._eventFocus.call(target, self, e);

					} else {
						self.close();
					}

				} else if (  $.inArray(e.keyCode, [38,39,40]) > -1 ) {

					// other keys

					if (  !self.isActive()  ) return;

					if (!selected) {
						// ничего не выбрано - сделать шаг вверх начиная с первого
						selected = self.selectPrevVisibleItem(self.getFirstVisibleItem());

					} else if ( e.keyCode == 38 ) {
						// up
						selected = self.selectPrevVisibleItem(selected);

					} else if ( e.keyCode == 40 ) {
						// down
						selected = self.selectNextVisibleItem(selected);

					} else {
						return;
					}

					self.calcScrollBarPosition();

					e.listItem = selected;

					self.trigger("select", e);

				} // close.if.keys in [38,39,40]
			},


			"_eventDefaultKeyDownMultipleTrue": function(e) {
				var selectedIds,
					self = this,
					list = self.get("list", null, !1),
					hovered = self.getHoveredItems()[0];

				if (  self.get("multiple")  ) {
					if (  $.inArray(e.keyCode, [37,39,9,18,17,16,20,27]) > -1  ) {
						// left, right, tab, alt, ctrl, shift, caps, esc

					} else if (e.keyCode == 13) {
						// Enter
						if (!hovered) return;

						selectedIds = self.getSelectedKeys();

						hovered.selected
							? self._deselectByID(hovered.id)
							: self._selectByID(hovered.id);

						selectedIds = selectedIds.concat(self.getSelectedKeys());

						self.applySelectedToInput();
						self.applySelectedToList(self._getItemsByID(selectedIds));

						e.listItem = hovered;

						self.trigger("select", e);

						return;

					} else if (e.keyCode == 38 || e.keyCode == 40) {
						if (hovered) {
							if (e.keyCode == 38)
								self.hoverPrevVisibleItem(hovered);

							if (e.keyCode == 40)
								self.hoverNextVisibleItem(hovered);

						} else {
							self.hoverItem(self.getFirstVisibleItem());
						}
					}

					self.calcScrollBarPosition();
				}
			},


			"_eventFocus": function(context,e) {
				var c, value, msdb_value,
					self            = this,
					selectedIds     = self.getSelectedKeys(),
					list            = self.get("list", null, !1),
					dbox            = self.get("dbox", null, !1),
					contextElement  = e.currentTarget || (this instanceof Element ? this : null);

				self.open();

				if (  self.fx.isTextInput(contextElement)  ) {
					msdb_value = contextElement.getAttribute('data-msdb-value');

					if (msdb_value) msdb_value = msdb_value.trim();

					// Если в инпуте уже есть значения, отметить их в списке как выбранные
					if (!msdb_value) {
						value = self.fx.trim(contextElement.value,",; ").split(/[;,]/ig);

						for (c = 0; c < value.length; c++) value[c] = value[c].trim();

						self._selectByLabel(value, true);

					} else {
						msdb_value = msdb_value.split(/[;,]/ig);

						for (c = 0; c < msdb_value.length; c++) msdb_value[c] = msdb_value[c].trim();

						self._selectByValue(msdb_value, true);
					}
				}

				// Снять hover со строки
				self.unhideAllOpt();

				Object.keys(list).forEach(function(key) {
					var item = list[key];

					if (
						!(
							(
								typeof contextElement.type != "undefined"
								&& $.inArray(
									contextElement.type.toLowerCase(),
									["submit","button"]
								) > -1
							)
							|| (
								$.inArray(
									contextElement.tagName.toLowerCase(),
									["submit","body","select"]
								) > -1
							)
						)
					) {
						self.unhoverItem(item);
					}
				});

				selectedIds = selectedIds.concat(self.getSelectedKeys());

				// Записать value внутри инпута
				!self.get("freeWrite") && self.applySelectedToInput();

				// Отметить выбранные строки
				self.applySelectedToList(self._getItemsByID(selectedIds));

				// Положение ползунка
				self.calcScrollBarPosition();

				// Пересчет высоты внутри списка
				self._calcListContainerHeight();

				// Запустить событие
				// self.trigger("focus", e);
			},


			"_onFocusOut": function() {
				this.get("multiple", null, !1) && this.applySelectedToInput();
			},


			"_initEvents": function(arg) {
				var eventName,
					body = $("body").get(0),
					self = this,
					tmpEvents = {};

				// TODO переименовать this.events -> this._events;
				this.events = Object.create(null);

				// ----------------------------------------------------------------

				// События которые передаются в коррне обьекта-параметра
				for (eventName in arg) {
					if (!arg.hasOwnProperty(eventName)) continue;
					if (typeof arg[eventName] != "function") continue;
					tmpEvents[eventName.replace(/^on/,'')] = arg[eventName];
				}

				// События которые передаются в обькте events
				for (eventName in arg.events) {
					if (!arg.events.hasOwnProperty(eventName)) continue;
					if (typeof arg.events[eventName] != "function") continue;
					tmpEvents[eventName] = arg.events[eventName];
				}

				// Установка событий
				for (eventName in tmpEvents) {
					if (!tmpEvents.hasOwnProperty(eventName)) continue;
					this.on(
						eventName,
						tmpEvents[eventName]
					);
				}

				// ----------------------------------------------------------------

				this.on(
					"keyup",
					function(context, e) {
						self._eventCheckInputEmpty(e);
					}
				);

				this.on(
					"change",
					function(context, e) {
						self._eventCheckInputEmpty(e);
					}
				);

				this.on(
					"input:empty",
					self._eventDefaultInputEmpty
				);

				this.on("focus", self._eventFocus.bind(self));
				this.on("click", self._eventFocus.bind(self));

				this.on(
					"focusout",
					function(context, e) {
						// Хак для FireFox. В нем нет relatedTarget для focusout
						if (  !e.relatedTarget  ) {
							self._timers.focusoutInputs = setTimeout(
								function() {
									self.close();
								},
								self.get("focusOutInputsTimeoutDelay", null, !1)
							);
							return;
						}

						if (  self._isDBoxInput(e.relatedTarget)  ) {
							return;
						}

						if (
							self._isDBoxElement(e.relatedTarget)
							|| self._isTargetElement(e.relatedTarget)
						) {
							return;
						}

						self.close();
					}
				);

				this.on("focusout", this._onFocusOut);

				// Отменяет таймаут для FF relatedTarget хака
				// Поскольку является частью блока-списка
				$(this.get("dbox_input")).bind("focus", function() {
					clearTimeout(self._timers.focusoutInputs);
				});

				this.on("afterSet:list", this._eventSetList);

				// ----------------------------------------------------------------

				// При самой первой инициализации
				if (  self._isColdInit()  ) {
					window.addEventListener("resize", self._eventWindowResize.bind(self), false);
				}
			},


			"_deactivateInstances": function(e) {
				for (var c=0; c<this.instances.length; c++) {
					if (
						this.instances[c]._isDBoxElement(e.target)
						|| this.instances[c]._isTargetElement(e.target)
					) {
						continue;
					}
					if (  this.instances[c].isActive()  ) this.instances[c].close();
				}
			},


			"_initTarget": function() {
				var target = this.get("target");

				if (
					target
					&& typeof target == "object"
				) {

					if (typeof target == "string") {
						target = $(target).get(0);
						this.set("target", target, null, false);

					} else if (target instanceof Element) {
						this.set("target", target, null, false);

					} else if (target instanceof $) {
						this.set(target.get(0), null, false);
					}
				}
			},


			/**
			 * @description Fire specified event
			 * @param {String} eventName - event name
			 * @param {Event | Object=} e - event or data object
			 * */
			"trigger": function(eventName, e) {
				if (typeof eventName != "string") return this;

				eventName = eventName.toLowerCase();

				if (
					typeof this.events[eventName] == "object"
					&& Array.isArray(this.events[eventName])
				) {
					// window.CustomEvent может оказаться undefined
					// и тогда оператор выбросит ошибку
					if (
						!e
						|| (
							e instanceof (window.CustomEvent || Function) == false
							&& e instanceof (window.Event || Function) == false
							&& e instanceof $.Event == false
						)
					) {
						e = $.Event(eventName, e);

					} else if (e instanceof $.Event == false) {
						e = $.Event(eventName, e);
					}

					var events = this.events[eventName];

					for (var c=0; c<events.length; c++) {

						if (typeof events[c] != "function") continue;

						events[c].call(this, this, e);

					}
				}

				return this;
			},


			/**
			 * @description Attach specified event listener
			 * @param {String} eventName - event name
			 * @param  {Function} fx - event handler
			 * @return {MSelectDBox}
			 * */
			"on": function(eventName, fx) {
				var self = this,
					target = this.get("target", null, false),
					dboxInput = this.get("dbox_input", null, false);

				if (
					typeof eventName != "string"
					|| typeof fx != "function"
				) {
					return this;
				}

				eventName = eventName.toLowerCase();

				if (
					typeof this.events[eventName] != "object"
					|| !Array.isArray(this.events[eventName])
				) {

					this.events[eventName] = [];

					if (  this._targetEvents.hasOwnProperty(eventName)  ) {
						$(target).bind(
							this._targetEvents[eventName].event,
							function(e) {
								self.trigger(eventName, e);
							},
							null
						);

						// Событие для встроенного элемента-ввода
						if (  this._targetEvents[eventName].dbox_input  ) {
							$(dboxInput).bind(
								this._targetEvents[eventName].event,
								function(e) {
									self.trigger(eventName, e);
								},
								null
							);
						}
					}

				}

				this.events[eventName].push(fx);

				return this;
			},


			/**
			 * Detect user language
			 * @return {String}
			 * */
			"detectLanguage": function() {
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
			 * @description Returns text by specified key and language
			 * @param {String} key
			 * @param {String=} lang - язык выбираемого текста
			 * @return {String}
			 * */
			"getText": function(key, lang) {
				!lang && (lang = this.get("language") || this.detectLanguage());

				return (this._texts[key] || {})[lang] || "";
			},


			/**
			 * @description Set text to specified language
			 * @param {String} key
			 * @param {String} lang - language
			 * @param {String} text - text key
			 * @return {MSelectDBox}
			 * */
			"setText": function(text, key, lang) {
				var isProto = true,
					proto = this instanceof MSelectDBox
						? !(isProto = false) && Object.getPrototypeOf(this)
						: this;

				!proto._texts[key] && (proto._texts[key] = {});

				!lang && (lang = (!isProto && this.get("language")) || this.detectLanguage());

				proto._texts[key][lang] = text;

				return this;
			},


			/**
			 * @description Global elements
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
						position: "absolute", display: "block", width: "168px", padding: '8px', height: "auto", "box-shadow": "0 10px 20px -5px rgba(0, 0, 0, 0.4)", "background-color": "#FFF", "border-radius": "3px", border: "1px solid #e6e6e6"
					},
					".m-select-d-box:after": {
						content:'\'\'', position: "absolute", "border-left": "10px solid transparent", "border-right": "9px solid transparent", "border-bottom": "10px solid white", top: "-10px", left: "50%", "margin-left": "-10px"
					},
					".m-select-d-box:before": {
						content: '\'\'', position: "absolute", "border-left": "11px solid transparent", "border-right": "11px solid transparent", "border-bottom": "11px solid #e6e6e6", top: "-11px", left: "50%", "margin-left": "-11px"
					},
					".m-select-d-box_bottom:after": {
						content:'\'\'', position: "absolute", "border-left": "10px solid transparent", "border-right": "9px solid transparent", "border-bottom": "none", "border-top": "10px solid white", top: "auto", bottom: "-10px", left: "50%", "margin-left": "-10px"
					},
					".m-select-d-box_bottom:before": {
						border: "none"
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


			"_initStyles": function() {
				if (  !$('#m-select-d-box-style').length  )
					this._buildStyles();

				return this;
			},


			"_buildStyles": function() {
				var body = $("body");

				var buildCSS= function(obj) {
					var styleSelector, styleProp,
						str = "";

					for (styleSelector in obj) {
						if (  !Object.prototype.hasOwnProperty.call(obj, styleSelector)  ) continue;
						if (  styleSelector.match(/^@media/)  ) {
							str += styleSelector + " {" + buildCSS(obj[styleSelector]) + "} ";
							continue;
						}

						str += styleSelector + " {";

						for (styleProp in obj[styleSelector]) {
							if (  !Object.prototype.hasOwnProperty.call(obj[styleSelector], styleProp)  ) continue;
							str += styleProp + ":" + obj[styleSelector][styleProp] + ";";
						}

						str += "} ";
					}

					return str;
				};

				var css = buildCSS(this._globalStyles),
					styleElem = $('#m-select-d-box-style');

				if (  !styleElem.length  ) {
					styleElem = $('<style />');
					styleElem.attr("id", "m-select-d-box-style");
					body.append(styleElem);
				}

				styleElem.html(css);

				return this;
			},


			"_initProps": function(arg) {

				// var self = this;
				var c, v, prop, defaultProps = {};

				// TODO Сделать объект с ключами вместо массива
				var allowedKeys = [
					{ "key": "name",             "type": "string" },
					{ "key": "list",             "type": "array" },
					{ "key": "autoApply",        "type": "any",      "into": "boolean" },
					{ "key": "autoPosition",     "type": "any",      "into": "boolean" },
					{ "key": "autoComplete",     "type": "any",      "into": "boolean" },
					{ "key": "target",           "type": "object" },
					{ "key": "multiple",         "type": "any",      "into": "boolean" },
					{ "key": "zIndex",           "type": "numeric",  "into": "integer" },
					{ "key": "width",            "type": "any" },
					{ "key": "embeddedInput",    "type": "any",      "into": "boolean" },
					{ "key": "optionFilters",    "type": "array" },
					{ "key": "closeButton",      "type": "boolean" },
					{ "key": "language",         "type": "string",   "default": this.detectLanguage() },
					{ "key": "freeWrite",        "type": "any",      "into": "boolean" }
				];

				for (c = 0; c < allowedKeys.length; c++) {
					allowedKeys[c].key = allowedKeys[c].key.toLowerCase();
					if (  "default" in allowedKeys[c]  ) {
						defaultProps[allowedKeys[c].key] = allowedKeys[c].default;
					}
				}

				this.set(defaultProps);

				if (typeof arg != "object") return;

				for (prop in arg) {

					if (  !arg.hasOwnProperty(prop)  ) continue;

					var key = prop.toLowerCase();

					var option = null;

					for (v = 0; v < allowedKeys.length; v++) {
						if (  allowedKeys[v].key.toLowerCase() == key  ) {
							option = allowedKeys[v];
							break;
						}
					}

					if (  option  ) {

						if (  option.type == "any"  ) {

						} else if (  option.type == "array"  ) {
							if (  !Array.isArray(arg[prop])  ) {
								throw new Error("Argument data type mismatch (key: '" + prop + "')");
							}

						} else if (  option.type == "numeric"  ) {
							if (  isNaN(arg[prop])  ) {
								throw new Error("Argument data type mismatch (key: '" + prop + "')");
							}

						} else {
							if (  option.type != typeof arg[prop]  ) {
								throw new Error("Argument data type mismatch (key: '" + prop + "')");
							}
						}

						if (  option.hasOwnProperty("into")  ) {
							if (  option.into == "boolean"  ) {
								arg[prop] = Boolean(arg[prop])

							} else if (  option.into == "integer"  ) {
								arg[prop] = parseInt(arg[prop])

							} else if (  option.into == "float"  ) {
								arg[prop] = parseFloat(arg[prop])
							}
						}


						// Исключение
						if (prop == "width") {
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
					"firstItem": void 0,
					"lastItem": void 0,
					"hoveredCache": Object.create(null),
					"hiddenCache": Object.create(null),
					"selectedCache": Object.create(null),
					"valuesCache": Object.create(null),
					"labelsCache": Object.create(null)
				}, null, !1);

			},


			"_initElements": function() {

				var body = $("body").get(0);

				// --------------------------------------------------------------
				// "Фоновая тьма" для моб. устройств

				if (  !this._globalElems.fade  ) {
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

				if (  Boolean(this.get("embeddedInput"))  ) {
					searchInputContainer.className += " m-select-d-box__search-input-container_active";
				}

				this.set("dbox", dbox);

				if (  this.get("zIndex")  ) dbox.style.zIndex = this.get("zIndex");

				// --------------------------------------------------------------

				dbox.appendChild($('<ul class="m-select-d-box__list-container"></ul>').get(0));

				// --------------------------------------------------------------
				// Ширина

				var width = this.get("width");

				if (width == "auto") {
					dbox.style.width = this.get("target").clientWidth + "px";

				} else if (width == "min") {

				} else {
					dbox.style.width = width + "px";
				}

				body.appendChild(dbox);

			},


			"_initList": function() {

				var list = this.get("list", null, !1);

				if (  !$.isArray(list)  ) {
					this.set("list", [], null, false);
					return false;
				}

				var c, listItem, prev,
					labelCache = Object.create(null),
					valueCache = Object.create(null),
					self = this,
					dbox = this.get("dbox", null, !1),
					ul = $(".m-select-d-box__list-container", dbox).get(0);

				!this._onItemClick && (this._onItemClick = function(e) {
					clearTimeout(self._timers.focusoutInputs);

					var msdbid = this.getAttribute('data-msdbid'),
						list = self.get("list", null, !1),
						selectedIds = self.getSelectedKeys().concat(msdbid);

					if (  self.get("multiple", null, !1)  ) {
						list[msdbid].selected
							? self._deselectByID(msdbid)
							: self._selectByID(msdbid, !1);

					} else {
						self._selectByID(msdbid, true);
					}

					self.applySelectedToInput();
					self.applySelectedToList(self._getItemsByID(selectedIds));

					e.listItem = list[msdbid];

					self.trigger("select", e);

					self.calcPosition();

					if (!self.get("multiple", null, !1)) self.close();
				});

				!this._onMouseLeave && (this._onMouseLeave = function() {
					var jqThis = $(this);

					if (jqThis.hasClass("m-select-d-box__list-item_hover"))
						jqThis.removeClass("m-select-d-box__list-item_hover");
				});

				ul.innerHTML = "";

				for (c = 0; c < list.length; c++) {
					if (!([list[c]] + "")) continue;

					if (  $.inArray(typeof list[c], ["number","string"]) > -1  ) {
						list[c] = {
							"value": list[c] + "",
							"label": list[c] + "",
							"selected": false
						};

					} else if (
						typeof list[c] == "object"
						&& this.fx.hop(list[c], "value")
						&& this.fx.hop(list[c], "label")
					) {
						if (  typeof list[c].selected == "undefined"  ) {
							list[c].selected = false;

						} else {
							list[c].selected = Boolean(list[c].selected);
						}

						list[c].value += "";
						list[c].label += "";

					} else {
						continue;
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
					listItem.isHovered = false;
					listItem.elem = document.createElement("li");
					listItem.elem.className = "m-select-d-box__list-item";
					listItem.elem.setAttribute('data-msdbid', c + '');
					listItem.$elem = $(listItem.elem);

					// addEventListener || attachEvent
					$(listItem.elem).bind("click", this._onItemClick, null);

					// addEventListener || attachEvent
					$(listItem.elem).bind("mouseleave", this._onMouseLeave, null);

					listItem.elem.innerHTML = listItem.label;
					ul.appendChild(listItem.elem);

				} // close.list.for

				this.set('firstItem', list[0], null, !1);
				this.set("lastItem", list[list.length - 1], null, !1);
				this.set("labelsCache", labelCache, null, !1);
				this.set("valuesCache", valueCache, null, !1);

			},


			"init": function(arg) {

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

				this.set("autoCompleteTimeoutDelay", 500, null, false);
				this.set("focusOutInputsTimeoutDelay", 250, null, false);

				this._timers = Object.create(null);
				this._timers.autoComplete = null;
				this._timers.focusedInputs = null;
				this._timers.focusoutInputs = null;

				// --------------------------------------------------------------------------------
				// Целевой элемент

				var target = this.get("target", null, !1);

				// --------------------------------------------------------------------------------
				// Контейнер списка

				var dbox = this.get("dbox", null, !1);

				// --------------------------------------------------------------------------------

				if (  self.get("name", null, !1)  ) {
					target.setAttribute("data-msdb-name", self.get("name", null, !1));
					dbox.setAttribute("data-msdb-name", self.get("name", null, !1));
				}

				self.on(
					"keydown",
					function(context, e) {
						self._eventDefaultKeyDownMultipleFalse(e);
						self._eventDefaultKeyDownMultipleTrue(e);
					}
				);

				self.on(
					"keyup",
					function(context, e) {
						self._eventDefaultKeyUp(e);
					}
				);

				// --------------------------------------------------------------
				// Инициализация матчеров строк

				if (  !self.get("optionFilters", null, !1)  ) {
					self.set(
						"optionFilters",
						[self.defaultOptionFilters.default],
						null, false
					);
				}

				// --------------------------------------------------------------

				if (  self._isColdInit()  ) {
					$(body).bind(
						"click",
						function(e) {
							self._deactivateInstances(e);
						}, null
					);
				}

				// --------------------------------------------------------------
				// instances размещен в конце для правильной работы this._isColdInit()

				this.instances.push(this);

				self.trigger("init");
			},


			/**
			 * Применяет языковые настройки к глобальным (общим) элементам имеющие подписи
			 * @protected
			 * @param {String} lang - устанавливаемый язык
			 * */
			"_applyLang": function(lang) {
				if (this._lastLang == lang) return;

				Object.getPrototypeOf(this)._lastLang = lang;

				// TODO существуют и другие места где необходимо сменить язык

				$(this._globalElems.fade)
					.find(".m-select-d-box-fade__outside-click-label-text")
					.html(this.getText(".m-select-d-box-fade__outside-click-label-text"));
			},


			/**
			 * @description Calculate position of list container
			 * */
			"calcPosition": function() {
				var self = this,
					body = $("body").get(0),
					target = this.get("target", null, !1),
					dbox = this.get("dbox", null, !1),
					jqDBox = $(dbox),
					offset = $(target).offset(),
					thisWidth = target.clientWidth,
					thisHeight = target.clientHeight,
					dboxWidth = dbox.clientWidth;

				jqDBox.removeClass("m-select-d-box_bottom");

				dbox.style.left = (offset.left + (thisWidth / 2) - ((dboxWidth + (self._globalStyles[".m-select-d-box"].padding.replace(/[px]/gi,"") * 2)) / 2)) + "px";

				var scrollY = window.scrollY || body.scrollTop;

				// TODO _isBoxBottomState()
				if ( (dbox.clientHeight + offset.top + thisHeight + 12 - scrollY) > window.innerHeight) {
					dbox.style.top = (offset.top - 12 - dbox.clientHeight) + "px";
					jqDBox.addClass("m-select-d-box_bottom");
				} else {
					dbox.style.top = (offset.top + thisHeight + 12) + "px";
				}
			},


			/**
			 * Calc and apply scrollbar position of list container
			 * */
			"calcScrollBarPosition": function() {
				var dbox = this.get("dbox", null, !1),
					ul = $(".m-select-d-box__list-container", dbox).get(0),

					selected = !this.get("multiple", null, !1)
						? this.getSelectedItems()[0]
						: this.getHoveredItems()[0];

				if (!selected) return;

				var top = selected.$elem.position().top + ul.scrollTop;

				if (top < ul.clientHeight / 2)
					return ul.scrollTop = 0;

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
			 * @protected
			 * @ignore
			 * */
			"_calcListContainerHeight": function() {
				var listContainer = $(this.get("dbox", null, !1))
					.find(".m-select-d-box__list-container")
					.get(0);

				if (this._isMobileState()) {
					var vh = window.innerHeight / 100;

					return listContainer.style.maxHeight = ((vh * 90) - 64 - 40) + "px";
				}

				if (listContainer.style.maxHeight)
					listContainer.style.maxHeight = "";
			},


			"_isDBoxElement": function(element) {
				var dbox = this.get("dbox", null, !1);

				return !!$(dbox).find(element).length || dbox == element
			},


			"_isTargetElement": function(element) {
				var target = this.get("target", null, !1);

				return !!$(target).find(element).length || target == element
			},


			"_isDBoxInput": function(elem) {
				return this.get("dbox_input") === elem;
			},


			/**
			 * return true если соблюдены условия для показа мобильной версии
			 * @protected
			 * @return {Boolean}
			 * @ignore
			 * */
			"_isMobileState": function() {
				return (
					window.innerWidth <= 640
					|| (
						window.innerWidth <= 740
						&& this.fx.isHDensScreen()
					)
				);
			},


			"_isBoxBottomState": function() {
				var dbox = this.get("dbox", null, null);

				return Boolean(dbox.className.match(new RegExp("m-select-d-box_bottom")));
			},


			"_isColdInit": function() {
				return !this.instances.length;
			},


			/**
			 * Returns hovered options (Array of objects)
			 * @return {Array}
			 * */
			"getHoveredItems": function() {
				var cache = this.get("hoveredCache", null, !1);

				return Object.keys(cache).map(function(c) {
					return cache[c];
				});
			},


			/**
			 * @description Return keys of selected options
			 * @return {Array}
			 * */
			"getSelectedKeys": function() {
				return Object.keys(this.get('selectedCache', null, !1));
			},


			/**
			 * @description Return values of selected options
			 * @return {Array}
			 * */
			"getSelectedValues": function() {
				var cache = this.get("selectedCache", null, !1);

				return Object.keys(cache).map(function(c) {
					return cache[c].value;
				});
			},


			/**
			 * @description Return labels of selected options
			 * @return {Array}
			 * */
			"getSelectedLabels": function() {
				var cache = this.get("selectedCache", null, !1);

				return Object.keys(cache).map(function(c) {
					return cache[c].label;
				});
			},


			/**
			 * Returns selected list options (Array of object)
			 * @return {Array}
			 * */
			"getSelectedItems": function() {
				var cache = this.get("selectedCache", null, !1);

				return Object.keys(cache).map(function(c) {
					return cache[c];
				});
			},


			/**
			 * @description Check existence of value in list
			 * @param {String} value
			 * @return {Boolean}
			 * */
			"hasValue": function(value) {
				var cache = this.get("valuesCache", null, !1);

				return !!cache[value];
			},


			/**
			 * @description Check existence of label in list
			 * @param {String} label
			 * @return {Boolean}
			 * */
			"hasLabel": function(label) {
				var cache = this.get("labelsCache", null, !1);

				return !!cache[label];
			},


			/**
			 * Apply selected options to list container
			 * @param {Array=} list - in purpose of optimisation (performance) you can use specific list options. By default method uses all list options
			 * @return {MSelectDBox}
			 * */
			"applySelectedToList": function(list) {
				!list && (list = this.get("list", null, !1));

				Object.keys(list).forEach(function(c) {
					if (!list[c]) return;

					$.fn[list[c].selected ? "addClass" : "removeClass"]
						.call([list[c].elem], "m-select-d-box__list-item_selected");
				});

				return this;
			},


			/**
			 * Apply selected options to control
			 * @return {MSelectDBox}
			 * */
			"applySelectedToInput": function() {
				var self = this,
					listValue = self.getSelectedValues(),
					listLabel = self.getSelectedLabels(),
					target = this.get("target", null, !1),
					dboxInput = this.get("dbox_input", null, !1);

				dboxInput.value =  listLabel.join("; ") + (!listLabel.length || !this.get("multiple") ? "" : ";");

				var tagName = target.tagName.toLowerCase();

				if ( tagName == "input" ) {
					if (  self.fx.isTextInput(target)  ) target.value = dboxInput.value;

				} else if ( tagName == "textarea" ) {
					target.value = listLabel.join(";\n") + (!listLabel.length || !this.get("multiple") ? "" : ";\n");

				} else if ( tagName == "select" ) {
					for (var v = 0; v < target.options.length; v++) {
						target.options[v].selected = $.inArray(target.options[v].value, listValue) > -1;
					}
				}

				target.setAttribute("data-msdb-value", listValue.join(";") + (!listValue.length || !this.get("multiple", null, !1) ? "" : ";"));

				return this;
			},


			/**
			 * @description Select specified option in list
			 * @param {Object} arg
			 * @param {String | Array} arg.value - select by value
			 * @param {String | Array} arg.label - select by label
			 * @param {Number} arg.id - select by id
			 * @param {Boolean} arg.blank - reset previous selected options
			 * */
			"select": function(arg) {
				var selectedIds = this.getSelectedKeys();

				this._select(arg);

				this.applySelectedToList(
					this._getItemsByID(
						selectedIds.concat(this.getSelectedKeys())
					)
				);

				this.applySelectedToInput();

				return this;
			},


			"_select": function(arg) {
				if (typeof arg != "object" || $.isArray(arg)) return;

				var value, key, blank = true;

				if ("blank" in arg) blank = !!arg.blank;

				if ("id" in arg) {
					this._selectByID(arg.id, blank);
					return;
				}

				if ("value" in arg) {
					value = arg.value;
					key = "value";

				} else if ("label" in arg) {
					value = arg.label;
					key = "label";

				} else {
					return;
				}

				value = [].concat(value);

				if (!this.get("multiple", null, !1) && value.length > 1) return null;

				if (key == "value") this._selectByValue(value, blank);
				else if (key == "label") this._selectByLabel(value, blank);
			},


			/**
			 * Выбрать по значению в списке
			 * @protected
			 * @param {Array} value
			 * @param {Boolean} reset - обнуть ранее выбранные строки
			 * */
			"_selectByValue": function(value, reset) {
				reset && this._deselectAll();

				var c,
					valuesCache = this.get("valuesCache", null, !1),
					selectedCache = this.get("selectedCache", null, !1);

				for (c = 0; c < value.length; c++) {
					if (!this.fx.hop(valuesCache, value[c])) continue;
					valuesCache[value[c]].selected = true;
					selectedCache[valuesCache[value[c]].id] = valuesCache[value[c]];
				}
			},


			/**
			 * Выбрать по названию строки
			 * @protected
			 * @param {Array} label
			 * @param {Boolean} reset - обнуть ранее выбранные строки
			 * */
			"_selectByLabel": function(label, reset) {
				reset && this._deselectAll();

				var c,
					labelsCache = this.get("labelsCache", null, !1),
					selectedCache = this.get("selectedCache", null, !1);

				for (c = 0; c < label.length; c++) {
					if (!this.fx.hop(labelsCache, label[c])) continue;
					labelsCache[label[c]].selected = true;
					selectedCache[labelsCache[label[c]].id] = labelsCache[label[c]];
				}
			},


			/**
			 * @description Снять выделение с указанного элемента
			 * @param {Object} arg
			 * @param {String | Array} arg.value - deselect by value
			 * @param {String | Array} arg.label - deselect by label
			 * @param {Number | String | Array} arg.id - deselect by id
			 * */
			"deselect": function(arg) {
				var selectedIds = this.getSelectedKeys();

				this._deselect(arg);

				this.applySelectedToList(
					this._getItemsByID(
						selectedIds.concat(this.getSelectedKeys())
					)
				);

				this.applySelectedToInput();

				return this;
			},


			/**
			 * Снять выделение
			 * @protected
			 * @param {Object} arg
			 * @param {Array | String} arg.value
			 * @param {Array | String} arg.label
			 * @param {Array | String | Number} arg.id
			 * */
			"_deselect": function(arg) {
				if (!$.isPlainObject(arg)) return;

				if ("value" in arg)
					return this._deselectByValue([].concat(arg.value));

				if ("label" in arg)
					return this._deselectByLabel([].concat(arg.label));

				if ("id" in arg)
					this._deselectByID(arg.id);
			},


			/**
			 * Снять выделение по значению
			 * @protected
			 * @param {Array | String} argVal
			 * */
			"_deselectByValue": function(argVal) {
				argVal = [].concat(argVal);

				var c, value, id,
					valuesCache = this.get("valuesCache", null, !1),
					selectedCache = this.get("selectedCache", null, !1);

				for (c = 0; c < argVal.length; c++) {
					value = argVal[c];

					if (!this.fx.hop(valuesCache, value)) continue;

					id = valuesCache[value].id;

					valuesCache[value].selected = false;
					delete selectedCache[id];
				}
			},


			/**
			 * Снять выделение по label строки списка
			 * @protected
			 * @param {Array | String} argLab - заголовки строк списка
			 * */
			"_deselectByLabel": function(argLab) {
				argLab = [].concat(argLab);

				var c, label, id,
					labelsCache = this.get("labelsCache", null, !1),
					selectedCache = this.get("selectedCache", null, !1);

				for (c = 0; c < argLab.length; c++) {
					label = argLab[c];

					if (!this.fx.hop(labelsCache, label)) continue;

					id = labelsCache[label].id;

					labelsCache[label].selected = false;
					delete selectedCache[id];
				}
			},


			/**
			 * Получить элементы списка по ключам (id)
			 * @protected
			 * @param {Array} ids - ключи списка
			 * @return {Object}
			 * */
			"_getItemsByID": function(ids) {
				var c, obj = Object.create(null),
					list = this.get("list", null, !1);

				for (c=0; c<ids.length; c++)
					obj[ids[c]] = list[ids[c]];

				return obj;
			},


			/**
			 * Hide specified list option
			 * @param {Object} item - list option
			 * @return {MSelectDBox}
			 * */
			"hideItem": function(item) {
				if (item) {
					var cache = this.get("hiddenCache", null, !1);

					cache[item.value] = item;

					item.$elem.addClass("m-select-d-box__list-item_hidden");
				}

				return this;
			},


			/**
			 * Make visible specified list option
			 * @param {Object} item - list option
			 * @return {MSelectDBox}
			 * */
			"unhideItem": function(item) {
				if (item) {
					var cache = this.get("hiddenCache", null, !1);

					delete cache[item.value];

					item.$elem.removeClass("m-select-d-box__list-item_hidden");
				}

				return this;
			},


			/**
			 * Make visible all list options
			 * */
			"unhideAllItems": function() {
				var cache = this.get("hiddenCache", null, !1);

				Object.keys(cache).forEach(function(k) {
					this.unhideItem(cache[k]);
				}, this);
			},


			/**
			 * Check visibility of list option
			 * @param {Object} item - строка в списке
			 * @return {Boolean}
			 * */
			"isVisibleItem": function(item) {
				return !!item && !item.$elem.hasClass("m-select-d-box__list-item_hidden");
			},


			/**
			 * Apply hover to specified option in list
			 * @param {Object} item - list option
			 * @return {MSelectDBox}
			 * */
			"hoverItem": function(item) {
				if (!item)
					return this;

				var cache = this.get("hoveredCache", null, !1);

				item.isHovered = true;
				item.$elem.addClass("m-select-d-box__list-item_hover");
				cache[item.id] = item;

				return this;
			},


			/**
			 * Take off hover to specified option in list
			 * @param {Object} item - list option
			 * @return {MSelectDBox}
			 * */
			"unhoverItem": function(item) {
				if (!item)
					return this;

				var cache = this.get("hoveredCache", null, !1);

				item.isHovered = false;
				item.$elem.removeClass("m-select-d-box__list-item_hover");

				delete cache[item.id];

				return this;
			},


			/**
			 * Take off hover to all options in list
			 * @return {MSelectDBox}
			 * */
			"unhoverAllItems": function() {
				var cache = this.get("hoveredCache", null, !1);

				Object.keys(cache).forEach(function(c) {
					this.unhoverItem(cache[c]);
				}, this);

				return this;
			},


			/**
			 * Hover next option in list
			 * @param {Object} item - current (relative) list option
			 * @return {MSelectDBox}
			 * */
			"hoverNextVisibleItem": function(item) {
				var next = this.getNextVisibleItem(item);

				if (next) {
					this.unhoverItem(item);
					this.hoverItem(next);
				}

				return this;
			},


			/**
			 * Hover previous option in list
			 * @param {Object} item - current (relative) list option
			 * @return {MSelectDBox}
			 * */
			"hoverPrevVisibleItem": function(item) {
				var prev = this.getPrevVisibleItem(item);

				if (prev) {
					this.unhoverItem(item);
					this.hoverItem(prev);
				}

				return this;
			},


			/**
			 * Get next visible option in list
			 * @param {Object} item - current (relative) list option
			 * @return {Object | undefined}
			 * */
			"getNextVisibleItem": function(item) {
				if (!item || !item.next) return;

				if (!this.isVisibleItem(item.next))
					return this.getNextVisibleItem(item.next);

				return item.next;
			},


			/**
			 * Get previous visible option in list
			 * @param {Object} item - current (relative) list option
			 * @return {Object | undefined}
			 * */
			"getPrevVisibleItem": function(item) {
				if (!item || !item.prev) return;

				if (!this.isVisibleItem(item.prev))
					return this.getPrevVisibleItem(item.prev);

				return item.prev;
			},


			/**
			 * Select next visible option in list
			 * @param {Object} item - current (relative) list option
			 * @return {Object}
			 * */
			"selectNextVisibleItem": function(item) {
				if (!item) return;

				var selected = this.getSelectedItems();

				item = this.getNextVisibleItem(item);

				if (!item) item = arguments[0];

				this._selectByID(item.id, true);
				this.applySelectedToInput();
				this.applySelectedToList(selected.concat(this.getSelectedItems()));

				return item;
			},


			/**
			 * Select previous visible option in list
			 * @param {Object} item - current (relative) list option
			 * @return {Object}
			 * */
			"selectPrevVisibleItem": function(item) {
				if (!item) return;

				var selected = this.getSelectedItems();

				item = this.getPrevVisibleItem(item);

				if (!item) item = arguments[0];

				this._selectByID(item.id, true);
				this.applySelectedToInput();
				this.applySelectedToList(selected.concat(this.getSelectedItems()));

				return item;
			},


			/**
			 * Get last visible option in list
			 * @return {Object}
			 * */
			"getLastVisibleItem": function() {
				var item = this.get("lastItem", null, !1);

				return (this.isVisibleItem(item) && item) || this.getPrevVisibleItem(item);
			},


			/**
			 * Get first visible option in list
			 * @return {Object}
			 * */
			"getFirstVisibleItem": function() {
				var item = this.get("firstItem", null, !1);

				return (this.isVisibleItem(item) && item) || this.getNextVisibleItem(item);
			},


			/**
			 * @description Выделяет пункт из списка по ключу. Каждый раз определяет новую выборку.
			 * @protected
			 * @param {Array | Number | String} ids - ключи строк списка
			 * @param {Boolean=} reset - сбросить уже выбранные строки
			 * */
			"_selectByID": function(ids, reset) {
				ids = [].concat(ids);

				var c, list = this.get("list", null, !1),
					cache = this.get("selectedCache", null, !1);

				reset && this._deselectAll();

				for (c=0; c<ids.length; c++) {
					if (  !list.hasOwnProperty(ids[c])  ) continue;

					list[ids[c]].selected = true;
					cache[ids[c]] = list[ids[c]];
				}
			},


			/**
			 * @description Сниманиет выделение только с указанной выборки, не затрагивая остальные
			 * @protected
			 * @param {Array | Number | String} ids - ключи списка
			 * */
			"_deselectByID": function(ids) {
				ids = [].concat(ids);

				var c, list = this.get("list", null, !1),
					cache = this.get("selectedCache", null, !1);

				for (c = 0; c < ids.length; c++) {
					if (!list.hasOwnProperty(ids[c])) continue;

					list[ids[c]].selected = false;
					delete cache[ids[c]];
				}
			},


			"_optionFiltersMatcher": function(filters, matcherStr, matchedStr) {
				if (arguments.length < 3) return true;
				if (typeof filters == "function") filters = [filters];
				if (!$.isArray(filters)) return false;
				for (var c=0; c<filters.length; c++) {
					if (  filters[c].call(this, matcherStr, matchedStr)  ) {
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
				"default": function(matcherStr, matchedStr) {
					if (
						typeof matcherStr != "string"
						|| typeof matchedStr != "string"
					) {
						return false;
					}

					var pattern = new RegExp(matcherStr.toLowerCase().trim());
					matchedStr = matchedStr.toString().toLowerCase();

					return Boolean(matchedStr.match(pattern));
				},

				"russianKeyboard": function(value, item_label) {
					if (
						typeof value != "string"
						|| typeof item_label != "string"
					) {
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

					for (var c= 0, L=value2.length; c<L; c++) {
						if (  enRu.hasOwnProperty(value2[c])  ) {
							value2[c] = enRu[value2[c]];
						}
					}

					return this.defaultOptionFilters.default(value2.join(""), item_label);
				}
			},


			/**
			 * Apply autocomplete to list
			 * @param {String} value
			 * @return MSelectDBox
			 * */
			"applyAutoComplete": function(value) {
				var list = this.get("list", null, !1),
					listKeys = Object.keys(list),
					hiddenCache = this.get("hiddenCache", null, !1),
					optFilters = this.get("optionFilters", null, !1);

				if (!value) {
					this.unhideAllOpt();

				} else {
					listKeys.forEach(function(c) {
						if (!this._optionFiltersMatcher(optFilters, value, list[c].label)) {
							this.hideItem(list[c]);

						} else {
							this.unhideItem(list[c]);
						}
					}, this);
				}

				Object.keys(hiddenCache).length == listKeys.length
					? this.trigger("autocomplete:empty")
					: this.trigger("autocomplete:not-empty");

				return this;
			},


			/**
			 * @description Deselect all options in list
			 * @return {MSelectDBox}
			 * */
			"deselectAll": function() {
				this._deselectAll();
				this.applySelectedToList();
				this.applySelectedToInput();

				return this;
			},


			"_deselectAll": function() {
				var cache = this.get("selectedCache", null, !1);

				Object.keys(cache).forEach(function(c) {
					cache[c].selected = false;
					delete cache[c];
				});
			},


			/**
			 * @description Select all options in list
			 * @return {MSelectDBox}
			 * */
			"selectAll": function() {
				if (!this.get("multiple", null, !1)) return this;

				var c, k,
					selectedCache = this.get("selectedCache", null, !1),
					list = this.get("list", null, !1),
					keys = Object.keys(list);

				for (c = 0; c < keys.length; c++) {
					k = keys[c];
					list[k].selected = true;
					selectedCache[k] = list[k];
				}

				this.applySelectedToList();
				this.applySelectedToInput();

				return this;
			},


			/**
			 * @description Check visible state of list
			 * @return {Boolean}
			 * */
			"isActive": function() {
				var dbox = this.get("dbox", null, null);
				return $(dbox).hasClass("m-select-d-box_hidden") == false
			},


			"reInitList": function() {
				this._initList();

				var c, key,
					list = this.get("list"),
					selectedCache = this.get("selectedCache", null, !1),
					valuesCache = this.get("valuesCache", null, !1),
					labelsCache = this.get("labelsCache", null, !1),
					hoveredCache = this.get("hoveredCache", null, !1),
					keys = Object.keys(selectedCache);

				// После перестройки списка
				// сохранить выделенные элементы если значение и заголовок совпадает
				for (c = 0; c < keys.length; c++) {
					key = keys[c];

					if (
						!valuesCache[selectedCache[key].value]
						|| !labelsCache[selectedCache[key].label]
					) {
						delete selectedCache[key];
						continue;
					}

					selectedCache[key] = valuesCache[selectedCache[key].value];
					selectedCache[key].selected = true;
				}

				Object.keys(hoveredCache).forEach(function(c) {
					hoveredCache.isHovered = false;
					delete hoveredCache[c];
				});

				this.applySelectedToInput();
				this.applySelectedToList();
			},


			/**
			 * @description Hide list
			 * @return MSelectDBox
			 * */
			"close": function() {
				var dbox = this.get("dbox", null, !1);

				$(dbox).addClass("m-select-d-box_hidden");
				this._closeFade();
				this.unhoverAllItems();

				return this;
			},


			/**
			 * @description show list
			 * @return {MSelectDBox}
			 * */
			"open": function() {
				var dbox = this.get("dbox", null, !1);

				$(dbox).removeClass("m-select-d-box_hidden");
				this.calcPosition();
				this._openFade();
				this._applyLang(this.get("language", null, !1));
				this._isMobileState() && this.get("dbox_input").focus();

				return this;
			},


			"_openFade": function() {
				$(this._globalElems.fade).removeClass("m-select-d-box_hidden");
			},


			"_closeFade": function() {
				$(this._globalElems.fade).addClass("m-select-d-box_hidden");
			},


			/**
			 * Снять список с контрола
			 * @ignore
			 * */
			"destroy": function() {
				// TODO unbind events

				var self = this,
					target = this.get("target", null, 0),
					proto = Object.getPrototypeOf(this);

				target.removeAttribute("data-msdb-name");
				target.removeAttribute("data-msdb-value");

				this.set("target", void 0, null, false);

				$(this.get("dbox")).remove();

				proto.instances = $.grep(proto.instances, function(a) {
					return a != self;
				});
			},


			"fx": {
				"isTextInput": function(elem) {
					if (elem instanceof Node === false) return false;
					var tagName = elem.tagName.toLowerCase();
					if (  tagName == "input"  ) {
						if (
							elem.type
							&& $.inArray(elem.type.toLowerCase(), ["text", "password", "email", "url", "search", "tel"]) > -1
						) {
							return true;
						}

					} else if (  tagName == "textarea"  ) {
						return true;
					}
					return false;
				},

				"isHDensScreen": function() {
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

				"isRetinaScreen": function() {
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

				"msplit": function(d,s) {
					s = s.replace(new RegExp('['+d.join('')+']','g'),d[0]);
					return s.split(d[0]);
				},

				"trim": function(str, ch, di) {
					var regEx = [];

					if (!di || di == "left")
						regEx.push("^[" + ch + "]+");

					if (!di || di == "right")
						regEx.push("[" + ch + "]+$");

					return str.replace(new RegExp(regEx.join("|"), "g"), '');
				},

				"rest": function(arr, n) {
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

		MSelectDBox.prototype.unhoverAllOpt = MSelectDBox.prototype.unhoverAllItems;
		MSelectDBox.prototype.unhideAllOpt = MSelectDBox.prototype.unhideAllItems;

		// ---------------------------------------------------------------------------------------------------

		var methodsList = {
				"open": 1, "close": 1, "isActive": 1, "get": 1, "set": 1, "select": 1, "selectAll": 1,
				"deselectAll": 1, "on": 1, "trigger": 1, "getSelectedLabels": 1, "getSelectedValues": 1,
				"getSelectedKeys": 1, "getText": 1, "setText": 1
			},
			
			jQueryChainMethods = {
				"open": 1, "close": 1, "set": 1, "select": 1, "selectAll": 1, "deselectAll": 1, "on": 1,
				"trigger": 1, "setText": 1
			},
			
			jQueryValFn = $.fn.val;

		$.fn.extend({
			"val": function(value) {
				if (this.attr('data-msdb-value')) {
					if (!value)
						return this.mSelectDBox().getSelectedValues();

					return this.mSelectDBox().select({ value: value }) && this;
				}

				return jQueryValFn.apply(this, arguments);
			},

			"mSelectDBox":  function(arg) {
				if (!this.length) return;

				// var name = this[0].getAttribute("data-msdb-name");
				var c, ret, rest,
					instances = MSelectDBox.prototype.getInstances(),
					instance = void 0,
					input = this[0];

				// TODO Получать экземпляр непосредственно из DOM элемента
				for (c=0; c<instances.length; c++) {
					if (  instances[c].get("target") == input  ) {
						instance = instances[c];
						break;
					}
				}

				if (!arguments.length) {
					return instance;

				} else if (typeof arg == "string") {
					if (  methodsList[arg]  ) {
						rest = MSelectDBox.prototype.fx.rest(arguments, 1);

						if (  typeof instance[arg] == "function"  ) {
							ret = instance[arg].apply(instance, rest);

							return jQueryChainMethods[arg]
								? this
								: ret;
						}
					}

				} else if (typeof arg == "object") {
					// Создать новый экземпляр и привязать его к инпуту
					arg.target = this[0];
					return new MSelectDBox(arg);
				}

				return this;
			}
		});

		$.prototype.mSelectDBox.prototype = MSelectDBox.prototype;

	})(jQuery);