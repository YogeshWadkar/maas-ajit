import { Injectable } from "@angular/core";
import { TextboxClass } from "../components/dynamic-form/form-input";
import { DropdownClass } from "../components/dynamic-form/form-select";
import { TextAreaClass } from "../components/dynamic-form/form-textarea";
import { DateClass } from "../components/dynamic-form/form-date";
import { ToggleClass } from "../components/dynamic-form/form-toggle";

@Injectable()
export class FieldGeneratorService {
  constructor() {}

  // private getDataValue(element, dataField) {
  //     let field = dataField;
  //     if (field.includes(".")) {
  //         let fieldArr = field.split(".");
  //         let value = element;
  //         fieldArr.forEach(item => {
  //             value = value[item];
  //         });
  //         return value;
  //     } else {
  //         return element[field];
  //     }
  // }

  private getDateField(column, idx, record) {
    return new DateClass({
      key: column.name,
      label: column.displayName,
      value: record ? record[column.name] : null,
      required: column.required,
      order: idx,
      startAt: column.startAt,
      disabled: column.disabled,
      validationType: column.validationType,
    });
  }

  private getStringField(column, idx, record) {
    return new TextboxClass({
      key: column.name,
      label: column.displayName,
      value: record ? record[column.name] : null,
      required: column.required,
      order: idx,
      disabled: column.disabled,
      validationType: column.validationType,
    });
  }

  private getTextArea(column, idx, record) {
    return new TextAreaClass({
      key: column.name,
      label: column.displayName,
      value: record ? record[column.name] : null,
      required: column.required,
      order: idx,
      pattern: column.pattern,
      disabled: column.disabled,
      validationType: column.validationType,
    });
  }

  private getBoolean(column, idx, record) {
    return new ToggleClass({
      key: column.name,
      label: column.displayName,
      value: record ? record[column.name] : null,
      required: column.required,
      order: idx,
      disabled: column.disabled,
      validationType: column.validationType,
    });
  }

  private getSelectionField(column, idx, record) {
    console.log("SELECTION: ", column, column.options, record);
    return new DropdownClass({
      key: column.name,
      label: column.displayName,
      value: record ? record[column.name + "Id"] : null,
      required: column.required,
      options: column.options || [],
      order: idx,
      disabled: column.disabled,
      validationType: column.validationType,
    });
  }

  getFields(columnsArr, record) {
    let fields: any[] = [];

    columnsArr.forEach((column, idx) => {
      if (!column.editable && column.editable != false) {
        switch (column.type) {
          case "string":
            console.log("string column");
            break;
          case "selection":
            console.log("selection column");
            fields.push(this.getSelectionField(column, idx, record));
            break;
          case "longstring":
            console.log("longstring column");
            fields.push(this.getTextArea(column, idx, record));
            break;
          case "date":
            console.log("date column");
            fields.push(this.getDateField(column, idx, record));
            break;
          case "actions":
            console.log("actions column");
            break;
          case "boolean":
            fields.push(this.getBoolean(column, idx, record));
            break;
          default:
            //treat it as string
            fields.push(this.getStringField(column, idx, record));
        }
      }
    });
    return fields;
  }
}
