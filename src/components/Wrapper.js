import {
  Box,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
} from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
import { useState } from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Link } from "react-router-dom";

const drawerWidth = 300;

export default function Wrapper({ window, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openRekening, setOpenRekening] = useState(true);
  const [openLaporan, setOpenLaporan] = useState(true);
  const [openPengaturan, setOpenPengaturan] = useState(true);

  const handleMenuClick = (which) => {
    if (which === "rekening") {
      setOpenRekening(!openRekening);
    } else if (which === "laporan") {
      setOpenLaporan(!openLaporan);
    } else if (which === "pengaturan") {
      setOpenPengaturan(!openPengaturan);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItemButton component={Link} to="/">
          <ListItemText
            primary="Beranda"
            primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
          />
        </ListItemButton>
        <ListItemButton onClick={() => handleMenuClick("rekening")}>
          <ListItemText
            primary="Master Rekening"
            primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
          />
          {openRekening ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openRekening} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} component={Link} to="/rekening/akun">
              <ListItemText
                primary="Akun"
                primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
              />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4 }}
              component={Link}
              to="/rekening/kelompok"
            >
              <ListItemText
                primary="Kelompok"
                primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
              />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4 }}
              component={Link}
              to="/rekening/jenis"
            >
              <ListItemText
                primary="Jenis"
                primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
              />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4 }}
              component={Link}
              to="/rekening/objek"
            >
              <ListItemText
                primary="Objek"
                primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
              />
            </ListItemButton>
          </List>
        </Collapse>
        <ListItemButton component={Link} to="/transaksi">
          <ListItemText
            primary="Transaksi"
            primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
          />
        </ListItemButton>
        <ListItemButton onClick={() => handleMenuClick("laporan")}>
          <ListItemText
            primary="Laporan"
            primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
          />
          {openLaporan ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openLaporan} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              component={Link}
              to="/laporan/realisasi-anggaran-kota"
            >
              <ListItemText
                primary="Realisasi Anggaran Kota"
                primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
              />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4 }}
              component={Link}
              to="/laporan/realisasi-anggaran-gabungan-kota"
            >
              <ListItemText
                primary="Realisasi Anggaran Gabungan Kota"
                primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
              />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4 }}
              component={Link}
              to="/laporan/rekapitulasi-pendapatan-dan-belanja"
            >
              <ListItemText
                primary="Rekapitulasi Pendapatan & Belanja"
                primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
              />
            </ListItemButton>
          </List>
        </Collapse>
        <ListItemButton onClick={() => handleMenuClick("pengaturan")}>
          <ListItemText
            primary="Pengaturan"
            primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
          />
          {openPengaturan ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openPengaturan} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              component={Link}
              to="/pengaturan/kota"
            >
              <ListItemText
                primary="Kota"
                primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
              />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4 }}
              component={Link}
              to="/pengaturan/penanda-tangan"
            >
              <ListItemText
                primary="Penanda Tangan"
                primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
              />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4 }}
              component={Link}
              to="/pengaturan/pengguna"
            >
              <ListItemText
                primary="Pengguna"
                primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
              />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <Header handleDrawerToggle={() => handleDrawerToggle()} />
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
        <Footer />
      </Box>
    </Box>
  );
}
