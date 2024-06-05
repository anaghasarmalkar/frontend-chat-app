import { Box, IconButton, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { defaultTextFieldValue } from "./NewRoom";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Message } from "@/utilities/types";

type ChatRoomProps = {
  websocket: WebSocket | null;
  userUUID: string;
  roomUUID: string;
  messages: Set<Message>;
};
export default function ChatRoom({
  websocket,
  userUUID,
  roomUUID,
  messages,
}: ChatRoomProps) {
  const [inputMessage, setInputMessage] = useState<string>(
    defaultTextFieldValue
  );
  const handleSendMessage = () => {
    if (inputMessage !== "" && websocket !== null) {
      const message_event = {
        entity: "room",
        action: "message",
        username: userUUID,
        entity_data: {
          room_uuid: roomUUID,
          message: inputMessage,
        },
      };
      websocket.send(JSON.stringify(message_event));
      setInputMessage("");
    }
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {Array.from(messages).map((msg) => {
          return (
            <Box
              key={msg.message_uuid}
              sx={{ display: "flex", flexDirection: "column" }}
              ml={msg.sender === userUUID ? "auto" : ""}
              mr={msg.sender !== userUUID ? "auto" : ""}
            >
              <Typography>{msg.sender}</Typography>
              <Typography>{msg.message}</Typography>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: "flex", width: "100%" }}>
        <TextField
          value={inputMessage}
          fullWidth
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputMessage(e.target.value)
          }
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.code === "Enter") {
              handleSendMessage();
            }
          }}
        ></TextField>
        <IconButton aria-label="send" onClick={handleSendMessage}>
          <SendRoundedIcon sx={{ height: "40px", width: "40px" }} />
        </IconButton>
      </Box>
    </Box>
  );
}
