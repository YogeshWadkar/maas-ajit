import { Component, IterableDiffers, DoCheck, ViewEncapsulation } from '@angular/core';

import {OnInit} from '@angular/core';
import { MeetingService } from '../../services/meeting.service';

import * as moment from 'moment';

import clonedeep from 'lodash.clonedeep';
import { CalendarService } from '../../services/calendar.service';
import { GlobalCfgService } from '../../services/globalcfg.service';
import { MessageService } from '../../services/message.service';
import { Utils } from '../../services/utils';

@Component({
  selector: 'tt-available-slots',
  templateUrl: './available-weekday-slots.component.html',
  styleUrls: ['./available-weekday-slots.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AvailableWeekdaySlotsComponent implements OnInit {
  
  selectedMeridian = 'all';
  selectedWeekday: any = null;

  weekdayWiseAllowedSlots: any = {
  };
 
  displayedColumns1 = [
    {name: 'fromTm', displayName: 'From Time'},
    {name: 'toTm', displayName: 'To Time'},
    {name: 'weekday', displayName: 'Weekday'},
    {name: 'actions', displayName: 'Actions'}];
  displayedColumns2 = [
    {name: 'weekday', dataField:'weekday.name', displayName: 'Weekday'},
    {name: 'fromTm', displayName: 'From Time', type: 'time', format: 'hh:mm A'},
    {name: 'toTm', displayName: 'To Time', type: 'time', format: 'hh:mm A'},
    {name: 'actions', displayName: 'Actions'}];

    weekdays: any[];
    refAvailableSlots: any;
    availableSlots: any = [];
    allowedSlots: any = [];

    constructor(
      private meetingService: MeetingService,
      private calendarService: CalendarService,
      private globalCfgService: GlobalCfgService,
      private msgService: MessageService,
      private utils: Utils
    ) {
    }

    getWeekdays() {
      this.calendarService.getWeekdays().subscribe(
        (response: any[])=> {
          this.weekdays = response['data'];
          this.selectedWeekday = this.weekdays[0];
          this.weekdays.forEach(wd => this.weekdayWiseAllowedSlots[wd.name] = 0);
          this.generateSlots();
          this.loadAllowedSlots(null);
        },
        (error)=> {
          console.log('Service error', error);
        }
      );
    }

  ngOnInit() {
    this.getWeekdays();
  }

  private loadAllowedSlots(weekdayId){
    this.calendarService.getAllowedSlots(weekdayId).subscribe(
      (response)=> {
        let map: any = response;
        this.weekdayWiseAllowedSlots[this.selectedWeekday.name] = 0;
        for (var key in map) {
          this.weekdayWiseAllowedSlots[key] = map[key].length;
          map[key].forEach(element => {
            element['fromTm'] = moment(element['fromTm']).toDate();
            element['toTm'] = moment(element['toTm']).toDate();
            element['actions'] = [{name: 'delete', tip: 'Remove from allowed'}];
          });  
        }
        this.allowedSlots = map;
      },
      (error)=> {
        console.log('Service error:', error);
      }
    );
  }

  private generateSlots() {
    this.meetingService.getWeekdayWiseAvailableSlots(null).subscribe(
      (response: any[])=> {
        this.refAvailableSlots = response['result'];

        for (var key in this.refAvailableSlots) {
          this.refAvailableSlots[key].forEach(element => {
            element['actions'] = [{name: 'add', tip: 'Add to allowed'}];
          });
        }

        this.availableSlots = clonedeep(this.refAvailableSlots);
        this.applyMeridianFilter();
      },
      (error)=> {
        console.log('Service failed:', error);
      }
    );
  }

  weekdayChanged(e) {
    this.selectedWeekday = this.weekdays[e.index];
    this.selectedMeridian = 'all';
    this.applyMeridianFilter();
    this.loadAllowedSlots(this.selectedWeekday.id);
  }

  onActionClicked(event, weekday, idx) {
    // console.log('onActionClicked:', arguments);
    if (event.actionName.name === 'add') {
      var rec = event.record;
      var formTm = moment(rec.fromTm, 'hh:mm A').toDate();
      var toTm = moment(rec.toTm, 'hh:mm A').toDate();
      debugger;

      this.calendarService.addToAllowedSlots({
        fromTm: formTm,
        toTm: toTm,
        weekdayId: weekday.id,
        duration: event.record.duration,
        userId: this.globalCfgService.getUserId(),
        slotId: rec.slotid
      }).subscribe(
        (response)=> {
          var idx = this.utils.getIdx('fromTm', rec.fromTm, this.refAvailableSlots[weekday.name]);
          this.msgService.showSuccess('Slot has been added');
          this.refAvailableSlots[weekday.name].splice(idx, 1);
          this.availableSlots[weekday.name] = clonedeep(this.refAvailableSlots[weekday.name]);
          this.applyMeridianFilter();
          this.loadAllowedSlots(weekday.id);
        },
        (error)=> {
          console.log('Service error:', error);
        }
      );
    }

    if (event.actionName.name === 'delete') {
      this.calendarService.removeFromAllowedSlots(event.record.id).subscribe(
        ()=> {
          this.msgService.showSuccess('Slot is no more available for booking');
          this.generateSlots();
          this.loadAllowedSlots(weekday.id);
        }
      );
    }
  }

  private isAM(rec) {
    var val = rec.fromTm;
    return (val.split(' '))[1] === 'AM';
  }

  private isPM(rec) {
    var val = rec.fromTm;
    return (val.split(' '))[1] === 'PM';
  }

  applyMeridianFilter() {
    if (this.selectedMeridian == 'am') {
      this.filterAMSlots(this.selectedWeekday);
    }
    if (this.selectedMeridian == 'pm') {
      this.filterPMSlots(this.selectedWeekday);
    }
    if (this.selectedMeridian == 'all') {
      this.filterAllSlots(this.selectedWeekday);
    }
  }

  filterAllSlots(weekday) {
    this.availableSlots[weekday.name] = this.refAvailableSlots[weekday.name];
  }

  filterAMSlots(weekday) {
    this.availableSlots[weekday.name] = this.refAvailableSlots[weekday.name];
    this.availableSlots[weekday.name] = this.availableSlots[weekday.name].filter(this.isAM);
  }

  filterPMSlots(weekday) {
    this.availableSlots[weekday.name] = this.refAvailableSlots[weekday.name];
    this.availableSlots[weekday.name] = this.availableSlots[weekday.name].filter(this.isPM);
  }
}

