import os

# ─── 1. GYÖKERES player card ──────────────────────────────────────────────────
gyokeres_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" width="360" height="480">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#001B5E"/>
      <stop offset="100%" stop-color="#003999"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFCD00" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#FFCD00" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="card"><rect width="360" height="480" rx="0"/></clipPath>
  </defs>
  <!-- Background -->
  <rect width="360" height="480" fill="url(#bg)"/>
  <!-- Diagonal accent stripe -->
  <polygon points="0,280 360,180 360,480 0,480" fill="#001240" opacity="0.6"/>
  <!-- Yellow top bar -->
  <rect width="360" height="6" fill="#FFCD00"/>
  <!-- Yellow shine overlay -->
  <rect width="360" height="240" fill="url(#shine)"/>
  <!-- Jersey number - huge -->
  <text x="200" y="230" font-family="Arial Black, sans-serif" font-size="220" font-weight="900" fill="#FFCD00" opacity="0.08" text-anchor="middle" dominant-baseline="auto">9</text>
  <!-- Player silhouette - action running pose -->
  <g transform="translate(60,30)" opacity="0.9">
    <!-- head -->
    <ellipse cx="150" cy="55" rx="32" ry="36" fill="#1a3a6b"/>
    <!-- neck -->
    <rect x="140" y="85" width="20" height="18" fill="#1a3a6b"/>
    <!-- body / torso -->
    <path d="M95,103 Q110,98 150,100 Q190,98 205,103 L215,195 L85,195 Z" fill="#1a3a6b"/>
    <!-- left arm raised -->
    <path d="M95,110 Q60,95 42,65" stroke="#1a3a6b" stroke-width="26" stroke-linecap="round" fill="none"/>
    <!-- right arm down -->
    <path d="M205,110 Q230,140 245,175" stroke="#1a3a6b" stroke-width="26" stroke-linecap="round" fill="none"/>
    <!-- left leg stride forward -->
    <path d="M110,193 Q90,250 60,300" stroke="#1a3a6b" stroke-width="28" stroke-linecap="round" fill="none"/>
    <path d="M60,300 Q45,325 30,330" stroke="#1a3a6b" stroke-width="22" stroke-linecap="round" fill="none"/>
    <!-- right leg back -->
    <path d="M170,193 Q185,250 210,300" stroke="#1a3a6b" stroke-width="28" stroke-linecap="round" fill="none"/>
    <path d="M210,300 Q228,325 240,335" stroke="#1a3a6b" stroke-width="22" stroke-linecap="round" fill="none"/>
  </g>
  <!-- Yellow jersey number overlay on silhouette -->
  <text x="182" y="220" font-family="Arial Black, sans-serif" font-size="52" font-weight="900" fill="#FFCD00" text-anchor="middle" opacity="0.5">9</text>
  <!-- Bottom info bar -->
  <rect y="390" width="360" height="90" fill="#FFCD00"/>
  <!-- Player name -->
  <text x="180" y="428" font-family="Arial Black, sans-serif" font-size="28" font-weight="900" fill="#001B5E" text-anchor="middle" letter-spacing="2">GYÖKERES</text>
  <text x="180" y="455" font-family="Arial, sans-serif" font-size="13" fill="#001B5E" text-anchor="middle" letter-spacing="3" opacity="0.7">ANFALL · SVERIGE</text>
  <text x="180" y="472" font-family="Arial, sans-serif" font-size="11" fill="#001B5E" text-anchor="middle" opacity="0.5">SPORTING CP</text>
  <!-- SE flag small -->
  <rect x="14" y="396" width="36" height="24" fill="#005EB8" rx="2"/>
  <rect x="14" y="406" width="36" height="4" fill="#FFCD00"/>
  <rect x="26" y="396" width="4" height="24" fill="#FFCD00"/>
</svg>'''

# ─── 2. ISAK player card ──────────────────────────────────────────────────────
isak_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" width="360" height="480">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a0030"/>
      <stop offset="50%" stop-color="#3d0066"/>
      <stop offset="100%" stop-color="#001B5E"/>
    </linearGradient>
    <linearGradient id="shine2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFCD00" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#FFCD00" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="360" height="480" fill="url(#bg2)"/>
  <polygon points="0,300 360,200 360,480 0,480" fill="#0a0020" opacity="0.7"/>
  <rect width="360" height="6" fill="#FFCD00"/>
  <rect width="360" height="240" fill="url(#shine2)"/>
  <text x="200" y="230" font-family="Arial Black, sans-serif" font-size="220" font-weight="900" fill="#FFCD00" opacity="0.07" text-anchor="middle">7</text>
  <!-- Player silhouette - shooting pose -->
  <g transform="translate(50,20)" opacity="0.9">
    <ellipse cx="165" cy="52" rx="30" ry="34" fill="#1a3a6b"/>
    <rect x="155" y="82" width="20" height="16" fill="#1a3a6b"/>
    <path d="M105,98 Q120,93 165,95 Q200,93 215,98 L222,188 L88,188 Z" fill="#1a3a6b"/>
    <!-- arms - celebration pose both up -->
    <path d="M105,105 Q70,80 50,50" stroke="#1a3a6b" stroke-width="25" stroke-linecap="round" fill="none"/>
    <path d="M215,105 Q250,80 268,50" stroke="#1a3a6b" stroke-width="25" stroke-linecap="round" fill="none"/>
    <!-- legs - stride -->
    <path d="M120,186 Q100,242 75,290" stroke="#1a3a6b" stroke-width="27" stroke-linecap="round" fill="none"/>
    <path d="M75,290 Q60,315 40,322" stroke="#1a3a6b" stroke-width="21" stroke-linecap="round" fill="none"/>
    <path d="M180,186 Q200,242 220,292" stroke="#1a3a6b" stroke-width="27" stroke-linecap="round" fill="none"/>
    <path d="M220,292 Q238,320 252,328" stroke="#1a3a6b" stroke-width="21" stroke-linecap="round" fill="none"/>
  </g>
  <rect y="390" width="360" height="90" fill="#FFCD00"/>
  <text x="180" y="428" font-family="Arial Black, sans-serif" font-size="28" font-weight="900" fill="#001B5E" text-anchor="middle" letter-spacing="2">ISAK</text>
  <text x="180" y="455" font-family="Arial, sans-serif" font-size="13" fill="#001B5E" text-anchor="middle" letter-spacing="3" opacity="0.7">ANFALL · SVERIGE</text>
  <text x="180" y="472" font-family="Arial, sans-serif" font-size="11" fill="#001B5E" text-anchor="middle" opacity="0.5">LIVERPOOL FC</text>
  <rect x="14" y="396" width="36" height="24" fill="#005EB8" rx="2"/>
  <rect x="14" y="406" width="36" height="4" fill="#FFCD00"/>
  <rect x="26" y="396" width="4" height="24" fill="#FFCD00"/>
</svg>'''

