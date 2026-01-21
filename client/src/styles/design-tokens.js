/**
 * Design Tokens for Fitness Tracking App
 * Modern dark theme with violet/purple accent colors
 *
 * Usage: Import these tokens throughout your app for consistency
 * These should be your ONLY source of truth for colors, spacing, etc.
 */

export const designTokens = {
  // ============================================================================
  // COLORS
  // ============================================================================

  colors: {
    // PRIMARY: Violet/Purple - Main brand color, primary actions, links
    primary: {
      50: '#faf5ff', // Lightest (rarely used in dark theme)
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7', // ⭐ Main primary color - use for buttons, links, highlights
      600: '#9333ea', // Hover states for primary buttons
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87', // Darkest
    },

    // ACCENT: Cyan/Blue - Secondary actions, progress indicators, info states
    accent: {
      400: '#22d3ee',
      500: '#06b6d4', // ⭐ Main accent color
      600: '#0891b2',
    },

    // SUCCESS: Green - Completed workouts, achievements, positive feedback
    success: {
      400: '#4ade80',
      500: '#22c55e', // ⭐ Main success color
      600: '#16a34a',
    },

    // WARNING: Amber - Rest days, caution, upcoming deadlines
    warning: {
      400: '#fbbf24',
      500: '#f59e0b', // ⭐ Main warning color
      600: '#d97706',
    },

    // ERROR: Red - Failed sets, errors, destructive actions
    error: {
      400: '#f87171',
      500: '#ef4444', // ⭐ Main error color
      600: '#dc2626',
    },

    // NEUTRAL: Grays - Text, backgrounds, borders (MOST USED in dark theme)
    neutral: {
      50: '#fafafa', // Lightest (for text on dark backgrounds)
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3', // ⭐ Muted text, secondary information
      500: '#737373', // ⭐ Placeholder text
      600: '#525252', // ⭐ Tertiary text
      700: '#404040', // ⭐ Borders, dividers
      800: '#262626', // ⭐ Card backgrounds, elevated surfaces
      900: '#171717', // ⭐ Page background, deepest level
      950: '#0a0a0a', // Darkest (rarely used)
    },

    // SEMANTIC MAPPINGS (use these in your components, not the raw colors above)
    // This makes it easy to switch themes later
    background: {
      primary: '#0a0a0a', // Main app background (neutral-950)
      secondary: '#171717', // Slightly elevated (neutral-900)
      tertiary: '#262626', // Cards, modals (neutral-800)
      elevated: '#404040', // Dropdowns, tooltips (neutral-700)
    },

    text: {
      primary: '#fafafa', // Main text (neutral-50)
      secondary: '#a3a3a3', // Less important text (neutral-400)
      tertiary: '#737373', // Muted text (neutral-500)
      disabled: '#525252', // Disabled state (neutral-600)
      inverse: '#0a0a0a', // Text on light backgrounds
    },

    border: {
      primary: '#404040', // Main borders (neutral-700)
      secondary: '#262626', // Subtle borders (neutral-800)
      focus: '#a855f7', // Focus rings (primary-500)
    },

    // SURFACE STATES (for interactive elements)
    surface: {
      base: '#262626', // Default card/surface
      hover: '#404040', // Hover state
      active: '#525252', // Active/pressed state
    },
  },

  // ============================================================================
  // SPACING
  // ============================================================================
  // Use these for margin, padding, gap - NEVER use random values like 13px

  spacing: {
    0: '0px',
    1: '4px', // ⭐ Tiny gaps (icon padding, tight spacing)
    2: '8px', // ⭐ Small gaps (between related items)
    3: '12px', // ⭐ Medium-small (button padding, compact lists)
    4: '16px', // ⭐⭐ MOST COMMON - default gap, card padding
    5: '20px',
    6: '24px', // ⭐ Large gaps (section spacing, card margins)
    8: '32px', // ⭐ Extra large (page margins, major sections)
    10: '40px',
    12: '48px', // ⭐ Huge spacing (between major page sections)
    16: '64px', // Rare (hero sections, landing pages)
    20: '80px',
    24: '96px',
  },

  // ============================================================================
  // TYPOGRAPHY
  // ============================================================================

  typography: {
    // FONT FAMILIES
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"Fira Code", "Courier New", monospace', // For numbers/stats if you want
    },

    // FONT SIZES
    fontSize: {
      xs: '12px', // ⭐ Small labels, captions, footnotes
      sm: '14px', // ⭐ Secondary text, metadata
      base: '16px', // ⭐⭐ DEFAULT - body text, most UI text
      lg: '18px', // ⭐ Emphasized text, subheadings
      xl: '20px', // ⭐ Section titles, small headings
      '2xl': '24px', // ⭐ Page subtitles, card titles
      '3xl': '30px', // ⭐ Page titles
      '4xl': '36px', // Large headings (dashboard welcome, etc.)
      '5xl': '48px', // Hero text (rarely used)
    },

    // FONT WEIGHTS
    fontWeight: {
      normal: '400', // ⭐ Body text
      medium: '500', // ⭐ Slightly emphasized
      semibold: '600', // ⭐ Buttons, labels, important text
      bold: '700', // ⭐ Headings, very important
      extrabold: '800', // Rare (hero text)
    },

    // LINE HEIGHTS
    lineHeight: {
      tight: '1.25', // Headings
      normal: '1.5', // ⭐ Body text
      relaxed: '1.75', // Long-form content
    },

    // LETTER SPACING
    letterSpacing: {
      tight: '-0.025em', // Headings
      normal: '0em', // ⭐ Most text
      wide: '0.025em', // Buttons, labels (optional)
    },
  },

  // ============================================================================
  // BORDER RADIUS
  // ============================================================================
  // Controls how "rounded" things look

  borderRadius: {
    none: '0px',
    sm: '4px', // ⭐ Small elements (badges, small buttons)
    md: '8px', // ⭐⭐ MOST COMMON - cards, inputs, buttons
    lg: '12px', // ⭐ Large cards, modals
    xl: '16px', // Hero cards, special elements
    '2xl': '24px', // Very rounded (rare)
    full: '9999px', // ⭐ Pills, circular avatars
  },

  // ============================================================================
  // SHADOWS
  // ============================================================================
  // For depth/elevation - subtle in dark themes

  shadows: {
    none: 'none',

    // LIGHT SHADOWS (subtle, for dark theme)
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)', // Subtle lift
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)', // ⭐ Cards
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', // ⭐ Modals, dropdowns
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6)', // Large modals
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.7)', // Heavy elevation

    // COLORED GLOW (for primary actions, highlights)
    glow: '0 0 20px rgba(168, 85, 247, 0.4)', // ⭐ Primary glow (violet)
    glowStrong: '0 0 30px rgba(168, 85, 247, 0.6)', // Stronger glow
  },

  // ============================================================================
  // TRANSITIONS
  // ============================================================================
  // Smooth animations

  transitions: {
    fast: '150ms ease-in-out', // ⭐ Hovers, small changes
    normal: '250ms ease-in-out', // ⭐⭐ Most transitions
    slow: '350ms ease-in-out', // Large movements, page transitions
  },

  // ============================================================================
  // Z-INDEX
  // ============================================================================
  // Stacking order (what appears on top)

  zIndex: {
    base: '0',
    dropdown: '1000',
    sticky: '1100',
    modal: '1200',
    popover: '1300',
    toast: '1400',
    tooltip: '1500',
  },

  // ============================================================================
  // BREAKPOINTS
  // ============================================================================
  // Responsive design breakpoints

  breakpoints: {
    sm: '640px', // Mobile landscape
    md: '768px', // Tablet
    lg: '1024px', // ⭐ Desktop
    xl: '1280px', // Large desktop
    '2xl': '1536px', // Extra large
  },
};

