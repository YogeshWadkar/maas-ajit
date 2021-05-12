import { Component, OnInit, Input } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { Router } from "@angular/router";
import { EventBusService } from "../../services/event-bus.service";
import { MiscService } from "../../services/misc.service";
import { SQSService } from "../../services/sqs.service";
import { FormDialogComponent } from "../form-dialog/form-dialog.component";
import { FieldGeneratorService } from "../../services/field-generator.service";
import { MatDialog } from "@angular/material";
import { UserService } from "../../services/user.service";
import { MessageService } from "../../services/message.service";
import { ChatDialogService } from '../../services/chat-dialog.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
    selector: "tt-freebusy",
    templateUrl: "./freebusy-setting.component.html",
    styleUrls: ["./freebusy-setting.component.css"]
})
export class FreeBusySettingComponent implements OnInit {

    formGroup = new FormGroup({
        email: new FormControl()
    });

    private record: any = {
        email: ''
    };
    private freeBusy: any;

    constructor(
        private globalCfgService: GlobalCfgService,
        private miscService: MiscService,
        private msgService: MessageService
    ) {
    }

    ngOnInit() {
        this.load();
        this.freeBusy = window['freebusy'];
        this.freeBusy.pickatime.init({
            buttonType: "native"
        });
    }

    load() {

        this.miscService.getFreeBusyDetail(this.globalCfgService.getUserId()).subscribe(
            (result: any) => {
                var rec = result.data[0];
                this.record = rec;
                this.formGroup.setValue({ email: rec.email });
            }
        );

    }

    save() {
        var rec = this.formGroup.value;
        rec.userId = this.globalCfgService.getUserId();

        if (this.record && this.record.id) {
            rec.id = this.record.id;
            this.miscService.updateFreeBusyDetail(rec).subscribe(
                () => this.msgService.showSuccess('Your FreeBusy detail has been updated successfully')
            );
        } else {
            this.miscService.saveFreeBusyDetail(rec).subscribe(
                () => this.msgService.showSuccess('Your FreeBusy detail has been saved successfully')
            );
        }
    }

    openFreeBusy(e) {
        var msgService = this.msgService;

        if (!this.record.email || this.record.email.length == 0) {
            msgService.showError('You must specifiy a FreeBusy email, first.');
            return;
        }


        this.freeBusy.pickatime.onselect(function(response, proposal) {
            debugger;
            if (response.statusCode === 200) {
                var meetingDate = new Date(proposal.startTime);
                var clientTz = proposal.organizer.timeZone;

                var el = document.getElementById('how-others-will-see');
                el.innerHTML = 'You have selected ' + meetingDate + ' in ' + clientTz + ' timezone'

              }
              else {
                msgService.showError('Error selecting date');
              }
        });

        this.freeBusy.pickatime.open({
            scenario: 'pick-a-time',
            display: 'modal'
        }, {
            calendarOwner: this.globalCfgService.getFullUserObj().email,
            durationInMin: 30,
            participants: [],
        });

    }
}
