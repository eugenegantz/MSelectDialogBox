'use strict';

describe('m-select-dialog-box', function() {
	var appendTextInput = function(arg, elemOpt) {
		if (!elemOpt) elemOpt = {};

		!elemOpt.tag && (elemOpt.tag = 'input');

		!elemOpt.attrs && (elemOpt.attrs = {
			id: 'msdb-test-a',
			type: 'text'
		});

		var nodeElem = document.createElement(elemOpt.tag);
		$.extend(nodeElem, elemOpt.attrs);

		$('body')
			.append(
			$(nodeElem)
				.mSelectDBox(arg)
				.get('target')
		);

		return $(nodeElem);
	};

	var detachTextInput = function($elem) {
		if ($elem.mSelectDBox()) {
			$elem.mSelectDBox().destroy();
		}
		$elem.remove();
	};

	describe('Constructor', function() {

		describe.skip('._initTarget()', function() {
			// TODO
			it('TODO', function() {
				assert.ok(!1);
			});
		});

		describe.skip('._initStyles()', function() {
			// TODO
			var $elemA,
				$elemB;

			before(function() {
				$elemA = appendTextInput({ list: [1] });
				$elemB = appendTextInput({ list: [1] });
			});

			after(function() {
				detachTextInput($elemA);
				detachTextInput($elemB);
			});

			it('should have single ".m-select-d-box-style"', function() {
				assert.lengthOf($('#m-select-d-box-style'), 1);
			});
		});

		describe.skip('._initProps()', function() {
			// TODO
			it('TODO', function() {
				assert.ok(!1);
			});
		});

		describe.skip('._initElements()', function() {
			// TODO
			it('TODO', function() {
				assert.ok(!1);
			});
		});

		describe('._initList()', function() {

			describe('Array of strings', function() {
				var $input;

				before(function() {
					$input = appendTextInput(
						{ list: ['alpha', 'beta', 'gamma'] },
						{ id: 'msdb-test-c' }
					);
				});

				after(function() {
					detachTextInput($input);
				});

				it('list\'s length == 6', function() {
					assert.lengthOf($input.mSelectDBox().get('list'), 3);
				});

				it('length of <li>  == 3', function() {
					assert.lengthOf($input.mSelectDBox().get('dbox').querySelectorAll('li'), 3);
				});

				it('second list\'s item label property should be "beta"', function() {
					assert.equal($input.mSelectDBox().get('list')[1].label, 'beta');
				});
			});

			describe('Array of Objects', function() {
				var $input;

				before(function() {
					$input = appendTextInput({
						list: [
							{ value: 'a', label: 'alpha' },
							{ value: 'b', label: 'beta' },
							{ value: 'g', label: 'gamma' },
							{ value: 'without_label' },
							{ label: 'without_value' },
							{}
						]
					}, { id: 'msdb-test-c' });
				});

				after(function() {
					detachTextInput($input);
				});

				it('list\'s length == 6', function() {
					assert.lengthOf($input.mSelectDBox().get('list'), 6);
				});

				it('length of <li>  == 3', function() {
					assert.lengthOf($input.mSelectDBox().get('dbox').querySelectorAll('li'), 3);
				});

				it('second list\'s item label property should be "beta"', function() {
					assert.equal($input.mSelectDBox().get('list')[1].label, 'beta');
				});
			});

			describe('Array of Strings + function, null, undefined', function() {
				var $input;

				before(function() {
					$input = appendTextInput({
						list: [
							'alpha',
							null,
							'beta',
							void 0,
							'gamma',
							function() {}
						]
					}, { id: 'msdb-test-c' });
				});

				after(function() {
					detachTextInput($input);
				});

				it('list\'s length == 6', function() {
					assert.lengthOf($input.mSelectDBox().get('list'), 6);
				});

				it('length of <li>  == 3', function() {
					assert.lengthOf($input.mSelectDBox().get('dbox').querySelectorAll('li'), 3);
				});

				it('second list\'s item should be null', function() {
					assert.isNull($input.mSelectDBox().get('list')[1], null);
				});

				it('third list\'s item label property should be "beta"', function() {
					assert.equal($input.mSelectDBox().get('list')[2].label, "beta");
				});
			});

		}); // </._initList()>

		describe('m-select-d-box-fade', function() {
			var $fadeElem, $inputElem;

			before(function() {
				$inputElem = appendTextInput({ list: [] });
			});

			beforeEach(function() {
				$fadeElem = $('.m-select-d-box-fade');
			});

			it('it initially hidden', function() {
				// m-select-d-box_hidden
				assert.isOk($fadeElem.hasClass('m-select-d-box_hidden'));
			});

			it('it visible when list is active', function() {
				// TODO
				$inputElem.mSelectDBox("open");
				assert.isNotOk($fadeElem.hasClass('m-select-d-box_hidden'));
				$inputElem.mSelectDBox("close");
			});
		}); // </m-select-d-box-fade>

	}); // </Constructor>

	describe('Events', function() {
		var $elem, msdb;

		beforeEach(function() {
			$elem = appendTextInput({
				list: ['abc']
			});
			msdb = $elem.mSelectDBox();
		});

		afterEach(function() {
			detachTextInput($elem);
		});

		describe('on', function() {
			beforeEach(function() {
				delete msdb.events.jump;
			});

			it('create event-name hash inside instance', function() {
				var ret = msdb.on('jump', function() {
					// do stuff
				});

				assert.isArray(msdb.events.jump);
				assert.ok(msdb == ret, 'chain');
			});

			it('append handler in existed event-name hash', function() {
				var len = msdb.events.click.length;
				var ret = msdb.on('click', function() {
					// do stuff
				});

				assert.lengthOf(msdb.events.click, len + 1);
				assert.ok(ret == msdb, 'chain');
			});

			it('event-name != String', function() {
				var ret = msdb.on({}, function() {});

				assert.notOk(msdb.events['[object Object]']);
			});

			it('event-handler != Function', function() {
				var ret = msdb.on('jump', {});

				assert.notOk(msdb.events.jump);
				assert.ok(ret == msdb, 'chain');
			});
		});

		describe('trigger', function() {
			beforeEach(function() {
				delete msdb.events.jump;
			});

			it('.trigger("jump", dataObject)', function(done) {
				msdb.on('jump', function(ctx, e) {
					assert.lengthOf(arguments, 2);
					assert.ok(msdb == ctx);
					assert.deepEqual(e.data, { a: 1, b: 2 });

					done();
				});

				msdb.trigger(
					'jump',
					{
						data: {
							a: 1,
							b: 2
						}
					}
				);
			});

			it.skip('TODO .trigger("jump", $.Event())', function() {
				// TODO
				assert.ok(false);
			})
		});

		it.skip('TODO', function() {
			assert.ok(!1);
		});
	});

	describe.skip('autoComplete', function() {
		it('TODO', function() {
			assert.ok(false);
		});
	});

	describe('methods', function() {

		describe('selection-methods', function() {
			var $elemMFalse, $elemMTrue;

			before(function() {
				$elemMTrue = appendTextInput(
					{
						list: [
							{ value: 'a-value', label: 'a-label' },
							{ value: 'b-value', label: 'b-label' },
							{ value: 'c-value', label: 'c-label' }
						],
						multiple: true
					},
					{
						attrs: {
							id: 'msdb-test-a',
								type: 'text'
						}
					}
				);

				$elemMFalse = appendTextInput(
					{
						list: [
							{ value: 'a-value', label: 'a-label' },
							{ value: 'b-value', label: 'b-label' },
							{ value: 'c-value', label: 'c-label' }
						],
						multiple: false
					},
					{
						attrs: {
							id: 'msdb-test-b',
							type: 'text'
						}
					}
				);
			});

			after(function() {
				detachTextInput($elemMFalse);
				detachTextInput($elemMTrue);
			});

			describe('.select()', function() {
				var data = {
					'mFalse': {},
					'mTrue': {}
				};

				var eachFn = function() {
					data.mFalse.values = $elemMFalse.mSelectDBox().getSelectedValues();
					data.mFalse.labels = $elemMFalse.mSelectDBox().getSelectedLabels();
					data.mFalse.$dbox = $($elemMFalse.mSelectDBox().get('dbox'));
					data.mFalse.$modSelected = data.mFalse.$dbox.find('.m-select-d-box__list-item_selected');
					data.mFalse.input = $elemMFalse.mSelectDBox().get('target');

					data.mTrue.values = $elemMTrue.mSelectDBox().getSelectedValues();
					data.mTrue.labels = $elemMTrue.mSelectDBox().getSelectedLabels();
					data.mTrue.$dbox = $($elemMTrue.mSelectDBox().get('dbox'));
					data.mTrue.$modSelected = data.mTrue.$dbox.find('.m-select-d-box__list-item_selected');
					data.mTrue.input = $elemMTrue.mSelectDBox().get('target');
				};

				describe('multiple: false', function() {
					beforeEach(function() {
						$elemMFalse.mSelectDBox().deselectAll();
					});

					it('value: "a-value"', function() {
						$elemMFalse.mSelectDBox().select({ value: 'a-value' });

						eachFn();

						assert.deepEqual(data.mFalse.values, ['a-value'], 'getSelectedValues');
						assert.equal(data.mFalse.input.value, 'a-label', 'input');
						assert.lengthOf(data.mFalse.$modSelected, 1, 'list');
					});

					it('value: ["a-value"]', function() {
						$elemMFalse.mSelectDBox().select({ value: ['a-value'] });

						eachFn();

						assert.deepEqual(data.mFalse.values, ['a-value'], 'getSelectedValues');
						assert.equal(data.mFalse.input.value, 'a-label', 'input');
						assert.lengthOf(data.mFalse.$modSelected, 1, 'list');
					});

					it('value: ["a-value", "b-value"]', function() {
						$elemMFalse.mSelectDBox().select({ value: ['a-value', 'b-value'] });

						eachFn();

						assert.deepEqual(data.mFalse.values, [], 'getSelectedValues');
						assert.equal(data.mFalse.input.value, '', 'input');
						assert.lengthOf(data.mFalse.$modSelected, 0, 'list');
					});

					it('label: "a-label"', function() {
						$elemMFalse.mSelectDBox().select({ label: 'a-label' });

						eachFn();

						assert.deepEqual(data.mFalse.labels, ['a-label'], 'getSelectedLabels');
						assert.equal(data.mFalse.input.value, 'a-label', 'input');
						assert.lengthOf(data.mFalse.$modSelected, 1, 'list');
					});

					it('label: ["a-label"]', function() {
						$elemMFalse.mSelectDBox().select({ label: ['a-label'] });

						eachFn();

						assert.deepEqual(data.mFalse.labels, ['a-label'], 'getSelectedLabels');
						assert.equal(data.mFalse.input.value, 'a-label', 'input');
						assert.lengthOf(data.mFalse.$modSelected, 1, 'list');
					});

					it('label: ["a-label", "b-label"]', function() {
						$elemMFalse.mSelectDBox().select({ label: ['a-label', 'b-label'] });

						eachFn();

						assert.deepEqual(data.mFalse.labels, [], 'getSelectedLabels');
						assert.equal(data.mFalse.input.value, '', 'input');
						assert.lengthOf(data.mFalse.$modSelected, 0, 'list');
					});
				});

				describe('multiple: true', function() {
					it('value: ["a-value", "b-value"]', function() {
						$elemMTrue.mSelectDBox().select({ value: ['a-value', 'b-value'] });

						eachFn();

						assert.deepEqual(data.mTrue.values, ['a-value', 'b-value'], 'getSelectedValues');
						assert.equal(data.mTrue.input.value, 'a-label; b-label;', 'input');
						assert.lengthOf(data.mTrue.$modSelected, 2, 'list');
					});

					it('label: ["a-label", "b-label"]', function() {
						$elemMTrue.mSelectDBox().select({ label: ['a-label', 'b-label'] });

						eachFn();

						assert.deepEqual(data.mTrue.labels, ['a-label', 'b-label'], 'getSelectedLabels');
						assert.equal(data.mTrue.input.value, 'a-label; b-label;', 'input');
						assert.lengthOf(data.mTrue.$modSelected, 2, 'list');
					})
				});
			});

			describe('$elem.val() // get', function() {
				beforeEach(function() {
					$elemMTrue.mSelectDBox().deselectAll();
				});

				it('get ["a-value", "b-value"]', function() {
					$elemMTrue.mSelectDBox().select({ value: ['a-value', 'b-value'] });
					assert.deepEqual($elemMTrue.val(), ['a-value', 'b-value']);
				});
			});

			describe('$elem.val("value") // set', function() {
				it('set ["a-value", "b-value"]', function() {
					$elemMTrue.val(['b-value', 'a-value']);
					assert.ok($elemMTrue.val(), ['a-value', 'b-value']);
				});
			});

			describe('.selectAll()', function() {
				it('check: labels, values, input, list', function() {
					var m = $elemMTrue.mSelectDBox();
					m.selectAll();

					assert.deepEqual(m.getSelectedValues(), ['a-value', 'b-value', 'c-value']);
					assert.deepEqual(m.getSelectedLabels(), ['a-label', 'b-label', 'c-label']);
					assert.equal(m.get('target').value, 'a-label; b-label; c-label;');
					assert.lengthOf($(m.get('dbox')).find('.m-select-d-box__list-item_selected'), 3)
				});
			});

			describe('.deselectAll()', function() {
				it('check: labels, values, input, list', function() {
					var m = $elemMTrue.mSelectDBox();
					m.deselectAll();

					assert.deepEqual(m.getSelectedValues(), []);
					assert.deepEqual(m.getSelectedLabels(), []);
					assert.equal(m.get('target').value, '');
					assert.lengthOf($(m.get('dbox')).find('.m-select-d-box__list-item_selected'), 0);
				});
			});

			describe('.deselect()', function() {
				var data = {
					mFalse: {},
					mTrue: {}
				};

				var eachFn = function() {
					data.mTrue.labels = $elemMTrue.mSelectDBox().getSelectedLabels();
					data.mTrue.values = $elemMTrue.mSelectDBox().getSelectedValues();
					data.mTrue.$dbox = $($elemMTrue.mSelectDBox().get('dbox'));
					data.mTrue.$selectedMod = data.mTrue.$dbox.find('.m-select-d-box__list-item_selected');
					data.mTrue.input = $elemMTrue.mSelectDBox().get('target');
				};

				beforeEach(function() {
					$elemMTrue.mSelectDBox().deselectAll();
					$elemMTrue.mSelectDBox().selectAll();
				});

				it('value: "a-value"', function() {
					$elemMTrue.mSelectDBox().deselect({ value: 'a-value' });

					eachFn();

					assert.lengthOf(data.mTrue.$selectedMod, 2, 'list');
					assert.deepEqual(data.mTrue.values, ['b-value', 'c-value'], 'values');
					assert.deepEqual(data.mTrue.labels, ['b-label', 'c-label'], 'labels');
					assert.equal(data.mTrue.input.value, 'b-label; c-label;', 'input');
				});

				it('value: ["a-value"]', function() {
					$elemMTrue.mSelectDBox().deselect({ value: ['a-value'] });

					eachFn();

					assert.lengthOf(data.mTrue.$selectedMod, 2, 'list');
					assert.deepEqual(data.mTrue.values, ['b-value', 'c-value'], 'values');
					assert.deepEqual(data.mTrue.labels, ['b-label', 'c-label'], 'labels');
					assert.equal(data.mTrue.input.value, 'b-label; c-label;', 'input');
				});

				it('value: ["a-value", "b-value", "false-value"]', function() {
					$elemMTrue.mSelectDBox().deselect({ value: ['a-value', 'c-value', 'false-value'] });

					eachFn();

					assert.lengthOf(data.mTrue.$selectedMod, 1, 'list');
					assert.deepEqual(data.mTrue.values, ['b-value'], 'values');
					assert.deepEqual(data.mTrue.labels, ['b-label'], 'labels');
					assert.equal(data.mTrue.input.value, 'b-label;', 'input');
				});

				it('label: "a-label"', function() {
					$elemMTrue.mSelectDBox().deselect({ label: 'a-label' });

					eachFn();

					assert.lengthOf(data.mTrue.$selectedMod, 2, 'list');
					assert.deepEqual(data.mTrue.values, ['b-value', 'c-value'], 'values');
					assert.deepEqual(data.mTrue.labels, ['b-label', 'c-label'], 'labels');
					assert.equal(data.mTrue.input.value, 'b-label; c-label;', 'input');
				});

				it('label: ["a-label"]', function() {
					$elemMTrue.mSelectDBox().deselect({ label: ['a-label'] });

					eachFn();

					assert.lengthOf(data.mTrue.$selectedMod, 2, 'list');
					assert.deepEqual(data.mTrue.values, ['b-value', 'c-value'], 'values');
					assert.deepEqual(data.mTrue.labels, ['b-label', 'c-label'], 'labels');
					assert.equal(data.mTrue.input.value, 'b-label; c-label;', 'input');
				});

				it('label: ["a-label", "b-label", "false-label"]', function() {
					$elemMTrue.mSelectDBox().deselect({ label: ['a-label', 'c-label', 'false-label'] });

					eachFn();

					assert.lengthOf(data.mTrue.$selectedMod, 1, 'list');
					assert.deepEqual(data.mTrue.values, ['b-value'], 'values');
					assert.deepEqual(data.mTrue.labels, ['b-label'], 'labels');
					assert.equal(data.mTrue.input.value, 'b-label;', 'input');
				});
			});

			describe('.getSelectedValues()', function() {
				beforeEach(function() {
					$elemMFalse.mSelectDBox().select({ value: 'b-value' });
					$elemMTrue.mSelectDBox().select({ value: ['a-value', 'c-value'] });
				});

				it('multiple true; suppose to be ["a-value", "c-value"]', function() {
					assert.deepEqual($elemMTrue.mSelectDBox().getSelectedValues(), ['a-value', 'c-value']);
				});
				it('multiple false; suppose to be ["b-value"]', function() {
					assert.deepEqual($elemMFalse.mSelectDBox().getSelectedValues(), ['b-value']);
				});
			});

			describe('.getSelectedLabels()', function() {
				beforeEach(function() {
					$elemMFalse.mSelectDBox().select({ value: 'b-value' });
					$elemMTrue.mSelectDBox().select({ value: ['a-value', 'c-value'] });
				});

				it('multiple true; suppose to be ["a-label", "c-label"]', function() {
					assert.deepEqual($elemMTrue.mSelectDBox().getSelectedLabels(), ['a-label', 'c-label']);
				});
				it('multiple false; suppose to be ["b-label"]', function() {
					assert.deepEqual($elemMFalse.mSelectDBox().getSelectedLabels(), ['b-label']);
				});
			});

			describe('.getSelectedKeys()', function() {
				beforeEach(function() {
					$elemMFalse.mSelectDBox().select({ value: 'b-value' });
					$elemMTrue.mSelectDBox().select({ value: ['a-value', 'c-value'] });
				});

				it('multiple true; suppose to be [0, 2]', function() {
					assert.deepEqual($elemMTrue.mSelectDBox().getSelectedKeys(), ['0', '2']);
				});
				it('multiple false; suppose to be [1]', function() {
					assert.deepEqual($elemMFalse.mSelectDBox().getSelectedKeys(), ['1']);
				});
			});

			describe('.hasValue()', function() {
				it('.hasValue(b-value) == true', function() {
					assert.ok($elemMFalse.mSelectDBox().hasValue('b-value'));
				});
				it('.hasValue(false-value) == false', function() {
					assert.notOk($elemMFalse.mSelectDBox().hasValue('false-value'));
				});
			});

			describe('.hasLabel()', function() {
				it('.hasLabel(b-label) == true', function() {
					assert.ok($elemMFalse.mSelectDBox().hasLabel('b-label'));
				});
				it('.hasLabel(false-label) == false', function() {
					assert.notOk($elemMFalse.mSelectDBox().hasLabel('false-label'));
				});
			});

			describe('.applySelectedToList()', function() {
				beforeEach(function() {
					$elemMFalse.mSelectDBox().deselectAll();
					$elemMTrue.mSelectDBox().deselectAll();
				});

				it('multiple = false; "c-label" should have ".m-select-d-box__list-item_selected"', function() {
					// $elemMTrue.mSelectDBox().select({ value: ['a-value', 'c-value'] });
					var selCache = $elemMFalse.mSelectDBox().get('selectedCache'),
						labels = $elemMFalse.mSelectDBox().get('labelsCache'),
						$box = $($elemMFalse.mSelectDBox().get('dbox'));

					selCache[labels['c-label'].id] = labels['c-label'];
					selCache[labels['c-label'].id].selected = true;

					$elemMFalse.mSelectDBox().applySelectedToList();

					var $collection = $box.find(
						'.m-select-d-box__list-item_selected[data-msdbid=' + labels['c-label'].id + '],' +
						'.m-select-d-box__list-item_selected[data-msdbid=3]'
					);

					assert.lengthOf($collection, 1);
				});

				it('multiple = true; "b-label", "c-label" should have ".m-select-d-box__list-item_selected"', function() {
					var selCache = $elemMFalse.mSelectDBox().get('selectedCache'),
						labels = $elemMFalse.mSelectDBox().get('labelsCache'),
						$box = $($elemMFalse.mSelectDBox().get('dbox'));

					selCache[labels['c-label'].id] = labels['c-label'];
					selCache[labels['c-label'].id].selected = true;
					selCache[labels['b-label'].id] = labels['b-label'];
					selCache[labels['b-label'].id].selected = true;

					$elemMFalse.mSelectDBox().applySelectedToList();

					var $collection = $box.find(
						'.m-select-d-box__list-item_selected[data-msdbid=' + labels['c-label'].id + '],' +
						'.m-select-d-box__list-item_selected[data-msdbid=' + labels['b-label'].id + '],' +
						'.m-select-d-box__list-item_selected[data-msdbid=3]'
					);

					assert.lengthOf($collection, 2);
				});
			});

			describe('.applySelectedToInput()', function() {
				beforeEach(function() {
					$elemMFalse.mSelectDBox().deselectAll();
					$elemMTrue.mSelectDBox().deselectAll();
				});

				it('multiple = false; input.value == "c-label"', function() {
					var selCache = $elemMFalse.mSelectDBox().get('selectedCache'),
						labels = $elemMFalse.mSelectDBox().get('labelsCache'),
						input = $elemMFalse.mSelectDBox().get('target');

					selCache[labels['c-label'].id] = labels['c-label'];
					selCache[labels['c-label'].id].selected = true;

					$elemMFalse.mSelectDBox().applySelectedToInput();

					assert.equal(input.value, 'c-label');
				});

				it('multiple = true; input.value == "b-label; c-label"', function() {
					var selCache = $elemMFalse.mSelectDBox().get('selectedCache'),
						labels = $elemMFalse.mSelectDBox().get('labelsCache'),
						input = $elemMFalse.mSelectDBox().get('target');

					selCache[labels['c-label'].id] = labels['c-label'];
					selCache[labels['c-label'].id].selected = true;
					selCache[labels['b-label'].id] = labels['b-label'];
					selCache[labels['b-label'].id].selected = true;

					$elemMFalse.mSelectDBox().applySelectedToInput();

					assert.equal(input.value, 'b-label; c-label');
				});
			});
		});

		describe('behavior-methods', function() {
			var $elem, $dbox, msdb;
			// m-select-d-box_hidden

			before(function() {
				$elem = appendTextInput({
					list: ['abc']
				});
				msdb = $elem.mSelectDBox();
				$dbox = $(msdb.get('dbox'));
			});

			after(function() {
				detachTextInput($elem);
			});

			describe('.open()', function() {
				it('should\'t have class ".m-select-d-box_hidden" after ".open()"', function() {
					assert.ok($dbox.hasClass('m-select-d-box_hidden'), 'inactive');

					msdb.open();

					assert.notOk($dbox.hasClass('m-select-d-box_hidden'), 'active');
				});
			});

			describe('.close()', function() {
				it('should have class ".m-select-d-box_hidden" after ".close()"', function() {
					msdb.open();

					assert.notOk($dbox.hasClass('m-select-d-box_hidden'), 'inactive');
				});
			});

			describe('.isActive()', function() {
				it('should be true when list opened', function() {
					msdb.close();
					msdb.open();
					assert.ok(msdb.isActive());
				});
			});
		});

		describe('other-methods', function() {

			var msdb,
				msdbB,
				$elem,
				$elemB;

			beforeEach(function() {
				$elem = appendTextInput({
					list: ['abc'],
					embeddedInput: true
				});

				$elemB = appendTextInput({
					list: ['abc'],
					embeddedInput: true
				});

				msdb = $elem.mSelectDBox();
				msdbB = $elemB.mSelectDBox();
			});

			afterEach(function() {
				detachTextInput($elem);
				detachTextInput($elemB)
			});

			describe('.set()', function() {
				beforeEach(function() {
					msdb._props = {};
					msdb.events = {};
				});

				afterEach(function() {
					msdb._props = {};
					msdb.events = {};
				});

				it('.set("color", "black")', function() {
					msdb.set('color', 'black');

					assert.equal(msdb._props.color, 'black');
				});

				it('.set("COLOR", "black")', function() {
					msdb.set('COLOR', 'black');

					assert.equal(msdb._props.color, 'black');
				});

				it('.set([...])', function() {
					msdb.set({
						color: 'black',
						figure: 'circle'
					});

					assert.equal(msdb._props.color, 'black');
					assert.equal(msdb._props.figure, 'circle');
				});

				it(
					'.set("color", "black");' +
					' .trigger("set");' +
					' .trigger("beforeSet");' +
					' .trigger("afterSet");' +
					' .trigger("beforeSet:color");' +
					' .trigger("afterSet:color");' +
					' .trigger("set:color")',
					function(done) {
						var c = 0;
						var callback = function() {
							if (++c >= 4) done();
						};

						msdb.on('set', callback)
							.on('beforeSet:color', callback)
							.on('afterSet:color', callback)
							.on('beforeSet', callback)
							.on('afterSet', callback)
							.on('set:color', callback)
							.set('color', 'black');
					}
				);

				it('.set({a, b}); should fire event twice', function(done) {
					var c = 0;
					var callback = function() {
						if (++c >= 2) done();
					};

					msdb.on('set', callback);

					msdb.set({ color: 'black', figure: 'circle' });
				});
			});

			describe('.get()', function() {
				afterEach(function() {
					msdb._props = {};
					msdb.events = {};
				});

				it('.get("color") == "black"', function() {
					msdb.set('color', 'black');
					assert.equal(msdb.get('color'), 'black');
				});

				it('.get("COLOR") == "black"', function() {
					msdb.set('color', 'black');
					assert.equal(msdb.get('COLOR'), 'black');
				});

				it(
					'.get("color", "black");' +
					' .trigger("get");' +
					' .trigger("get:color")',
					function(done2) {
						var c = 0;
						var callback = function() {
							if (++c >= 2) done2();
						};

						msdb.on('get', callback)
							.on('get:color', callback)
							.get('color', 'black');
					}
				);
			});

			describe.skip('._isDBoxInput()', function() {
				// TODO
				it('own ".m-select-d-box__search-input"', function() {
					// m-select-d-box__search-input
					var $dbox = $(msdb.get('dbox')),
						$lsInp = $dbox
							.find('.m-select-d-box__search-input')
							.get(0);

					assert.ok(msdb._isDBoxInput($lsInp));
				});

				it('not own ".m-select-d-box__search-input"', function() {
					// m-select-d-box__search-input
					var $lsInpB = $(msdbB.get('dbox'))
						.find('.m-select-d-box__search-input')
						.get(0);

					assert.notOk(msdb._isDBoxInput($lsInpB));
				});
			});

			describe('._isTargetElement()', function() {
				it('own control element', function() {
					assert.ok(msdb._isTargetElement($elem.get(0)));
				});

				it('not own control element', function() {
					assert.notOk(msdbB._isTargetElement($elem.get(0)));
				});
			});

			describe('._isDBoxElement()', function() {
				it('own box list element', function() {
					assert.ok(msdb._isDBoxElement(msdb.get('dbox')));
				});

				it('not own box list element', function() {
					assert.notOk(msdbB._isDBoxElement(msdb.get('dbox')));
				});
			});

		});
	});

	describe('utils', function() {
		var fx = $.fn.mSelectDBox.prototype.fx;

		describe('.isTextInput()', function() {
			it('type="text" == true', function() {
				assert.ok(fx.isTextInput($('<input type="text">').get(0)));
			});

			it('type="button" == false', function() {
				assert.notOk(fx.isTextInput($('<input type="button">').get(0)));
			});

			it('<div> == false', function() {
				assert.notOk(fx.isTextInput($('<div>').get(0)));
			});

			it('<select> == false', function() {
				assert.notOk(fx.isTextInput($('<select>').get(0)));
			});

			it('<textarea> == true', function() {
				assert.ok(fx.isTextInput($('<textarea>').get(0)));
			});
		});

		describe('msplit', function() {
			it('"a;b,c d" -> ["a", "b", "c", "d"]', function() {
				assert.deepEqual(fx.msplit([';',',',' '], 'a;b,c d'), ['a', 'b', 'c', 'd']);
			});
		});

		describe('trim', function() {
			it('"1234" -> trim "14" -> "23"', function() {
				assert.equal(fx.trim('1234', '14'), '23');
			});

			it('"1234" -> rtrim "14" -> "123"', function() {
				assert.equal(fx.trim('1234', '14', 'right'), '123');
			});

			it('"1234" -> ltrim "14" -> "234"', function() {
				assert.equal(fx.trim('1234', '14', 'left'), '234');
			});
		});

		describe('rest', function() {
			it('[1,2,3,4] -> [2,3,4]', function() {
				assert.deepEqual(fx.rest([1,2,3,4], 1), [2,3,4]);
			});
		});

		describe('hop', function() {
			it('.hop({a:1,b:2}, a) == true', function() {
				assert.ok(fx.hop({a: 1, b: 2}, 'a'));
			});

			it('.hop({a:1,b:2}, c) == false', function() {
				assert.notOk(fx.hop({a: 1, b: 2}, 'c'));
			});

			it('.hop({a:1,b:2}, a) == true', function() {
				var proto = { a: 1, b: 2, c: 3},
					obj = Object.create(proto);

				assert.notOk(fx.hop(obj, 'a'));
			});
		});
	})
});