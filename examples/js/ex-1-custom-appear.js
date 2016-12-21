(function($) {
	var KEY_UP = 38,
		KEY_RIGHT = 39,
		KEY_DOWN = 40,
		KEY_LEFT = 37,
		KEY_ENTER = 13,
		KEY_BACKSPACE = 8;

	if (typeof $ != "function")
		throw new Error("jQuery is not defined");

	/**
	 * @constructor
	 * */
	var MyCustomAppear1 = function(ctx) {
		// ctx - instance of "m-select-dialog-box"
		this.msdbCtx = ctx;

		this._timers = {
			autoCompleteKeyUp: null,
			focusOut: null
		};

		this._initStyles();
		this._initElem();
		this._initList();
		this._initEvents();
	};

	$.fn.mSelectDBox.MyCustomAppear1 = MyCustomAppear1;

	MyCustomAppear1.prototype = {
		"_initStyles": function() {
			var styleElem = $("#msdb-eg-custom-control");

			if (styleElem.length) return;

			var css = "" +
				".m-select-d-box__control_type_spec {" +
					"padding: 5px 5px;" +
					"border: 2px solid #464C4F; " +
					"background: #ffffff; " +
					"display: inline-block; " +
					"text-align: left;" +
					"color: black;" +
					"-webkit-border-radius: 3px;" +
					"-moz-border-radius: 3px;" +
					"border-radius: 3px;" +
					"font-size: 13px;" +
					"cursor: pointer;" +
					"outline: none;" +
				"}" +

				".m-select-d-box__selected-holder { display: inline-block; }" +

				".m-select-d-box__selected-holder-item {" +
					"position: relative;" +
					"display: inline-block; " +
					"padding: 3px 6px; " +
					"background: black; " +
					"color: white;" +
					"margin: 2px;" +
					"border-radius: 2px;" +
					"max-width: 48px;" +
					"box-sizing: border-box;" +
					"text-overflow: ellipsis; " +
					"overflow: hidden;" +
					"vertical-align: top;" +
				"}" +

				".m-select-d-box__selected-holder-item_hover," +
				".m-select-d-box__selected-holder-item:hover { " +
					"background: mediumseagreen;" +
					"overflow: initial;" +
				"}" +

				".m-select-d-box__selected-holder-item " +
				".m-select-d-box__selected-holder-label {" +
					"display: none;" +
					"position: absolute;" +
					"background: rgb(60, 179, 113);" +
					"padding: 3px 6px;" +
					"color: white;" +
					"width: auto;" +
					"bottom: 0px;" +
					"left: 0px;" +
					"border-radius: 2px;" +
					"z-index: 1;" +
				"}" +

				".m-select-d-box__selected-holder-item:hover " +
				".m-select-d-box__selected-holder-label {" +
					"display: block;" +
				"}" +

				"input.m-select-d-box__control-input {" +
					"width: 32px;" +
					"border: initial;" +
					"outline: initial;" +
					"margin: 4px; " +
					"vertical-align: top;" +
				"}" +
				"";

			$("body").append($('<style id="#msdb-eg-custom-control">').html(css));
		},


		"_initElem": function() {
			var $ = jQuery,
				ctx = this.msdbCtx,
				prevControl = ctx.get("target", void 0, 0),
				prevInlineStyles = prevControl.getAttribute("style") || "";

			var newAttrs = [
				prevInlineStyles
					? 'style="' + prevInlineStyles + '"'
					: "",

				prevControl.id
					? 'id="' + prevControl.id + '"'
					: "",

				'class="' + (
					prevControl.className
						? prevControl.className
						: ""
				) + ' m-select-d-box__control_type_spec"'
			];

			var html = '' +
				'<label ' + newAttrs.join(" ") + '>' +
				'<div class="m-select-d-box__selected-holder"></div>' +
				'<input class="m-select-d-box__control-input" placeholder="enter">' +
				'</label>';

			var $newControl = $(html);

			// replace target element by custom
			ctx.set("target", $newControl.get(0), null, 0);

			// use built-in key-value storage to link custom elements
			ctx.set("$my-custom-control", $newControl, null, 0);
			ctx.set("$my-custom-input", $newControl.find("input"), null, 0);
			ctx.set("$my-selected-holder", $newControl.find(".m-select-d-box__selected-holder"));

			$(prevControl).after($newControl);

			$(prevControl).remove();
		},


		"_initList": function() {
			var list = this.msdbCtx.get("list", null, !1);

			Object.keys(list).forEach(function(key) {
				var item = list[key];

				item.$holderLab = $('' +
					'<div class="m-select-d-box__selected-holder-item" data-title="' + item.label + '" data-msdb-key="' + key + '">' +
						'<span>' + item.label + '</span>' +
						'<div class="m-select-d-box__selected-holder-label">' + item.label + '</div>' +
					'</div>');
			});
		},


		"_initEvents": function() {
			var self = this,
				ctx = this.msdbCtx,
				$dbox = $(ctx.get("dbox", null, !1)),
				$input = ctx.get("$my-custom-input", null, !1),
				$control = ctx.get("$my-custom-control", null, !1);

			$input.bind("focus", function() {
				ctx.open();
			});

			$input.bind("keyup", this._onDefKeyUp.bind(this));

			$input.bind("keydown", this._onDefKeyDown.bind(this));

			$input.bind("focus", function() {
				clearTimeout(self._timers.focusOut);
			});

			$input.bind("focusout", function(e) {
				clearTimeout(self._timers.focusOut);

				console.log(e);

				// ctx._isDBoxElement(e.currentTarget);

				self._timers.focusOut = setTimeout(function() {
					ctx.trigger("focusout");
				}, 100);
			});

			$dbox.on("click", "*", function() {
				clearTimeout(self._timers.focusOut);
			});

			ctx.on("select", function() {
				self.applySelectedToHolder();
			});

			$control.on("click", ".m-select-d-box__selected-holder-item", function() {
				ctx.deselect({ id: +this.getAttribute("data-msdb-key") });
				ctx.applySelectedToList();
				self.applySelectedToHolder();
			});
		},


		"_onDefKeyUp": function(e) {
			var self = this;

			clearTimeout(this._timers.autoCompleteKeyUp);

			this._timers.autoCompleteKeyUp = setTimeout(function() {
				self.msdbCtx.applyAutoComplete(e.currentTarget.value);
				self.msdbCtx.open();
			}, 500);
		},


		"_onDefKeyDown": function(e) {
			var ctx = this.msdbCtx,
				$hovLabElem,
				elem = e.currentTarget,
				hov = ctx.getHoveredItems()[0] || ctx.getFirstVisibleItem();

			if (e.keyCode == KEY_UP) {
				ctx.hoverPrevVisibleItem(hov);

			} else if (e.keyCode == KEY_DOWN) {
				ctx.hoverNextVisibleItem(hov);

			} else if (e.keyCode == KEY_ENTER) {
				hov.selected
					? ctx.deselect({ id: hov.id })
					: ctx.select({ id: hov.id, blank: false });

				this.applySelectedToHolder();

			} else if (!elem.value) {
				if (e.keyCode == KEY_BACKSPACE) {
					$hovLabElem = this.getHoveredLab$();

					if (!$hovLabElem.length) {
						this.hoverLab(this.getLastLab$());

					} else {
						ctx.deselect({ id: $hovLabElem.attr("data-msdb-key") });
						this.unhoverLab($hovLabElem);
						this.hoverPrevLab($hovLabElem);
						!$hovLabElem.prev().length && this.hoverNextLab($hovLabElem);
						this.applySelectedToHolder();
					}

				} else if (e.keyCode == KEY_LEFT) {
					$hovLabElem = this.getHoveredLab$();

					!$hovLabElem.length
						? this.hoverLab(this.getLastLab$())
						: this.hoverPrevLab($hovLabElem);

				} else if (e.keyCode == KEY_RIGHT) {
					$hovLabElem = this.getHoveredLab$();

					!$hovLabElem.length
						? this.hoverLab(this.getLastLab$())
						: this.hoverNextLab($hovLabElem);
				}
			}

			ctx.calcScrollBarPosition();
		},


		"isLabHovered": function($lab) {
			return $lab.hasClass("m-select-d-box__selected-holder-item_hover");
		},


		"getLastLab$": function() {
			var $holder = this.msdbCtx.get("$my-selected-holder", null, !1);

			return $holder.find(".m-select-d-box__selected-holder-item:last-child");
		},


		"getHoveredLab$": function() {
			var $holder = this.msdbCtx.get("$my-selected-holder", null, !1);

			return $holder.find(".m-select-d-box__selected-holder-item_hover").last();
		},


		"hoverPrevLab": function($lab) {
			this.hoverLab($lab.prev());
			$lab.prev().length && this.unhoverLab($lab);
		},


		"hoverNextLab": function($lab) {
			this.hoverLab($lab.next());
			$lab.next().length && this.unhoverLab($lab);
		},


		"hoverLab": function($lab) {
			$lab.addClass("m-select-d-box__selected-holder-item_hover");
		},


		"unhoverLab": function($lab) {
			$lab.removeClass("m-select-d-box__selected-holder-item_hover");
		},


		"applySelectedToHolder": function() {
			var ctx = this.msdbCtx,
				items = ctx.getSelectedItems(),
				list = ctx.get("list", null, 0),
				$holder = ctx.get("$my-selected-holder", null, 0);

			$holder.html('');

			items.forEach(function(item) {
				$holder.append(item.$holderLab);
			});
		}
	};
})(jQuery);