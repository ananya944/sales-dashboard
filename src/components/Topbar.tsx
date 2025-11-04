import { Bell, Settings, UserCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Topbar() {
	return (
		<header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
			<div className="relative w-full max-w-xl">
				<Input placeholder="Search clients, subscriptions..." className="pl-10 bg-slate-50" />
				<Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
			</div>
			<div className="flex items-center gap-3">
				<button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" aria-label="Notifications"><Bell className="h-5 w-5" /></button>
				<button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" aria-label="Settings"><Settings className="h-5 w-5" /></button>
				<div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
					<UserCircle className="h-6 w-6 text-slate-600" />
					<span className="text-sm text-slate-700">You</span>
				</div>
			</div>
		</header>
	);
}
