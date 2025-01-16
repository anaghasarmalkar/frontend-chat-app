import { Paper, Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function SuccessfulUserCreation() {
  const queryParam = useSearchParams();
  return (
    queryParam.get("user_created") && (
      <Paper
        variant="outlined"
        sx={{
          margin: "0.5rem",
          padding: "0.75rem",
          color: "rgb(30, 70, 32)",
          backgroundColor: "rgb(237, 247, 237)",
        }}
      >
        <Typography align="center">
          Your account was created successfully.
        </Typography>
        <Typography align="center">Please login to continue.</Typography>
      </Paper>
    )
  );
}
