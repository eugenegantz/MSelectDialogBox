
	// ========== Диалогбокс ==========

	(function($){

		var MSelectDBox = function(arg){
			this.init(arg);
		};

		MSelectDBox.prototype = {
			"instances": [],

			"get" : function(key,arg){

				if (typeof key != "string") return;

				key = key.toLowerCase();

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


			"set" : function(key,value,arg){

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

				var aliases = {};

				var methodAliases = {};

				if ( typeof aliases[key] == "string" ) {
					key = aliases[key];
				}

				if ( typeof methodAliases[key] == "string" ) {
					key = methodAliases[key];
					if (typeof this[key] != "function"){
						return false;
					}
					if (typeof arg == "undefined") arg = Object.create(null);
					return this[key](value,arg);
				}

				this._props[key] = value;

				return true;

			},


			"getInstaces" : function(arg){
				if (typeof arg != "object") arg = Object.create(null);
				var name = (["string","number"].indexOf(typeof arg.name) > -1 ? arg.name : null );

				var tmp = [];
				for(var c=0; c<this.instances.length; c++){
					if (name !== null && this.instances[c].get("name") != name ){
						continue;
					}
					tmp.push(this.instances[c]);
				}
				return tmp;
			},


			"_targetEvents": [
				{"name": "click", "event": "click"},
				{"name": "keydown", "event": "keydown"},
				{"name": "keyup", "event": "keyup"},
				{"name": "hover", "event": "hover"},
				{"name": "focus", "event": "focus"},
				{"name": "focusout", "event": "blur"}
			],


			"_eventCheckInputEmpty": function(e){
				var target = this.get("target");
				var list = this.get("list");

				if (
					(
					["input","textarea"].indexOf(target.tagName.toLowerCase()) != -1
					|| ["text", "password", "email", "url", "search", "tel"].indexOf(target.type.toLowerCase()) != -1
					)
					&& !target.value.trim()
				) {
					this.trigger("input:empty", e);
				}
			},


			"_eventDefaultInputEmpty": function(){
				this.deselectAll();
			},


			"_eventDefaultKeyUp": function(e){

				var self						= this;
				var target					= self.get("target");
				var keyCode				= e.keyCode;
				var list						= self.get("list");
				var dbox					= self.get("dbox");
				var contextElement		= e.currentTarget;

				clearTimeout(self._timers.autoComplete);

				self._timers.autoComplete = setTimeout(function(){
					var value, v;

					// ... autoComplete
					if (  self.get("autoComplete")  ){

						if ( [37,38,39,40,9,13,18,17,16,20,27].indexOf(keyCode) > -1 ){

						} else {

							var li	= $(".MSelectDBox__list-item", dbox);
							value	= target.value.toLowerCase();
							// value	= self.fx.trim(value,";, ","both");
							value	= self.fx.msplit([';',','],value);
							value = value[value.length-1];

							var pattern = new RegExp(value.trim());

							for(v=0; v<li.length; v++){
								var msdbid = parseInt(li[v].getAttribute("data-msdbid"));

								if (  !value  ){
									li[v].classList.remove('MSelectDBox__list-item_hidden');

								} else if ( !list[msdbid].label.toString().toLowerCase().match(pattern) ){
									li[v].classList.add('MSelectDBox__list-item_hidden');

								} else {
									li[v].classList.remove('MSelectDBox__list-item_hidden');

								}

								li[v].classList.remove('MSelectDBox__list-item_hover');
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
								list[prop].selected = (value.indexOf(list[prop].label.trim()) > -1);
							}

							self.applySelectedToList();
							self.applySelectedToInput();
						}

					}

				},500);

			},


			"_eventDefaultKeyDownMultipleFalse": function(e){

				var self = this;

				var ul, li, c, L;

				var dbox = self.get("dbox");
				var list = self.get("list");
				var target = self.get("target");

				// Если список без множественного выделения
				if (  self.get("multiple")  ) return; // close.if.!multiple

				if (  [37,39,9,18,17,16,20,27].indexOf(e.keyCode) > -1  ){
					// left, right, tab, alt, ctrl, shift, caps, esc

				} else if ( e.keyCode == 13 ){
					// 13 = Enter

					if (  !self.isActive()  ){
						self.open();
						self._eventFocus.apply(target, [self, e]);

					} else {
						self.close();

					}

				} else if ( [38,39,40].indexOf(e.keyCode) > -1 ) {

					// other keys

					if (  !self.isActive()  ) return;

					ul = $("ul", dbox).get(0);

					li = $('li:not(.MSelectDBox__list-item_hidden)', dbox);

					var selectedLi = -1;

					for(c=0, L=li.length; c<L; c++){
						if (  li[c].classList.contains("MSelectDBox__list-item_selected")  ){
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


			"_eventDefaultKeyDownMultipleTrue": function(e){

				var self = this, c, L;
				var target = self.get("target");
				var dbox = self.get("dbox");
				var list = self.get("list");
				var selectedKey;

				if (  self.get("multiple")  ){
					if ( [37,39,9,18,17,16,20,27].indexOf(e.keyCode) > -1 ){
						// left, right, tab, alt, ctrl, shift, caps, esc

					} else if (  e.keyCode == 13  ){
						// Enter
						var hoveredLi = $(".MSelectDBox__list-item_hover",dbox);

						if (  !hoveredLi.length  ) return;

						hoveredLi = hoveredLi.get(0);

						var selectedKeys = self.getSelectedKeys();

						selectedKey = parseInt(hoveredLi.getAttribute('data-msdbid'));

						var tmp = selectedKeys.indexOf(selectedKey);

						if (  tmp > -1  ){
							selectedKeys[tmp] = null;
						} else {
							selectedKeys.push(selectedKey);
						}

						self._selectByID(selectedKeys);

						self.trigger("select", e);

						return;
					}

					if ( [38,40].indexOf(e.keyCode) > -1 ) {
						// up, down

						// var ul = $(".MSelectDBox__list-container", dbox);

						var li = $('.MSelectDBox__list-item:not(.MSelectDBox__list-item_hidden)', dbox);

						hoveredLi = -1;

						for(c=0, L=li.length; c<L; c++){
							if (  li[c].classList.contains("MSelectDBox__list-item_hover")  ) {
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

						li[newHoveredLi].classList.add("MSelectDBox__list-item_hover");

						if (hoveredLi > -1 && newHoveredLi != hoveredLi){
							li[hoveredLi].classList.remove("MSelectDBox__list-item_hover");
						}

						self._calcScrollBarPosition();
					}
				}
			},


			"_eventFocus": function(context,e){
				var msdb_value, c, v;

				var self		= this;
				var list		= self.get("list");
				var dbox	= self.get("dbox");

				self.open();

				self.calcPosition();

				var contextElement = (  e.currentTarget || (this instanceof Element ? this : null )  );

				if (
					["input","textarea"].indexOf(contextElement.tagName.toLowerCase()) != -1
					|| (
					contextElement.type
					&& ["text", "password", "email", "url", "search", "tel"].indexOf(contextElement.type.toLowerCase()) != -1
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
					for (v=0; v<dbox_li.length; v++){
						if (
							(
							typeof contextElement.type != "undefined"
							&& ["submit","button"].indexOf(contextElement.type.toLowerCase()) > -1
							)
							|| ( ["submit","body","select"].indexOf(contextElement.tagName.toLowerCase()) > -1 )
						){

						} else {
							dbox_li[v].classList.remove('MSelectDBox__list-item_hover');
						}
						dbox_li[v].classList.remove('MSelectDBox__list-item_hidden');
					}
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
					tmpEvents[eventName] = arg[eventName];
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
					"input:empty",
					self._eventDefaultInputEmpty
				);

				this.on("focus", self._eventFocus);
				this.on("click", self._eventFocus);

				this.on(
					"focusout",
					function(context, e){
						if (e.relatedTarget){
							if (
								self._isDBoxElement(e.relatedTarget)
								|| self._isTargetElement(e.relatedTarget)
							){
								return;
							}
							self.close();
						}
					}
				);

				// ----------------------------------------------------------------

				body.addEventListener(
					"click",
					function(){

					}
				);

			},


			"_deactivateInstances": function(e){
				if (
					this._isDBoxElement(e.target)
					|| this._isTargetElement(e.target)
				){
					return;
				}
				if (  this.isActive()  ) this.close();
			},


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


			"trigger": function(eventName, e){

				var self = this;

				if (typeof eventName != "string") return;

				eventName = eventName.toLowerCase();

				var eventConstructor = Event || CustomEvent;

				if (
					typeof this.events[eventName] == "object"
					&& Array.isArray(this.events[eventName])
				){

					if (
						e instanceof CustomEvent == false
						&& e instanceof Event == false
					){
						e = new eventConstructor(eventName);
					}

					var events = this.events[eventName];

					for(var c=0; c<events.length; c++){

						if (typeof events[c] != "function") continue;

						events[c].apply(this,[self, e]);

					}

				}

			},


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
							target.addEventListener(
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


			"_initStyles": function(){

				var body = $("body").get(0);

				this.styles = Object.create(null);

				this.styles.dboxPaddings = 8;

				if ( !$('#mSelectDBoxStyle').length ){
					var stylecss = ''
						+' .MSelectDBox																									{position:absolute; display:block; width:168px; padding:'+this.styles.dboxPaddings+'px; height:auto; box-shadow:0px 0px 8px rgba(0, 0, 0, 0.24); background-color: #FFF; border-radius: 3px;}'
						+' .MSelectDBox_hidden																						{display:none;}'
						+' .MSelectDBox:after																							{content:\'\'; position:absolute; border-left:10px solid transparent; border-right:9px solid transparent; border-bottom:10px solid white; top: -10px; left: 50%; margin-left: -10px;}'
						+' .MSelectDBox_bottom:after																				{content:\'\'; position:absolute; border-left:10px solid transparent; border-right:9px solid transparent; border-bottom: none; border-top:10px solid white; top: initial; bottom: -10px; left: 50%; margin-left: -10px;}'
						+' .MSelectDBox__list-container																				{position:relative; margin:0px; padding:0px; max-height:200px; overflow-x:hidden;}'
						+' .MSelectDBox__list-item																					{position:relative; padding:5px; color:black; display:block; line-height:100%; cursor:pointer; font-size:12px;}'
						+' .MSelectDBox__list-item:hover, .MSelectDBox__list-item_hover 								{background-color:#e6e6e6;}'
						+' .MSelectDBox__list-item_selected																		{background-color:#C40056; color:white;}'
						+' .MSelectDBox__list-item_selected:hover, .MSelectDBox__list-item_selected.MSelectDBox__list-item_hover	{background-color:#DB2277;}'
						+' .MSelectDBox__list-item_selected:before																{content:\':: \';}'
						+' .MSelectDBox__list-item:active, .MSelectDBox__list-item_selected:active					{background-color:#b80000; color:white;}'
						+' .MSelectDBox__list-item_hidden																			{display:none;}'
						+' .MSelectDBox__search-input 																				{border:1px solid #a2a2a2; width:100%;}'
						+' .MSelectDBox__search-input-container																{margin-bottom:12px;}'
						+'';

					// #DB2277

					var style = document.createElement('style');
					style.id = "mSelectDBoxStyle";
					style.innerHTML = stylecss;
					body.appendChild(style);
				}

			},


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
					{"key":"builtInInput", "type":"any", "into": "boolean"}
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
									["min","auto"].indexOf(arg.width) > -1
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


			"_initElements": function(){

				var body = $("body").get(0);

				var dbox = document.createElement('div');

				this.set("dbox", dbox);

				dbox.className = "MSelectDBox MSelectDBox_hidden";

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


			"_initList": function(){

				var c, L;

				if (  !Array.isArray(this.get("list"))  ) {
					this.set("list", []);
					return false;
				}

				var list = this.get("list");

				var dbox = this.get("dbox");

				var tmplist = [];

				// TODO FlattenFn

				for ( c= 0, L = list.length; c<L; c++ ){
					if ( ["number","string"].indexOf(typeof list[c]) != -1 ){

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
				this.set("list", tmplist);

				// -------------------------------------------------------------------

				var ul = document.createElement('ul');

				ul.className = "MSelectDBox__list-container";

				var self = this;

				for(var itemKey in list ){
					if (!list.hasOwnProperty(itemKey)) continue;

					var li = document.createElement("li");

					li.className = "MSelectDBox__list-item";

					li.setAttribute('data-msdbid',itemKey);

					li.addEventListener(
						'click',
						function(e){
							var selectedKeys = [];

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

					li.addEventListener('mouseleave',function(){
						if (this.classList.contains("MSelectDBox__list-item_hover")){
							this.classList.remove("MSelectDBox__list-item_hover");
						}
					},null);

					li.innerHTML = list[itemKey].label;
					ul.appendChild(li);
				}

				dbox.appendChild(ul);

			},


			"init": function(arg){

				this._props = Object.create(null);

				var self = this;

				var body = document.querySelector('body');

				this.instances.push(this);

				// --------------------------------------------------------------------------------

				this._initProps(arg);

				// --------------------------------------------------------------------------------

				this._initTarget();
				this._initEvents(arg);
				this._initElements();
				this._initList();
				this._initStyles();


				// --------------------------------------------------------------------------------
				// Таймеры

				this._timers = {
					"autoComplete" : null
				};

				// --------------------------------------------------------------------------------
				// Целевой элемент

				var target = this.get("target");

				// --------------------------------------------------------------------------------

				if (  self.get("name")  ){
					target.setAttribute("data-msdb-name",self.get("name"));
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
					["input","textarea"].indexOf(target.tagName.toLowerCase()) != -1
					|| (
					target.type
					&& ["text", "password", "email", "url", "search", "tel"].indexOf(target.type.toLowerCase()) != -1
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

				body.addEventListener(
					'click', function(e){
						self._deactivateInstances(e);
					}, null
				);

			},


			"calcPosition" : function(){
				var self = this;
				var target = this.get("target");
				var dbox = this.get("dbox");
				var offset = $(target).offset();
				var thisWidth = target.clientWidth;
				var thisHeight = target.clientHeight;
				var dboxWidth = dbox.clientWidth;

				dbox.classList.remove("MSelectDBox_bottom");

				dbox.style.left = (offset.left + (thisWidth / 2) - ((dboxWidth + (self.styles.dboxPaddings * 2)) / 2)) + "px";

				if ( (dbox.clientHeight + offset.top + thisHeight + 12 - scrollY) > window.innerHeight){
					dbox.style.top = (offset.top - 12 - dbox.clientHeight) + "px";
					dbox.classList.add("MSelectDBox_bottom");
				} else {
					dbox.style.top = (offset.top + thisHeight + 12) + "px";
				}
			},


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


			"_isDBoxElement": function(element){
				var dbox = this.get("dbox");
				var each = $("*", dbox).toArray();
				each.push(dbox);

				for (var c=0; c<each.length; c++){
					if ( each[c] == element ) return true;
				}

				return false;
			},


			"_isTargetElement": function(element){
				var target = this.get("target");
				var each = $("*",target).toArray();
				each.push(target);

				for(var c=0; c<each.length; c++){
					if (each[c] == element){
						return true;
					}
				}

				return false;
			},


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


			"applySelectedToList" : function(){
				// var self = this;
				var dbox = this.get("dbox");
				var list = this.get("list");

				var li = $("li",dbox);
				for(var c= 0, L=li.length; c<L; c++){
					var msdbid = li[c].getAttribute("data-msdbid");
					if (
						typeof list[msdbid] != "undefined"
						&& list[msdbid].selected
					){
						li[c].classList.add('MSelectDBox__list-item_selected');
					} else {
						li[c].classList.remove('MSelectDBox__list-item_selected');
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
						&& ["text", "password", "email", "url", "search", "tel"].indexOf(target.type.toLowerCase()) != -1
					){
						target.value = listLabel.join("; ") + (!listLabel.length || !this.get("multiple") ? "" : ";");
					}

				} else if ( tagName == "textarea" ) {

					target.value = listLabel.join(";\n") + (!listLabel.length || !this.get("multiple") ? "" : ";\n");

				} else if ( tagName == "select" ) {

					for (var v=0; v<target.options.length; v++) {
						target.options[v].selected = (listValue.indexOf(target.options[v].value > -1));
					}

				}

				target.setAttribute("data-msdb-value", listValue.join(";") + (!listValue.length || !this.get("multiple") ? "" : ";"));

			},


			"select" : function(arg){
				if (typeof arg != "object" || Array.isArray(arg)) return;

				var value, key, blank = true;

				if (typeof arg.blank != "undefined") blank = Boolean(arg.blank);

				if (arg.id){
					if (  !isNaN(arg.id) || Array.isArray(arg.id)  ){
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

				if (["number", "string"].indexOf(typeof value) > -1) {
					value = [value];
				} else if (
					typeof value == "object"
					&& Array.isArray(value)
				) {

				} else {
					return null;
				}

				if (!this.get("multiple") && value.length > 1) return null;

				var list = this.get("list");

				for(var c=0, L=list.length; c<L; c++){
					if ( value.indexOf(list[c][key]) > -1 ){
						list[c].selected = true;
					} else if ( blank ) {
						list[c].selected = false;
					}
				}

				this.applySelectedToList();
				this.applySelectedToInput();

			},

			// Каждый раз определяет новую выборку
			"_selectByID": function(arg){
				var c;

				if (  !isNaN(arg)  ){
					arg = [parseInt(arg)];
				} else if (  Array.isArray(arg)  ) {

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

			// Снимание выделение только с указанной выборки, не затрагивая остальные
			"_deselectByID": function(arg){
				var c;

				if (typeof bool == "undefined") bool = true;

				if (  !isNaN(arg)  ){
					arg = [parseInt(arg)];
				} else if (  Array.isArray(arg)  ) {

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


			"_hideItems": function(){},


			"_unhideItems": function(){},


			"deselectAll" : function(){

				var list = this.get("list");

				for (var c = 0, L = list.length; c < L; c++) {
					list[c].selected = false;
				}
				this.applySelectedToList();
				this.applySelectedToInput();

			},


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


			"isActive": function(){
				var dbox = this.get("dbox");
				return dbox.classList.contains("MSelectDBox_hidden") == false
			},


			"reInitList": function(){

				var dbox = this.get("dbox");

				$("ul",dbox).detach();

				this._initList();

			},


			"close" : function(){
				var dbox = this.get("dbox");
				dbox.classList.add("MSelectDBox_hidden");
			},



			"open" : function(){
				var dbox = this.get("dbox");
				dbox.classList.remove("MSelectDBox_hidden");
			},



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
							if ( !str.length || !(_chars.indexOf(str[0]) != -1 || _chars.indexOf(str[str.length-1]) != -1) ) break;
							if ( _chars.indexOf(str[str.length-1]) != -1 ) str.pop();
							if ( _chars.indexOf(str[0]) != -1 ) str.shift();
						}
					}

					if ( _mode == 'left' ){
						for(;;){
							if ( !str.length || _chars.indexOf(str[0]) == -1 ) break;
							str.shift();
						}
					}

					if ( _mode == 'right' ){
						for(;;){
							if ( !str.length || _chars.indexOf(str[str.length-1]) == -1 ) break;
							str.pop();
						}
					}

					return str.join('');
				}
			}
		};

		// ---------------------------------------------------------------------------------------------------

		$.fn.extend({
			"mSelectDBox":  function(arg){
				if (typeof arg != "object") return;
				if (this.length){
					arg.target = this[0];
					return new MSelectDBox(arg);
				}
			}
		});

		$.prototype.mSelectDBox.prototype = MSelectDBox.prototype;

	})(jQuery);