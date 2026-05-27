// 提供商 Logo 映射 — 国产大模型 API 平台常见厂商
const LOGOS: Record<string, string> = {
  // DeepSeek
  DeepSeek: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#4F46E5"/>
    <path d="M8 16C8 12.686 10.686 10 14 10h4c3.314 0 6 2.686 6 6s-2.686 6-6 6h-4c-3.314 0-6-2.686-6-6z" fill="#818CF8"/>
    <path d="M12 16a2 2 0 114 0 2 2 0 01-4 0z" fill="white"/>
  </svg>`,

  // 阿里云 / Qwen
  阿里云: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#FF6A00"/>
    <path d="M6 22V10l10-4 10 4v12l-10 4-10-4z" fill="none" stroke="white" stroke-width="1.5"/>
    <path d="M16 6l8 3.2v13.6l-8 3.2V6z" fill="white" fill-opacity="0.3"/>
    <text x="16" y="20" text-anchor="middle" fill="white" font-size="7" font-weight="bold">云</text>
  </svg>`,

  // 智谱AI
  智谱AI: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#1E1B4B"/>
    <circle cx="16" cy="16" r="8" fill="none" stroke="#8B5CF6" stroke-width="2"/>
    <circle cx="16" cy="16" r="3" fill="#A78BFA"/>
    <path d="M16 8v3M16 21v3M8 16h3M21 16h3" stroke="#8B5CF6" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  // 月之暗面 / Moonshot
  月之暗面: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#0F172A"/>
    <path d="M24 16A8 8 0 118 16a8 8 0 0116 0z" fill="#FACC15"/>
    <path d="M24 16A8 8 0 008 8a8 8 0 0016 8z" fill="none"/>
    <circle cx="14" cy="14" r="1.5" fill="#0F172A" opacity="0.4"/>
  </svg>`,

  // 阶跃星辰
  阶跃星辰: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#065F46"/>
    <path d="M16 6l2.5 7.5L26 16l-7.5 2.5L16 26l-2.5-7.5L6 16l7.5-2.5L16 6z" fill="#34D399"/>
  </svg>`,

  // 零一万物
  零一万物: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#0F766E"/>
    <text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="800" font-family="sans-serif">01</text>
    <text x="16" y="27" text-anchor="middle" fill="#5EEAD4" font-size="5" font-weight="600">万物</text>
  </svg>`,

  // 智源(BAAI)
  "智源(BAAI)": `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#1E3A5F"/>
    <text x="16" y="17" text-anchor="middle" fill="white" font-size="8" font-weight="800" font-family="sans-serif">BAAI</text>
    <rect x="10" y="20" width="12" height="1.5" rx="0.75" fill="#818CF8"/>
  </svg>`,

  // StabilityAI
  StabilityAI: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#831843"/>
    <path d="M16 4l10 8v12H6V12l10-8z" fill="#F472B6" opacity="0.8"/>
    <circle cx="16" cy="16" r="3" fill="#831843"/>
  </svg>`,

  // 硅基流动 (default AI icon)
  _default: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#374151"/>
    <path d="M12 20V12l4 4 4-4v8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
    <circle cx="16" cy="13" r="2" fill="white" opacity="0.6"/>
  </svg>`,
};

interface Props {
  provider: string;
  size?: number;
}

export default function ProviderLogo({ provider, size = 28 }: Props) {
  const svg = LOGOS[provider] || LOGOS._default;

  return (
    <span
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{
        width: size,
        height: size,
        display: "inline-block",
        flexShrink: 0,
        borderRadius: 6,
        overflow: "hidden",
      }}
    />
  );
}
