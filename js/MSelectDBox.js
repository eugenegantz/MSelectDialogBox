
	// ========== Диалогбокс ==========

	(function($){

		/**
		 * @constructor
		 * @global
		 * */
		var MSelectDBox = function(arg){
			this.init(arg);
		};

		MSelectDBox.prototype = {
			"instances": [],


			/**
			 * @param {String} key - key of instance property
			 * @param {Object=} arg - optional arguments,
			 * @param {Boolean} e - event trigger on|off. If "false"  then "get" won't trigger event
			 * @memberof MSelectDBox
			 * @return {*}
			 * */
			"get" : function(key,arg,e){

				var self = this, tmp;

				if (typeof key != "string") return;

				key = key.toLowerCase();

				// .....................

				if (typeof e == "undefined") e = 1;

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
			 * @param {Boolean} e - event trigger on|off. If "false"  then "set" won't trigger event
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

				if (typeof e == "undefined") e = 1;

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
			 * @return {MSelectDBox}
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


			"_targetEvents": [
				{"name": "click", "event": "click"},
				{"name": "keydown", "event": "keydown"},
				{"name": "keyup", "event": "keyup"},
				{"name": "hover", "event": "hover"},
				{"name": "focus", "event": "focus"},
				{"name": "focusout", "event": "focusout"},
				{"name": "change", "event": "change"}
			],


			/**
			 * @ignore
			 * */
			"_eventCheckInputEmpty": function(e){
				var target = this.get("target");
				var list = this.get("list");

				if (
					(
						$.inArray(target.tagName.toLowerCase(), ["input","textarea"]) != -1
					|| $.inArray(target.type.toLowerCase(), ["text", "password", "email", "url", "search", "tel"]) != -1
					)
					&& !target.value.trim()
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
			 * @ignore
			 * */
			"_eventDefaultKeyUp": function(e){

				var self						= this;
				var target					= self.get("target");
				var keyCode				= e.keyCode;
				var list						= self.get("list");
				var dbox						= self.get("dbox");
				var contextElement		= e.currentTarget;

				clearTimeout(self._timers.autoComplete);

				self._timers.autoComplete = setTimeout(function(){
					var value, v;

					// ... autoComplete
					if (  self.get("autoComplete")  ){

						if (  $.inArray(keyCode, [37,38,39,40,9,13,18,17,16,20,27]) > -1 ){

						} else {

							var li	= $(".MSelectDBox__list-item", dbox);
							value	= target.value.toLowerCase();
							// value	= self.fx.trim(value,";, ","both");
							value	= self.fx.msplit([';',','],value);
							value = value[value.length-1];

							// var pattern = new RegExp(value.trim());

							for(v=0; v<li.length; v++){
								var msdbid = parseInt(li[v].getAttribute("data-msdbid"));
								var jqLi = $(li[v]);

								if (  !value  ){
									jqLi.removeClass('MSelectDBox__list-item_hidden');

								} else if (
									!self._optionFiltersMatcher(self.get("optionFilters"), value, list[msdbid].label)
								){
									jqLi.addClass('MSelectDBox__list-item_hidden');

								} else {
									jqLi.removeClass('MSelectDBox__list-item_hidden');

								}

								jqLi.removeClass('MSelectDBox__list-item_hover');
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
				var list = self.get("list");
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

					li = $('li:not(.MSelectDBox__list-item_hidden)', dbox);

					var selectedLi = -1;
					var jqli;

					for(c=0, L=li.length; c<L; c++){
						jqli = $(li[c]);
						if (  jqli.hasClass("MSelectDBox__list-item_selected")  ){
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
				var target = self.get("target");
				var dbox = self.get("dbox");
				var list = self.get("list");
				var selectedKey;

				if (  self.get("multiple")  ){
					if (  $.inArray(e.keyCode, [37,39,9,18,17,16,20,27]) > -1  ){
						// left, right, tab, alt, ctrl, shift, caps, esc

					} else if (  e.keyCode == 13  ){
						// Enter
						var hoveredLi = $(".MSelectDBox__list-item_hover",dbox);

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

						// var ul = $(".MSelectDBox__list-container", dbox);

						var li = $('.MSelectDBox__list-item:not(.MSelectDBox__list-item_hidden)', dbox);

						hoveredLi = -1;
						var jqli;

						for(c=0, L=li.length; c<L; c++){
							jqli = $(li[c]);
							if (  jqli.hasClass("MSelectDBox__list-item_hover")  ) {
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

						$(li[newHoveredLi]).addClass("MSelectDBox__list-item_hover");

						if (hoveredLi > -1 && newHoveredLi != hoveredLi){
							$(li[hoveredLi]).removeClass("MSelectDBox__list-item_hover");
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

				var contextElement = (  e.currentTarget || (this instanceof Element ? this : null )  );

				if (
					$.inArray(contextElement.tagName.toLowerCase(), ["input","textarea"]) != -1
					|| (
					contextElement.type
					&& $.inArray(contextElement.type.toLowerCase(), ["text", "password", "email", "url", "search", "tel"]) != -1
					)
				){
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
					dbox_li.removeClass('MSelectDBox__list-item_hidden');
					for (v=0; v<dbox_li.length; v++){
						if (
							(
								typeof contextElement.type != "undefined"
								&& $.inArray(contextElement.type.toLowerCase(), ["submit","button"]) > -1
							)
							|| (  $.inArray(contextElement.tagName.toLowerCase(), ["submit","body","select"]) > -1 )
						){

						} else {
							$(dbox_li[v]).removeClass('MSelectDBox__list-item_hover');
						}
					}
				}

				// Записать value внутри инпута
				if (  !self.get("freeWrite")  ){
					self.applySelectedToInput();
				}

				// Записать value внутри инпута
				self.applySelectedToInput();

				// Отметить выбранные строки
				self.applySelectedToList();

				// Положение ползунка
				self._calcScrollBarPosition();

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
						tmpEvents[eventName],
						false
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
						if (  !e.relatedTarget  ) {
							self._timers.focusoutInputs = setTimeout(
								function(){
									self.close();
								},
								250
							);
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

				this.on("set",this._eventDefaultSet);
				this.on("get", this._eventDefaultGet);
				this.on("afterSet:list", this._eventSetList);

				// ----------------------------------------------------------------

				/*
				body.addEventListener(
					"click",
					function(){
						// ...
					}
				);
				*/

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

				var self = this;

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
						e = new $.Event(eventName);
					}

					var events = this.events[eventName];

					for(var c=0; c<events.length; c++){

						if (typeof events[c] != "function") continue;

						events[c].apply(this,[self, e]);

					}

				}

			},


			/**
			 * @description attach specified event listener
			 * @param {String} eventName
			 * @param  {Function} fx - Event handler
			 * @return {Boolean}
			 * @memberof MSelectDBox
			 * */
			"on": function(eventName, fx){
				var c, self = this;
				var target = this.get("target");

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

					for(c=0; c<this._targetEvents.length; c++){

						if (  this._targetEvents[c].name.toLowerCase() == eventName  ){
							// addEventListener || attachEvent
							$(target).bind(
								this._targetEvents[c].event,
								function(e){
									self.trigger(eventName, e);
								},
								null
							);
							break;
						}

					}

				}

				this.events[eventName].push(fx);

				return true;

			},


			/**
			 * @description Global styles by selectors
			 * @memberof MSelectDBox
			 * */
			"_globalStyles": {
				".MSelectDBox": {
					position: "absolute", display: "block", width: "168px", padding: '8px', height: "auto", "box-shadow": "0 0px 8px rgba(0, 0, 0, 0.24)", "background-color": "#FFF", "border-radius": "3px"
				},
				".MSelectDBox_hidden": {
					display: "none"
				},
				".MSelectDBox:after": {
					content:'\'\'', position: "absolute", "border-left": "10px solid transparent", "border-right": "9px solid transparent", "border-bottom": "10px solid white", top: "-10px", left: "50%", "margin-left": "-10px"
				},
				".MSelectDBox_bottom:after": {
					content:'\'\'', position: "absolute", "border-left": "10px solid transparent", "border-right": "9px solid transparent", "border-bottom": "none", "border-top": "10px solid white", top: "initial", bottom: "-10px", left: "50%", "margin-left": "-10px",
				},
				".MSelectDBox__list-container": {
					position: "relative", margin: "0px", padding: "0px", "max-height": "200px", "overflow-x": "hidden"
				},
				".MSelectDBox__list-item": {
					position: "relative", padding: "5px", "background-color": "none", color: "black", display: "block", "line-height": "100%", cursor: "pointer", "font-size": "12px"
				},
				".MSelectDBox__list-item:hover, .MSelectDBox__list-item_hover": {
					"background-color": "#e6e6e6"
				},
				".MSelectDBox__list-item_selected": {
					"background-color": "#C40056", color:"white"
				},
				".MSelectDBox__list-item_selected:hover, .MSelectDBox__list-item_selected.MSelectDBox__list-item_hover": {
					"background-color": "#DB2277"
				},
				".MSelectDBox__list-item_selected:before": {
					content:'\':: \''
				},
				".MSelectDBox__list-item:active, .MSelectDBox__list-item_selected:active": {
					"background-color": "#b80000", color: "white"
				},
				".MSelectDBox__list-item_hidden": {
					display:"none"
				},
				".MSelectDBox__search-input": {
					border: "1px solid #a2a2a2", width: "100%"
				},
				".MSelectDBox__search-input-container": {
					"margin-bottom": "12px"
				}
			},


			/**
			 * @ignore
			 * */
			"_initStyles": function(){

				if (  !$('#mSelectDBoxStyle').length  ){
					this._buildStyles();
				}

			},


			/**
			 * @ignore
			 * */
			"_buildStyles": function(){

				var body = $("body");

				var stylecss = "";

				for(var styleSelector in this._globalStyles){
					if (  !this._globalStyles.hasOwnProperty(styleSelector)  ) continue;
					stylecss += styleSelector + "{";
					for(var styleProp in this._globalStyles[styleSelector]){
						if (  !this._globalStyles[styleSelector].hasOwnProperty(styleProp)  ) continue;
						stylecss += styleProp + ":" + this._globalStyles[styleSelector][styleProp] + ";";
					}
					stylecss += "} ";
				}

				var styleElem = $('#mSelectDBoxStyle');

				if (  !styleElem.length  ){
					styleElem = $('<style />');
					styleElem.attr("id", "mSelectDBoxStyle");
					body.append(styleElem);
				}

				styleElem.html(stylecss);

			},


			/**
			 * @ignore
			 * */
			"_initProps": function(arg){

				// var self = this;
				var c, v, prop;

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
					{"key":"builtInInput", "type":"any", "into": "boolean"},
					{"key":"optionFilters", "type":"array"},
					{"key":"freeWrite", "type":"any", "into": "boolean"}
				];

				for(c=0; c<allowedKeys.length; c++){
					allowedKeys[c].key = allowedKeys[c].key.toLowerCase();
				}

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

				var dbox = document.createElement('div');
				var jqDBox = $(dbox);

				this.set("dbox", dbox);

				jqDBox.addClass("MSelectDBox");
				jqDBox.addClass("MSelectDBox_hidden");

				var searchInputContainer = $(
					'<div class="MSelectDBox__search-input-container">' +
					'<input class="MSelectDBox__search-input" type="text">' +
					'</div>'
				).get(0);

				// var searchInput = $("input",searchInputContainer).get(0);

				dbox.appendChild(searchInputContainer);

				if (  !this.get("builtInInput")  ){
					searchInputContainer.style.display = "none";
				}

				this.set("dbox", dbox);

				if (  this.get("zIndex")  ) dbox.style.zIndex = this.get("zIndex");

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

				var ul = document.createElement('ul');

				ul.className = "MSelectDBox__list-container";

				var self = this;

				for(var itemKey in list ){
					if (!list.hasOwnProperty(itemKey)) continue;

					var li = document.createElement("li");

					li.className = "MSelectDBox__list-item";

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
						if (  jqThis.hasClass("MSelectDBox__list-item_hover")  ){
							jqThis.removeClass("MSelectDBox__list-item_hover");
						}
					},null);

					li.innerHTML = list[itemKey].label;
					ul.appendChild(li);
				}

				dbox.appendChild(ul);

			},


			/**
			 * @ignore
			 * */
			"init": function(arg){

				this._props = Object.create(null);

				var self = this;

				var body = $('body').get(0);

				this.instances.push(this);

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
				this._initEvents(arg);
				this._initElements();
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
						var dbox = self.get("dbox");
						var list = self.get("list");

						self._eventDefaultKeyDownMultipleFalse(e);
						self._eventDefaultKeyDownMultipleTrue(e);
					}
				);

				// ------------------------------------------------------------

				if (
					$.inArray(target.tagName.toLowerCase(), ["input","textarea"]) != -1
					|| (
						target.type
						&& $.inArray(target.type.toLowerCase(), ["text", "password", "email", "url", "search", "tel"]) != -1
					)
				){

					self.on(
						"keyup",
						function(context, e){
							self._eventDefaultKeyUp(e);
						}
					);

				}

				// --------------------------------------------------------------
				// Инициализация матчеров строк

				if (  !self.get("optionFilters")  ){
					self.set(
						"optionFilters",
						[self.defaultOptionFilters.default]
					);
				}

				// --------------------------------------------------------------

				if (self.instances.length < 2){
					$(body).bind(
						"click",
						function(e){
							self._deactivateInstances(e);
						}, null
					);
				}

			},


			/**
			 * @description Calculate position of list container
			 * @memberof MSelectDBox
			 * */
			"calcPosition" : function(){
				var self = this;
				var body = $("body").get(0);
				var target = this.get("target");
				var dbox = this.get("dbox");
				var jqDBox = $(dbox);
				var offset = $(target).offset();
				var thisWidth = target.clientWidth;
				var thisHeight = target.clientHeight;
				var dboxWidth = dbox.clientWidth;

				jqDBox.removeClass("MSelectDBox_bottom");

				dbox.style.left = (offset.left + (thisWidth / 2) - ((dboxWidth + (self._globalStyles[".MSelectDBox"].padding.replace(/[px]/gi,"") * 2)) / 2)) + "px";

				var scrollY = window.scrollY || body.scrollTop;

				if ( (dbox.clientHeight + offset.top + thisHeight + 12 - scrollY) > window.innerHeight){
					dbox.style.top = (offset.top - 12 - dbox.clientHeight) + "px";
					jqDBox.addClass("MSelectDBox_bottom");
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

				var ul = $(".MSelectDBox__list-container",dbox).get(0);

				if (  !this.get("multiple")  ){
					selectedLi = $(".MSelectDBox__list-item_selected",dbox);

				} else {
					selectedLi = $(".MSelectDBox__list-item_hover",dbox);

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
			 * @ignore
			 * */
			"_isDBoxElement": function(element){
				var dbox = this.get("dbox");
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
				var target = this.get("target");
				// var each = $("*",target).toArray();
				var each = $(target).find("*");
				if (each){
					each = Array.prototype.slice.call(each,0);
					each.push(target);
					for(var c=0; c<each.length; c++){
						if (each[c] == element){
							return true;
						}
					}

				}

				return false;
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

				li.removeClass("MSelectDBox__list-item_selected");

				for(var c= 0, L=li.length; c<L; c++){
					var msdbid = li[c].getAttribute("data-msdbid");
					if (
						typeof list[msdbid] != "undefined"
						&& list[msdbid].selected
					){
						$(li[c]).addClass('MSelectDBox__list-item_selected');
					}
				}
			},


			"applySelectedToInput" : function(){

				var self			= this;
				var listValue	= self.getSelectedValues();
				var listLabel	= self.getSelectedLabels();
				var target		= this.get("target");

				var tagName = target.tagName.toLowerCase();
				if ( tagName == "input" ){

					if (
						target.type
						&& $.inArray(target.type.toLowerCase(), ["text", "password", "email", "url", "search", "tel"]) != -1
					){
						target.value = listLabel.join("; ") + (!listLabel.length || !this.get("multiple") ? "" : ";");
					}

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

				if (typeof bool == "undefined") bool = true;

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
				var dbox = this.get("dbox");
				return $(dbox).hasClass("MSelectDBox_hidden") == false
			},


			"reInitList": function(){

				var dbox = this.get("dbox");

				$("ul",dbox).detach();

				this._initList();

			},


			/**
			 * @description hide list
			 * @memberof MSelectDBox
			 * */
			"close" : function(){
				var dbox = this.get("dbox");
				$(dbox).addClass("MSelectDBox_hidden");
			},


			/**
			 * @description show list
			 * @memberof MSelectDBox
			 * */
			"open" : function(){
				var dbox = this.get("dbox");
				$(dbox).removeClass("MSelectDBox_hidden");
				this.calcPosition();
			},


			/**
			 * @ignore
			 * */
			"fx" : {
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

		var methodsList = ["open","close","isActive","get","set","select","selectAll","deselectAll","on","trigger"];

		$.fn.extend({
			"mSelectDBox":  function(arg){
				if (!this.length) return;

				// var name = this[0].getAttribute("data-msdb-name");
				var instances =  MSelectDBox.prototype.getInstances();
				var instance = void 0;
				var input = this[0];

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