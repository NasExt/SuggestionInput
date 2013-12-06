/**
 * suggestionInput
 * @package suggestionInput
 * @copyright Copyright (c) 2012 Dusan Hudak
 */

/**
 * Keyboard
 */
function Keyboard() {
	this.remove = function (e) {
		return e.keyCode == 8;
	};
	this.enter = function (e) {
		return e.keyCode == 13;
	};
	this.escape = function (e) {
		return e.keyCode == 27;
	};
	this.up = function (e) {
		return e.keyCode == 38;
	};
	this.down = function (e) {
		return e.keyCode == 40;
	};
	this.control = function (e) {
		return $.inArray(e.keyCode, [13, 16, 18, 35, 36, 37, 38, 39, 40, 46, 91, 92]) !== -1;
	};
	this.input = function (e) {
		var letter = /^[a-iA-Z\u00C0-\u02A00-9-]+$/; // a-i numpad 1-9, A-Z letters, accented letters, numbers, hyphen
		return $.inArray(e.keyCode, [96, 32, 189, 190]) !== -1  // numpad zero, hyphen, point
			|| letter.test(this.keyToChar(e.keyCode));
	};
	this.keyToChar = function (key) {
		return String.fromCharCode(key);
	};
}
var kb = new Keyboard;

/**
 * SuggestionInputControl
 */
function SuggestionInputControl() {
	var i = this;

	this.options = {
		startSuggest: 3,
		suggestTimeout: 250,
		suggestListClass: 'typeahead dropdown-menu',
		suggestListActiveClass: 'active'
	};
	this.name = undefined;
	this.control = undefined;
	this.suggestionInputContainer = undefined;
	this.suggest = undefined;
	this.timeout = null;


	/**
	 * Create link to signal
	 * @returns string Link to signal
	 */
	this.getSignalLink = function () {
		if (!i.control.data('suggestion-input')) {
			return false;
		}
		return i.control.data('suggestion-input').replace('%25filter%25', i.control.val());
	};


	/**
	 * Get suggestion input container
	 * @returns {XML|parent|*|parent|parent|parent}
	 */
	this.getSuggestionInputContainer = function () {
		return i.control.parent();
	};


	/**
	 * Get input form
	 * @returns {*|parents|parents}
	 */
	this.getForm = function () {
		return i.control.parents('form');
	};


	/**
	 * @returns {boolean}
	 */
	this.onChange = function () {
		return false;
	};


	/**
	 * @param e
	 */
	this.onBlur = function (e) {
		setTimeout(function () {
			i.suggest.hide();
		}, 200);
	};


	/**
	 * Action suggest
	 * @param e
	 */
	this.onSuggest = function (e) {

		// reset timeout
		if (this.timeout) clearTimeout(this.timeout);

		this.timeout = setTimeout(function () {

			// If not signal link or press kb.control key then stop suggest
			if (!i.getSignalLink() || kb.control(e)) {
				return false;
			}

			// Start suggest only when the value is longer than i.options.startSuggest
			// and hide suggestList
			if (i.control.val().length < i.options.startSuggest) {
				i.suggest.hide();
				return false;
			}

			// Send ajax request
			$.ajax(i.getSignalLink(), {
				success: function (payload) {
					i.suggest.data('init', true);
					i.suggest.children().remove();

					var showData = payload.use;
					if (payload.show) {
						showData = payload.show;
					}

					if (payload.use) {
						$.each(payload.use, function (x, v) {
							var item = $('<li/>').html(showData[x]);
							item.attr('data-value', v);
							item.mouseover(function () {
								i.suggest.children().removeClass(i.options.suggestListActiveClass);
								$(this).addClass(i.options.suggestListActiveClass);
							});
							item.click(function () {
								i.control.val(item.data('value'));
								i.suggest.hide();
							});
							i.suggest.append(item);
						});
						if (payload.use.length > 0) {
							i.suggest.show();
						}
					}
				}
			});

		}, i.options.suggestTimeout);
	};


	/**
	 *
	 * @param e
	 * @returns {boolean}
	 */
	this.onKeyDown = function (e) {
		if (kb.input(e)) {
			// if write
		}
		else if (kb.enter(e) && i.suggest.is(':visible') && i.suggest.children('.' + i.options.suggestListActiveClass).text().length > 0) {
			var selected = i.suggest.children('.' + i.options.suggestListActiveClass);
			selected.click();
			return false;
		}
		else if (kb.down(e) && i.suggest.is(':visible')) {
			var selected = i.suggest.children('.' + i.options.suggestListActiveClass);
			if (!selected.length) {
				var item = i.suggest.children(':first-child').addClass(i.options.suggestListActiveClass);
				i.control.val(item.data('value'));
			} else if (selected.next().length) {
				selected.removeClass(i.options.suggestListActiveClass);
				var item = selected.next().addClass(i.options.suggestListActiveClass);
				i.control.val(item.data('value'));
			}
			return false;
		} else if (kb.up(e) && i.suggest.is(':visible')) {
			var selected = i.suggest.children('.' + i.options.suggestListActiveClass);
			if (selected.prev().length) {
				selected.removeClass(i.options.suggestListActiveClass);
				var item = selected.prev().addClass(i.options.suggestListActiveClass);
				i.control.val(item.data('value'));
			} else {
				i.suggest.hide();
			}
			return false;
		}
		else if (kb.down(e) && !i.suggest.is(':visible')) {
			if (i.suggest.children().length > 0) {
				i.suggest.show();
			}
			return false;
		}
		else if (kb.escape(e)) {
			i.control.val('');
			i.suggest.hide();
			i.suggest.children().remove();
			return false;
		}
		else if (kb.remove(e)) {
			// if delete
		}
		else if (!kb.control(e)) {
			// if kb is not in control
		}
	};
}


/**
 * SuggestionInput
 */
var SuggestionInput = SuggestionInput || {
	inputs: []
};

/**
 *
 * @param {string} controlId
 * @param {object} options
 */
SuggestionInput.create = function (controlId, options) {
	var input = new SuggestionInputControl;

	input.options = $.extend({}, input.options, options);
	input.name = controlId;
	input.control = $('#' + input.name);
	input.suggestionInputContainer = input.getSuggestionInputContainer();

	if (input.getSignalLink()) {
		input.suggest = $('<ul/>').addClass(input.options.suggestListClass);

		var width = input.control.innerWidth();
		input.suggest.css({
			minWidth: width + "px"
		});
		input.control.css({
			marginBottom: "0px"
		});

		input.suggestionInputContainer.append(input.suggest);
		input.suggest.hide();
	}

	input.control.keydown(input.onKeyDown);
	input.control.keyup(input.onSuggest);
	input.control.bind('cut change', input.onChange);
	input.control.blur(input.onBlur);

	this.inputs.push(input);
};