import DashboardClient from "@/components/dashboard-client";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Here's a summary of your study sessions.</p>
      </div>
      <DashboardClient />
    </div>
  );
}
