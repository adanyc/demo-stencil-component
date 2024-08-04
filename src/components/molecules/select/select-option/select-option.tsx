import { Component, Prop, Event, EventEmitter, Element, h, Method } from '@stencil/core';
import { ISelectOption, OptionSelected, Option } from '../select-interface';

@Component({
  tag: 'acme-select-option',
  styleUrl: 'select-option.scss'
})
export class SelectOption implements ISelectOption<Option> {

  @Element() el!: HTMLElement;
  @Prop() disabled: boolean = false;
  @Prop({ reflect: true }) opt: boolean = true;
  @Prop({ mutable: true }) selected: boolean = false;
  @Prop({ mutable: true }) value?: any;
  @Prop() shortName?: string;
  @Event() ctrlSelectOptionDidLoad!: EventEmitter<void>;
  @Event() ctrlSelectOptionDidUnload!: EventEmitter<void>;
  @Event() optionSelected!: EventEmitter<OptionSelected<Option>>;

  componentWillLoad() {
    if (this.value === undefined) {
      this.value = this.el.textContent || '';
    }
  }

  componentDidLoad() {
    this.ctrlSelectOptionDidLoad.emit();
  }

  componentDidUnload() {
    this.ctrlSelectOptionDidUnload.emit();
  }

  @Method()
  async selectOption() {
    this.clickedOption();
  }

  private clickedOption() {
    this.selected = true;
    this.optionSelected.emit({
      currentDisplay: this.el.textContent || '',
      currentShortDisplay: this.shortName || '',
      currentValue: this.value
    });
  }

  private divAttrs() {
    return {
      'class': {
        'select-item': true,
        'disabled': this.disabled,
        'active': this.selected
      },
      'role': 'option'
    };
  }

  render() {
    return (
      <div
        {...this.divAttrs()}
        onClick={() => this.clickedOption()}
      >
        <span>
          <slot></slot>
        </span>
      </div>
    );
  }
}
