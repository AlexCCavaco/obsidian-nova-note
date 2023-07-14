
export type DISPLAY_TYPES = 'tasks' | 'data';
export const displayData = ['tasks','data'];
export function isDisplay(data:string): data is DISPLAY_TYPES { return displayData.includes(data.toLowerCase()); }