# ─── 3. LINDELÖF player card ──────────────────────────────────────────────────
lindelof_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" width="360" height="480">
  <defs>
    <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a1a0a"/>
      <stop offset="50%" stop-color="#003300"/>
      <stop offset="100%" stop-color="#001B5E"/>
    </linearGradient>
  </defs>
  <rect width="360" height="480" fill="url(#bg3)"/>
  <polygon points="0,320 360,220 360,480 0,480" fill="#050f05" opacity="0.7"/>
  <rect width="360" height="6" fill="#FFCD00"/>
  <text x="200" y="230" font-family="Arial Black, sans-serif" font-size="220" font-weight="900" fill="#FFCD00" opacity="0.07" text-anchor="middle">2</text>
  <g transform="translate(60,30)" opacity="0.9">
    <ellipse cx="148" cy="55" rx="30" ry="34" fill="#1a3a6b"/>
    <rect x="138" y="85" width="20" height="16" fill="#1a3a6b"/>
    <path d="M95,101 Q115,96 148,98 Q185,96 200,101 L208,192 L85,192 Z" fill="#1a3a6b"/>
    <path d="M95,108 Q65,125 48,158" stroke="#1a3a6b" stroke-width="25" stroke-linecap="round" fill="none"/>
    <path d="M200,108 Q230,125 246,158" stroke="#1a3a6b" stroke-width="25" stroke-linecap="round" fill="none"/>
    <path d="M112,190 Q96,248 78,298" stroke="#1a3a6b" stroke-width="27" stroke-linecap="round" fill="none"/>
    <path d="M78,298 Q62,322 44,328" stroke="#1a3a6b" stroke-width="21" stroke-linecap="round" fill="none"/>
    <path d="M172,190 Q188,248 208,298" stroke="#1a3a6b" stroke-width="27" stroke-linecap="round" fill="none"/>
    <path d="M208,298 Q226,322 240,330" stroke="#1a3a6b" stroke-width="21" stroke-linecap="round" fill="none"/>
  </g>
  <rect y="390" width="360" height="90" fill="#FFCD00"/>
  <text x="180" y="428" font-family="Arial Black, sans-serif" font-size="22" font-weight="900" fill="#001B5E" text-anchor="middle" letter-spacing="1">NILSSON LINDELÖF</text>
  <text x="180" y="455" font-family="Arial, sans-serif" font-size="13" fill="#001B5E" text-anchor="middle" letter-spacing="3" opacity="0.7">FÖRSVAR · SVERIGE</text>
  <text x="180" y="472" font-family="Arial, sans-serif" font-size="11" fill="#001B5E" text-anchor="middle" opacity="0.5">MAN UNITED</text>
  <rect x="14" y="396" width="36" height="24" fill="#005EB8" rx="2"/>
  <rect x="14" y="406" width="36" height="4" fill="#FFCD00"/>
  <rect x="26" y="396" width="4" height="24" fill="#FFCD00"/>
</svg>'''

# ─── 4. BERGVALL player card ──────────────────────────────────────────────────
bergvall_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" width="360" height="480">
  <defs>
    <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#001B5E"/>
      <stop offset="60%" stop-color="#002855"/>
      <stop offset="100%" stop-color="#111111"/>
    </linearGradient>
  </defs>
  <rect width="360" height="480" fill="url(#bg4)"/>
  <polygon points="0,300 360,200 360,480 0,480" fill="#000a20" opacity="0.6"/>
  <rect width="360" height="6" fill="#FFCD00"/>
  <text x="200" y="230" font-family="Arial Black, sans-serif" font-size="220" font-weight="900" fill="#FFCD00" opacity="0.07" text-anchor="middle">8</text>
  <g transform="translate(60,30)" opacity="0.9">
    <ellipse cx="150" cy="53" rx="28" ry="32" fill="#1a3a6b"/>
    <rect x="140" y="81" width="20" height="16" fill="#1a3a6b"/>
    <path d="M98,97 Q118,92 150,94 Q183,92 198,97 L205,188 L88,188 Z" fill="#1a3a6b"/>
    <path d="M98,104 Q72,88 58,62" stroke="#1a3a6b" stroke-width="23" stroke-linecap="round" fill="none"/>
    <path d="M198,104 Q224,130 238,162" stroke="#1a3a6b" stroke-width="23" stroke-linecap="round" fill="none"/>
    <path d="M115,186 Q98,244 80,294" stroke="#1a3a6b" stroke-width="26" stroke-linecap="round" fill="none"/>
    <path d="M80,294 Q64,318 46,325" stroke="#1a3a6b" stroke-width="20" stroke-linecap="round" fill="none"/>
    <path d="M172,186 Q189,244 208,294" stroke="#1a3a6b" stroke-width="26" stroke-linecap="round" fill="none"/>
    <path d="M208,294 Q226,318 240,326" stroke="#1a3a6b" stroke-width="20" stroke-linecap="round" fill="none"/>
  </g>
  <rect y="390" width="360" height="90" fill="#FFCD00"/>
  <text x="180" y="428" font-family="Arial Black, sans-serif" font-size="28" font-weight="900" fill="#001B5E" text-anchor="middle" letter-spacing="2">BERGVALL</text>
  <text x="180" y="455" font-family="Arial, sans-serif" font-size="13" fill="#001B5E" text-anchor="middle" letter-spacing="3" opacity="0.7">MITTFÄLT · SVERIGE</text>
  <text x="180" y="472" font-family="Arial, sans-serif" font-size="11" fill="#001B5E" text-anchor="middle" opacity="0.5">TOTTENHAM HOTSPUR</text>
  <rect x="14" y="396" width="36" height="24" fill="#005EB8" rx="2"/>
  <rect x="14" y="406" width="36" height="4" fill="#FFCD00"/>
  <rect x="26" y="396" width="4" height="24" fill="#FFCD00"/>
</svg>'''

# ─── 5. ELANGA player card ──────────────────────────────────────────────────────
elanga_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" width="360" height="480">
  <defs>
    <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a0000"/>
      <stop offset="50%" stop-color="#3d0000"/>
      <stop offset="100%" stop-color="#001B5E"/>
    </linearGradient>
  </defs>
  <rect width="360" height="480" fill="url(#bg5)"/>
  <polygon points="0,310 360,210 360,480 0,480" fill="#0a0000" opacity="0.6"/>
  <rect width="360" height="6" fill="#FFCD00"/>
  <text x="200" y="230" font-family="Arial Black, sans-serif" font-size="220" font-weight="900" fill="#FFCD00" opacity="0.07" text-anchor="middle">11</text>
  <g transform="translate(60,30)" opacity="0.9">
    <ellipse cx="150" cy="52" rx="29" ry="33" fill="#1a3a6b"/>
    <rect x="140" y="81" width="20" height="16" fill="#1a3a6b"/>
    <path d="M97,97 Q117,92 150,94 Q184,92 200,97 L208,190 L86,190 Z" fill="#1a3a6b"/>
    <path d="M97,104 Q68,82 52,50" stroke="#1a3a6b" stroke-width="24" stroke-linecap="round" fill="none"/>
    <path d="M200,104 Q226,126 242,148" stroke="#1a3a6b" stroke-width="24" stroke-linecap="round" fill="none"/>
    <path d="M113,188 Q94,246 72,296" stroke="#1a3a6b" stroke-width="27" stroke-linecap="round" fill="none"/>
    <path d="M72,296 Q56,320 38,327" stroke="#1a3a6b" stroke-width="21" stroke-linecap="round" fill="none"/>
    <path d="M174,188 Q195,246 218,296" stroke="#1a3a6b" stroke-width="27" stroke-linecap="round" fill="none"/>
    <path d="M218,296 Q237,320 252,328" stroke="#1a3a6b" stroke-width="21" stroke-linecap="round" fill="none"/>
  </g>
  <rect y="390" width="360" height="90" fill="#FFCD00"/>
  <text x="180" y="428" font-family="Arial Black, sans-serif" font-size="28" font-weight="900" fill="#001B5E" text-anchor="middle" letter-spacing="2">ELANGA</text>
  <text x="180" y="455" font-family="Arial, sans-serif" font-size="13" fill="#001B5E" text-anchor="middle" letter-spacing="3" opacity="0.7">YTTER · SVERIGE</text>
  <text x="180" y="472" font-family="Arial, sans-serif" font-size="11" fill="#001B5E" text-anchor="middle" opacity="0.5">NEWCASTLE UNITED</text>
  <rect x="14" y="396" width="36" height="24" fill="#005EB8" rx="2"/>
  <rect x="14" y="406" width="36" height="4" fill="#FFCD00"/>
  <rect x="26" y="396" width="4" height="24" fill="#FFCD00"/>
