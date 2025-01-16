import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { CurrentSectionType, Room } from "@/utilities/types";
import { useCallback } from "react";

type AskToJoinProps = {
  websocket: WebSocket | null;
  userUUID: string;
  room: Room;
  handleCurrentWindowState: (windowState: CurrentSectionType) => void;
  handleSetCurrentRoom: (room: Room) => void;
  handleClearRoom: () => void;
};
export default function AskToJoin({
  websocket,
  userUUID,
  room,
  handleCurrentWindowState,
  handleSetCurrentRoom,
  handleClearRoom,
}: AskToJoinProps) {
  const [open, setOpen] = React.useState(true);

  const handleClose = useCallback(() => {
    setOpen(false);
    handleClearRoom();
    handleCurrentWindowState(CurrentSectionType.Welcome);
  }, [handleClearRoom, handleCurrentWindowState]);

  const handleJoin = () => {
    if (websocket !== null) {
      const joinEvent = {
        entity: "room",
        action: "join",
        username: userUUID,
        entity_data: {
          room_uuid: room.id,
        },
      };
      websocket.send(JSON.stringify(joinEvent));
    }
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogContent>
        <DialogContentText>Do you want to join {room.name}?</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ display: "flex", alignItems: "center" }}>
        <Button
          variant="outlined"
          onClick={() => {
            handleClose();
          }}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            handleJoin();
            handleSetCurrentRoom(room);
            handleCurrentWindowState(CurrentSectionType.JoinedRoom);
          }}
        >
          Join
        </Button>
      </DialogActions>
    </Dialog>
  );
}
