import { useAppSelector } from "./useRedux";

// 1	"super_admin"	"Admin Super"
// 2	"city_admin"	"Admin Kota"
// 3	"manager_ro"	"Pimpinan"
// 4	"manager_city"	"Pimpinan Kota"

export default function useRole() {
	const user = useAppSelector((state) => state.session.user);
	let role_id = parseInt(user?.token.substr(user?.token.length - 1));
	let is_super_admin = false;

	if (role_id === 1 || role_id === 3) {
		is_super_admin = true;
	}

	return { role_id, is_super_admin };
}
