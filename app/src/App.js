import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

import Masuk from "./pages/auth/Masuk";
import NotFound from "./pages/404";
import Beranda from "./pages/Beranda";

import ProtectedRoute from "./components/ProtectedRoute";
import UnprotectedRoute from "./components/UnprotectedRoute";
import Wrapper from "./components/Wrapper";

import RekeningAkun from "./pages/rekening/RekeningAkun";
import RekeningJenis from "./pages/rekening/RekeningJenis";
import RekeningKelompok from "./pages/rekening/RekeningKelompok";
import RekeningObjek from "./pages/rekening/RekeningObjek";
import Transaksi from "./pages/transaksi/Transaksi";
import AnggaranKota from "./pages/laporan/AnggaranKota";
import AnggaranGabunganKota from "./pages/laporan/AnggaranGabunganKota";
import PendapatanBelanja from "./pages/laporan/PendapatanBelanja";
import PengaturanKota from "./pages/pengaturan/PengaturanKota";
import PengaturanPenandaTangan from "./pages/pengaturan/PengaturanPenandaTangan";
import PengaturanPengguna from "./pages/pengaturan/PengaturanPengguna";

function App() {
	return (
		<BrowserRouter basename="/silara_live">
			<Routes>
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<Wrapper>
								<Outlet />
							</Wrapper>
						</ProtectedRoute>
					}
				>
					<Route index element={<Beranda />} />
					<Route path="/rekening" element={<Outlet />}>
						<Route path="akun" element={<RekeningAkun />} />
						<Route path="kelompok" element={<RekeningKelompok />} />
						<Route path="jenis" element={<RekeningJenis />} />
						<Route path="objek" element={<RekeningObjek />} />
					</Route>
					<Route path="/transaksi" element={<Outlet />}>
						<Route index element={<Transaksi />} />
					</Route>
					<Route path="/laporan" element={<Outlet />}>
						<Route path="realisasi-anggaran-kota" element={<AnggaranKota />} />
						<Route
							path="realisasi-anggaran-gabungan-kota"
							element={<AnggaranGabunganKota />}
						/>
						<Route
							path="rekapitulasi-pendapatan-dan-belanja"
							element={<PendapatanBelanja />}
						/>
					</Route>
					<Route path="/pengaturan" element={<Outlet />}>
						<Route path="kota" element={<PengaturanKota />} />
						<Route
							path="penanda-tangan"
							element={<PengaturanPenandaTangan />}
						/>
						<Route path="pengguna" element={<PengaturanPengguna />} />
					</Route>
				</Route>
				<Route path="/auth">
					<Route
						path="masuk"
						element={
							<UnprotectedRoute>
								<Masuk />
							</UnprotectedRoute>
						}
					/>
				</Route>
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
