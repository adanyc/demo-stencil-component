import { Component, Prop, Listen, Element, Watch, Event, EventEmitter, State, h } from '@stencil/core';
import { SelectOptionType } from './select-interface';

let selectIds = 0;

@Component({
  tag: 'acme-select',
  styleUrl: 'select.scss'
})
export class Select {
  private childrenOptions: any[] = [];
  private optionsMatchSelected: any[] = [];
  private counterMatches: number = 0;
  private oldLetterKey: string = '';
  private keyPressed: boolean = false;
  private didInit: boolean = false;
  private nativeSelect?: HTMLElement;
  private selectId = `acme-select-${selectIds++}`;
  private readonly SINGLE_OPTION_MATCH = 1;

  private onBlur = (event: FocusEvent) => {
    console.log('(onBlur)', event);
    this.open = false;
    if (!this.disabled) {
      this.ctrlBlur.emit();
    }
  }

  private onFocus = () => {
    console.log('(onFocus)');
    if (!this.disabled) {
      this.ctrlFocus.emit();
    }
  }

  private onClick = () => {
    console.log('(onClick)');
    if (!this.disabled) {
      this.ctrlClick.emit();
    }
  }

  private onKeyPress = (event: KeyboardEvent) => {
    const newLetterKey = event.key.toUpperCase();
      const optionsMatches = this.getOptionsMatchesList(newLetterKey);
      this.keyPressed = optionsMatches.length > 0 ? this.open : false;
      if (newLetterKey !== this.oldLetterKey) {
        this.oldLetterKey = newLetterKey;
        this.resetMatchesCounter();
        this.resetOptionsMatchSelected();
      } else {
        this.validateSumCounterMatches(optionsMatches);
      }

      this.setupOptionsMatches(optionsMatches);
  }

  @Element() el!: any;

  @State() hoverElement: boolean = false;
  @Watch('hoverElement')
  async hoverElementChanged() {
    await this.updateHeaderLabel();
  }

  @State() filledElement: boolean = false;
  @Watch('filledElement')
  async filledElementChanged() {
    await this.updateHeaderLabel();
  }

  @Prop() message?: string;
  @Prop() name: string = this.selectId;
  @Prop({ reflect: true }) optionType: SelectOptionType = 'simple';
  @Prop() size: string = 'md';
  @Prop({ mutable: true }) ctrlValue?: any | null;

  @Watch('ctrlValue')
  protected ctrlValueChanged() {
    this.updateOptions();
    this.filledElement = this.getFilledElement(this.ctrlValue);
    this.ctrlChange.emit(this.ctrlValue);
  }

  @Prop() disabled: boolean = false;

  @Watch('disabled')
  protected async disabledChanged() {
    this.updateHeaderDisabled(this.disabled);
    await this.updateHeaderLabel();
  }

  @Prop({ reflect: true, mutable: true }) open: boolean = false;

  @Watch('open')
  async openChanged() {
    await this.updateHeaderLabel();
  }

  @Prop() state?: 'error';

  @Watch('state')
  async stateChanged() {
    await this.updateHeaderLabel();
  }

  @Event() ctrlBlur!: EventEmitter<void>;
  @Event() ctrlChange!: EventEmitter<any>;
  @Event() ctrlFocus!: EventEmitter<void>;
  @Event() ctrlClick!: EventEmitter<void>;

  async componentDidLoad() {
    if (this.nativeSelect) {
      this.nativeSelect.setAttribute('name', this.name);
    }

    await this.loadOptions();
    this.updateOptions();
    this.updateHeaderDisabled(this.disabled);

    await this.updateHeaderLabel();

    this.didInit = true;
  }

  @Listen('ctrlSelectOptionDidLoad')
  @Listen('ctrlSelectOptionDidUnload')
  async selectOptionsReload() {
    await this.loadOptions();

    if (this.didInit && this.ctrlValue !== undefined) {
      this.updateOptions();
    }
  }

  @Listen('clickedText')
  listenerClickedText() {
    this.open = false;
  }

  @Listen('optionSelected')
  listenerOptionSelected(event: CustomEvent) {
    const displayValue = event.detail.currentShortDisplay || event.detail.currentDisplay;
    this.updateHeaderValue(displayValue);
    this.ctrlValue = event.detail.currentValue;
    this.filledElement = this.getFilledElement(this.ctrlValue);
    this.open = false;
    if (this.keyPressed) {
      this.toggleSelect();
      this.keyPressed = false;
    }
  }

  @Listen('removeOption')
  listenRemoveOption() {
    this.open = false;
  }

