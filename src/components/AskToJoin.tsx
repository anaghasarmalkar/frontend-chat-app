import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { CurrentSectionType } from "@/utilities/types";

type AskToJoinProps = {
  websocket: WebSocket | null;
  userUUID: string;
  roomUUID: string;
  handleCurrentWindowState: (windowState: CurrentSectionType) => void;
  handleSetCurrentRoom: (roomUUID: string) => void;
};
export default function AskToJoin({
  websocket,
  userUUID,
  roomUUID,
  handleCurrentWindowState,
  handleSetCurrentRoom,
}: AskToJoinProps) {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  const handleJoin = () => {
    if (websocket !== null) {
      const joinEvent = {
        entity: "room",
        action: "join",
        username: userUUID,
        entity_data: {
          room_uuid: roomUUID,
        },
      };
      websocket.send(JSON.stringify(joinEvent));
    }
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Join Room</DialogTitle>
      <DialogContent>
        <DialogContentText>Do you want to join this room?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={() => {
            handleClose();
            handleCurrentWindowState(CurrentSectionType.Welcome);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            handleJoin();
            handleSetCurrentRoom(roomUUID);
            handleCurrentWindowState(CurrentSectionType.JoinedRoom);
          }}
        >
          Join
        </Button>
      </DialogActions>
    </Dialog>
  );
}
