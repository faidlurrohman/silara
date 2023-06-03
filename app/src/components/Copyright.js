export default function Copyright() {
	return (
		<div className="text-center text-xs font-light">
			{`Copyright ©`}{" "}
			<a
				href="#"
				className="text-secondary"
			>{` ${process.env.REACT_APP_NAME} `}</a>
			{new Date().getFullYear()}
		</div>
	);
}
