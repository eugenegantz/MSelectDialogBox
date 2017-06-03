$(document).ready(function() {

	var eventLog = function(ctx, e) {
		var html = [
			"name: " + ctx.get("name"),
			"event.type: " + e.type
		];
		$(".events-plate").html(html.join("<br />"));
	};

	Math.rand = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	$.prototype.mSelectDBox.prototype._globalStyles[".m-select-d-box__list-item_selected"]["background-color"] = "mediumseagreen";
	$.prototype.mSelectDBox.prototype._globalStyles[".m-select-d-box__list-item_selected:hover, .m-select-d-box__list-item_selected.m-select-d-box__list-item_hover"]["background-color"] = "green";
	$.prototype.mSelectDBox.prototype._globalStyles[".m-select-d-box__list-item:active, .m-select-d-box__list-item_selected:active"]["background-color"] = "darkgreen";


	$("#msdb-a").mSelectDBox({
		"list": (function() {
			var arr = [];
			var counter = 0;
			for (var c = 0; c < 9000; c++) {
				arr.push(counter += Math.round(Math.random() * 99) * 10);
			}
			return arr;
		})(),
		"multiple": false,
		"autoComplete": true,
		"input:empty": eventLog,
		"onselect": eventLog,
		"name": "a"
	});

	$("#msdb-b").mSelectDBox({
		"list": [
			"alpha", "beta", "gamma", "delta",
			"epsilon", "zeta", "eta", "theta", "iota",
			"kappa", "lambda", "mu", "nu", "xi",
			"omicron", "pi", "rho", "sigma", "tau",
			"upsilon", "phi", "chi", "psi", "omega"
		],
		"builtInInput": 0,
		"multiple": true,
		"autoComplete": true,
		"onkeydown": eventLog,
		"input:empty": eventLog,
		"name": "b"
	});

	$("#msdb-c").mSelectDBox({
		"list": [
			"Яблоко",
			"Апельсин",
			"Киви",
			"Авокадо",
			"Ананас",
			"Арбуз",
			"Банан",
			"и помидор с огурцами"
		],
		"builtInInput": 0,
		"multiple": true,
		"autoComplete": true,
		"onkeydown": eventLog,
		"input:empty": eventLog,
		"name": "c",
		"optionFilters": [
			$.prototype.mSelectDBox.prototype.defaultOptionFilters.default,
			$.prototype.mSelectDBox.prototype.defaultOptionFilters.russianKeyboard
		]
	});

	$("#msdb-d").mSelectDBox({
		"list": [
			"Petrenko (muhomor)",
			"Larin",
			"Abdulova",
			"Dukalis",
			"Kazantsev",
			"Volkov",
			"Solovets",
			"Cherdyntsev"
		],
		"multiple": 1,
		"name": "d",
		"autoComplete": true
	});

	var customFilterMatchLeft = function(inputString, optionString) {
		var pattern = new RegExp("^" + inputString.trim(), "ig");
		optionString = String(optionString);
		return Boolean(optionString.match(pattern));
	};

	$("#msdb-e").mSelectDBox({
		"list": [
			"aa-bb-cc-dd-1",
			"bb-cc-dd-aa-2",
			"cc-dd-aa-bb-3",
			"dd-aa-bb-cc-4"
		],
		"optionFilters": [customFilterMatchLeft],
		"multiple": false,
		"autoComplete": true
	});

	$("#msdb-f").mSelectDBox({
		"list": [
			"Petrenko (muhomor)",
			"Larin",
			"Abdulova",
			"Dukalis",
			"Kazantsev",
			"Volkov",
			"Solovets",
			"Cherdyntsev"
		],
		"multiple": 1,
		"name": "f",
		"autoComplete": true,
		"embeddedInput": true,
		"language": "en"
	}).on(
		"autocomplete:empty",
		eventLog
	).on(
		"autocomplete:not-empty",
		eventLog
	);

	$("#msdb-0").mSelectDBox({
		"list": [
			"alpha", "beta", "gamma", "delta",
			"epsilon", "zeta", "eta", "theta", "iota",
			"kappa", "lambda", "mu", "nu", "xi",
			"omicron", "pi", "rho", "sigma", "tau",
			"upsilon", "phi", "chi", "psi", "omega"
		],
		"multiple": 1,
		"autoComplete": true,
		"onInit": function(ctx) {
			new $.fn.mSelectDBox.MyCustomAppear1(ctx);
		}
	});
});