import { ProviderSidebar } from "@/components/ProviderSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <ProviderSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl w-full">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
