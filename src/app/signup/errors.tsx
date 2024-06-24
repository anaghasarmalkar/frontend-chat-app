"use client";

import { Box, Typography } from "@mui/material";

export type ErrorsProps = {
  title?: string;
  messages: string[];
};

export default function Errors({
  title = "Please correct the following errors.",
  messages,
}: ErrorsProps) {
  return (
    <Box component="div">
      <Typography>{title}</Typography>
      <ul>
        {messages.map((err: string, idx: number) => (
          <li key={idx}>
            <Typography>{err}</Typography>
          </li>
        ))}
      </ul>
    </Box>
  );
}
