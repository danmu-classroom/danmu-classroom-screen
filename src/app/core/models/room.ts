// Example
// {
// 	"id": 287,
// 	"key": "6715",
// 	"online": true,
// 	"url": "http://localhost:3000/rooms/287",
// 	"auth_token": "EhpofVP9yG4A9GbGMcRdxMZz",
// 	"auth_token_sent_at": "2018-11-11T15:21:20.231Z"
// }

export interface Room {
  auth_token: string;
  auth_token_sent_at: Date;
  id: number;
  key: string;
  online: boolean;
  url: string;
}
