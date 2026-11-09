/**
 * ============================================================================
 * ZFITs 3D HANGING TAG - MASTER CONFIGURATION
 * ============================================================================
 * All dimensions, physics, and styling variables are centralized here.
 * Edit any values below to customize the tag manually anytime:
 * ============================================================================
 */
export const TAG_CONFIG = {
  // --- 1. CARD DIMENSIONS & SHAPE ---
  cardWidth: 0.54,            // Width of the card in 3D units (default: 0.54)
  cardHeight: 1.08,           // Height of the card in 3D units (default: 1.08)
  cardThickness: 0.0042,      // Physical depth/thickness of paperboard (~0.4 mm)
  bevelThickness: 0.0006,     // Subtle edge bevel thickness
  bevelSize: 0.0006,          // Subtle edge bevel width
  holeRadius: 0.016,          // Punched hole radius
  holeOffsetY: 0.075,         // Distance from top edge to punched hole center

  // --- 2. CARD & BRANDING COLORS ---
  cardBgColor: '#0A0A0C',     // Background cardstock (deep rich luxury matte black)
  cardCoreColor: '#08080A',   // Edge paper core color (solid black core)
  contentColor: '#FFFFFF',    // PURE CRISP WHITE (#FFFFFF) for logo, border, and text

  // --- 3. SUSPENSION CORD CONFIGURATION ---
  stringThickness: 0.0028,    // Delicate thin string radius (default: 0.0028)
  stringColor: '#F5EFE6',     // Warm luxury cream color (unbleached cotton cord)
  stringRoughness: 0.88,      // Matte cotton cord roughness
  stringMetalness: 0.02,      // Cotton non-metallic finish
  ceilingY: 2.15,             // Suspension anchor height at top of the scene
  totalRopeLength: 1.50,      // Full length of rope; card hangs gracefully in optical center

  // --- 4. REAL-WORLD DROP & GRAVITY PHYSICS ---
  dropStartHeight: 2.75,      // Starting height above viewport for initial entrance fall
  gravity: -18.5,             // Realistic gravitational acceleration (m/s²)
  ropeElasticity: 0.65,       // Catch elasticity (rebound bounce when rope extends)
  ropeDamping: 0.94,          // Velocity damping for natural settling

  // --- 5. LIGHTING & RADIANCE ---
  emissiveIntensity: 0.95,    // Keeps pure #FFFFFF logo, border, & text radiant
};

