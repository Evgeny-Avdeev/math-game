import {playerLooks} from './player-looks.mjs?v=8';
const ink='#304c4b';
const path=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
export function playerPortrait(item){
 const p=playerLooks[item.id];if(!p)return null;
 const {skin,hair,style,beard,shirt,kit,rx,ry,eyeGap,nose,smile}=p;
 const cx=120,cy=121,left=cx-rx,right=cx+rx,top=cy-ry,bottom=cy+ry;
 const face=`M${left} 112 Q${left-3} ${top} 120 ${top}Q${right+3} ${top} ${right} 112L${right-3} 143Q${right-9} ${bottom-4} 120 ${bottom}Q${left+9} ${bottom-4} ${left+3} 143Z`;
 const long=['long','headband','pony','bigcurls'].includes(style);
 let back='';
 if(long)back=path(`M68 100Q55 30 120 31Q190 31 178 108L185 189Q163 207 141 181H96Q66 202 55 178Z`,hair,`stroke="${ink}" stroke-width="3"`);
 if(style==='pony')back=path('M153 78Q200 83 183 144L167 176L163 108Z',hair,`stroke="${ink}" stroke-width="3"`);
 const jersey='M26 280L33 231Q38 211 90 198H150Q202 211 207 231L214 280Z';
 let kitPattern='';
 if(kit==='stripes')kitPattern='<path d="M72 199V283M120 199V283M168 199V283" stroke="#f9f4e7" stroke-width="24"/>';
 if(kit==='checks')for(let y=202;y<282;y+=24)for(let x=24;x<218;x+=24)if(((y-202)/24+(x-24)/24)%2===0)kitPattern+=`<rect x="${x}" y="${y}" width="24" height="24" fill="#dc5961"/>`;
 if(kit==='side')kitPattern='<path d="M29 224L58 217L57 280H28Z" fill="#dc5360"/>';
 const collar=kit==='plain'&&shirt==='#f4cc58'?'#3e9974':kit==='vintage'?'#e1d2ae':'#f8eedb';
 const base=`<ellipse cx="120" cy="267" rx="94" ry="10" fill="#446d6820"/>${back}<svg x="0" y="0" width="240" height="280"><defs><clipPath id="kit-${item.id}">${path(jersey,'white')}</clipPath></defs>${path(jersey,shirt,`stroke="${ink}" stroke-width="3.5"`)}<g clip-path="url(#kit-${item.id})">${kitPattern}<path d="M27 258Q117 236 212 258V283H27Z" fill="#203d4310"/></g></svg>${path('M100 169V200Q120 219 140 200V169Z',skin,`stroke="${ink}" stroke-width="3"`)}${path('M101 177Q120 187 139 177V191Q120 204 101 191Z','#8d4f3625')}${path('M90 198L101 194Q120 214 139 194L150 198Q120 236 90 198Z',collar,`stroke="${ink}" stroke-width="2"`)}<path d="M65 228L57 279M175 228L183 279" stroke="${ink}" stroke-width="2" opacity=".2"/>`;
 let hairTop='';
 if(style==='bald')hairTop=path(`M${left+1} 100Q${left-6} 82 ${left+8} 74L${left+8} 101M${right-1} 100Q${right+6} 82 ${right-8} 74L${right-8} 101`,hair);
 if(style==='receding')hairTop=path('M73 112Q66 70 93 62L96 82Q78 88 79 116M167 112Q174 70 147 62L144 82Q162 88 161 116',hair);
 if(['crop','buzz','fade','classic'].includes(style))hairTop=path(`M${left} 116Q${left-10} 57 120 57Q${right+10} 57 ${right} 116L${right-8} 94Q120 ${style==='buzz'?78:69} ${left+8} 94Z`,hair,`stroke="${ink}" stroke-width="2.5"`);
 if(style==='fringe')hairTop=path('M75 113Q65 58 103 54Q157 45 167 81L166 112L157 94L84 96Z',hair,`stroke="${ink}" stroke-width="3"`)+path('M84 89L155 87','none',`stroke="#ffffff25" stroke-width="3" stroke-linecap="round"`);
 if(style==='sweep'||style==='slick')hairTop=path(`M73 115Q60 76 82 58Q114 32 163 57L173 48Q185 75 164 104L161 85Q118 100 86 82L81 115Z`,hair,`stroke="${ink}" stroke-width="3"`)+path('M82 71Q118 86 161 63','none',`stroke="#fff5df35" stroke-width="4" stroke-linecap="round"`);
 if(style==='quiff')hairTop=path('M74 116L69 82Q67 48 98 50Q131 50 157 30Q179 54 168 88L164 113L156 85Q113 91 85 79L82 116Z',hair,`stroke="${ink}" stroke-width="3"`)+path('M89 62Q123 70 151 50','none',`stroke="#fff3db40" stroke-width="4" stroke-linecap="round"`);
 if(style==='sidepart')hairTop=path('M74 115Q63 64 96 54Q138 39 163 65Q178 85 165 115L157 85Q136 82 120 68Q107 91 83 96L82 116Z',hair,`stroke="${ink}" stroke-width="3"`)+path('M120 67Q130 54 144 57','none',`stroke="#ffffff30" stroke-width="3"`);
 if(style==='mohawk')hairTop=path('M76 110L76 78L99 64L105 44L118 53L130 32L142 48L151 45L156 86L165 109L154 91L85 91Z',hair,`stroke="${ink}" stroke-width="2.5"`)+path('M111 59L129 45L138 65','none',`stroke="#fff5d780" stroke-width="4"`);
 if(style==='spikes')hairTop=path('M74 113L69 77L81 78L84 54L98 63L109 44L121 59L139 40L144 61L162 53L158 74L172 72L165 112L157 89L83 90Z',hair,`stroke="${ink}" stroke-width="3"`);
 if(style==='long'||style==='pony')hairTop=path('M73 121Q58 59 102 46Q151 28 170 77L166 125L157 104Q155 77 136 65Q113 87 84 91L80 129Z',hair,`stroke="${ink}" stroke-width="3"`)+path('M77 86Q105 66 125 54M149 57Q171 91 161 135','none',`stroke="#f7ddb850" stroke-width="3" stroke-linecap="round"`);
 if(style==='waves')hairTop=path('M72 114Q57 92 72 79Q61 60 86 55Q86 36 110 48Q128 27 144 48Q169 37 172 61Q190 67 173 89L165 117L154 86Q130 97 87 85L81 116Z',hair,`stroke="${ink}" stroke-width="3"`);
 if(['curls','bigcurls','coils','high','tips'].includes(style)){
 const big=style==='bigcurls'||style==='curls',tall=style==='high';
 const points=big?[[73,76,17],[84,55,18],[105,45,17],[128,43,18],[149,51,18],[167,69,18],[173,92,13],[68,99,13]]:[[78,73,12],[91,58,13],[109,tall?38:53,14],[130,tall?35:51,14],[150,59,14],[165,77,12]];
 hairTop=path(`M72 112V73Q120 ${tall?15:36} 168 73V112L158 89H83L81 112Z`,hair);
 for(const [x,y,r]of points)hairTop+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${hair}" stroke="${ink}" stroke-width="2"/>`;
 for(let i=0;i<9;i++){const x=80+(i%5)*18,y=60+Math.floor(i/5)*18;hairTop+=path(`M${x-4} ${y+3}q-5 -9 5 -8`, 'none',`stroke="${style==='tips'?'#c7a473':'#ffffff20'}" stroke-width="${style==='tips'?4:2}" stroke-linecap="round"`);}
 }
 if(style==='ronaldo')hairTop=path('M98 79Q120 54 143 79V90Q120 83 98 90Z',hair,`stroke="${ink}" stroke-width="2"`);
 if(style==='headband')hairTop=path('M69 120Q58 70 83 54Q121 29 156 53Q185 72 170 128L157 112L156 83Q118 72 82 87L81 128Z',hair,`stroke="${ink}" stroke-width="3"`)+path('M70 84Q119 57 169 83L170 94Q120 70 70 96Z','#2c434c',`stroke="${ink}" stroke-width="2"`)+path('M73 85Q120 64 166 84','none','stroke="#97a8b7" stroke-width="2"');
 if(style==='cap')hairTop=path('M69 94L74 71Q83 41 121 46Q160 47 168 75L170 92Z','#37424a',`stroke="${ink}" stroke-width="3"`)+path('M65 90Q116 72 178 88Q194 95 165 104Q115 98 65 104Z','#46525b',`stroke="${ink}" stroke-width="3"`)+path('M82 70Q112 52 150 70','none','stroke="#718087" stroke-width="2"');
 let beardShape='';
 if(beard==='full'||beard==='trim')beardShape=path(`M${left+4} 133L${left+13} 142Q120 157 ${right-13} 142L${right-4} 133L${right-6} 155Q${right-12} ${bottom+5} 120 ${bottom+7}Q${left+12} ${bottom+5} ${left+6} 155Z`,hair,`stroke="${ink}" stroke-width="2"`);
 if(beard==='stubble')beardShape=path(`M${left+6} 144Q120 176 ${right-6} 144Q${right-13} ${bottom+2} 120 ${bottom+2}Q${left+13} ${bottom+2} ${left+6} 144Z`,hair,'opacity=".22"');
 if(beard==='goatee')beardShape=path('M105 158Q120 164 135 158L133 179Q120 190 107 179Z',hair);
 const eyeY=item.id==='ronaldinho'?116:115;const eyes=['son','haaland'].includes(item.id)?`<path d="M${120-eyeGap-5} ${eyeY}q5 -4 10 0M${120+eyeGap-5} ${eyeY}q5 -4 10 0" fill="none" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>`:`<ellipse cx="${120-eyeGap}" cy="${eyeY}" rx="4" ry="5.5" fill="${ink}"/><ellipse cx="${120+eyeGap}" cy="${eyeY}" rx="4" ry="5.5" fill="${ink}"/><g fill="#fff7e9"><circle cx="${119-eyeGap}" cy="${eyeY-2}" r="1.5"/><circle cx="${119+eyeGap}" cy="${eyeY-2}" r="1.5"/></g>`;
 const eyebrows=path(`M${120-eyeGap-9} 104q8 ${-3-p.brow*2} 17 -1M${120+eyeGap-8} 103q8 ${-2-p.brow} 17 1`,'none',`stroke="${hair}" stroke-width="4" stroke-linecap="round"`);
 const mouth=item.id==='ronaldinho'||item.id==='pele'||item.id==='saka'||item.id==='mbappe'?path('M102 146Q120 155 138 146Q134 169 120 168Q106 167 102 146Z','#fff5df',`stroke="${ink}" stroke-width="2"`)+path('M120 151V159','none',`stroke="${ink}" stroke-width="1.5"`):path(`M108 151q12 ${smile+3} 24 0`,'none',`stroke="${beard==='full'?'#eeb7a1':'#9c5f51'}" stroke-width="3" stroke-linecap="round"`);
 const moustache=beard==='none'||beard==='stubble'?'':path('M104 143Q113 135 120 141Q127 135 136 143L130 147Q120 143 110 147Z',hair);
 let extras='';
 if(kit==='keeper'||kit==='vintage')extras=`<g stroke="${ink}" stroke-width="2.5"><path d="M47 263L42 241Q37 226 44 225L54 238L50 214Q50 208 56 211L65 234L64 213Q67 206 72 214L76 238L82 226Q89 221 90 230L83 260Z" fill="${kit==='vintage'?'#c59b68':'#fff3d8'}"/><path d="M157 263L151 235Q151 229 157 230L163 238L166 215Q169 208 173 214L173 235L183 216Q189 212 190 218L184 241L196 229Q202 228 200 237L192 264Z" fill="${kit==='vintage'?'#c59b68':'#fff3d8'}"/></g>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280" role="img" aria-label="Иллюстрация: ${item.name}" class="player-portrait"><rect x="7" y="5" width="226" height="269" rx="37" fill="#e4f2df"/><circle cx="120" cy="120" r="99" fill="#f8ecd0"/><path d="M22 214H218M43 216V186Q120 167 197 186V216M64 214V194H177V214" fill="none" stroke="#aecdb7" stroke-width="2"/><path d="M32 73l4 9 10 1-8 7 3 10-9-5-9 5 2-10-7-7 10-1ZM208 128l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#e8bd65"/>${base}<ellipse cx="${left-2}" cy="123" rx="9" ry="15" fill="${skin}" stroke="${ink}" stroke-width="2.5"/><ellipse cx="${right+2}" cy="123" rx="9" ry="15" fill="${skin}" stroke="${ink}" stroke-width="2.5"/>${path(face,skin,`stroke="${ink}" stroke-width="3"`)}${path(`M${right-8} 105Q${right+4} 153 120 ${bottom-1}Q${right-8} ${bottom-18} ${right-8} 105`,'#7f48251c')}${beardShape}${hairTop}${eyebrows}${eyes}<ellipse cx="${left+17}" cy="138" rx="9" ry="4" fill="#d97e6c" opacity=".32"/><ellipse cx="${right-17}" cy="138" rx="9" ry="4" fill="#d97e6c" opacity=".32"/>${path(`M120 119l-${nose} 16q${nose} 4 ${nose+5} 0`,'none','stroke="#9d644f" stroke-width="2" stroke-linecap="round"')}${mouth}${moustache}${extras}</svg>`;
}
