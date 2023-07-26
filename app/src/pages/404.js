import { ArrowLeftOutlined } from "@ant-design/icons";
import { Link, Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/useRedux";

export default function NotFound({ useNav = true }) {
	const session = useAppSelector((state) => state.session.user);

	if (!session) {
		return <Navigate to={"/auth/masuk"} replace />;
	}

	return (
		<div className="flex justify-center items-center w-full h-screen flex-col">
			<img
				className="max-w-full md:max-w-md"
				src={`${process.env.PUBLIC_URL}/404.png`}
				alt="Not found"
			/>
			<p className="m-0 text-right text-xs">
				An art by{" "}
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://dribbble.com/frasierfanclub"
					className="text-secondary hover:text-secondary"
				>
					Jennifer Suplee
				</a>
			</p>

			{useNav && (
				<p className="mt-10 flex flex-row items-center space-x-5">
					<Link
						to="/"
						className="text-black hover:text-black my-transition flex items-center hover:bg-secondaryOpacity py-2 px-5 rounded-full"
					>
						<ArrowLeftOutlined />{" "}
						<span className="ml-2">Kembali ke halaman awal</span>
					</Link>
				</p>
			)}
		</div>
	);
}
