import { Component, OnInit, Inject } from "@angular/core";
import { DndDropEvent, DropEffect } from "ngx-drag-drop";
import { field, value } from "../../services/model/form-fields";
import { ActivatedRoute } from "@angular/router";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import swal from "sweetalert2";
import { UploadFileComponent } from "../upload-file/upload-file.component";

@Component({
  selector: "app-user-form",
  templateUrl: "./request-form.component.html",
  styleUrls: ["./request-form.component.css"]
})
export class RequestFormComponent implements OnInit {
  defaultTitle: string = "Form Dialog";
  isFormValid: boolean = true;
  defaultSaveBtnTxt: string = "Save";
  formStatus: string = "INVALID";

  value: value = {
    label: "",
    value: ""
  };
  success = false;

  fieldModels: Array<field> = [
    {
      type: "text",
      icon: "fa-font",
      label: "Text",
      description: "Enter your name",
      placeholder: "Enter your name",
      className: "form-control",
      subtype: "text",
      regex: "",
      handle: true
    },
    {
      type: "email",
      icon: "fa-envelope",
      required: true,
      label: "Email",
      description: "Enter your email",
      placeholder: "Enter your email",
      className: "form-control",
      subtype: "text",
      regex: "^([a-zA-Z0-9_.-]+)@([a-zA-Z0-9_.-]+).([a-zA-Z]{2,5})$",
      errorText: "Please enter a valid email",
      handle: true
    },
    {
      type: "phone",
      icon: "fa-phone",
      label: "Phone",
      description: "Enter your phone",
      placeholder: "Enter your phone",
      className: "form-control",
      subtype: "text",
      regex: "^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$",
      errorText: "Please enter a valid phone number",
      handle: true
    },
    {
      type: "number",
      label: "Number",
      icon: "fa-html5",
      description: "Age",
      placeholder: "Enter your age",
      className: "form-control",
      value: "20",
      min: 12,
      max: 90
    },
    {
      type: "date",
      icon: "fa-calendar",
      label: "Date",
      placeholder: "Date",
      className: "form-control"
    },
    // {
    //   type: "datetime-local",
    //   icon: "fa-calendar",
    //   label: "DateTime",
    //   placeholder: "Date Time",
    //   className: "form-control"
    // },
    {
      type: "textarea",
      icon: "fa-text-width",
      label: "Textarea",
      placeholder: "Address"
    },
    {
      type: "checkbox",
      required: true,
      label: "Checkbox",
      icon: "fa-list",
      description: "Checkbox",
      inline: true,
      values: [
        {
          label: "Option 1",
          value: "option-1"
        },
        {
          label: "Option 2",
          value: "option-2"
        }
      ]
    },
    {
      type: "radio",
      icon: "fa-list-ul",
      label: "Radio",
      description: "Radio boxes",
      values: [
        {
          label: "Option 1",
          value: "option-1"
        },
        {
          label: "Option 2",
          value: "option-2"
        }
      ]
    },
    {
      type: "autocomplete",
      icon: "fa-bars",
      label: "Select",
      description: "Select",
      placeholder: "Select",
      className: "form-control",
      values: [
        {
          label: "Option 1",
          value: "option-1"
        },
        {
          label: "Option 2",
          value: "option-2"
        },
        {
          label: "Option 3",
          value: "option-3"
        }
      ]
    },
    {
      type: "file",
      icon: "fa-file",
      label: "File Upload",
      className: "form-control",
      subtype: "file"
    }
  ];

  modelFields: Array<field> = [];
  model: any = {
    name: "",
    description: "App Description...",
    theme: {
      bgColor: "ffffff",
      textColor: "555555",
      bannerImage: ""
    },
    attributes: this.modelFields
  };

  report = false;
  reports: any = [];

  constructor(
    private route: ActivatedRoute,
    private dialogRef: MatDialogRef<RequestFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (this.data.model) {
      this.model = this.data.model;
    }
  }

  ngOnInit() {}
  cancel() {
    this.dialogRef.close();
  }
  close() {
    this.dialogRef.close(this.model);
  }

  onDragStart(event: DragEvent) {
    console.log("drag started", JSON.stringify(event, null, 2));
  }

  onDragEnd(event: DragEvent) {
    console.log("drag ended", JSON.stringify(event, null, 2));
  }

  onDraggableCopied(event: DragEvent) {
    console.log("draggable copied", JSON.stringify(event, null, 2));
  }

  onDraggableLinked(event: DragEvent) {
    console.log("draggable linked", JSON.stringify(event, null, 2));
  }

  onDragged(item: any, list: any[], effect: DropEffect) {
    if (effect === "move") {
      const index = list.indexOf(item);
      list.splice(index, 1);
    }
  }

  onDragCanceled(event: DragEvent) {
    console.log("drag cancelled", JSON.stringify(event, null, 2));
  }

  onDragover(event: DragEvent) {
    console.log("dragover", JSON.stringify(event, null, 2));
  }

  onDrop(event: DndDropEvent, list?: any[]) {
    if (list && (event.dropEffect === "copy" || event.dropEffect === "move")) {
      if (event.dropEffect === "copy")
        event.data.name = event.data.type + "-" + new Date().getTime();
      let index = event.index;
      if (typeof index === "undefined") {
        index = list.length;
      }
      list.splice(index, 0, event.data);
    }
  }

  addValue(values) {
    values.push(this.value);
    this.value = { label: "", value: "" };
  }

  removeField(i) {
    swal({
      title: "Are you sure?",
      text: "Do you want to delete this field?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f06b4e",
      cancelButtonColor: "#777",
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    }).then(result => {
      if (result.value) {
        this.model.attributes.splice(i, 1);
      }
    });
  }

  updateForm() {
    let input = new FormData();
    input.append("id", this.model._id);
    input.append("name", this.model.name);
    input.append("description", this.model.description);
    input.append("bannerImage", this.model.theme.bannerImage);
    input.append("bgColor", this.model.theme.bgColor);
    input.append("textColor", this.model.theme.textColor);
    input.append("attributes", JSON.stringify(this.model.attributes));
  }

  initReport() {
    this.report = true;
    let input = {
      id: this.model._id
    };
  }

  toggleValue(item) {
    item.selected = !item.selected;
  }

  submit() {
    let valid = true;
    let validationArray = JSON.parse(JSON.stringify(this.model.attributes));
    validationArray.reverse().forEach(field => {
      console.log(field.label + "=>" + field.required + "=>" + field.value);
      if (field.required && !field.value && field.type != "checkbox") {
        swal("Error", "Please enter " + field.label, "error");
        valid = false;
        return false;
      }
      if (field.required && field.regex) {
        let regex = new RegExp(field.regex);
        if (regex.test(field.value) == false) {
          swal("Error", field.errorText, "error");
          valid = false;
          return false;
        }
      }
      if (field.required && field.type == "checkbox") {
        if (field.values.filter(r => r.selected).length == 0) {
          swal("Error", "Please enterrr " + field.label, "error");
          valid = false;
          return false;
        }
      }
    });
    if (!valid) {
      return false;
    }
    console.log("Save", this.model);
    let input = new FormData();
    input.append("formId", this.model._id);
    input.append("attributes", JSON.stringify(this.model.attributes));
  }
}
export interface DialogData {
  title: string;
  note: string;
  saveBtnTxt: string;
  model: any;
  readOnly: boolean;
}
