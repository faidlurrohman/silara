import {
	BrowserRouter,
	Outlet,
	Route,
	Routes,
	useParams,
} from "react-router-dom";
import useRole from "./hooks/useRole";

import Masuk from "./pages/auth/Masuk";
import NotFound from "./pages/404";
import Beranda from "./pages/Beranda";

import ProtectedRoute from "./components/ProtectedRoute";
import UnprotectedRoute from "./components/UnprotectedRoute";
import Wrapper from "./components/Wrapper";

import AnggaranKota from "./pages/laporan/AnggaranKota";
import AnggaranGabunganKota from "./pages/laporan/AnggaranGabunganKota";
import PendapatanBelanja from "./pages/laporan/PendapatanBelanja";
import PengaturanKota from "./pages/pengaturan/PengaturanKota";
import PengaturanPenandaTangan from "./pages/pengaturan/PengaturanPenandaTangan";
import PengaturanPengguna from "./pages/pengaturan/PengaturanPengguna";

import Akun from "./pages/rekening/Akun";
import Kelompok from "./pages/rekening/Kelompok";
import Jenis from "./pages/rekening/Jenis";
import Objek from "./pages/rekening/Objek";

import Anggaran from "./pages/transaksi/Anggaran";
import Realisasi from "./pages/transaksi/Realisasi";

function DynamicWrapper({ children }) {
	const { id } = useParams();

	if (isNaN(Number(id))) {
		return <NotFound useNav={false} />;
	}

	if (!/^[0-9]+$/.exec(Number(id))) {
		return <NotFound useNav={false} />;
	}

	return children;
}

function App() {
	const { is_super_admin } = useRole();

	return (
		<BrowserRouter basename={process.env.REACT_APP_BASE_ROUTER}>
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
					{is_super_admin && (
						<Route path="/rekening" element={<Outlet />}>
							<Route index element={<Akun />} />
							<Route path="kelompok" element={<Outlet />}>
								<Route index element={<Kelompok />} />
								<Route
									path=":id"
									element={
										<DynamicWrapper>
											<Kelompok />
										</DynamicWrapper>
									}
								/>
							</Route>
							<Route path="jenis" element={<Outlet />}>
								<Route index element={<Jenis />} />
								<Route
									path=":id"
									element={
										<DynamicWrapper>
											<Jenis />
										</DynamicWrapper>
									}
								/>
							</Route>
							<Route path="objek" element={<Outlet />}>
								<Route index element={<Objek />} />
								<Route
									path=":id"
									element={
										<DynamicWrapper>
											<Objek />
										</DynamicWrapper>
									}
								/>
							</Route>
						</Route>
					)}
					<Route path="/transaksi" element={<Outlet />}>
						<Route path="anggaran" element={<Anggaran />} />
						<Route path="realisasi" element={<Realisasi />} />
					</Route>
					<Route path="/laporan" element={<Outlet />}>
						<Route path="realisasi-anggaran-kota" element={<AnggaranKota />} />
						{is_super_admin && (
							<>
								<Route
									path="realisasi-anggaran-gabungan-kota"
									element={<AnggaranGabunganKota />}
								/>
								<Route
									path="rekapitulasi-pendapatan-dan-belanja"
									element={<PendapatanBelanja />}
								/>
							</>
						)}
					</Route>
					{is_super_admin && (
						<Route path="/pengaturan" element={<Outlet />}>
							<Route path="kota" element={<PengaturanKota />} />
							<Route
								path="penanda-tangan"
								element={<PengaturanPenandaTangan />}
							/>
							<Route path="pengguna" element={<PengaturanPengguna />} />
						</Route>
					)}
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
