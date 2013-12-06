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

/**
 * SuggestionData
 *
 * @author Dusan Hudak
 */
class SuggestionData
{

	protected $record = array();

	const USE_PARAM = 'use';
	const SHOW_PARAM = 'show';


	/**
	 * @return array
	 */
	public function getData()
	{
		return $this->record;
	}


	/**
	 * @param mixed $use
	 * @param mixed $show
	 * @return SuggestionData provides fluent interface
	 */
	public function setRecord($use, $show = NULL)
	{
		$this->record[self::USE_PARAM][] = $use;
		$this->record[self::SHOW_PARAM][] = $show ? $show : $use;
		return $this;
	}


	/**
	 * @param array $data
	 * @return SuggestionData provides fluent interface
	 */
	public function setData($data = array())
	{
		foreach ($data as $value) {
			$this->record[self::USE_PARAM][] = $value;
			$this->record[self::SHOW_PARAM][] = $value;
		}
		return $this;
	}
}
