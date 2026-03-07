import Link from "next/link";

const navItems = [
  { href: "/admin",         label: "全クライアント" },
  { href: "/admin/clients", label: "クライアント管理" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-800">行政書士LP管理</span>
        </div>
        <nav className="py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
