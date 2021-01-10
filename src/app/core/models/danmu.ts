// Example
// {
// 	"id": 115,
// 	"content": ":messsage",
// 	"room_id": 287,
// 	"sender_id": 6,
// 	"created_at": "2018-11-11T15:29:51.260Z",
// 	"updated_at": "2018-11-11T15:29:51.260Z"
// }

export interface Danmu {
  id: number;
  content: string;
  room_id: number;
  sender_id: number;
  created_at: Date;
  updated_at: Date;
}
