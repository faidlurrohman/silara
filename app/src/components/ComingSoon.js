import { ArrowLeftOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

export default function ComingSoon({ useNav = true }) {
	return (
		<div className="flex justify-center items-center w-full h-screen flex-col">
			<img
				className="max-w-full md:max-w-md"
				src={`${process.env.PUBLIC_URL}/coming_soon.png`}
			/>
			<p className="m-0 text-right text-xs">
				An art by{" "}
				<a target="_blank" href="https://dribbble.com/petrhad">
					Petr Had
				</a>
			</p>
			{useNav && (
				<p className="mt-10 flex flex-row items-center space-x-5">
					<Link
						to="/"
						className="text-gray-700 hover:text-black my-transition flex items-center hover:bg-gray-300 py-2 px-5 rounded-full"
					>
						<ArrowLeftOutlined />{" "}
						<span className="ml-2">Kembali ke halaman awal</span>
					</Link>
				</p>
			)}
		</div>
	);
}
