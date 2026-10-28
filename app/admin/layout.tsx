import type { Metadata } from "next";
import { DatabaseZap } from "lucide-react";
import { Sidebar } from "@/components/admin/sidebar";
import { ToastProvider } from "@/components/toast";
import { Alert } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-sand">
        <Sidebar username={session.username} />
        <div className="lg:py-3 lg:pr-3 lg:pl-[244px]">
          <main className="min-h-[calc(100dvh-64px)] bg-paper lg:min-h-[calc(100dvh-24px)] lg:rounded-[26px] lg:shadow-md lg:ring-1 lg:ring-gray-200/70">
            <div className="mx-auto max-w-[1280px] px-4 pt-7 pb-24 sm:px-8 lg:px-10 lg:pt-9 lg:pb-12">
              {isDbConfigured() ? (
                children
              ) : (
                <Alert color="error" icon={DatabaseZap} title="Database belum terhubung">
                  Environment variable <code className="font-mono">DATABASE_URL</code> belum diatur. Hubungkan database
                  Neon lewat Vercel → Storage, lalu redeploy.
                </Alert>
              )}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
