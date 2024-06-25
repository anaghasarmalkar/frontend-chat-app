"use client";

import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
export type ErrorsProps = {
  title?: string;
  messages: string[];
};

export default function Errors({
  title = "Please correct the following errors.",
  messages,
}: ErrorsProps) {
  return (
    <Box
      component="div"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px",
      }}
    >
      <Typography>{title}</Typography>
      <List sx={{ color: "red" }}>
        {messages.map((err: string, idx: number) => (
          <ListItem key={idx}>
            <Typography align="center">{err}</Typography>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
