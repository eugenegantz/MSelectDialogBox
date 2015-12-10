/**
 * Created by User on 30.10.2015.
 */

$(document).ready(function(){
/*

	new MSelectDBox({
		"target": $("#msdb-a").get(0),
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
*/

	/*
	new MSelectDBox({
		"target": $("#msdb-b").get(0),
		"list": (function(){
			var arr = [];
			for(var c=0; c<30; c++){
				arr.push(Math.round(Math.random() * 10000));
			}
			return arr;
		})(),
		"builtInInput": 1,
		"multiple": true,
		"autoComplete": true,
		"onkeydown": function(context, e){
			console.log(arguments);
		},
		"input:empty": function(){
			console.log(arguments);
		},
		"name": "b"
	})
	*/

	$("#msdb-a").mSelectDBox({
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
	
	$("#msdb-b").mSelectDBox({
		"list": (function(){
			var arr = [];
			for(var c=0; c<1030; c++){
				arr.push(Math.round(Math.random() * 10000));
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