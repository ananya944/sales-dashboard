import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Toaster } from "@/components/ui/toaster";

export default function SidebarLayout() {
	return (
		<div className="flex h-dvh w-dvw bg-slate-50">
			<Sidebar />
			<main className="flex-1 overflow-auto">
				<Topbar />
				<div className="mx-auto max-w-7xl p-8">
					<Outlet />
				</div>
			</main>
			<Toaster />
		</div>
	);
}
