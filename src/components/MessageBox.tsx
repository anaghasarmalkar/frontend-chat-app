import { Message } from "@/utilities/types";
import { Box, Typography } from "@mui/material";

type MessageBoxProps = Pick<Message, "message" | "sent">;

export default function MessageBox({ message, sent }: MessageBoxProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: "0.5rem",
        alignItems: "flex-end",
      }}
    >
      <Typography
        variant="body1"
        sx={{ overflowWrap: "anywhere", flexGrow: 1 }}
      >
        {message}
      </Typography>
      <Typography sx={{ flexShrink: 0 }}>
        <Box sx={{ fontSize: 11 }}>
          {new Date(sent).toLocaleTimeString([], {
            timeStyle: "short",
          })}
        </Box>
      </Typography>
    </Box>
  );
}
