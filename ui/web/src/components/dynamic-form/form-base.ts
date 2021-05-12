export class FormBase<T> {
  value: T;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;
  startAt: Date;
  pattern: any;
  disabled: boolean;
  validationType: string;

  constructor(
    options: {
      value?: T;
      key?: string;
      label?: string;
      required?: boolean;
      order?: number;
      controlType?: string;
      startAt?: Date;
      pattern?: any;
      disabled?: boolean;
      validationType?: string;
    } = {}
  ) {
    this.value = options.value;
    this.key = options.key || "";
    this.label = options.label || "";
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || "";
    this.startAt = options.startAt || null;
    this.pattern = options.pattern || "";
    this.disabled = !!options.disabled;
    this.validationType = options.validationType;
  }
}
