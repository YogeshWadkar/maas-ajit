import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  ViewEncapsulation
} from "@angular/core";
import * as moment from "moment";
import { ChatService } from "../../services/chat.service";
import { FileUploadService } from 'src/services/file-upload.service';
import { GlobalCfgService } from "../../services/globalcfg.service";
import { Subject } from "rxjs";
@Component({
  selector: "tt-chat-dialog",
  templateUrl: "./chat-dialog.component.html",
  styleUrls: ["./chat-dialog.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class ChatDialogComponent implements OnInit {
  chatLog: any[] = [];
  isMinimized: boolean = false;
  chatInputValue: string;

  @Input()
  ctx: any;

  @Input()
  highlight: boolean = false;

  @Input()
  readOnly: boolean = false;

  @Output()
  close = new EventEmitter();
  socket: any;

  @ViewChild("chathistory", { static: true }) chatHistoryEl: ElementRef;
  uploader: any;
  attachment: any;

  user: object;
  private userSource = new Subject<any>();
  private userFetchedValue$ = this.userSource.asObservable();
  subscriptions: any = [];
  userrole: any;

  constructor(
    private chatService: ChatService,
    private uploadService: FileUploadService,
    private globalCfgService: GlobalCfgService,
  ) { }

  ngOnInit() {
    this.user = this.globalCfgService.getFullUserObj();
    this.userrole = this.user["signupAs"];

    this.uploader = this.uploadService.getImgUploader("chatimages");

    this.loadCtxChatHistory();
    this.socket = this.chatService.startReceiver(this.ctx);

    this.socket.on("connect", () => {
      console.log("connected:", this.socket.connected); // true
    });

    var me = this;

    this.socket.on("chatmessage", function (rec) {
      console.log("Got message: ", rec);
      me.chatLog.push({
        type: rec.type,
        value: rec.value,
        avatar: me.ctx.toUser.photoUrl,
        name: me.ctx.toUser.firstName,
        time: moment(rec.createdon).format("ddd, hh:mm A")
      });

      me.highlight = true;
      me.adjustScroll();
    });
  }

  adjustScroll() {
    setTimeout(() => {
      this.chatHistoryEl.nativeElement.scrollTop = this.chatHistoryEl.nativeElement.scrollHeight;
    }, 200);
  }

  onEnter(input, chatHistoryEl) {
    this.chatLog.push({
      type: "text",
      value: input.value,
      avatar: this.ctx.fromUser.photoUrl,
      name: "You",
      time: moment().format("ddd, hh:mm A")
    });

    this.chatService.add(this.socket, {
      ctx: this.ctx.ctx,
      ctxId: this.ctx.ctxId,
      type: "text",
      value: input.value,
      fromUserId: this.ctx.fromUser.id,
      toUserId: this.ctx.toUser.id
    });

    // this.msgService.showSuccess("Chat logged");

    input.value = null;
    this.chatInputValue = null;

    this.adjustScroll();
  }

  minimize() {
    this.isMinimized = false;
  }

  maximize() {
    this.isMinimized = true;
  }

  minOrMaximize() {
    this.isMinimized = !this.isMinimized;
  }

  loadCtxChatHistory() {
    this.chatService.getHistory(this.ctx.ctxId).subscribe((response: any) => {
      response.data.forEach(log => {
        var avatar, name;
        if (this.ctx.fromUser.id == log.fromUser.id) {
          name = "You";
          avatar = this.ctx.fromUser.photoUrl;
        } else {
          name = log.fromUser.firstName;
          avatar = this.ctx.toUser.photoUrl;
        }
        this.chatLog.push({
          type: log.type,
          value: log.value,
          avatar: avatar,
          name: name,
          time: moment(log.createdon).format("ddd, hh:mm A")
        });
      });
      this.adjustScroll();
    });
  }

  onClose() {
    this.close.emit(this.ctx);
  }

  onFileSelected() {
    console.log("File selected");
    this.uploader.response.subscribe(
      response => {
        console.log("File uploaded:", response, JSON.parse(response));

        this.attachment = JSON.parse(response)["result"]["files"]["file"][0];
        var path =
          "/uploads/" + this.attachment.container + "/" + this.attachment.name;

        this.chatLog.push({
          type: "image",
          value: path,
          avatar: this.ctx.fromUser.photoUrl,
          name: "You",
          time: moment().format("ddd, hh:mm A")
        });

        this.chatService.add(this.socket, {
          ctx: this.ctx.ctx,
          ctxId: this.ctx.ctxId,
          type: "image",
          value: path,
          fromUserId: this.ctx.fromUser.id,
          toUserId: this.ctx.toUser.id
        });

        this.adjustScroll();
      },
      error => {
        console.log("File upload error:", error);
      }
    );
  }
}