</svg>'''

# ─── 6. STADIUM BACKGROUND (wide atmospheric for hero/onboarding) ──────────────
stadium_bg_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 600" width="1440" height="600">
  <defs>
    <radialGradient id="skyGlow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#1a3a6b" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#000510" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="pitchGlow" cx="50%" cy="85%" r="40%">
      <stop offset="0%" stop-color="#0a3a0a" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="light1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFCD00" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#FFCD00" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Night sky background -->
  <rect width="1440" height="600" fill="#000510"/>
  <rect width="1440" height="600" fill="url(#skyGlow)"/>
  
  <!-- Stars -->
  <circle cx="120" cy="40" r="1.2" fill="white" opacity="0.6"/>
  <circle cx="280" cy="25" r="0.8" fill="white" opacity="0.5"/>
  <circle cx="450" cy="55" r="1" fill="white" opacity="0.4"/>
  <circle cx="680" cy="20" r="1.5" fill="white" opacity="0.5"/>
  <circle cx="900" cy="40" r="1" fill="white" opacity="0.6"/>
  <circle cx="1100" cy="30" r="1.2" fill="white" opacity="0.4"/>
  <circle cx="1300" cy="50" r="0.8" fill="white" opacity="0.5"/>
  <circle cx="1380" cy="15" r="1" fill="white" opacity="0.6"/>
  <circle cx="200" cy="70" r="0.6" fill="white" opacity="0.3"/>
  <circle cx="560" cy="35" r="0.8" fill="white" opacity="0.4"/>
  <circle cx="820" cy="60" r="1" fill="white" opacity="0.3"/>
  <circle cx="1050" cy="75" r="0.6" fill="white" opacity="0.4"/>
  <circle cx="1240" cy="20" r="1.2" fill="white" opacity="0.5"/>
  
  <!-- Stadium outer arch left -->
  <ellipse cx="320" cy="580" rx="480" ry="520" fill="none" stroke="#0e2d5e" stroke-width="3" opacity="0.4"/>
  <!-- Stadium outer arch right -->
  <ellipse cx="1120" cy="580" rx="480" ry="520" fill="none" stroke="#0e2d5e" stroke-width="3" opacity="0.4"/>
  
  <!-- Stadium roof/canopy left -->
  <path d="M0,120 Q180,80 360,95 Q480,105 580,115 L580,145 Q480,135 360,125 Q180,110 0,150 Z" fill="#0e1f3d" opacity="0.95"/>
  <!-- Stadium roof/canopy right -->
  <path d="M1440,120 Q1260,80 1080,95 Q960,105 860,115 L860,145 Q960,135 1080,125 Q1260,110 1440,150 Z" fill="#0e1f3d" opacity="0.95"/>
  
  <!-- Floodlights -->
  <rect x="110" y="70" width="14" height="60" fill="#1a2d50"/>
  <rect x="90" y="65" width="54" height="12" fill="#2a4070" rx="2"/>
  <ellipse cx="117" cy="61" rx="35" ry="8" fill="#FFCD00" opacity="0.4"/>
  
  <rect x="1316" y="70" width="14" height="60" fill="#1a2d50"/>
  <rect x="1296" y="65" width="54" height="12" fill="#2a4070" rx="2"/>
  <ellipse cx="1323" cy="61" rx="35" ry="8" fill="#FFCD00" opacity="0.4"/>
  
  <!-- Left floodlight beam -->
  <polygon points="90,73 0,200 0,380 270,140" fill="#FFCD00" opacity="0.025"/>
  <!-- Right floodlight beam -->
  <polygon points="1350,73 1440,200 1440,380 1170,140" fill="#FFCD00" opacity="0.025"/>
  
  <!-- Crowd stands left (rows of silhouettes) -->
  <g opacity="0.85">
    <!-- Row 1 - top, darkest -->
    <rect x="0" y="152" width="580" height="20" fill="#0a1a30" opacity="0.9"/>
    <!-- Crowd heads row 1 -->
    <g fill="#162840">
      <ellipse cx="15" cy="153" rx="7" ry="6"/> <ellipse cx="32" cy="151" rx="7" ry="6"/> <ellipse cx="49" cy="154" rx="7" ry="6"/> <ellipse cx="66" cy="152" rx="7" ry="6"/> <ellipse cx="83" cy="153" rx="7" ry="6"/> <ellipse cx="100" cy="151" rx="7" ry="6"/> <ellipse cx="117" cy="154" rx="7" ry="6"/> <ellipse cx="134" cy="152" rx="7" ry="6"/> <ellipse cx="151" cy="153" rx="7" ry="6"/> <ellipse cx="168" cy="151" rx="7" ry="6"/> <ellipse cx="185" cy="154" rx="7" ry="6"/> <ellipse cx="202" cy="152" rx="7" ry="6"/> <ellipse cx="219" cy="153" rx="7" ry="6"/> <ellipse cx="236" cy="151" rx="7" ry="6"/> <ellipse cx="253" cy="154" rx="7" ry="6"/> <ellipse cx="270" cy="152" rx="7" ry="6"/> <ellipse cx="287" cy="153" rx="7" ry="6"/> <ellipse cx="304" cy="151" rx="7" ry="6"/> <ellipse cx="321" cy="154" rx="7" ry="6"/> <ellipse cx="338" cy="152" rx="7" ry="6"/> <ellipse cx="355" cy="153" rx="7" ry="6"/> <ellipse cx="372" cy="151" rx="7" ry="6"/> <ellipse cx="389" cy="154" rx="7" ry="6"/> <ellipse cx="406" cy="152" rx="7" ry="6"/> <ellipse cx="423" cy="153" rx="7" ry="6"/> <ellipse cx="440" cy="151" rx="7" ry="6"/> <ellipse cx="457" cy="154" rx="7" ry="6"/> <ellipse cx="474" cy="152" rx="7" ry="6"/> <ellipse cx="491" cy="153" rx="7" ry="6"/> <ellipse cx="508" cy="151" rx="7" ry="6"/> <ellipse cx="525" cy="154" rx="7" ry="6"/> <ellipse cx="542" cy="152" rx="7" ry="6"/> <ellipse cx="559" cy="153" rx="7" ry="6"/>
    </g>
    <!-- Row 2 -->
    <rect x="0" y="171" width="580" height="22" fill="#0c2040" opacity="0.9"/>
    <g fill="#1e3855">
      <ellipse cx="15" cy="172" rx="8" ry="7"/> <ellipse cx="34" cy="170" rx="8" ry="7"/> <ellipse cx="53" cy="173" rx="8" ry="7"/> <ellipse cx="72" cy="171" rx="8" ry="7"/> <ellipse cx="91" cy="172" rx="8" ry="7"/> <ellipse cx="110" cy="170" rx="8" ry="7"/> <ellipse cx="129" cy="173" rx="8" ry="7"/> <ellipse cx="148" cy="171" rx="8" ry="7"/> <ellipse cx="167" cy="172" rx="8" ry="7"/> <ellipse cx="186" cy="170" rx="8" ry="7"/> <ellipse cx="205" cy="173" rx="8" ry="7"/> <ellipse cx="224" cy="171" rx="8" ry="7"/> <ellipse cx="243" cy="172" rx="8" ry="7"/> <ellipse cx="262" cy="170" rx="8" ry="7"/> <ellipse cx="281" cy="173" rx="8" ry="7"/> <ellipse cx="300" cy="171" rx="8" ry="7"/> <ellipse cx="319" cy="172" rx="8" ry="7"/> <ellipse cx="338" cy="170" rx="8" ry="7"/> <ellipse cx="357" cy="173" rx="8" ry="7"/> <ellipse cx="376" cy="171" rx="8" ry="7"/> <ellipse cx="395" cy="172" rx="8" ry="7"/> <ellipse cx="414" cy="170" rx="8" ry="7"/> <ellipse cx="433" cy="173" rx="8" ry="7"/> <ellipse cx="452" cy="171" rx="8" ry="7"/> <ellipse cx="471" cy="172" rx="8" ry="7"/> <ellipse cx="490" cy="170" rx="8" ry="7"/> <ellipse cx="509" cy="173" rx="8" ry="7"/> <ellipse cx="528" cy="171" rx="8" ry="7"/> <ellipse cx="547" cy="172" rx="8" ry="7"/> <ellipse cx="566" cy="170" rx="8" ry="7"/>
    </g>
    <!-- Row 3 with Swedish flag color fans -->
    <rect x="0" y="192" width="580" height="24" fill="#0e2848" opacity="0.9"/>
    <g fill="#2a4a6a">
      <ellipse cx="15" cy="193" rx="9" ry="8"/> <ellipse cx="36" cy="191" rx="9" ry="8"/> <ellipse cx="57" cy="194" rx="9" ry="8"/> <ellipse cx="78" cy="192" rx="9" ry="8"/> <ellipse cx="99" cy="193" rx="9" ry="8"/> <ellipse cx="120" cy="191" rx="9" ry="8"/> <ellipse cx="141" cy="194" rx="9" ry="8"/> <ellipse cx="162" cy="192" rx="9" ry="8"/> <ellipse cx="183" cy="193" rx="9" ry="8"/> <ellipse cx="204" cy="191" rx="9" ry="8"/> <ellipse cx="225" cy="194" rx="9" ry="8"/> <ellipse cx="246" cy="192" rx="9" ry="8"/> <ellipse cx="267" cy="193" rx="9" ry="8"/> <ellipse cx="288" cy="191" rx="9" ry="8"/> <ellipse cx="309" cy="194" rx="9" ry="8"/> <ellipse cx="330" cy="192" rx="9" ry="8"/> <ellipse cx="351" cy="193" rx="9" ry="8"/> <ellipse cx="372" cy="191" rx="9" ry="8"/> <ellipse cx="393" cy="194" rx="9" ry="8"/> <ellipse cx="414" cy="192" rx="9" ry="8"/> <ellipse cx="435" cy="193" rx="9" ry="8"/> <ellipse cx="456" cy="191" rx="9" ry="8"/> <ellipse cx="477" cy="194" rx="9" ry="8"/> <ellipse cx="498" cy="192" rx="9" ry="8"/> <ellipse cx="519" cy="193" rx="9" ry="8"/> <ellipse cx="540" cy="191" rx="9" ry="8"/> <ellipse cx="561" cy="194" rx="9" ry="8"/>
    </g>
    <!-- Swedish fans yellow dots row 3 -->
    <g fill="#FFCD00" opacity="0.6">
      <ellipse cx="78" cy="192" rx="9" ry="8"/> <ellipse cx="120" cy="191" rx="9" ry="8"/> <ellipse cx="204" cy="193" rx="9" ry="8"/> <ellipse cx="267" cy="192" rx="9" ry="8"/> <ellipse cx="330" cy="191" rx="9" ry="8"/> <ellipse cx="414" cy="193" rx="9" ry="8"/> <ellipse cx="477" cy="192" rx="9" ry="8"/>
    </g>
  </g>
  
  <!-- Crowd stands right (mirror) -->
  <g opacity="0.85">
    <rect x="860" y="152" width="580" height="20" fill="#0a1a30" opacity="0.9"/>
    <g fill="#162840">
      <ellipse cx="875" cy="153" rx="7" ry="6"/> <ellipse cx="892" cy="151" rx="7" ry="6"/> <ellipse cx="909" cy="154" rx="7" ry="6"/> <ellipse cx="926" cy="152" rx="7" ry="6"/> <ellipse cx="943" cy="153" rx="7" ry="6"/> <ellipse cx="960" cy="151" rx="7" ry="6"/> <ellipse cx="977" cy="154" rx="7" ry="6"/> <ellipse cx="994" cy="152" rx="7" ry="6"/> <ellipse cx="1011" cy="153" rx="7" ry="6"/> <ellipse cx="1028" cy="151" rx="7" ry="6"/> <ellipse cx="1045" cy="154" rx="7" ry="6"/> <ellipse cx="1062" cy="152" rx="7" ry="6"/> <ellipse cx="1079" cy="153" rx="7" ry="6"/> <ellipse cx="1096" cy="151" rx="7" ry="6"/> <ellipse cx="1113" cy="154" rx="7" ry="6"/> <ellipse cx="1130" cy="152" rx="7" ry="6"/> <ellipse cx="1147" cy="153" rx="7" ry="6"/> <ellipse cx="1164" cy="151" rx="7" ry="6"/> <ellipse cx="1181" cy="154" rx="7" ry="6"/> <ellipse cx="1198" cy="152" rx="7" ry="6"/> <ellipse cx="1215" cy="153" rx="7" ry="6"/> <ellipse cx="1232" cy="151" rx="7" ry="6"/> <ellipse cx="1249" cy="154" rx="7" ry="6"/> <ellipse cx="1266" cy="152" rx="7" ry="6"/> <ellipse cx="1283" cy="153" rx="7" ry="6"/> <ellipse cx="1300" cy="151" rx="7" ry="6"/> <ellipse cx="1317" cy="154" rx="7" ry="6"/> <ellipse cx="1334" cy="152" rx="7" ry="6"/> <ellipse cx="1351" cy="153" rx="7" ry="6"/> <ellipse cx="1368" cy="151" rx="7" ry="6"/> <ellipse cx="1385" cy="154" rx="7" ry="6"/> <ellipse cx="1402" cy="152" rx="7" ry="6"/> <ellipse cx="1419" cy="153" rx="7" ry="6"/>
    </g>
    <rect x="860" y="171" width="580" height="22" fill="#0c2040" opacity="0.9"/>
    <g fill="#1e3855">
      <ellipse cx="875" cy="172" rx="8" ry="7"/> <ellipse cx="894" cy="170" rx="8" ry="7"/> <ellipse cx="913" cy="173" rx="8" ry="7"/> <ellipse cx="932" cy="171" rx="8" ry="7"/> <ellipse cx="951" cy="172" rx="8" ry="7"/> <ellipse cx="970" cy="170" rx="8" ry="7"/> <ellipse cx="989" cy="173" rx="8" ry="7"/> <ellipse cx="1008" cy="171" rx="8" ry="7"/> <ellipse cx="1027" cy="172" rx="8" ry="7"/> <ellipse cx="1046" cy="170" rx="8" ry="7"/> <ellipse cx="1065" cy="173" rx="8" ry="7"/> <ellipse cx="1084" cy="171" rx="8" ry="7"/> <ellipse cx="1103" cy="172" rx="8" ry="7"/> <ellipse cx="1122" cy="170" rx="8" ry="7"/> <ellipse cx="1141" cy="173" rx="8" ry="7"/> <ellipse cx="1160" cy="171" rx="8" ry="7"/> <ellipse cx="1179" cy="172" rx="8" ry="7"/> <ellipse cx="1198" cy="170" rx="8" ry="7"/> <ellipse cx="1217" cy="173" rx="8" ry="7"/> <ellipse cx="1236" cy="171" rx="8" ry="7"/> <ellipse cx="1255" cy="172" rx="8" ry="7"/> <ellipse cx="1274" cy="170" rx="8" ry="7"/> <ellipse cx="1293" cy="173" rx="8" ry="7"/> <ellipse cx="1312" cy="171" rx="8" ry="7"/> <ellipse cx="1331" cy="172" rx="8" ry="7"/> <ellipse cx="1350" cy="170" rx="8" ry="7"/> <ellipse cx="1369" cy="173" rx="8" ry="7"/> <ellipse cx="1388" cy="171" rx="8" ry="7"/> <ellipse cx="1407" cy="172" rx="8" ry="7"/> <ellipse cx="1426" cy="170" rx="8" ry="7"/>
    </g>
    <rect x="860" y="192" width="580" height="24" fill="#0e2848" opacity="0.9"/>
    <g fill="#2a4a6a">
      <ellipse cx="875" cy="193" rx="9" ry="8"/> <ellipse cx="896" cy="191" rx="9" ry="8"/> <ellipse cx="917" cy="194" rx="9" ry="8"/> <ellipse cx="938" cy="192" rx="9" ry="8"/> <ellipse cx="959" cy="193" rx="9" ry="8"/> <ellipse cx="980" cy="191" rx="9" ry="8"/> <ellipse cx="1001" cy="194" rx="9" ry="8"/> <ellipse cx="1022" cy="192" rx="9" ry="8"/> <ellipse cx="1043" cy="193" rx="9" ry="8"/> <ellipse cx="1064" cy="191" rx="9" ry="8"/> <ellipse cx="1085" cy="194" rx="9" ry="8"/> <ellipse cx="1106" cy="192" rx="9" ry="8"/> <ellipse cx="1127" cy="193" rx="9" ry="8"/> <ellipse cx="1148" cy="191" rx="9" ry="8"/> <ellipse cx="1169" cy="194" rx="9" ry="8"/> <ellipse cx="1190" cy="192" rx="9" ry="8"/> <ellipse cx="1211" cy="193" rx="9" ry="8"/> <ellipse cx="1232" cy="191" rx="9" ry="8"/> <ellipse cx="1253" cy="194" rx="9" ry="8"/> <ellipse cx="1274" cy="192" rx="9" ry="8"/> <ellipse cx="1295" cy="193" rx="9" ry="8"/> <ellipse cx="1316" cy="191" rx="9" ry="8"/> <ellipse cx="1337" cy="194" rx="9" ry="8"/> <ellipse cx="1358" cy="192" rx="9" ry="8"/> <ellipse cx="1379" cy="193" rx="9" ry="8"/> <ellipse cx="1400" cy="191" rx="9" ry="8"/> <ellipse cx="1421" cy="194" rx="9" ry="8"/>
    </g>
    <g fill="#FFCD00" opacity="0.6">
      <ellipse cx="938" cy="192" rx="9" ry="8"/> <ellipse cx="980" cy="191" rx="9" ry="8"/> <ellipse cx="1064" cy="193" rx="9" ry="8"/> <ellipse cx="1148" cy="192" rx="9" ry="8"/> <ellipse cx="1253" cy="191" rx="9" ry="8"/> <ellipse cx="1316" cy="193" rx="9" ry="8"/> <ellipse cx="1400" cy="192" rx="9" ry="8"/>
    </g>
  </g>
  
  <!-- Pitch - the green rectangle below stands -->
  <rect x="0" y="215" width="1440" height="385" fill="#001a00"/>
  <rect width="1440" height="385" y="215" fill="url(#pitchGlow)"/>
  
  <!-- Pitch markings -->
  <rect x="180" y="240" width="1080" height="300" fill="none" stroke="#0f3f0f" stroke-width="2.5"/>
  <line x1="720" y1="240" x2="720" y2="540" stroke="#0f3f0f" stroke-width="2.5"/>
  <ellipse cx="720" cy="390" rx="90" ry="75" fill="none" stroke="#0f3f0f" stroke-width="2.5"/>
  <circle cx="720" cy="390" r="4" fill="#0f3f0f"/>
  <!-- Penalty areas -->
  <rect x="180" y="300" width="180" height="180" fill="none" stroke="#0f3f0f" stroke-width="2.5"/>
  <rect x="1080" y="300" width="180" height="180" fill="none" stroke="#0f3f0f" stroke-width="2.5"/>
  <!-- 6-yard boxes -->
  <rect x="180" y="345" width="70" height="90" fill="none" stroke="#0f3f0f" stroke-width="2"/>
  <rect x="1190" y="345" width="70" height="90" fill="none" stroke="#0f3f0f" stroke-width="2"/>
  
  <!-- Floodlight glow on pitch -->
  <ellipse cx="400" cy="390" rx="300" ry="200" fill="#FFCD00" opacity="0.015"/>
  <ellipse cx="1040" cy="390" rx="300" ry="200" fill="#FFCD00" opacity="0.015"/>
  
  <!-- Bottom fade to dark -->
  <rect x="0" y="480" width="1440" height="120" fill="url(#bottomFade)" opacity="1"/>
  <defs>
    <linearGradient id="bottomFade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.8"/>
    </linearGradient>
  </defs>
</svg>'''

