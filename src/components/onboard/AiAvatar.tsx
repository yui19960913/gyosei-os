interface AiAvatarProps {
  size?: number
  thinking?: boolean
}

export function AiAvatar({ size = 100, thinking = false }: AiAvatarProps) {
  return (
    <div
      className={`inline-flex items-center justify-center ${thinking ? 'animate-pulse' : ''}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 外側グロー */}
        <circle cx="50" cy="50" r="46" fill="#eff6ff" />
        {/* メインサークル */}
        <circle cx="50" cy="50" r="42" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />

        {/* 頭部パーツ */}
        {/* 左目（外） */}
        <circle cx="34" cy="43" r="7" fill="#1e40af" />
        {/* 左目（白） */}
        <circle cx="36" cy="41" r="2.5" fill="white" />
        {/* 右目（外） */}
        <circle cx="66" cy="43" r="7" fill="#1e40af" />
        {/* 右目（白） */}
        <circle cx="68" cy="41" r="2.5" fill="white" />

        {/* 口 */}
        <path
          d="M 36 63 Q 50 73 64 63"
          stroke="#1e40af"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* アンテナ */}
        <line x1="50" y1="8" x2="50" y2="20" stroke="#3b82f6" strokeWidth="2" />
        <circle cx="50" cy="6" r="3.5" fill="#3b82f6" />

        {/* 頬の光沢 */}
        <ellipse cx="25" cy="55" rx="5" ry="3" fill="#93c5fd" opacity="0.5" />
        <ellipse cx="75" cy="55" rx="5" ry="3" fill="#93c5fd" opacity="0.5" />
      </svg>
    </div>
  )
}