  private getFilledElement(ctrlValue: any) {
    return ctrlValue === 0 ? true : (ctrlValue);
  }

  private async loadOptions() {
    this.childrenOptions = await Promise.all(
      Array.from(this.el.querySelectorAll('[opt]')).map(o => (o as any).componentOnReady())
    );
  }

  private getOptionsMatchesList(text: string) {
    return this.childrenOptions.filter(option =>
      option.textContent.charAt(0).toUpperCase() === text && !option.disabled
    );
  }

  private setupOptionsMatches(optionsMatches: any[]) {
    const optionMatchesSize = optionsMatches.length;
    const optionMatch = optionsMatches[this.counterMatches];

    if (optionMatchesSize === this.SINGLE_OPTION_MATCH) {
      this.resetMatchesCounter();
      this.setCtrlValueWithMatch(optionMatch);
    }

    if (optionMatchesSize > this.SINGLE_OPTION_MATCH) {
      this.setCtrlValueWithMatch(optionMatch);
      this.optionsMatchSelected.push(optionMatch);
    }
  }

  private resetMatchesCounter() {
    this.counterMatches = 0;
  }

  private resetOptionsMatchSelected() {
    this.optionsMatchSelected = [];
  }

  private validateSumCounterMatches(optionsMatches: any[]) {
    if (this.optionsMatchSelected.length === optionsMatches.length) {
      this.resetMatchesCounter();
      this.resetOptionsMatchSelected();
    } else {
      this.counterMatches++;
    }
  }

  private setCtrlValueWithMatch(optionMatch: any) {
    this.ctrlValue = optionMatch.value;
    const optionSelected = optionMatch as HTMLElement;
    optionSelected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  private selectAttrs() {
    return {
      select: {
        'class': {
          'dropdown': true,
          'filled': this.filledElement,
          'disabled': this.disabled,
          'invalid': !this.disabled && this.state === 'error',
          'show': !this.disabled && this.open,
          [`${this.size}`]: !!this.size
        }
      },
      toggle: {
        'class': {
          'dropdown-toggle': true,
          'disabled': this.disabled
        },
        'data-toggle': 'dropdown',
        'aria-haspopup': 'true',
        'aria-expanded': (!this.disabled && this.open) ? 'true' : 'false',
        'role': 'listbox'
      },
      menu: {
        'class': {
          'dropdown-menu': true,
          'show': !this.disabled && this.open
        },
        'x-placement': 'bottom-start'
      }
    };
  }

  private selectOptionClick(optionSelected: any) {
    optionSelected.selectOption();
  }

  private toggleMouseOver(value: boolean) {
    this.hoverElement = value;
  }

  private toggleSelect() {
    this.open = !this.open;
  }

  private updateHeaderDisabled(value: boolean) {
    const headerElement = this.el.querySelector('[slot="header"]');
      (headerElement as any).setDisabled(value);
  }

  private async updateHeaderLabel() {
    const headerElement = this.el.querySelector('[slot="header"]') as any;
      await headerElement.setHover(this.hoverElement);
      await headerElement.setActive(!this.disabled && this.open);
      await headerElement.setError(this.state === 'error');
      await headerElement.setSize(this.size);
  }

  private updateHeaderValue(display: any) {
    const headerElement = this.el.querySelector('[slot="header"]');
    (headerElement as any).setHeader(display);
  }

  private updateOptions() {
    let hasSelected = false;

    this.childrenOptions.forEach(option => {
      if (!hasSelected && JSON.stringify(option.value) === JSON.stringify(this.ctrlValue)) {
        hasSelected = true;
        if (!option.selected) {
          this.selectOptionClick(option);
        }
      } else {
        option.selected = false;
      }
    });

    if (!hasSelected) {
      this.updateHeaderValue(null);
    }
  }

  render() {
    const attrs = this.selectAttrs();

    return [
      <div
        {...attrs.select}
        ref={el => this.nativeSelect = el}
        onBlur={this.onBlur}
        onFocus={this.onFocus}
        onClick={this.onClick}
        onKeyPress={this.onKeyPress}
        tabindex="-1"
      >
        <div
          {...attrs.toggle}
          onClick={() => this.toggleSelect()}
          onMouseLeave={() => this.toggleMouseOver(false)}
          onMouseOver={() => this.toggleMouseOver(true)}
        >
          <slot name="header"></slot>
        </div>
        <div {...attrs.menu}>
          <div class="container-option-menu">
            <slot></slot>
          </div>
        </div>
      </div>,
      (() => {
        return (this.size !== 'sm' &&
          <span>{this.message || '\u00A0'}</span>
        );
      })()
    ];
  }
}
