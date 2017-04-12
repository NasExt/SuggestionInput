/**
 * SuggestionInput
 * @author Dusan Hudak <admin@dusan-hudak.com>
 */

(function ($) {
	$.fn.suggestionInput = function (options) {

		var si = this;
		si.timeout = false;
		si.kb = new SuggestionInputKeyboard;
		si.suggestListContainerDefaultClass = 'suggestion-input-typeahead';
		si.suggestionInputContainerDefaultClass = 'suggestion-input-container';
		si.settings = $.extend({
			startSuggest: 3,
			openOnClick: false,
			suggestTimeout: 350,
			suggestListContainerClass: 'dropdown-menu',
			suggestionInputContainerClass: '',
			suggestListActiveClass: 'active',
			dataLinkName: 'suggestionInput',
			filterAlias: 'suggestionInputValue'
		}, options);

		/**
		 * Get suggestion input container
		 * @param $input
		 * @returns {XML|*}
		 */
		this.getSuggestionInputContainer = function ($input) {
			return $($input).parent('.' + si.suggestionInputContainerDefaultClass);
		};

		/**
		 * Create suggestion input container
		 * @param $input
		 * @returns {XML|*}
		 */
		this.createSuggestionInputContainer = function ($input) {
			if ($input.parent().hasClass(si.suggestionInputContainerDefaultClass)) {
				return $input.parent();
			} else {
				var container = $('<div/>').addClass(si.suggestionInputContainerDefaultClass);
				$input.before(container);
				container.append($input);
				return container;
			}
		};

		/**
		 * Get link to signal
		 * @param $input
		 * @returns {*}
		 */
		this.getSignalLink = function ($input) {
			var data = $($input).data(si.settings.dataLinkName);
			if (data == undefined) {
				return false;
			}
			return data.replace('%25' + si.settings.filterAlias + '%25', $($input).val());
		};

		/**
		 * Create SuggestListContainer
		 * @param $input
		 * @returns {*}
		 */
		this.createSuggestListContainer = function ($input) {
			var suggestionInputContainer = si.getSuggestionInputContainer($input);

			if ($input.next().hasClass(si.suggestListContainerDefaultClass)) {
				var suggestListContainer = $input.next();
			} else {
				var suggestListContainer = $('<ul/>').addClass(si.suggestListContainerDefaultClass);
				suggestionInputContainer.append(suggestListContainer);
			}

			suggestListContainer
				.addClass(si.settings.suggestListContainerClass)
				.css({
					minWidth: $($input).innerWidth() + "px"
				})
				.hide();

			$($input).css({
				marginBottom: "0px"
			});

			return suggestListContainer;
		};

		/**
		 * Get SuggestListContainer
		 * @param $input
		 * @returns {*}
		 */
		this.getSuggestListContainer = function ($input) {
			var suggestionInputContainer = si.getSuggestionInputContainer($input);
			return suggestionInputContainer.find('.' + si.suggestListContainerDefaultClass);
		};

		/**
		 * Hide SuggestListContainer
		 * @param $input
		 */
		this.hideSuggestListContainer = function ($input) {
			var suggestListContainer = si.getSuggestListContainer($input);
			if (suggestListContainer.is(':visible')) {
				suggestListContainer.hide();
			}
		};

		/**
		 * Show SuggestListContainer
		 * @param $input
		 */
		this.showSuggestListContainer = function ($input) {
			var suggestListContainer = si.getSuggestListContainer($input);
			if (suggestListContainer.is(':hidden')) {
				suggestListContainer.show();
			}
		};

		/**
		 * Event onChange
		 * @returns {boolean}
		 */
		this.onChange = function () {
			return false;
		};

		/**
		 * Event onBlur
		 * @param e
		 */
		this.onBlur = function (e) {
			var $input = $(this);
			setTimeout(function () {
				si.hideSuggestListContainer($input);
			}, 200);
		};

		/**
		 * Event onSuggest
		 * @param e
		 * @returns {boolean}
		 */
		this.onSuggest = function (e) {
			var $input = $(this);
			var suggestListContainer = si.getSuggestListContainer($input);

			// reset timeout
			if (si.timeout != false) clearTimeout(si.timeout);

			si.timeout = setTimeout(function () {

				// If not signal link or press kb.control key then stop suggest
				if (si.kb.control(e) || si.kb.escape(e)) {
					return false;
				}

				// Start suggest only when the value is longer than i.options.startSuggest
				// and hide suggestList
				if (si.settings.openOnClick == true) {
					if (e.type != 'click' && $input.val().length < si.settings.startSuggest) {
						return false;
					}
				} else {
					if ($input.val().length < si.settings.startSuggest) {
						return false;
					}
				}

				// Send ajax request
				$.ajax(si.getSignalLink($input), {
					success: function (payload) {
						suggestListContainer.children().remove();

						var showData = payload.use;
						if (payload.show) {
							showData = payload.show;
						}

						if (payload.use) {
							$.each(payload.use, function (i, v) {
								var item = $('<li/>')
									.html(showData[i])
									.attr('data-value', v)
									.mouseover(function () {
										suggestListContainer.children().removeClass(si.settings.suggestListActiveClass);
										$(this).addClass(si.settings.suggestListActiveClass);
									})
									.click(function (e) {
										si.hideSuggestListContainer($input);

										var e = jQuery.Event("keyup");
										e.which = 13;
										e.keyCode = 13;

										$input.val(item.data('value')).change().trigger(e);
									});

								suggestListContainer.append(item);
							});

							if (payload.use.length > 0) {
								si.showSuggestListContainer($input);
							}
						} else {
							si.hideSuggestListContainer($input);
						}
					}
				});

			}, si.settings.suggestTimeout);
		};

		/**
		 * Event onKeyDown
		 * @param e
		 * @returns {boolean}
		 */
		this.onKeyDown = function (e) {
			var $input = $(this);
			var suggestListContainer = si.getSuggestListContainer($input);

			if (si.kb.input(e)) {
				// if write
			}
			else if (si.kb.enter(e) && suggestListContainer.is(':visible') && suggestListContainer.children('.' + si.settings.suggestListActiveClass).text().length > 0) {
				var selected = suggestListContainer.children('.' + si.settings.suggestListActiveClass);
				selected.click();
				return false;
			}
			else if (si.kb.down(e) && suggestListContainer.is(':visible')) {
				var selected = suggestListContainer.children('.' + si.settings.suggestListActiveClass);
				if (!selected.length) {
					var item = suggestListContainer.children(':first-child').addClass(si.settings.suggestListActiveClass);
					$input.val(item.data('value'));
				} else if (selected.next().length) {
					selected.removeClass(si.settings.suggestListActiveClass);
					var item = selected.next().addClass(si.settings.suggestListActiveClass);
					$input.val(item.data('value'));
				}
				return false;
			} else if (si.kb.up(e) && suggestListContainer.is(':visible')) {
				var selected = suggestListContainer.children('.' + si.settings.suggestListActiveClass);
				if (selected.prev().length) {
					selected.removeClass(si.settings.suggestListActiveClass);
					var item = selected.prev().addClass(si.settings.suggestListActiveClass);
					$input.val(item.data('value'));
				} else {
					si.hideSuggestListContainer($input);
				}
				return false;
			}
			else if (si.kb.down(e) && !suggestListContainer.is(':visible')) {
				if (suggestListContainer.children().length > 0) {
					si.showSuggestListContainer($input);
				}
				return false;
			}
			else if (si.kb.escape(e)) {
				si.hideSuggestListContainer($input);
				suggestListContainer.children().remove();
				return false;
			}
			else if (si.kb.remove(e)) {
				// if delete
			}
			else if (!si.kb.control(e)) {
				// if kb is not in control
			}
		};

		/**
		 * SuggestionInputKeyboard
		 */
		function SuggestionInputKeyboard() {
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

		/**
		 * Process input
		 */
		return this.each(function () {
			var $input = $(this);

			if (si.getSignalLink($input)) {
				si.createSuggestionInputContainer($input);
				si.createSuggestListContainer($input);

				$input.unbind('keydown').bind('keydown', si.onKeyDown);
				$input.unbind('keyup').bind('keyup', si.onSuggest);
				$input.unbind('cut change').bind('cut change', si.onChange);
				$input.unbind('blur').bind('blur', si.onBlur);
				$input.unbind('click').bind('click', si.onSuggest);
			}
		});
	}
})(jQuery);
