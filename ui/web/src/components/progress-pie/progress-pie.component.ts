import { Component, Input, ViewChild } from "@angular/core";
import { OnInit } from "@angular/core";

import Chart from "chart.js";

@Component({
  selector: "tt-progress-pie",
  templateUrl: "./progress-pie.component.html",
  styleUrls: ["./progress-pie.component.css"]
})
export class ProgressPieComponent implements OnInit {
  private _progress: any = 0;

  get progress() {
    return this._progress;
  }

  @Input()
  set progress(val: any) {
    console.log("Progress updated: ", this.pie, val);
    this._progress = parseInt(val);
    // this.pie.nativeElement.style.width = val + "%";

    Chart.pluginService.register({
      beforeDraw: function(chart) {
        var width = chart.chart.width,
            height = chart.chart.height,
            ctx = chart.chart.ctx;
    
        ctx.restore();
        var fontSize = (height / 90).toFixed(2);
        ctx.font = fontSize + "em sans-serif";
        ctx.textBaseline = "middle";

        console.log('CTX: ', ctx, chart);
    
        var text = chart.config.progress + '%',
            textX = Math.round((width - ctx.measureText(text).width) / 2),
            textY = height / 2;
    
        ctx.fillText(text, textX, textY);
        ctx.save();
      }
    });

    var data = {
      labels: [
        "Progress",
        "Pending"
      ],
      datasets: [
        {
          data: [this._progress, 100 - this._progress],
          backgroundColor: [
            "rgba(240, 107, 78, 1)",
            "rgba(245, 245, 245, 1)"
          ],
          hoverBackgroundColor: [
            "rgba(240, 107, 78, 1)",
            "rgba(245, 245, 245, 1)"
          ]
        }]
    };

    console.log(data, this.pie.nativeElement);

    var chart = new Chart(this.pie.nativeElement, {
      type: 'doughnut',
      data: data,
      progress: this._progress,
      options: {
        responsive: true,
        legend: {
          display: false
        }
      }
    });
  }

  @ViewChild("progresspie", { static: true }) pie;

  ngOnInit() {
    
  }
  
  ngAfterViewInit() {

  }
}