# ─── 7. WORLD CUP TROPHY SVG ──────────────────────────────────────────────────
trophy_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE566"/>
      <stop offset="25%" stop-color="#FFCD00"/>
      <stop offset="50%" stop-color="#D4A000"/>
      <stop offset="75%" stop-color="#FFCD00"/>
      <stop offset="100%" stop-color="#B8860B"/>
    </linearGradient>
    <linearGradient id="goldSheen" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#B8860B"/>
      <stop offset="30%" stop-color="#FFCD00"/>
      <stop offset="60%" stop-color="#FFE566"/>
      <stop offset="100%" stop-color="#D4A000"/>
    </linearGradient>
    <radialGradient id="baseGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFCD00" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#FFCD00" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  
  <!-- Background glow -->
  <ellipse cx="150" cy="320" rx="120" ry="60" fill="url(#baseGlow)"/>
  
  <!-- Trophy cup body -->
  <path d="M85,50 Q80,45 80,40 Q80,30 100,25 Q130,18 150,18 Q170,18 200,25 Q220,30 220,40 Q220,45 215,50 L205,140 Q200,165 180,175 Q165,182 150,182 Q135,182 120,175 Q100,165 95,140 Z" fill="url(#gold)" filter="url(#glow)"/>
  
  <!-- Trophy cup rim highlight -->
  <ellipse cx="150" cy="50" rx="67" ry="15" fill="none" stroke="#FFE566" stroke-width="3" opacity="0.8"/>
  <ellipse cx="150" cy="50" rx="65" ry="13" fill="#FFE566" opacity="0.1"/>
  
  <!-- Cup interior shadow -->
  <path d="M88,55 Q88,45 150,42 Q212,45 212,55 L208,100 Q205,85 150,82 Q95,85 92,100 Z" fill="#B8860B" opacity="0.35"/>
  
  <!-- Trophy handles left -->
  <path d="M88,80 Q55,75 48,100 Q42,125 55,140 Q65,152 88,148" fill="none" stroke="url(#goldSheen)" stroke-width="14" stroke-linecap="round"/>
  <path d="M88,80 Q55,75 48,100 Q42,125 55,140 Q65,152 88,148" fill="none" stroke="#FFE566" stroke-width="4" stroke-linecap="round" opacity="0.4"/>
  
  <!-- Trophy handles right -->
  <path d="M212,80 Q245,75 252,100 Q258,125 245,140 Q235,152 212,148" fill="none" stroke="url(#goldSheen)" stroke-width="14" stroke-linecap="round"/>
  <path d="M212,80 Q245,75 252,100 Q258,125 245,140 Q235,152 212,148" fill="none" stroke="#FFE566" stroke-width="4" stroke-linecap="round" opacity="0.4"/>
  
  <!-- World globe at top of trophy -->
  <circle cx="150" cy="38" r="22" fill="url(#gold)" filter="url(#glow)"/>
  <circle cx="150" cy="38" r="20" fill="none" stroke="#B8860B" stroke-width="1.5" opacity="0.6"/>
  <!-- Continents suggestion on globe -->
  <path d="M138,28 Q144,24 152,26 Q158,28 160,34 Q156,38 150,38 Q142,36 138,28 Z" fill="#B8860B" opacity="0.5"/>
  <path d="M155,40 Q160,36 165,40 Q163,46 157,48 Q153,44 155,40 Z" fill="#B8860B" opacity="0.5"/>
  <ellipse cx="150" cy="38" r="22" fill="none" stroke="#FFE566" stroke-width="2" opacity="0.3"/>
  
  <!-- Trophy stem -->
  <path d="M128,182 L122,220 L178,220 L172,182 Z" fill="url(#gold)"/>
  <path d="M122,220 L108,250 L192,250 L178,220 Z" fill="url(#goldSheen)"/>
  <rect x="108" y="248" width="84" height="8" fill="#D4A000" rx="2"/>
  
  <!-- Trophy base platform (wide) -->
  <path d="M72,256 Q72,250 108,250 L192,250 Q228,250 228,256 L232,310 Q232,318 150,318 Q68,318 68,310 Z" fill="url(#gold)"/>
  
  <!-- Base tiers -->
  <rect x="68" y="308" width="164" height="14" fill="#B8860B" rx="2"/>
  <rect x="55" y="320" width="190" height="18" fill="url(#goldSheen)" rx="2"/>
  <rect x="50" y="336" width="200" height="10" fill="#D4A000" rx="2"/>
  
  <!-- Base engravings suggestion -->
  <line x1="85" y1="280" x2="215" y2="280" stroke="#B8860B" stroke-width="1" opacity="0.5"/>
  <line x1="85" y1="295" x2="215" y2="295" stroke="#B8860B" stroke-width="1" opacity="0.5"/>
  <text x="150" y="290" font-family="serif" font-size="9" fill="#B8860B" text-anchor="middle" letter-spacing="2" opacity="0.7">FIFA WORLD CUP</text>
  
  <!-- Top shine reflection -->
  <path d="M110,60 Q130,52 145,55 Q148,60 140,65 Q125,62 110,60 Z" fill="#FFE566" opacity="0.35"/>
