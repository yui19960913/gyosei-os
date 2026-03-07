import { redirect } from 'next/navigation'

export default async function ClientIndexPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>
}) {
  const { clientSlug } = await params
  redirect(`/admin/clients/${clientSlug}/dashboard`)
}
