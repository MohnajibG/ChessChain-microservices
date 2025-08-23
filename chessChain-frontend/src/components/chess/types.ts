import { type Square } from "chess.js";

export type MoveEvent = {
  from: Square;
  to: Square;
  roomId: string;
};
