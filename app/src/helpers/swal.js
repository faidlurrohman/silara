import Swal from "sweetalert2";
import { COLORS } from "./constants";

export const swal = (message = "Tidak ada pesan", icon = "error") => {
	return Swal.fire({
		icon: icon,
		html: `<span className="font-noto">${message}</span>`,
		confirmButtonText: '<span className="font-noto">OK</span>',
		confirmButtonColor: COLORS.main,
		focusConfirm: false,
	});
};
