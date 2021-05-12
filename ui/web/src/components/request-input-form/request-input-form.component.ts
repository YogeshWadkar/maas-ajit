import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";

@Component({
  selector: "tt-request-input-form",
  templateUrl: "./request-input-form.component.html",
  styleUrls: ["./request-input-form.component.css"]
})
export class RequestInputFormComponent implements OnInit {
  @Input() fields: any;
  @Input() data: any;
  @Input() readOnly: any;

    form: FormGroup;

  ngOnInit() {
      console.log(this.fields);
      this.generateControls();
  }

  generateControls() {
    var controls = {};
    this.fields.forEach(fld => {
        if (fld.type == 'checkbox') {
            var values = fld.values;
            values.forEach(opt => {
                controls[fld.name + '-' + opt.value] = new FormControl();
            });
        } else {
            controls[fld.name] = new FormControl();
        }
    });

    this.form = new FormGroup(controls);
    if (this.data) {
        this.form.setValue(this.data);
    }
    if (this.readOnly) {
        this.form.disable();
    }
  }

//   get isValid() {
//     return this.form.controls[this.field.key].valid;
//   }

  getValues() {
      return this.form.value;
  }

  handleUpload(field, file) {
    this.form.value[field.name] = "/uploads/" + file.container + "/" + file.name;
  }
}
