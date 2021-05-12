import { Component, OnInit, Input } from '@angular/core';
import { ChatDialogService } from '../../services/chat-dialog.service';
import { Utils } from '../../services/utils';

@Component({
    selector: "tt-chat-dialog-ct",
    templateUrl: "./chat-dialog-ct.component.html",
    styleUrls: ["./chat-dialog-ct.component.css"]
  })
  export class ChatDialogContainerComponent implements OnInit {

    private chatDialogs: any[] = [];

    constructor(
        private chatDialogService: ChatDialogService,
        private utils: Utils
    ) {

        this.chatDialogService.chatFetchedValue$.subscribe(
            (ctx)=> {
                const obj = this.utils.getObject('ctxId', ctx.ctxId, this.chatDialogs);
                const index = this.utils.getIdx('ctxId', ctx.ctxId, this.chatDialogs);

                if (!obj) {
                    this.chatDialogs.push(ctx);
                } else if (obj && this.chatDialogs.length > 4 && index < this.chatDialogs.length-4) {
                    this.chatDialogs.splice(index, 1);
                    this.chatDialogs.push(ctx);
                } else {
                    obj.highlight = true;
                    setTimeout(() => {
                        obj.highlight = false;
                    }, 4000);
                }
            }
        );

        this.chatDialogService.closeAllFetchedValue$.subscribe(
            ()=> {
                this.chatDialogs = [];
            }
        );
    }

    ngOnInit() {
    }

    onClose(e) {
        var idx = this.utils.getIdx('ctxId', e.ctxId, this.chatDialogs);
        this.chatDialogs.splice(idx, 1);
    }

    lPosition(idx, length) {
        let position;
        if (length > 4) {
            switch (idx) {
              case length - 4:
                position = 0;
                break;
              case length - 3:
                position = 308;
                break;
              case length - 2:
                position = 616;
                break;
              case length - 1:
                position = 924;
                break;
            }
        } else {
            position = (idx * 300) + (idx * 8);
        }
        return position;
    }
}