</svg>'''

# ─── 8. WC2026 HERO BRANDING SVG ─────────────────────────────────────────────
wc2026_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400">
  <defs>
    <linearGradient id="navyBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#001240"/>
      <stop offset="100%" stop-color="#001B5E"/>
    </linearGradient>
    <linearGradient id="yellowFade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFCD00" stop-opacity="1"/>
      <stop offset="100%" stop-color="#CC9900" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <rect width="800" height="400" fill="url(#navyBg)"/>
  
  <!-- Decorative diagonal lines -->
  <line x1="0" y1="50" x2="800" y2="350" stroke="#FFCD00" stroke-width="0.5" opacity="0.08"/>
  <line x1="0" y1="100" x2="800" y2="400" stroke="#FFCD00" stroke-width="0.5" opacity="0.06"/>
  <line x1="0" y1="0" x2="800" y2="300" stroke="#FFCD00" stroke-width="0.5" opacity="0.06"/>
  
  <!-- "FIFA" small text top -->
  <text x="400" y="70" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#FFCD00" text-anchor="middle" letter-spacing="8" opacity="0.8">FIFA</text>
  
  <!-- "WORLD CUP" big -->
  <text x="400" y="160" font-family="Arial Black, sans-serif" font-size="72" font-weight="900" fill="white" text-anchor="middle" letter-spacing="8">WORLD CUP</text>
  
  <!-- "2026" number - huge yellow -->
  <text x="400" y="300" font-family="Arial Black, sans-serif" font-size="140" font-weight="900" fill="url(#yellowFade)" text-anchor="middle" letter-spacing="4">2026</text>
  
  <!-- Three flag colors bar -->
  <rect x="260" y="318" width="93" height="5" fill="#BF0A30" rx="2"/>
  <rect x="356" y="318" width="88" height="5" fill="white" rx="2"/>
  <rect x="447" y="318" width="93" height="5" fill="#006847" rx="2"/>
  
  <!-- USA · CANADA · MEXICO -->
  <text x="400" y="348" font-family="Arial, sans-serif" font-size="13" fill="white" text-anchor="middle" letter-spacing="4" opacity="0.6">USA · CANADA · MEXICO</text>
  
  <!-- Corner stars -->
  <text x="60" y="80" font-family="serif" font-size="32" fill="#FFCD00" opacity="0.2">★</text>
  <text x="712" y="80" font-family="serif" font-size="32" fill="#FFCD00" opacity="0.2">★</text>
  <text x="60" y="360" font-family="serif" font-size="32" fill="#FFCD00" opacity="0.2">★</text>
  <text x="712" y="360" font-family="serif" font-size="32" fill="#FFCD00" opacity="0.2">★</text>
</svg>'''

