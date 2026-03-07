import Link from "next/link";
import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, string> = {
  active: "稼働中",
  paused: "停止中",
  churned: "解約",
};

const STATUS_COLOR: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  churned: "bg-gray-100 text-gray-500",
};

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      firmName: true,
      ownerName: true,
      status: true,
      monthlyFee: true,
      contractStartedAt: true,
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">クライアント一覧</h1>
        <Link
          href="/admin/clients/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          新規登録
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="text-sm text-gray-500">クライアントがまだ登録されていません。</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">事務所名</th>
                <th className="px-4 py-3">オーナー</th>
                <th className="px-4 py-3">ステータス</th>
                <th className="px-4 py-3 text-right">月額</th>
                <th className="px-4 py-3">契約開始</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {client.firmName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{client.ownerName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLOR[client.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {STATUS_LABEL[client.status] ?? client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    ¥{client.monthlyFee.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {client.contractStartedAt.toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/clients/${client.slug}/dashboard`}
                      className="text-blue-600 hover:underline"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
