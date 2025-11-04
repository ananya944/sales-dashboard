import { NavLink } from "react-router-dom";
import { Home, Users, BarChart3, FileText, RefreshCw } from "lucide-react";

export default function Sidebar() {
	const linkBase = "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 no-underline";
	const activeClasses = "bg-slate-100 text-slate-900";
	const SectionTitle = ({ children }: { children: string }) => (
		<div className="px-4 pb-2 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</div>
	);

	return (
		<aside className="h-full w-60 shrink-0 border-r border-slate-200 bg-white">
			{/* Logo */}
			<div className="flex items-center gap-3 px-4 pt-5">
				<div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
					{/* Bar chart glyph */}
					<svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
						<rect x="3" y="16" width="3" height="5" rx="1" fill="currentColor" />
						<rect x="9" y="12" width="3" height="9" rx="1" fill="currentColor" />
						<rect x="15" y="7" width="3" height="14" rx="1" fill="currentColor" />
						<path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".6" />
					</svg>
				</div>
				<div>
					<div className="text-base font-semibold text-blue-600">FinanceOS</div>
					<div className="text-xs text-slate-500">Sales + Finance</div>
				</div>
			</div>

			{/* Divider above WORKSPACE */}
			<div className="mt-4 border-t border-slate-200" />

			<nav className="mt-4">
				<SectionTitle>Workspace</SectionTitle>
				<ul className="list-none space-y-1 px-2">
					<li>
						<NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? activeClasses : ""}`}>
							<Home className="h-4 w-4" />
							<span>Dashboard</span>
						</NavLink>
					</li>
					<li>
						<NavLink to="/prospects" className={({ isActive }) => `${linkBase} ${isActive ? activeClasses : ""}`}>
							<Users className="h-4 w-4" />
							<span>Prospects</span>
						</NavLink>
					</li>
					<li>
						<NavLink to="/clients" className={({ isActive }) => `${linkBase} ${isActive ? activeClasses : ""}`}>
							<Users className="h-4 w-4" />
							<span>Clients</span>
						</NavLink>
					</li>
					<li>
						<NavLink to="/employees" className={({ isActive }) => `${linkBase} ${isActive ? activeClasses : ""}`}>
							<Users className="h-4 w-4" />
							<span>Employees</span>
						</NavLink>
					</li>
				</ul>

				<SectionTitle>Finance</SectionTitle>
				<ul className="list-none space-y-1 px-2 pb-6">
					<li>
						<NavLink to="/finance/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? activeClasses : ""}`}>
							<BarChart3 className="h-4 w-4" />
							<span>Dashboard</span>
						</NavLink>
					</li>
					<li>
						<NavLink to="/invoices" className={({ isActive }) => `${linkBase} ${isActive ? activeClasses : ""}`}>
							<FileText className="h-4 w-4" />
							<span>Invoices</span>
						</NavLink>
					</li>
					<li>
						<NavLink to="/reconciliation" className={({ isActive }) => `${linkBase} ${isActive ? activeClasses : ""}`}>
							<RefreshCw className="h-4 w-4" />
							<span>Reconciliation</span>
						</NavLink>
					</li>
				</ul>
			</nav>
		</aside>
	);
}
