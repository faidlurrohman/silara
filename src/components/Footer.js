import { Box } from "@mui/material";
import Copyright from "./Copyright";

export default function Footer() {
  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Copyright />
    </Box>
  );
}
