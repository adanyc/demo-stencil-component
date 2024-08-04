import { EventEmitter } from '@stencil/core';

export type SelectOptionType = 'simple';

export type Option = string;

export type OptionSelected<T> = {
  currentDisplay: T;
  currentShortDisplay?: T;
  currentValue: any;
};

export interface ISelectOption<T> {
  selected: boolean;
  opt: boolean;
  value?: any;
  ctrlSelectOptionDidLoad: EventEmitter<void>;
  ctrlSelectOptionDidUnload: EventEmitter<void>;
  optionSelected: EventEmitter<OptionSelected<T>>;
}

export interface ISelectHeader {
  value?: any;
  setHeader: (option: any) => void;
}
