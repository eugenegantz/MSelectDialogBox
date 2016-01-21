$(document).ready(function(){

	Math.rand = function(min,max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	$("#msdb-a").mSelectDBox({
		"list": (function(){
			var arr = [];
			for(var c=0; c<220; c++){
				arr.push(Math.round(Math.random() * 10000));
			}
			return arr;
		})(),
		"multiple": false,
		"autoComplete": true,
		"input:empty": function(){
			console.log(arguments);
		},
		"onselect": function(){
			console.log(arguments);
		},
		"name": "a"
	});
	
	$("#msdb-b").mSelectDBox({
		"list": (function(){
			var lib = "qwertyuiopasdfghjklzxcvbnm".split("");
			var arr = [], str;
			for(var c=0; c<12; c++){
				str = "";
				for(var v=0; v<8; v++){
					str += lib[Math.rand(0, lib.length-1)];
				}
				arr.push(str);
			}
			return arr;
		})(),
		"builtInInput": 0,
		"multiple": true,
		"autoComplete": true,
		"onkeydown": function(context, e){
			console.log(arguments);
		},
		"input:empty": function(){
			console.log(arguments);
		},
		"name": "b"
	});

});