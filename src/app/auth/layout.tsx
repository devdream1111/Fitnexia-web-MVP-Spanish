export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen overflow-hidden bg-[var(--fn-bg)]">{children}</div>;
}
