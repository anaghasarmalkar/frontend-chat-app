"use client";
import { Box, IconButton, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { ChangeEvent, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export default function ChatWindow() {
  const [latestMessage, setLatestMessage] = useState<string>("");
  // const handleInput = useDebouncedCallback(
  //   (value) => setLatestMessage(value),
  //   500
  // );
  // Q: How much to keep debounce if I finish typing input and hit enter? Will i lose data?

  const handleSend = () => {};
  return (
    <Box
      sx={{
        width: 300,
        height: 200,
        borderRadius: 2,
        border: "2px solid grey",
        padding: 1,
        position: "relative",
      }}
      component="section"
    >
      <div
        style={{
          width: "95%",
          borderRadius: 15,
          border: "1px solid grey",
          position: "absolute",
          bottom: 1,
        }}
      >
        <TextField
          sx={{
            "& > :not(style)": { m: 1 },
          }}
          id="outlined-basic"
          variant="outlined"
          defaultValue={""}
          onChange={
            (event: ChangeEvent<HTMLInputElement>) =>
              setLatestMessage(event.target.value)
            // handleInput(e.target.value)
          }
        />
        <IconButton aria-label="send" onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </div>
    </Box>
  );
}
