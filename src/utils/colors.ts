export const COLOR_PALETTE = [
    'rgba(51,102,204,0.5)',
    'rgba(220,57,18,0.5)',
    'rgba(255,153,0,0.5)',
    'rgba(16,150,24,0.5)',
    'rgba(153,0,153,0.5)',
    'rgba(0,153,198,0.5)',
    'rgba(221,68,119,0.5)',
    'rgba(102,170,0,0.5)',
    'rgba(184,46,46,0.5)',
    'rgba(49,99,149,0.5)',
    'rgba(153,68,153,0.5)',
    'rgba(34,170,153,0.5)',
    'rgba(170,170,17,0.5)',
    'rgba(102,51,204,0.5)',
    'rgba(230,115,0,0.5)',
    'rgba(139,7,7,0.5)',
    'rgba(101,16,103,0.5)',
    'rgba(50,146,98,0.5)',
    'rgba(85,116,166,0.5)',
    'rgba(59,62,172,0.5)'
];


export function getColorByIndex(index: number): string {
    if (index < COLOR_PALETTE.length) return COLOR_PALETTE[index];
    const hue = (index * 47) % 360;
    return `hsla(${hue}, 70%, 70%, 0.7)`;
}
