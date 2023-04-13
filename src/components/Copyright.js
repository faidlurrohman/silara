import { Link, Typography } from "@mui/material";

export default function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      fontSize={12}
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="#">
        Silara
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
