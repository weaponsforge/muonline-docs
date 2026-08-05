const SECTIONS = {
  CHARACTERS: 'characters',
  WEAPONS: 'weapons',
  SECRETS: 'secrets',
}

export const CATEGORY = {
  [SECTIONS.CHARACTERS]: 'MU Online Characters',
  [SECTIONS.WEAPONS]: 'MU Online Weapons',
  [SECTIONS.SECRETS]: 'MU Online Secrets / Tips',
}

export function getSection(path: string | undefined) {
  if (!path) return SECTIONS.CHARACTERS
  const [dir] = path.split('/', 1)
  if (!dir) return SECTIONS.CHARACTERS

  return (
    {
      [SECTIONS.WEAPONS]: SECTIONS.WEAPONS,
      [SECTIONS.SECRETS]: SECTIONS.SECRETS,
    }[dir] ?? SECTIONS.CHARACTERS
  )
}
