// Original vector portraits: playful illustrations, rather than breed identification photos.
export function portrait(item){
 if(item.pet==='football')return footballPortrait(item);
 const l=item.look||{},coat=l.coat||'#e7ac68',muzzle=l.muzzle||'#fff2df',eyes=l.eyes||'#43384f';
 const isDog=item.pet==='dog';
 let ears='';
 if(isDog){
  if(l.ear==='point'||l.ear==='half')ears=`<path d="M45 65 Q20 2 65 36L77 68M118 62Q157 0 155 66L143 87" fill="${coat}" stroke="#574457" stroke-width="4"/><path d="M43 38L54 65L65 51M141 38L128 60L144 64" fill="#e7a1a2"/>`;
  else ears=`<path d="M46 52Q12 32 20 ${l.ear==='long'?133:112}Q35 143 54 89M139 52Q175 31 166 ${l.ear==='long'?133:112}Q152 145 135 89" fill="${l.patch==='spots'?'#5a5262':coat}" stroke="#574457" stroke-width="4"/>`;
 }else if(l.fold){ears=`<path d="M43 62Q15 24 76 48L67 77M118 48Q176 26 153 67L131 78" fill="${coat}" stroke="#574457" stroke-width="4"/>`;}
 else ears=`<path d="M42 76L${l.bigEars?25:34} ${l.bigEars?8:23}Q52 18 78 57M111 57Q137 17 155 ${l.bigEars?8:23}L150 81" fill="${coat}" stroke="#574457" stroke-width="4"/><path d="M44 38L49 65L65 56M141 37L135 65L121 56" fill="#e6afb4"/>`;
 const fluff=l.fluff?`<path d="M46 68L34 82L40 95L28 109L41 120L36 134L56 141L67 151L82 149L95 157L108 149L128 153L137 139L154 132L149 118L159 104L149 93L153 79L137 67Z" fill="${coat}" stroke="#574457" stroke-width="4"/>`:'';
 let marks='';
 if(l.patch==='blaze')marks=`<path d="M87 50Q98 41 107 51L101 89Q130 83 130 119Q95 151 60 119Q60 88 90 88Z" fill="${muzzle}"/>`;
 if(l.patch==='mask')marks=`<path d="M50 76Q69 58 91 91L96 108L101 90Q121 58 141 76L143 115Q97 146 49 114Z" fill="${muzzle}"/>`;
 if(l.patch==='point')marks=`<ellipse cx="96" cy="104" rx="43" ry="34" fill="#75615e"/><path d="M38 29L48 70L70 55M149 30L138 70L119 55" fill="#75615e"/>`;
 if(l.patch==='spots'||l.spots)marks=`<g fill="#5b4b48"><ellipse cx="56" cy="71" rx="13" ry="17"/><ellipse cx="123" cy="57" rx="10" ry="9"/><ellipse cx="142" cy="112" rx="8" ry="10"/><ellipse cx="68" cy="125" rx="7" ry="6"/></g>`;
 if(l.stripes)marks+=`<g fill="none" stroke="#776252" stroke-width="6" stroke-linecap="round"><path d="M80 51L85 65M96 48V63M111 51L106 65M46 93L59 99M45 108L57 111M145 93L133 99M145 108L134 111"/></g>`;
 if(l.wrinkles)marks+=`<g fill="none" stroke="#bd8c91" stroke-width="2"><path d="M78 57Q95 64 112 57M80 65Q96 71 110 65"/></g>`;
 return `<svg viewBox="0 0 190 180" role="img" aria-label="${item.name}"><ellipse cx="95" cy="161" rx="51" ry="7" fill="#48334c12"/>${ears}${l.tufts?'<path d="M33 26L27 14L45 29M143 26L158 12L153 35" fill="#71615c"/>':''}${fluff}<ellipse cx="96" cy="98" rx="${l.round?57:53}" ry="52" fill="${coat}" stroke="#574457" stroke-width="4"/>${marks}${isDog?`<ellipse cx="96" cy="118" rx="29" ry="23" fill="${muzzle}"/>`:''}<g fill="${eyes}"><ellipse cx="74" cy="91" rx="7" ry="9"/><ellipse cx="119" cy="91" rx="7" ry="9"/></g><g fill="white"><circle cx="72" cy="88" r="2.4"/><circle cx="117" cy="88" r="2.4"/></g><ellipse cx="58" cy="108" rx="9" ry="5" fill="#f1a6aa" opacity=".65"/><ellipse cx="136" cy="108" rx="9" ry="5" fill="#f1a6aa" opacity=".65"/><path d="M88 111Q96 105 104 111L96 119Z" fill="${isDog?'#493f4e':'#be7884'}"/><path d="M96 118V125M96 125Q85 136 80 124M96 125Q108 136 112 124" fill="none" stroke="#554253" stroke-width="3" stroke-linecap="round"/>${isDog?'<path d="M89 133Q96 127 103 133V140Q96 154 89 140Z" fill="#e597a2" stroke="#574457" stroke-width="2"/>':'<path d="M60 115L33 110M61 123L34 127M132 115L158 110M131 123L158 128" stroke="#665167" stroke-width="2" stroke-linecap="round"/>'}<path d="M62 150Q96 166 129 150" stroke="#ed8e83" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="96" cy="159" r="7" fill="#ffd579" stroke="#b58c47" stroke-width="2"/></svg>`;
}

function footballPortrait(item){
 const shirt=item.look?.shirt||'#62b791',initials=item.look?.initials||'⚽';
 return `<svg viewBox="0 0 190 180" role="img" aria-label="Карточка: ${item.name}"><circle cx="95" cy="89" r="77" fill="${shirt}" opacity=".16"/><path d="M34 55L63 35L78 40Q95 54 112 40L127 35L156 55L143 84L126 77V145Q95 161 64 145V77L47 84Z" fill="${shirt}" stroke="#375750" stroke-width="4" stroke-linejoin="round"/><path d="M78 40Q95 65 112 40M65 125H126" fill="none" stroke="#fff7da" stroke-width="6"/><text x="95" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="29" font-weight="bold" fill="#fffdf3">${initials}</text><circle cx="142" cy="137" r="27" fill="#fffdf3" stroke="#375750" stroke-width="3"/><path d="M142 124L153 132L149 145H135L131 132Z" fill="#375750"/><path d="M142 110V119M166 130L158 133M157 158L151 150M126 158L133 149M117 130L126 133" stroke="#375750" stroke-width="4"/><path d="M40 22L43 29L51 30L45 35L47 43L40 39L33 43L35 35L29 30L37 29Z" fill="#efc658"/></svg>`;
}
