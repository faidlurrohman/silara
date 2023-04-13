import { Box, Link, Typography } from "@mui/material";

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
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        fontSize={12}
      >
        {"Copyright © "}
        <Link color="inherit" href="#">
          Silara
        </Link>{" "}
        {new Date().getFullYear()}
        {"."}
      </Typography>
    </Box>
  );
}
