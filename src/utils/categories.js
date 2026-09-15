export const CATEGORIES = [
  { id: 'cbc', label: 'Complete Blood Count', short: 'CBC' },
  { id: 'lipid', label: 'Lipid Profile', short: 'Lipid' },
  { id: 'liver', label: 'Liver Function', short: 'Liver' },
  { id: 'kidney', label: 'Kidney Function', short: 'Kidney' },
  { id: 'glucose', label: 'Blood Sugar', short: 'Sugar' },
  { id: 'thyroid', label: 'Thyroid Function', short: 'Thyroid' },
  { id: 'vitamins', label: 'Vitamins & Minerals', short: 'Vitamins' },
  { id: 'cardiac', label: 'Cardiac Markers', short: 'Cardiac' },
  { id: 'urine', label: 'Urine Analysis', short: 'Urine' },
  { id: 'electrolytes', label: 'Electrolytes', short: 'Electrolytes' },
  { id: 'hormones', label: 'Hormones', short: 'Hormones' },
  { id: 'inflammation', label: 'Inflammation Markers', short: 'Inflammation' },
  { id: 'other', label: 'Other', short: 'Other' },
]

export function categoryMeta(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
}
