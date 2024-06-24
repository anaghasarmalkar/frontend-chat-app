import { Box, CircularProgress, Typography } from "@mui/material";
type LoaderProps = {
  label: string;
};
export default function Loader({ label }: LoaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress />
      <Typography variant="h6" sx={{ paddingTop: "1rem" }}>
        {label}
      </Typography>
    </Box>
  );
}