# ─── 9. SWEDEN HERO BANNER ───────────────────────────────────────────────────
sweden_hero_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="1200" height="400">
  <defs>
    <linearGradient id="sweHero" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#001B5E"/>
      <stop offset="60%" stop-color="#003399"/>
      <stop offset="100%" stop-color="#005EB8"/>
    </linearGradient>
    <linearGradient id="yellowStripe" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFCD00" stop-opacity="0"/>
      <stop offset="20%" stop-color="#FFCD00" stop-opacity="1"/>
      <stop offset="80%" stop-color="#FFCD00" stop-opacity="1"/>
      <stop offset="100%" stop-color="#FFCD00" stop-opacity="0"/>
    </linearGradient>
    <filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="1200" height="400" fill="url(#sweHero)"/>
  
  <!-- Swedish cross pattern (huge, decorative) -->
  <rect x="380" y="0" width="60" height="400" fill="#FFCD00" opacity="0.06"/>
  <rect x="0" y="170" width="1200" height="60" fill="url(#yellowStripe)" opacity="0.07"/>
  
  <!-- Geometric pattern overlay -->
  <polygon points="0,0 300,0 0,200" fill="#000" opacity="0.08"/>
  <polygon points="1200,0 900,0 1200,200" fill="#000" opacity="0.08"/>
  
  <!-- Background hexagonal pattern suggestion -->
  <g opacity="0.04" fill="none" stroke="#FFCD00" stroke-width="1">
    <polygon points="100,50 130,35 160,50 160,80 130,95 100,80"/>
    <polygon points="160,50 190,35 220,50 220,80 190,95 160,80"/>
    <polygon points="220,50 250,35 280,50 280,80 250,95 220,80"/>
    <polygon points="1000,50 1030,35 1060,50 1060,80 1030,95 1000,80"/>
    <polygon points="1060,50 1090,35 1120,50 1120,80 1090,95 1060,80"/>
    <polygon points="100,110 130,95 160,110 160,140 130,155 100,140"/>
    <polygon points="1000,110 1030,95 1060,110 1060,140 1030,155 1000,140"/>
  </g>
  
  <!-- Player silhouettes (2 players) -->
  <!-- Player 1 - left, running -->
  <g transform="translate(120,40) scale(0.9)" opacity="0.35" fill="#4488cc">
    <ellipse cx="120" cy="58" rx="28" ry="32"/>
    <rect x="111" y="86" width="18" height="15"/>
    <path d="M78,98 Q98,93 120,95 Q142,93 162,98 L168,178 L72,178 Z"/>
    <path d="M78,105 Q52,88 38,58" stroke="#4488cc" stroke-width="22" stroke-linecap="round" fill="none"/>
    <path d="M162,105 Q185,128 195,155" stroke="#4488cc" stroke-width="22" stroke-linecap="round" fill="none"/>
    <path d="M92,176 Q76,228 58,272" stroke="#4488cc" stroke-width="24" stroke-linecap="round" fill="none"/>
    <path d="M58,272 Q44,294 28,300" stroke="#4488cc" stroke-width="18" stroke-linecap="round" fill="none"/>
    <path d="M148,176 Q164,228 180,272" stroke="#4488cc" stroke-width="24" stroke-linecap="round" fill="none"/>
    <path d="M180,272 Q196,294 210,300" stroke="#4488cc" stroke-width="18" stroke-linecap="round" fill="none"/>
  </g>
  
  <!-- Player 2 - right, shooting pose -->
  <g transform="translate(920,30) scale(1.0)" opacity="0.3" fill="#4488cc">
    <ellipse cx="130" cy="60" rx="30" ry="34"/>
    <rect x="120" y="90" width="20" height="16"/>
    <path d="M85,105 Q108,98 130,100 Q155,98 175,105 L183,195 L78,195 Z"/>
    <path d="M85,112 Q56,92 40,60" stroke="#4488cc" stroke-width="24" stroke-linecap="round" fill="none"/>
    <path d="M175,112 Q202,134 218,168" stroke="#4488cc" stroke-width="24" stroke-linecap="round" fill="none"/>
    <path d="M100,193 Q82,248 62,296" stroke="#4488cc" stroke-width="26" stroke-linecap="round" fill="none"/>
    <path d="M62,296 Q46,320 28,328" stroke="#4488cc" stroke-width="20" stroke-linecap="round" fill="none"/>
    <path d="M158,193 Q178,248 200,296" stroke="#4488cc" stroke-width="26" stroke-linecap="round" fill="none"/>
    <path d="M200,296 Q220,320 238,328" stroke="#4488cc" stroke-width="20" stroke-linecap="round" fill="none"/>
  </g>
  
  <!-- Central content area -->
  <text x="600" y="110" font-family="Arial Black, sans-serif" font-size="16" fill="#FFCD00" text-anchor="middle" letter-spacing="6" opacity="0.9">SVERIGE</text>
  <text x="600" y="210" font-family="Arial Black, sans-serif" font-size="88" font-weight="900" fill="white" text-anchor="middle" letter-spacing="4">VM 2026</text>
  <rect x="200" y="228" width="800" height="4" fill="#FFCD00" opacity="0.5"/>
  <text x="600" y="275" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle" letter-spacing="3" opacity="0.7">GRUPP F · USA 2026</text>
  <text x="600" y="320" font-family="Arial, sans-serif" font-size="15" fill="#FFCD00" text-anchor="middle" letter-spacing="2" opacity="0.8">🇸🇪 Sverige · 🇳🇱 Nederländerna · 🇯🇵 Japan · 🇹🇳 Tunisien</text>
  
  <!-- Bottom yellow bar -->
  <rect y="370" width="1200" height="6" fill="#FFCD00" opacity="0.7"/>
