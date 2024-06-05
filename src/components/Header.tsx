import { Box, Typography } from "@mui/material";
import { PropsWithChildren } from "react";

type HeaderProps = {
  title: string;
};

export default function Header({
  title,
  children,
}: PropsWithChildren<HeaderProps>) {
  return (
    <Box
      display="flex"
      flexDirection="row"
      flexWrap="nowrap"
      justifyContent="space-between"
      alignItems="center"
      padding="0.75rem"
    >
      <Typography noWrap component="div">
        {title}
      </Typography>
      {children}
    </Box>
  );
}
