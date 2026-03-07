export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">ダッシュボード</h1>
      <p className="text-gray-500 text-sm mb-8">マーケティング活動の概要</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'ページ数',       value: '-', icon: '🖥️' },
          { label: '今月のリード',   value: '-', icon: '👤' },
          { label: 'セッション数',   value: '-', icon: '👁️' },
          { label: '広告キャンペーン', value: '-', icon: '📣' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{card.label}</span>
              <span className="text-xl">{card.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-400">
        データ収集機能は Phase 3 以降で実装予定です。
      </p>
    </div>
  )
}
