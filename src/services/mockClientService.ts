import type { ExtendedClient, Subscription } from "@/types/client";

const clients: ExtendedClient[] = [
	{
		id: "CL-001",
		name: "Acme Corporation",
		salesSpoc: "John Smith",
		accountManager: "Alice Brown",
		clientAdmin: "Robert Johnson",
		email: "finance@acme.com",
		status: "active",
		mrr: "$12,450",
		subscriptions: [],
	},
	{
		id: "CL-002",
		name: "TechStart Inc",
		salesSpoc: "Sarah Johnson",
		accountManager: "Mike Wilson",
		clientAdmin: "Jennifer Lee",
		email: "billing@techstart.com",
		status: "onboarding",
		mrr: "$8,920",
		subscriptions: [],
	},
	{
		id: "CL-003",
		name: "Global Solutions Ltd",
		salesSpoc: "David Chen",
		accountManager: "Lisa Anderson",
		clientAdmin: "Tom Wilson",
		email: "admin@globalsolutions.com",
		status: "active",
		mrr: "$15,680",
		subscriptions: [],
	},
	{
		id: "CL-004",
		name: "InnovateCorp",
		salesSpoc: "Michael Brown",
		accountManager: "Jessica Davis",
		clientAdmin: "Kevin Martinez",
		email: "contact@innovatecorp.com",
		status: "terminated",
		mrr: "-",
		subscriptions: [],
	},
	{
		id: "CL-005",
		name: "FutureTech Systems",
		salesSpoc: "Amanda Wilson",
		accountManager: "Carlos Rodriguez",
		clientAdmin: "Priya Patel",
		email: "info@futuretech.com",
		status: "pending",
		mrr: "-",
		subscriptions: [],
	},
];

export function getAllClients(): ExtendedClient[] {
	return clients;
}

export async function fetchClientDetails(id: string): Promise<ExtendedClient> {
    const base = clients.find(c => c.id === id);
    if (!base) {
        throw new Error("Client not found");
    }
    // Provide some mock extended fields for the details page
    return {
        ...base,
        address: base.address ?? "123 Business St, New York, NY",
        phone: base.phone ?? "+1 (555) 123-4567",
        lastActivity: (base as any).lastActivity ?? "2024-01-10",
        total_employees: (base as any).total_employees ?? 2,
        invoices: (base as any).invoices ?? [
            { id: "INV-001", amount: 2450, status: "pending" },
        ],
        employees: (base as any).employees ?? [
            {
                name: "Mike Chen",
                role: "Full Stack Developer",
                department: "Engineering",
                salaryInr: 140000,
                startDate: "15/12/2023",
                status: "active",
                billable: true,
            },
        ],
    };
}

export function addSubscriptionToClient(clientId: string, subscription: Subscription): void {
    const client = clients.find(c => c.id === clientId);
    if (client) {
        client.subscriptions.push(subscription);
    }
}