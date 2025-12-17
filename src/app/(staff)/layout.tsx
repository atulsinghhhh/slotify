import { StaffSidebar } from "@/components/StaffSidebar";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <StaffSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
