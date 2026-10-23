/**
 * MR JOO Official Brand Assets & Artwork Engine
 * High-definition vector SVG assets capturing:
 * 1. MR JOO Founder Avatar (Cyberpunk HUD ring with glowing red optical sensors, golden crown monogram)
 * 2. ENIGMA Level 52 Imperial Sovereign Crest
 * 3. 8 High-Value 3D Holographic Gift Icons
 */

// 1. MR JOO Founder Avatar (Image 2)
export const MR_JOO_FOUNDER_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <!-- Dark Circuit Background Gradient -->
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1c1f26"/>
      <stop offset="70%" stop-color="#0b0e14"/>
      <stop offset="100%" stop-color="#05070a"/>
    </radialGradient>

    <!-- Metallic Ring Gradient -->
    <linearGradient id="metalRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#555a64"/>
      <stop offset="30%" stop-color="#8c93a0"/>
      <stop offset="50%" stop-color="#2a2e38"/>
      <stop offset="75%" stop-color="#727986"/>
      <stop offset="100%" stop-color="#1a1c22"/>
    </linearGradient>

    <!-- Red Cyber Glow Filter -->
    <filter id="redGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Golden Crown Gradient -->
    <linearGradient id="goldCrown" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE082"/>
      <stop offset="40%" stop-color="#FFB300"/>
      <stop offset="70%" stop-color="#FF8F00"/>
      <stop offset="100%" stop-color="#FFA000"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="500" height="500" fill="url(#bgGlow)"/>

  <!-- Circuit lines in background -->
  <path d="M 50 120 H 120 V 60 M 450 120 H 380 V 60 M 50 380 H 120 V 440 M 450 380 H 380 V 440" stroke="#ff2233" stroke-width="2" stroke-opacity="0.3" fill="none"/>
  <circle cx="120" cy="60" r="4" fill="#ff2233" opacity="0.6"/>
  <circle cx="380" cy="60" r="4" fill="#ff2233" opacity="0.6"/>
  <circle cx="120" cy="440" r="4" fill="#ff2233" opacity="0.6"/>
  <circle cx="380" cy="440" r="4" fill="#ff2233" opacity="0.6"/>

  <!-- Central Portrait Head Silhouette with Stylish Curly Hair & Beard -->
  <g id="portrait">
    <!-- Neck & Shoulders Jacket -->
    <path d="M 180 390 C 180 340, 320 340, 320 390 L 350 460 L 150 460 Z" fill="#15171d"/>
    <path d="M 200 360 L 250 420 L 300 360" stroke="#252830" stroke-width="6" fill="#0d0e12"/>

    <!-- Head & Face -->
    <ellipse cx="250" cy="270" rx="70" ry="85" fill="#c99572"/>
    
    <!-- Full Groomed Beard -->
    <path d="M 195 270 C 190 350, 310 350, 305 270 C 295 335, 205 335, 195 270 Z" fill="#1a1412"/>
    <path d="M 215 305 C 235 315, 265 315, 285 305 C 275 320, 225 320, 215 305 Z" fill="#120d0b"/>

    <!-- Eyes & Brows -->
    <path d="M 215 240 Q 230 235 240 240" stroke="#1c1613" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M 260 240 Q 270 235 285 240" stroke="#1c1613" stroke-width="4" stroke-linecap="round" fill="none"/>
    <circle cx="230" cy="248" r="4" fill="#2d1c14"/>
    <circle cx="270" cy="248" r="4" fill="#2d1c14"/>
    <circle cx="231" cy="246" r="1.5" fill="#ffffff"/>
    <circle cx="271" cy="246" r="1.5" fill="#ffffff"/>

    <!-- Nose -->
    <path d="M 250 245 L 246 270 L 254 270" stroke="#a67353" stroke-width="2.5" fill="none" stroke-linecap="round"/>

    <!-- Voluminous Stylish Curly Hair -->
    <path d="M 175 250 C 160 170, 210 130, 250 130 C 290 130, 340 170, 325 250 C 315 190, 185 190, 175 250 Z" fill="#1a1412"/>
    <!-- Curls -->
    <circle cx="210" cy="160" r="26" fill="#1a1412"/>
    <circle cx="250" cy="145" r="28" fill="#1f1816"/>
    <circle cx="290" cy="160" r="26" fill="#1a1412"/>
    <circle cx="185" cy="195" r="22" fill="#140f0e"/>
    <circle cx="315" cy="195" r="22" fill="#140f0e"/>
    <circle cx="235" cy="175" r="24" fill="#241b18"/>
    <circle cx="270" cy="175" r="22" fill="#1a1412"/>
  </g>

  <!-- Heavy Cyberpunk Metallic Ring Frame -->
  <circle cx="250" cy="250" r="195" fill="none" stroke="url(#metalRing)" stroke-width="24"/>
  <circle cx="250" cy="250" r="182" fill="none" stroke="#ff2233" stroke-width="2" stroke-dasharray="16 8" filter="url(#redGlow)"/>
  <circle cx="250" cy="250" r="208" fill="none" stroke="#2a2e38" stroke-width="4"/>

  <!-- Optical Sensors with Glowing Red Lenses (At 10, 2, and 7 o'clock) -->
  <!-- Top Left Sensor -->
  <g transform="translate(100, 160)">
    <circle cx="0" cy="0" r="16" fill="#1a1c22" stroke="url(#metalRing)" stroke-width="4"/>
    <circle cx="0" cy="0" r="9" fill="#ff1122" filter="url(#redGlow)"/>
    <circle cx="0" cy="0" r="4" fill="#ffffff"/>
    <path d="M 12 12 Q 30 40 50 50" stroke="#ff2233" stroke-width="3" fill="none" opacity="0.8"/>
  </g>

  <!-- Top Right Sensor -->
  <g transform="translate(400, 160)">
    <circle cx="0" cy="0" r="16" fill="#1a1c22" stroke="url(#metalRing)" stroke-width="4"/>
    <circle cx="0" cy="0" r="9" fill="#ff1122" filter="url(#redGlow)"/>
    <circle cx="0" cy="0" r="4" fill="#ffffff"/>
    <path d="M -12 12 Q -30 40 -50 50" stroke="#ff2233" stroke-width="3" fill="none" opacity="0.8"/>
  </g>

  <!-- Bottom Left Sensor -->
  <g transform="translate(110, 360)">
    <circle cx="0" cy="0" r="18" fill="#1a1c22" stroke="url(#metalRing)" stroke-width="4"/>
    <circle cx="0" cy="0" r="10" fill="#ff1122" filter="url(#redGlow)"/>
    <circle cx="0" cy="0" r="4" fill="#ffffff"/>
    <path d="M 12 -12 Q 35 -30 45 -50" stroke="#ff2233" stroke-width="3" fill="none" opacity="0.8"/>
  </g>

  <!-- MR JOO Monogram Logo with Crown (Centered at Bottom) -->
  <g transform="translate(250, 415)">
    <!-- Golden Royal Crown -->
    <path d="M -22 -35 L -14 -18 L 0 -30 L 14 -18 L 22 -35 L 18 -12 L -18 -12 Z" fill="url(#goldCrown)" filter="drop-shadow(0 0 6px rgba(255,179,0,0.8))"/>
    <circle cx="-22" cy="-35" r="2.5" fill="#ffffff"/>
    <circle cx="0" cy="-30" r="2.5" fill="#ffffff"/>
    <circle cx="22" cy="-35" r="2.5" fill="#ffffff"/>

    <!-- Metallic Gold "MR" -->
    <text x="0" y="5" font-family="'Impact', 'Arial Black', sans-serif" font-size="28" font-weight="900" fill="url(#goldCrown)" text-anchor="middle" letter-spacing="2">MR</text>

    <!-- Vibrant Red "MR JOO" -->
    <text x="0" y="32" font-family="'Arial Black', sans-serif" font-size="22" font-weight="900" fill="#ff1122" text-anchor="middle" letter-spacing="4" filter="url(#redGlow)">MR JOO</text>
  </g>
</svg>
`)}`;

// 2. ENIGMA Level 52 Sovereign Crest (Image 5)
export const ENIGMA_52_CREST = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <!-- Blue Neon Glow -->
    <filter id="neonBlueGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Red Neon Glow -->
    <filter id="neonRedGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- 3D Gold Font Gradient -->
    <linearGradient id="gold3D" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFF9C4"/>
      <stop offset="30%" stop-color="#FFD54F"/>
      <stop offset="60%" stop-color="#FF8F00"/>
      <stop offset="85%" stop-color="#B26A00"/>
      <stop offset="100%" stop-color="#5D3800"/>
    </linearGradient>

    <radialGradient id="enigmaBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#101426"/>
      <stop offset="60%" stop-color="#080a14"/>
      <stop offset="100%" stop-color="#020306"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="600" height="600" fill="url(#enigmaBg)"/>

  <!-- Left Sapphire Blue Plasma Ring -->
  <path d="M 300 80 A 220 220 0 0 0 300 520" stroke="#00d4ff" stroke-width="12" fill="none" filter="url(#neonBlueGlow)" stroke-linecap="round"/>
  <path d="M 300 110 A 190 190 0 0 0 300 490" stroke="#0077ff" stroke-width="4" fill="none" opacity="0.8"/>

  <!-- Right Crimson Red Plasma Ring -->
  <path d="M 300 80 A 220 220 0 0 1 300 520" stroke="#ff2244" stroke-width="12" fill="none" filter="url(#neonRedGlow)" stroke-linecap="round"/>
  <path d="M 300 110 A 190 190 0 0 1 300 490" stroke="#ff6600" stroke-width="4" fill="none" opacity="0.8"/>

  <!-- Hooded Sovereign Master Silhouette -->
  <g transform="translate(300, 260)">
    <!-- Shoulders & Ornate Golden Armor Cloak -->
    <path d="M -160 160 C -140 60, -80 30, -50 0 L 50 0 C 80 30, 140 60, 160 160 Z" fill="#0d0f17"/>
    <path d="M -150 160 L -70 40 L 0 80 L 70 40 L 150 160" stroke="url(#gold3D)" stroke-width="4" fill="none"/>

    <!-- Mysterious Hood -->
    <path d="M -65 0 C -75 -70, -50 -130, 0 -150 C 50 -130, 75 -70, 65 0 C 50 40, -50 40, -65 0 Z" fill="#07080d" stroke="#1c2030" stroke-width="3"/>
    
    <!-- Shadowed Faceless Mask & Golden Crest -->
    <path d="M -30 -30 L 0 30 L 30 -30 Z" fill="#020305"/>
    <path d="M -18 -40 L 0 -10 L 18 -40" stroke="url(#gold3D)" stroke-width="2.5" fill="none"/>
  </g>

  <!-- Golden 5-Peak Imperial Crown -->
  <g transform="translate(300, 360)">
    <path d="M -35 -40 L -22 -15 L 0 -35 L 22 -15 L 35 -40 L 28 -5 L -28 -5 Z" fill="url(#gold3D)" filter="drop-shadow(0 0 10px rgba(255,193,7,0.9))"/>
    <circle cx="-35" cy="-40" r="3.5" fill="#ffffff"/>
    <circle cx="0" cy="-35" r="3.5" fill="#ffffff"/>
    <circle cx="35" cy="-40" r="3.5" fill="#ffffff"/>
  </g>

  <!-- 3D Embossed ENIGMA 1 / LVL 52 Typography -->
  <g transform="translate(300, 440)">
    <text x="0" y="0" font-family="'Cinzel', 'Times New Roman', serif" font-size="64" font-weight="900" fill="url(#gold3D)" text-anchor="middle" letter-spacing="8" filter="drop-shadow(0 4px 15px rgba(0,0,0,0.9))">ENIGMA</text>
    
    <!-- The Crimson '1' / Level 52 -->
    <text x="175" y="0" font-family="'Cinzel', 'Arial Black', serif" font-size="70" font-weight="900" fill="#ff1a35" text-anchor="middle" filter="url(#neonRedGlow)">1</text>
    
    <!-- Underline Winged Sword Pedestal -->
    <path d="M -180 15 L 180 15" stroke="url(#gold3D)" stroke-width="3"/>
    <polygon points="0,10 -15,22 15,22" fill="url(#gold3D)"/>
    
    <text x="0" y="38" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#00d4ff" text-anchor="middle" letter-spacing="6" filter="url(#neonBlueGlow)">IMPERIAL LEVEL 52</text>
  </g>
</svg>
`)}`;
