NasExt/SuggestionInput
===========================

SuggestionInput for Nette Framework.

Requirements
------------

NasExt/SuggestionInput requires PHP 5.3.2 or higher.

- [Nette Framework](https://github.com/nette/nette)

Installation
------------

The best way to install NasExt/SuggestionInput is using  [Composer](http://getcomposer.org/):

```sh
$ composer require nasext/suggestion-input
```

Initialization in your `bootstrap.php`:

```php
NasExt\Forms\Controls\SuggestionInput::register();
```

Include from client-side:
- suggestionInput.css
- suggestionInput.js

Initialize SuggestionInput:
```js
$('[data-suggestion-input]').each(function () {
	SuggestionInput.create($(this).attr('id'));
});
```

### Custom options
```js
$('[data-suggestion-input]').each(function () {
	var options = {
		startSuggest: 3,
		suggestTimeout: 250,
		suggestListClass: 'typeahead dropdown-menu',
		suggestListActiveClass: 'active'
	};

	SuggestionInput.create($(this).attr('id'), options);
});
```

## Usage

How to use SuggestionInput in form:
````php
$data = array(
	'Value1',
	'Value2',
	'Value3',
	'Value4',
	'Value5',
	'Other Value1',
	'Other Value2',
	'Other Value3',
	'Other Value4'
);

$form->addSuggestionInput("productId", "Name", 5)
	->setAttribute('autocomplete', 'off')
	->setSuggestCallback(function ($filter, $count, SuggestionData $suggestionData) use ($data) {
		$suggestionData->setData($data);
		return $suggestionData;
	});
```

You can also view the list of different values ​​as in the input
````php
$data = array(
	'Value1',
	'Value2',
	'Value3',
	'Value4',
	'Value5',
	'Other Value1',
	'Other Value2',
	'Other Value3',
	'Other Value4'
);

$form->addSuggestionInput("item", "Name")
	->setAttribute('autocomplete', 'off')
	->setSuggestCallback(function ($filter, $count, SuggestionData $suggestionData) use ($data) {
		foreach ($data as $id=>$value) {
			$name = $id . '::' . $value;
			$suggestionData->setRecord($value, $name);
		}
		return $suggestionData;
	});
```

-----


Repository [http://github.com/nasext/suggestioninput](http://github.com/nasext/suggestioninput).
