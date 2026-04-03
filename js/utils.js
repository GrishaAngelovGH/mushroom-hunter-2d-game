/**
 * Utility functions for color manipulation and game logic.
 */

/**
 * Adjusts the brightness of a hex color.
 * @param {string} color - Hex color string (e.g., "#RRGGBB").
 * @param {number} percent - Percentage to lighten (>0) or darken (<0).
 * @returns {string} - Adjusted hex color.
 */
export function shadeColor(color, percent) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    // If we're lightening and the color is very dark, use a minimum additive boost
    if (percent > 0) {
        R = Math.min(255, R + (255 - R) * (percent / 100));
        G = Math.min(255, G + (255 - G) * (percent / 100));
        B = Math.min(255, B + (255 - B) * (percent / 100));
    } else {
        // Multiplicative darkening for consistent feel
        const factor = (100 + percent) / 100;
        R = Math.floor(R * factor);
        G = Math.floor(G * factor);
        B = Math.floor(B * factor);
    }

    R = Math.round(Math.max(0, Math.min(255, R)));
    G = Math.round(Math.max(0, Math.min(255, G)));
    B = Math.round(Math.max(0, Math.min(255, B)));

    const RR = R.toString(16).padStart(2, '0');
    const GG = G.toString(16).padStart(2, '0');
    const BB = B.toString(16).padStart(2, '0');

    return "#" + RR + GG + BB;
}

/**
 * Linearly interpolates between two colors.
 */
export function lerpColor(a, b, amount) {
    const ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (Math.round(rr) << 16) + (Math.round(rg) << 8) + Math.round(rb)).toString(16).slice(1);
}
