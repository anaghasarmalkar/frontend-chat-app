import { Box, IconButton, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
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
        height: "100%",
        padding: "0.75rem",
      }}
    >
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          paddingBottom: "0.75rem",
          overflowY: "scroll",
        }}
      >
        {Array.from(messages).map((msg) => {
          return msg.sender === userUUID ? (
            <Box
              key={msg.message_uuid}
              sx={{
                display: "flex",
                backgroundColor: "#00b4d8",
                marginLeft: "auto",
                gap: "0.5rem",
                alignItems: "baseline",
                padding: "0.5rem",
                borderRadius: "10px",
                maxWidth: "70%",
              }}
            >
              <Typography variant="body1">{msg.message}</Typography>
              <Typography>
                <Box sx={{ fontSize: 11 }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Box>
              </Typography>
            </Box>
          ) : (
            <Box
              key={msg.message_uuid}
              sx={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#adb5bd",
                marginRight: "auto",
                padding: "0.5rem",
                borderRadius: "10px",
                maxWidth: "70%",
              }}
            >
              <Typography variant="body1">
                <Box sx={{ fontWeight: "bold" }}>{msg.sender.slice(0, 5)}</Box>
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.5rem",
                  alignItems: "baseline",
                }}
              >
                <Typography variant="body1">{msg.message}</Typography>
                <Typography>
                  <Box sx={{ fontSize: 11 }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Box>
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: "flex", width: "100%" }}>
        <TextField
          autoFocus
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
