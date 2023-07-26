import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function Loader({ spinning = false }) {
	return (
		<div
			className={`flex bg-white items-center justify-center opacity-100 text-center w-full fixed top-0 bottom-0 left-0 z-[100000] ${
				!spinning &&
				`-z-[100000] opacity-0 transition-all ease-in-out delay-200 duration-500`
			} `}
		>
			<div className="w-[200px] h-[100px] inline-flex flex-col justify-around">
				<Spin size="large" indicator={<LoadingOutlined spin />} />
				<div className="w-[200px] h-[20px] uppercase text-center font-semibold text-xs tracking-wider text-secondary">
					Sedang Memuat
				</div>
			</div>
		</div>
	);
}
