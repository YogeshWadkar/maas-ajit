import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from "@angular/core";
import { SelectionModel } from "@angular/cdk/collections";
import { MatTableDataSource, MatPaginator, MatSort } from "@angular/material";

import * as moment from "moment";

@Component({
  selector: "tt-dynamic-table",
  templateUrl: "./dynamic-table.component.html",
  styleUrls: ["./dynamic-table.component.css"]
})
export class DynamicTableComponent {
  selection = new SelectionModel<string>(true, []);

  @Input("data")
  public data: Array<any>;

  @Input("columns")
  columns: any;

  @Input("pagination")
  pagination: boolean = true;

  @Input("totalCount")
  totalCount: any;

  @Output("rowClicked")
  public rowClicked = new EventEmitter();

  @Output("actionClicked")
  public actionClicked = new EventEmitter();

  @Output("actionableClicked")
  public actionableClicked = new EventEmitter();

  @Output("pageChanged")
  public pageChanged = new EventEmitter();

  displayedColumns: any;
  dataSource: MatTableDataSource<any>;

  //Pagination
  private length: number = null;
  pageSize: number = 5;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  //Sorting
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit() {}

  getDataValue(column, element, dataField) {
    let field = dataField;
    if (field.includes(".")) {
      let fieldArr = field.split(".");
      let value = element;
      fieldArr.forEach(item => {
        value = value[item];
      });
      return value;
    } else {
      var retVal = "";
      switch (column.type) {
        case "boolean":
          retVal = element[column.name] ? "Yes" : "No"; //default formatter, for now
          break;
        case "time":
          var fmt = column.format;
          retVal = moment(element[column.name]).format(fmt);
          break;
        case "date":
          var fmt = column.format;
          var val = element[column.name];
          retVal = val ? moment(element[column.name]).format(fmt) : "";
          break;
        default:
          retVal = element[field];
      }
      return retVal;
    }
  }

  ngOnChanges() {
    this.reConfigureGrid();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    }, 2000);
    this.dataSource.sort = this.sort;
  }

  reConfigureGrid() {
    this.dataSource = new MatTableDataSource(this.data);
    if (this.columns && this.columns.length > 0) {
      this.displayedColumns = this.columns.map(col => col.name);
    } else {
      this.displayedColumns = [];
    }
    this.length = this.totalCount; //this.data ? this.data.length : 0;
  }

  onRowClick(rowIndex, record) {
    console.log("onRowClick:", arguments);
    this.rowClicked.emit({ rowIndex: rowIndex, record: record });
  }

  onActionClick(actionName, record, idx) {
    this.actionClicked.emit({
      actionName: actionName,
      record: record,
      rowIndex: idx
    });
  }

  onActionableClick(name, record, idx) {
    this.actionableClicked.emit({
      actionName: name,
      record: record,
      rowIndex: idx
    });
  }

  onPageChange(pageEvnt) {
    this.pageChanged.emit(pageEvnt);
  }
}
