import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy
} from "@angular/core";
import { FormBase } from "./form-base";
import { FormGroupControlService } from "../../services/formgroup-control.service";
import { FormGroup } from "@angular/forms";

@Component({
  selector: "tt-dynamic-form",
  templateUrl: "./dynamic-form.component.html",
  styleUrls: ["./dynamic-form.component.css"]
})
export class DynamicFormComponent implements OnInit, OnDestroy {
  @Input() fields: FormBase<any>[] = [];

  @Input() values: any[] = [];

  @Input("isReadOnly")
  isReadOnly: boolean;

  @Output()
  statusChange = new EventEmitter<string>();

  form: FormGroup;
  payload = "";

  subscriptions: any[] = [];

  constructor(public fcs: FormGroupControlService) {}

  ngOnInit() {
    this.form = this.fcs.toFormGroup(this.fields, this.values);
    this.subscriptions.push(this.form.statusChanges.subscribe(
      (status)=> {
        this.statusChange.emit(status);
      }
    ));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getValue() {
    return this.form.value;
  }
}
