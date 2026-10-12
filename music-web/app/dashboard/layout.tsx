import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard', // ผลลัพธ์จะเป็น "Playlists | Chompu" ตาม Template ที่เราตั้งไว้ใน Layout หลัก
}

export default function PlaylistsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}