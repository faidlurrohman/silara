import { Layout, Menu } from "antd";
import { useState } from "react";
import HeaderComponent from "./Header";
import { useNavigate } from "react-router-dom";
import Copyright from "./Copyright";

const { Content, Footer, Sider } = Layout;
const rootSubmenuKeys = ["1", "2", "3", "4", "5"];

export default function Wrapper({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState(["1"]);
  const navigate = useNavigate();

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  return (
    <Layout>
      <Sider
        style={{
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          top: 0,
          left: 0,
        }}
        width={280}
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        <div className="h-8 m-4 bg-gray-400" />
        <Menu
          theme="dark"
          mode="inline"
          className="text-sm"
          defaultSelectedKeys={["1"]}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          items={[
            {
              key: "1",
              label: "Beranda",
              onClick: () => navigate("/"),
            },
            {
              key: "2",
              label: "Master Rekening",
              children: [
                {
                  key: "2_1",
                  label: "Akun",
                  onClick: () => navigate("rekening/akun"),
                },
                {
                  key: "2_2",
                  label: "Kelompok",
                  onClick: () => navigate("rekening/kelompok"),
                },
                {
                  key: "2_3",
                  label: "Jenis",
                  onClick: () => navigate("rekening/jenis"),
                },
                {
                  key: "2_4",
                  label: "Objek",
                  onClick: () => navigate("rekening/objek"),
                },
              ],
            },
            {
              key: "3",
              label: "Transaksi",
              onClick: () => navigate("transaksi"),
            },
            {
              key: "4",
              label: "Laporan",
              children: [
                {
                  key: "4_1",
                  label: "Anggaran Kota",
                  onClick: () => navigate("laporan/realisasi-anggaran-kota"),
                },
                {
                  key: "4_2",
                  label: "Anggaran Gabungan Kota",
                  onClick: () =>
                    navigate("laporan/realisasi-anggaran-gabungan-kota"),
                },
                {
                  key: "4_3",
                  label: "Pendapatan & Belanja",
                  onClick: () =>
                    navigate("laporan/rekapitulasi-pendapatan-dan-belanja"),
                },
              ],
            },
            {
              key: "5",
              label: "Pengaturan",
              children: [
                {
                  key: "5_1",
                  label: "Kota",
                  onClick: () => navigate("pengaturan/kota"),
                },
                {
                  key: "5_2",
                  label: "Penanda Tangan",
                  onClick: () => navigate("pengaturan/penanda-tangan"),
                },
                {
                  key: "5_3",
                  label: "Pengguna",
                  onClick: () => navigate("pengaturan/pengguna"),
                },
              ],
            },
          ]}
        />
      </Sider>
      <Layout className="site-layout">
        <HeaderComponent
          onCollapse={() => setCollapsed(!collapsed)}
          collapsed={collapsed}
        />
        <Content className="p-2.5 m-2.5 bg-white min-h-fit">{children}</Content>
        <Footer className="text-center m-0 p-4">
          <Copyright />
        </Footer>
      </Layout>
    </Layout>
  );
}