</svg>'''

# ─── 10. NRG STADIUM SVG ─────────────────────────────────────────────────────
nrg_stadium_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="skyNRG" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000a1a"/>
      <stop offset="70%" stop-color="#001840"/>
      <stop offset="100%" stop-color="#001a00"/>
    </linearGradient>
    <radialGradient id="nrgGlow" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stop-color="#FFCD00" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#FFCD00" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="450" fill="url(#skyNRG)"/>
  <rect width="800" height="450" fill="url(#nrgGlow)"/>
  
  <!-- Stars/night sky -->
  <circle cx="80" cy="30" r="1" fill="white" opacity="0.5"/>
  <circle cx="200" cy="50" r="1.2" fill="white" opacity="0.4"/>
  <circle cx="350" cy="25" r="0.8" fill="white" opacity="0.6"/>
  <circle cx="500" cy="40" r="1" fill="white" opacity="0.5"/>
  <circle cx="650" cy="30" r="1.2" fill="white" opacity="0.4"/>
  <circle cx="750" cy="55" r="0.8" fill="white" opacity="0.6"/>
  
  <!-- NRG Stadium distinctive retractable roof shape -->
  <!-- Main roof left panel -->
  <path d="M0,180 Q100,120 200,110 L200,135 Q100,145 0,205 Z" fill="#1a2d40" opacity="0.95"/>
  <!-- Main roof right panel -->
  <path d="M800,180 Q700,120 600,110 L600,135 Q700,145 800,205 Z" fill="#1a2d40" opacity="0.95"/>
  <!-- Roof gap/opening center -->
  <path d="M200,110 Q400,90 600,110 L600,135 Q400,115 200,135 Z" fill="#0a1820" opacity="0.9"/>
  
  <!-- Stadium exterior walls -->
  <rect x="50" y="200" width="700" height="180" fill="#0e1f35" opacity="0.9"/>
  <!-- Window details -->
  <g fill="#FFCD00" opacity="0.3">
    <rect x="80" y="215" width="20" height="30" rx="1"/>
    <rect x="115" y="215" width="20" height="30" rx="1"/>
    <rect x="150" y="215" width="20" height="30" rx="1"/>
    <rect x="185" y="215" width="20" height="30" rx="1"/>
    <rect x="220" y="215" width="20" height="30" rx="1"/>
    <rect x="255" y="215" width="20" height="30" rx="1"/>
    <rect x="290" y="215" width="20" height="30" rx="1"/>
    <rect x="325" y="215" width="20" height="30" rx="1"/>
    <rect x="360" y="215" width="20" height="30" rx="1"/>
    <rect x="395" y="215" width="20" height="30" rx="1"/>
    <rect x="430" y="215" width="20" height="30" rx="1"/>
    <rect x="465" y="215" width="20" height="30" rx="1"/>
    <rect x="500" y="215" width="20" height="30" rx="1"/>
    <rect x="535" y="215" width="20" height="30" rx="1"/>
    <rect x="570" y="215" width="20" height="30" rx="1"/>
    <rect x="605" y="215" width="20" height="30" rx="1"/>
    <rect x="640" y="215" width="20" height="30" rx="1"/>
    <rect x="675" y="215" width="20" height="30" rx="1"/>
    <rect x="710" y="215" width="20" height="30" rx="1"/>
  </g>
  <!-- Second row windows -->
  <g fill="#FFCD00" opacity="0.15">
    <rect x="80" y="260" width="20" height="25" rx="1"/>
    <rect x="115" y="260" width="20" height="25" rx="1"/>
    <rect x="150" y="260" width="20" height="25" rx="1"/>
    <rect x="220" y="260" width="20" height="25" rx="1"/>
    <rect x="290" y="260" width="20" height="25" rx="1"/>
    <rect x="360" y="260" width="20" height="25" rx="1"/>
    <rect x="430" y="260" width="20" height="25" rx="1"/>
    <rect x="500" y="260" width="20" height="25" rx="1"/>
    <rect x="570" y="260" width="20" height="25" rx="1"/>
    <rect x="640" y="260" width="20" height="25" rx="1"/>
    <rect x="710" y="260" width="20" height="25" rx="1"/>
  </g>
  
  <!-- Ground level / base -->
  <rect x="0" y="380" width="800" height="70" fill="#050d18"/>
  <!-- Parking/ground details -->
  <line x1="0" y1="382" x2="800" y2="382" stroke="#FFCD00" stroke-width="1" opacity="0.15"/>
  
  <!-- Foreground crowd silhouettes at base -->
  <g fill="#0a1525" opacity="0.8">
    <ellipse cx="50" cy="381" rx="12" ry="10"/>
    <ellipse cx="78" cy="383" rx="12" ry="10"/>
    <ellipse cx="106" cy="380" rx="12" ry="10"/>
    <ellipse cx="134" cy="382" rx="12" ry="10"/>
    <ellipse cx="162" cy="381" rx="12" ry="10"/>
    <ellipse cx="700" cy="381" rx="12" ry="10"/>
    <ellipse cx="728" cy="383" rx="12" ry="10"/>
    <ellipse cx="756" cy="380" rx="12" ry="10"/>
  </g>
  
  <!-- Floodlights on roof -->
  <ellipse cx="200" cy="108" rx="25" ry="6" fill="#FFCD00" opacity="0.5"/>
  <ellipse cx="600" cy="108" rx="25" ry="6" fill="#FFCD00" opacity="0.5"/>
  
  <!-- Label -->
  <text x="400" y="420" font-family="Arial Black, sans-serif" font-size="18" font-weight="900" fill="white" text-anchor="middle" letter-spacing="4" opacity="0.8">NRG STADIUM</text>
  <text x="400" y="442" font-family="Arial, sans-serif" font-size="11" fill="#FFCD00" text-anchor="middle" letter-spacing="2" opacity="0.6">HOUSTON, TEXAS · 72,220 PLATSER</text>
</svg>'''

