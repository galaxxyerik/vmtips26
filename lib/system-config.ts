import { createServiceClient } from '@/lib/supabase/server'

export type SystemConfigKey =
  | 'global_lock'
  | 'emergency_mode'
  | 'disable_submissions'
  | 'maintenance_banner'
  | 'scoring_frozen'

export async function getSystemConfig(): Promise<Record<string, string>> {
  const service = createServiceClient()
  const { data } = await service.from('vmt_system_config').select('key, value')
  return Object.fromEntries((data ?? []).map(r => [r.key, r.value]))
}

export async function setSystemConfig(key: string, value: string, updatedBy: string) {
  const service = createServiceClient()
  await service.from('vmt_system_config').upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
    updated_by: updatedBy,
  })
}

export function isGloballyLocked(config: Record<string, string>): boolean {
  return config['global_lock'] === 'true'
}
