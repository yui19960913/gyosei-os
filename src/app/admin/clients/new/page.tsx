"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      firmName: form.get("firmName"),
      ownerName: form.get("ownerName"),
      slug: form.get("slug"),
      email: form.get("email"),
      monthlyFee: form.get("monthlyFee"),
      contractStartedAt: form.get("contractStartedAt"),
      status: form.get("status"),
      phone: form.get("phone"),
      prefecture: form.get("prefecture"),
      notes: form.get("notes"),
    };

    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/clients");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "登録に失敗しました");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/clients" className="text-sm text-gray-500 hover:text-gray-700">
          ← 一覧に戻る
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">クライアント新規登録</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-gray-200 bg-white p-6">
        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="事務所名 *" name="firmName" required />
          <Field label="オーナー名 *" name="ownerName" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="slug * (例: yamada-gyosei)" name="slug" required pattern="[a-z0-9\-]+" />
          <Field label="メールアドレス *" name="email" type="email" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="月額（円）*" name="monthlyFee" type="number" required min={0} />
          <Field label="契約開始日 *" name="contractStartedAt" type="date" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="電話番号" name="phone" type="tel" />
          <Field label="都道府県" name="prefecture" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            ステータス
          </label>
          <select
            name="status"
            defaultValue="active"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="active">稼働中</option>
            <option value="paused">停止中</option>
            <option value="churned">解約</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">メモ</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin/clients"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  ...props
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  [key: string]: unknown;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        {...props}
      />
    </div>
  );
}
