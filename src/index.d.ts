export type IconName = 'grid' | 'inbox' | 'network' | 'radio' | 'briefcase' | 'layers' | 'sparkles' | 'check' | 'chart' | 'users' | 'clipboard' | 'landmark' | 'globe' | 'mail' | 'search' | 'arrow' | 'chevron' | 'plus' | 'close' | 'play' | 'clock' | 'settings' | 'book' | 'bell' | 'download' | 'trash';
export const iconPaths: Readonly<Record<IconName, string>>;
export const iconNames: readonly IconName[];
export function icon(name: IconName, options?: { label?: string; size?: number; className?: string }): string;
