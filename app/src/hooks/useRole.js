import { useAppSelector } from "./useRedux";

export default function useRole() {
	const user = useAppSelector((state) => state.session.user);
	let role_id = parseInt(user?.token.substr(user?.token.length - 1));
	let is_super_admin = false;

	if (role_id === 1) {
		is_super_admin = true;
	}

	return { role_id, is_super_admin };
}
