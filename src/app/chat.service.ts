import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ChatManager, TokenProvider } from '@pusher/chatkit-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  AUTH_URL = 'http://localhost:3000/token';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  INSTANCE_LOCATOR = 'YOUR_INSTANCE_LOCATOR';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  GENERAL_ROOM_ID = 'YOUR_ROOM_ID';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  GENERAL_ROOM_INDEX = 0;
  chatManager: ChatManager;
  currentUser;
  messages = [];

  usersSubject = new BehaviorSubject([]);
  messagesSubject = new BehaviorSubject([]);
  constructor() { }
  async connectToChatkit(userid: string) {
    this.chatManager = new ChatManager({
      instanceLocator: this.INSTANCE_LOCATOR,
      userId : userid,
      tokenProvider: new TokenProvider({ url: this.AUTH_URL })
    });
    this.currentUser = await this.chatManager.connect();
    await this.currentUser.subscribeToRoom({
      roomId: this.GENERAL_ROOM_ID,
      hooks: {
        onMessage: message => {
          this.messages.push(message);
          this.messagesSubject.next(this.messages);
        }
      },
      messageLimit: 20
    });

    const users = this.currentUser.rooms[this.GENERAL_ROOM_INDEX].users;
    this.usersSubject.next(users);
  }

  getUsers() {
    return this.usersSubject;
  }
  getMessages() {
    return this.messagesSubject;
  }
  sendMessage(message) {
    return this.currentUser.sendMessage({
      text: message.text,
      roomId: message.roomId || this.GENERAL_ROOM_ID
    });
  }
  isUserOnline(user): boolean {
    return user.presence.state === 'online';
  }
  getCurrentUser() {
    return this.currentUser;
  }
}
