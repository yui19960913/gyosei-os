export default function LegalPage() {
  return (
    <div style={{
      maxWidth: 760, margin: '0 auto', padding: '64px 24px 120px',
      fontFamily: "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Arial, sans-serif",
      color: '#1f2937', lineHeight: 1.8,
    }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>特定商取引法に基づく表記</h1>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 48 }}>最終更新日：2026年3月18日</p>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        {[
          { label: '販売事業者', value: '【要記入：戸籍上の氏名】' },
          { label: '運営責任者', value: '【要記入：氏名】' },
          { label: '所在地', value: '【要記入：住所】※請求があった場合、遅滞なく開示します' },
          { label: '電話番号', value: '【要記入：電話番号】（受付時間：平日10:00〜18:00）' },
          { label: 'メールアドレス', value: 'support@webseisei.com' },
          { label: 'サービス名', value: 'webseisei.com' },
          { label: 'サービス内容', value: '行政書士向けAIウェブサイト自動生成SaaSサービス' },
          { label: '販売価格', value: '月額プラン：4,980円（税込）\n年額プラン：49,800円（税込）' },
          { label: 'その他費用', value: '別途費用は発生しません（通信費はお客様負担）' },
          { label: '支払方法', value: 'クレジットカード（Visa・Mastercard・American Express・JCB）' },
          { label: '支払時期', value: '申込み時に即時決済。以降は毎月（または毎年）の契約更新日に自動決済' },
          { label: 'サービス提供開始時期', value: '決済完了後、即時ご利用いただけます' },
          { label: '契約期間', value: '1ヶ月（月額プラン）または1年（年額プラン）。期間終了後は自動更新' },
          { label: '解約方法', value: '管理画面またはメール（support@webseisei.com）にて受付。当該契約期間の終了をもって解約成立' },
          { label: '返金について', value: '契約期間途中での解約による残存期間分の返金はいたしません。ただし、運営者の責めに帰すべき事由によりサービスが提供できなかった場合はこの限りではありません' },
          { label: '動作環境', value: 'インターネットに接続されたPCまたはスマートフォン（最新ブラウザ推奨）' },
        ].map(({ label, value }) => (
          <tr key={label} style={{ borderBottom: '1px solid #e5e7eb' }}>
            <td style={{
              padding: '16px 20px 16px 0', verticalAlign: 'top',
              fontWeight: 600, color: '#374151', width: 180, whiteSpace: 'nowrap',
            }}>
              {label}
            </td>
            <td style={{ padding: '16px 0', color: '#4b5563', whiteSpace: 'pre-line' }}>
              {value}
            </td>
          </tr>
        ))}
      </table>
    </div>
  )
}