// ============================================================================
// USAGE EXAMPLES (DELETE THIS SECTION AFTER READING)
// ============================================================================

/*

EXAMPLE 1: Using in inline styles (React)
-----------------------------------------
import { designTokens as dt } from './design-tokens';

function MyButton() {
  return (
    <button style={{
      backgroundColor: dt.colors.primary[500],
      color: dt.colors.text.primary,
      padding: `${dt.spacing[3]} ${dt.spacing[6]}`,
      borderRadius: dt.borderRadius.md,
      fontSize: dt.typography.fontSize.base,
      fontWeight: dt.typography.fontWeight.semibold,
      transition: dt.transitions.fast,
    }}>
      Click Me
    </button>
  );
}


EXAMPLE 2: Using with Tailwind (if you use it)
-----------------------------------------------
In tailwind.config.js:

const { designTokens } = require('./design-tokens');

module.exports = {
  theme: {
    extend: {
      colors: designTokens.colors,
      spacing: designTokens.spacing,
      fontSize: designTokens.typography.fontSize,
      // ... etc
    }
  }
}

Then use in JSX:
<button className="bg-primary-500 text-white px-6 py-3 rounded-md">
  Click Me
</button>


EXAMPLE 3: Creating a reusable Button component
------------------------------------------------
import { designTokens as dt } from './design-tokens';

function Button({ variant = 'primary', children, ...props }) {
  const styles = {
    primary: {
      backgroundColor: dt.colors.primary[500],
      color: dt.colors.text.primary,
      ':hover': { backgroundColor: dt.colors.primary[600] }
    },
    secondary: {
      backgroundColor: dt.colors.surface.base,
      color: dt.colors.text.primary,
      border: `1px solid ${dt.colors.border.primary}`,
    },
    // ... more variants
  };
  
  return (
    <button 
      style={{
        ...styles[variant],
        padding: `${dt.spacing[3]} ${dt.spacing[6]}`,
        borderRadius: dt.borderRadius.md,
        fontSize: dt.typography.fontSize.base,
        fontWeight: dt.typography.fontWeight.semibold,
        transition: dt.transitions.fast,
      }}
      {...props}
    >
      {children}
    </button>
  );
}


EXAMPLE 4: Card component
--------------------------
function Card({ children }) {
  return (
    <div style={{
      backgroundColor: dt.colors.background.tertiary,
      padding: dt.spacing[6],
      borderRadius: dt.borderRadius.lg,
      border: `1px solid ${dt.colors.border.secondary}`,
      boxShadow: dt.shadows.md,
    }}>
      {children}
    </div>
  );
}

*/

// ============================================================================
// QUICK REFERENCE GUIDE
// ============================================================================

/*

MOST COMMONLY USED VALUES:
--------------------------

COLORS:
- Primary button: colors.primary[500] (#a855f7)
- Text: colors.text.primary (#fafafa)
- Background: colors.background.primary (#0a0a0a)
- Card: colors.background.tertiary (#262626)
- Border: colors.border.primary (#404040)

SPACING:
- Default padding: spacing[4] (16px)
- Section gaps: spacing[6] (24px)
- Button padding: spacing[3] spacing[6] (12px 24px)

TYPOGRAPHY:
- Body text: fontSize.base (16px), fontWeight.normal (400)
- Headings: fontSize.2xl (24px), fontWeight.bold (700)
- Buttons: fontSize.base (16px), fontWeight.semibold (600)

BORDER RADIUS:
- Most things: borderRadius.md (8px)
- Large cards: borderRadius.lg (12px)

SHADOWS:
- Cards: shadows.md
- Modals: shadows.lg

*/

export default designTokens;
