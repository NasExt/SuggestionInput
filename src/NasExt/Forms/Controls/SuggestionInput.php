<?php

/**
 * This file is part of the NasExt extensions of Nette Framework
 *
 * Copyright (c) 2013 Dusan Hudak (http://dusan-hudak.com)
 *
 * For the full copyright and license information, please view
 * the file license.txt that was distributed with this source code.
 */

namespace NasExt\Forms\Controls;

use Nette\Application\Responses\JsonResponse;
use Nette\Application\UI\BadSignalException;
use Nette\Application\UI\ISignalReceiver;
use Nette\Application\UI\Presenter;
use Nette\Callback;
use Nette\Forms\Container;
use Nette\Forms\Controls\TextInput;
use Nette\Forms\Form;
use Nette\InvalidArgumentException;
use Nette\InvalidStateException;
use Nette\Utils\Html;

/**
 * SuggestionInput
 *
 * @author Dusan Hudak
 */
class SuggestionInput extends TextInput implements ISignalReceiver
{

	/** @var int */
	protected $payloadLimit = 5;

	/** @var callback returning array */
	protected $suggestCallback;

	/** @var string parameter name */
	const SUGGEST_PARAMETER = 'suggestFilter';

	/** @var string signal name */
	const SIGNAL_NAME = 'suggest';


	/**
	 * @param string $label
	 * @param int $limit
	 */
	public function __construct($label = NULL, $limit = NULL)
	{
		parent::__construct($label);
		if ($limit) {
			$this->setPayloadLimit($limit);
		}
	}


	/**
	 * Generates control's HTML element.
	 * @return Html
	 * @throws InvalidStateException
	 */
	public function getControl()
	{
		$container = Html::el('div')->addAttributes(array('class' => 'suggestion-input'));
		/** @var $control Html */
		$control = parent::getControl();

		if ($this->suggestCallback !== NULL) {
			$form = $this->getForm();
			if (!$form || !$form instanceof Form) {
				throw new InvalidStateException("SuggestionInput supports only Nette\\Application\\UI\\Form.");
			}

			$control->attrs['data-suggestion-input'] = $form->getPresenter()->link(
				$this->lookupPath('Nette\Application\UI\Presenter') . self::NAME_SEPARATOR . self::SIGNAL_NAME . '!', array(self::SUGGEST_PARAMETER => '%filter%')
			);
		}
		$container->add($control);
		return $container;
	}


	/**
	 * @param array $suggest
	 * @return SuggestionInput provides fluent interface
	 */
	public function setSuggestCallback($suggest)
	{
		$this->suggestCallback = new Callback($suggest);
		return $this;
	}


	/**
	 * @param int $limit
	 * @return SuggestionInput provides fluent interface
	 * @throws InvalidArgumentException
	 */
	public function setPayloadLimit($limit)
	{
		if ($limit < 0)
			throw new InvalidArgumentException("Invalid limit, expected positive integer.");

		$this->payloadLimit = $limit;
		return $this;
	}


	/**
	 * @param string $signal
	 * @throws InvalidStateException
	 * @throws BadSignalException
	 */
	public function signalReceived($signal)
	{
		if ($signal === self::SIGNAL_NAME) {
			if (!($this->suggestCallback instanceof Callback)) {
				throw new InvalidStateException('Suggets callback not set.');
			}

			/** @var Presenter $presenter */
			$presenter = $this->getForm()->getPresenter();

			/** @var SuggestionData $data */
			$data = $this->suggestCallback->invoke($presenter->getParameter(self::SUGGEST_PARAMETER), $this->payloadLimit, new SuggestionData());

			$presenter->sendResponse(new JsonResponse($data->getData()));
		} else {
			$class = get_class($this);
			throw new BadSignalException("Missing handler for signal '$signal' in $class.");
		}
	}


	/*     * ******************* registration ****************** */

	/**
	 * Adds addSuggestionInput() method to \Nette\Forms\Form
	 */
	public static function register()
	{
		Container::extensionMethod('addSuggestionInput', callback(__CLASS__, 'addSuggestionInput'));
	}


	/**
	 * @param Container $container
	 * @param string $name
	 * @param string $label
	 * @param int $limit
	 * @return SuggestionInput provides fluent interface
	 */
	public static function addSuggestionInput(Container $container, $name, $label = NULL, $limit = NULL)
	{
		$container[$name] = new self($label, $limit);
		return $container[$name];
	}
}
