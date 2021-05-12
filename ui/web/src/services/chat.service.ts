import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";

import io from 'socket.io-client';

@Injectable()
export class ChatService {

  constructor(
    private http: HttpClient,
    private globalCfgService: GlobalCfgService
  ) {}

  getHistory(id) {
    let filter = JSON.stringify({
      where: {
          ctxId: id
      },
      order: 'createdon ASC',
      include: ['fromUser', 'toUser']
    });
    return this.http.get(
      environment.apiurl +
        "/Chats/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter,
      {}
    );
  }

  add(socket, rec) {
    socket.emit('chatmessage', rec);
  }

  startReceiver(rec) {
    var socket = io(environment.socketUrl + '?token=' +
      this.globalCfgService.getAccessToken() + '&uid=' + rec.fromUser.id + '&ctx=' + rec.ctx + '&ctxId=' + rec.ctxId);

    return socket;
  }
}
