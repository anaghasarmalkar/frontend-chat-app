import { Box, Typography } from "@mui/material";
import { PropsWithChildren } from "react";

type HeaderProps = {
  title: string;
  description?: string;
};
const headerHeight = 75;

export default function Header({
  title,
  description,
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
      height={headerHeight}
    >
      <Box>
        <Typography noWrap variant="h6">
          <Box sx={{ fontWeight: "bold" }}>{title}</Box>
        </Typography>
        {description && (
          <Typography noWrap variant="subtitle2">
            {description}
          </Typography>
        )}
      </Box>

      {children}
    </Box>
  );
}
