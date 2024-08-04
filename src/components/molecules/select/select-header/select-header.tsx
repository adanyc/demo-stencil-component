import { Component, Prop, h, Method, State } from '@stencil/core';
import { ISelectHeader, Option } from '../select-interface';

@Component({
  tag: 'acme-select-header',
  styleUrl: 'select-header.scss'
})
export class SelectHeader implements ISelectHeader {

  @State() activeLabel: boolean = false;
  @State() disabled: boolean = false;
  @State() error: boolean = false;
  @State() hover: boolean = false;
  @State() size: string = 'lg';
  @State() value?: Option;

  @Prop() label?: string;
  @Method()
  async setActive(value: boolean) {
    this.activeLabel = value;
  }

  @Method()
  async setDisabled(value: boolean) {
    this.disabled = value;
  }

  @Method()
  async setError(value: boolean) {
    this.error = value;
  }

  @Method()
  async setHeader(option: any) {
    this.value = option;
  }

  @Method()
  async setHover(value: boolean) {
    this.hover = value;
  }

  @Method()
  async setSize(size: string) {
    this.size = size;
  }

  render() {
    return [
      <span>{this.value || '\u00A0'}</span>,
      <span class="select-label">{this.label || ''}</span>
    ];
  }
}