# ─── 11. GYÖKERES GOAL / CELEBRATION SVG ─────────────────────────────────────
celebration_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <radialGradient id="celebGlow" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#FFCD00" stop-opacity="0.4"/>
      <stop offset="60%" stop-color="#005EB8" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#001240" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="playerLight" cx="50%" cy="40%" r="35%">
      <stop offset="0%" stop-color="#FFCD00" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#FFCD00" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="500" fill="#001240"/>
  <rect width="800" height="500" fill="url(#celebGlow)"/>
  
  <!-- Confetti/celebration particles -->
  <g opacity="0.7">
    <rect x="120" y="40" width="8" height="20" fill="#FFCD00" transform="rotate(30 124 50)"/>
    <rect x="200" y="80" width="6" height="16" fill="#005EB8" transform="rotate(-20 203 88)"/>
    <rect x="350" y="30" width="8" height="20" fill="#FFCD00" transform="rotate(45 354 40)"/>
    <rect x="500" y="60" width="6" height="16" fill="white" transform="rotate(-35 503 68)"/>
    <rect x="650" y="40" width="8" height="20" fill="#FFCD00" transform="rotate(15 654 50)"/>
    <rect x="720" y="90" width="6" height="16" fill="#005EB8" transform="rotate(-50 723 98)"/>
    <rect x="80" y="120" width="6" height="16" fill="white" transform="rotate(60 83 128)"/>
    <rect x="750" y="140" width="8" height="20" fill="#FFCD00" transform="rotate(-25 754 150)"/>
    <circle cx="160" cy="60" r="6" fill="#FFCD00" opacity="0.8"/>
    <circle cx="420" cy="45" r="5" fill="white" opacity="0.8"/>
    <circle cx="620" cy="70" r="6" fill="#005EB8" opacity="0.8"/>
    <circle cx="280" cy="35" r="4" fill="#FFCD00" opacity="0.8"/>
    <circle cx="700" cy="55" r="5" fill="white" opacity="0.8"/>
  </g>
  
  <!-- Main player celebration silhouette (arms wide, celebrating) -->
  <rect width="800" height="500" fill="url(#playerLight)"/>
  <g transform="translate(280,40) scale(1.2)" opacity="0.92" fill="#002080">
    <!-- Head -->
    <ellipse cx="120" cy="52" rx="32" ry="36"/>
    <!-- Neck -->
    <rect x="111" y="84" width="18" height="16"/>
    <!-- Body -->
    <path d="M70,98 Q95,92 120,94 Q148,92 170,98 L175,185 L65,185 Z"/>
    <!-- Left arm raised and wide -->
    <path d="M70,108 Q30,80 8,45" stroke="#002080" stroke-width="28" stroke-linecap="round" fill="none"/>
    <!-- Right arm raised and wide -->  
    <path d="M170,108 Q210,80 232,45" stroke="#002080" stroke-width="28" stroke-linecap="round" fill="none"/>
    <!-- Legs - stride jump -->
    <path d="M88,183 Q72,235 55,280" stroke="#002080" stroke-width="27" stroke-linecap="round" fill="none"/>
    <path d="M55,280 Q38,308 20,318" stroke="#002080" stroke-width="21" stroke-linecap="round" fill="none"/>
    <path d="M152,183 Q168,235 185,280" stroke="#002080" stroke-width="27" stroke-linecap="round" fill="none"/>
    <path d="M185,280 Q202,308 220,318" stroke="#002080" stroke-width="21" stroke-linecap="round" fill="none"/>
  </g>
  
  <!-- "88'" minute marker -->
  <text x="680" y="90" font-family="Arial Black, sans-serif" font-size="64" font-weight="900" fill="#FFCD00" text-anchor="middle" opacity="0.15">88'</text>
  
  <!-- Jersey number -->
  <text x="400" y="230" font-family="Arial Black, sans-serif" font-size="180" font-weight="900" fill="#FFCD00" text-anchor="middle" opacity="0.06">9</text>
  
  <!-- Bottom text -->
  <rect x="0" y="420" width="800" height="80" fill="rgba(0,0,0,0.5)"/>
  <text x="400" y="458" font-family="Arial Black, sans-serif" font-size="22" font-weight="900" fill="#FFCD00" text-anchor="middle" letter-spacing="3">GYÖKERES 88'</text>
  <text x="400" y="484" font-family="Arial, sans-serif" font-size="13" fill="white" text-anchor="middle" opacity="0.7" letter-spacing="2">SVERIGE 2-1 POLEN · VM-KVAL 2025</text>
</svg>'''

# Save all files
files = {
    'gyokeres-card.svg': gyokeres_svg,
    'isak-card.svg': isak_svg,
    'lindelof-card.svg': lindelof_svg,
    'bergvall-card.svg': bergvall_svg,
    'elanga-card.svg': elanga_svg,
    'stadium-background.svg': stadium_bg_svg,
    'trophy-wc2026.svg': trophy_svg,
    'wc2026-branding.svg': wc2026_svg,
    'sweden-hero.svg': sweden_hero_svg,
    'nrg-stadium.svg': nrg_stadium_svg,
    'gyokeres-celebration.svg': celebration_svg,
}

base = '/home/user/vmtips26/public/images/'
for fname, content in files.items():
    with open(base + fname, 'w') as f:
        f.write(content)
    print(f'Written: {fname}')

print('All SVGs written.')
