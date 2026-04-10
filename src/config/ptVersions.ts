// ─────────────────────────────────────────────
// PeopleTools Version Registry
// Covers all actively used PT versions
// ─────────────────────────────────────────────

export interface PTVersion {
  id: string
  label: string
  urlCode: string
  released: string
  status: 'current' | 'supported' | 'legacy'
}

export const PT_VERSIONS: PTVersion[] = [
  { id: '8.62', label: 'PT 8.62', urlCode: 'F75068_01/pt862pbr3', released: '2023', status: 'current'   },
  { id: '8.61', label: 'PT 8.61', urlCode: 'F40044_01/pt861pbr1', released: '2022', status: 'supported' },
  { id: '8.60', label: 'PT 8.60', urlCode: 'E92519_02/pt860pbr2', released: '2021', status: 'supported' },
  { id: '8.59', label: 'PT 8.59', urlCode: 'E66686_01/pt859pbr0', released: '2020', status: 'supported' },
  { id: '8.58', label: 'PT 8.58', urlCode: 'E96709_01/pt858pbr0', released: '2019', status: 'legacy'    },
  { id: '8.57', label: 'PT 8.57', urlCode: 'E87249_01/pt857pbr0', released: '2018', status: 'legacy'    },
]

export const DEFAULT_VERSION = '8.62'

export function getVersionUrlCode(versionId: string): string {
  const v = PT_VERSIONS.find(v => v.id === versionId)
  return v?.urlCode ?? PT_VERSIONS[0].urlCode
}

export function buildOracleUrl(urlCode: string, page: string): string {
  return `https://docs.oracle.com/cd/${urlCode}/eng/pt/tpcd/${page}`
}
