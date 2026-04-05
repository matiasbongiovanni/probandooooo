import withPWAInit from "@ducanh2912/next-pwa"

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
})

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placeholder.svg'],
    unoptimized: true,
  },
  env: {
    MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: "https://bgmywsfvehgsuwuumdax.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbXl3c2Z2ZWhnc3V3dXVtZGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTI0NjAsImV4cCI6MjA2NzA2ODQ2MH0.H9z-i3gXu_Sdt3MQvB_YuwcOliUhcM1bOd9EylqA4QQ"
  },
}

export default withPWA(nextConfig)
