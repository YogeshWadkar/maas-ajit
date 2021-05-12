import { Component, OnInit, OnDestroy } from "@angular/core";
import { ProgramService } from "src/services/program.service";
import { GlobalCfgService } from "src/services/globalcfg.service";

@Component({
  selector: "app-program-performance",
  templateUrl: "./program-performance.component.html",
  styleUrls: ["./program-performance.component.css"]
})
export class ProgramPerformanceComponent implements OnInit, OnDestroy {
  data: any[];
  page: any;

  statuses: any;
  publisedStatusId: number;
  completedStatusId: number;
  programs: any[] = [];
  selectedProgram: any;

  subscriptions: any = [];

  columns: any[] = [
    {
      name: "linkOpenedCnt",
      displayName: "Link Opened Count"
    },
    {
      name: "requestCnt",
      displayName: "Join Request Count"
    },
    {
      name: "mentorCnt",
      displayName: "Total Mentors Assigned"
    }
  ];

  constructor(
    private programService: ProgramService,
    private globalCfgService: GlobalCfgService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.globalCfgService.userFetchedValue$.subscribe(() => {
        this.loadProgramStatuses();
      })
    );
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private loadProgramMetrics(page?) {
    this.programService
      .getProgramMetrics(this.selectedProgram)
      .subscribe((response: any) => {
        this.data = response["result"];
      });
  }

  private loadPrograms() {
    this.programService
      .get(this.globalCfgService.getFullUserObj().companyId)
      .subscribe(response => {
        var arr = response["data"];

        arr.forEach(item => {
          if (
            item.statusId === this.publisedStatusId ||
            item.statusId === this.completedStatusId
          ) {
            this.programs.push(item);
          }
        });

        if (this.programs.length > 0) {
          this.selectedProgram = this.programs[0].id;
          this.loadProgramMetrics();
        }
        this.loadProgramMetrics();
      });
  }

  private loadProgramStatuses() {
    this.programService.getStatus().subscribe(response => {
      this.statuses = response["data"];
      this.statuses.forEach(element => {
        if (element.name == "published") {
          this.publisedStatusId = element.id;
        }
        if (element.name == "completed") {
          this.completedStatusId = element.id;
        }
      });
      this.loadPrograms();
    });
  }

  private onPageChanged(page) {
    this.loadProgramMetrics(page);
    this.page = page;
  }

  applyFilter() {
    this.page = null;
    this.loadProgramMetrics();
  }
}
