// ===== Animation kit + 23 concept animations (injected into template) =====
const SVGNS = "http://www.w3.org/2000/svg";
class AnimKit{
  constructor(svg){ this.svg = svg; this.animate = true; }
  n(tag, attrs = {}, txt){
    if(attrs.key){
      const old = this.svg.querySelector(`[data-key="${attrs.key}"]`);
      if(old) old.remove();
    }
    const e = document.createElementNS(SVGNS, tag);
    for(const [k,v] of Object.entries(attrs)){
      if(k==="cls") e.setAttribute("class", v);
      else if(k==="anim"){ if(this.animate) e.classList.add(v); }
      else if(k==="key") e.setAttribute("data-key", v);
      else if(k==="parent") continue;
      else e.setAttribute(k, v);
    }
    if(txt != null) e.textContent = txt;
    (attrs.parent || this.svg).appendChild(e);
    return e;
  }
  rect(x,y,w,h,fill,ex={}){ return this.n("rect",{x,y,width:w,height:h,fill,rx:ex.rx??3,...ex}); }
  txt(x,y,s,size=16,ex={}){ return this.n("text",{x,y,"font-size":size,fill:ex.fill||"currentColor","text-anchor":ex.ta||"middle","font-weight":ex.fw||"400",...ex},s); }
  line(x1,y1,x2,y2,stroke="#94a3b8",ex={}){ return this.n("line",{x1,y1,x2,y2,stroke,"stroke-width":ex.sw??2,...ex}); }
  circ(cx,cy,r,fill,ex={}){ return this.n("circle",{cx,cy,r,fill,...ex}); }
  poly(pts,fill,ex={}){ return this.n("polygon",{points:pts,fill,...ex}); }
  arrow(x1,y1,x2,y2,color="#f59e0b",ex={}){
    const g = this.n("g",{anim:ex.anim||"pop",key:ex.key});
    this.n("line",{x1,y1,x2,y2,stroke:color,"stroke-width":3,parent:g});
    const a = Math.atan2(y2-y1,x2-x1), L=9;
    this.n("polygon",{points:`${x2},${y2} ${x2-L*Math.cos(a-0.45)},${y2-L*Math.sin(a-0.45)} ${x2-L*Math.cos(a+0.45)},${y2-L*Math.sin(a+0.45)}`,fill:color,parent:g});
    return g;
  }
  chip(x,y,s,color="#4f46e5",ex={}){
    const g = this.n("g",{anim:ex.anim??"pop",key:ex.key});
    this.rect(x-16,y-16,32,32,color,{rx:8,parent:g});
    this.txt(x,y+6,s,18,{fill:"#fff",fw:"800",parent:g});
    return g;
  }
  // fraction bar: parts equal cells, first `shade` cells filled
  fbar(x,y,w,h,parts,shade,color,ex={}){
    const g = this.n("g",{anim:ex.anim,key:ex.key});
    for(let i=0;i<parts;i++){
      this.rect(x+i*(w/parts),y,w/parts,h,i<shade?color:"none",{parent:g,stroke:"#94a3b8","stroke-width":1.5,rx:2});
    }
    return g;
  }
  // isometric unit cube, size s
  cube(x,y,s,fill="#0ea5e9",ex={}){
    const g = this.n("g",{anim:ex.anim,key:ex.key});
    const d = s*0.45;
    this.poly(`${x},${y} ${x+s},${y} ${x+s},${y+s} ${x},${y+s}`,fill,{parent:g,stroke:"#075985","stroke-width":1});
    this.poly(`${x},${y} ${x+d},${y-d} ${x+s+d},${y-d} ${x+s},${y}`,shadeHex(fill,1.25),{parent:g,stroke:"#075985","stroke-width":1});
    this.poly(`${x+s},${y} ${x+s+d},${y-d} ${x+s+d},${y+s-d} ${x+s},${y+s}`,shadeHex(fill,0.8),{parent:g,stroke:"#075985","stroke-width":1});
    return g;
  }
  grid(x,y,w,h,nx,ny,stroke="#cbd5e1"){
    const g = this.n("g",{});
    for(let i=0;i<=nx;i++) this.line(x+i*w/nx,y,x+i*w/nx,y+h,stroke,{parent:g,sw:1});
    for(let j=0;j<=ny;j++) this.line(x,y+j*h/ny,x+w,y+j*h/ny,stroke,{parent:g,sw:1});
    return g;
  }
}
function shadeHex(hex,f){
  const n = parseInt(hex.slice(1),16);
  const c = v=>Math.max(0,Math.min(255,Math.round(v*f)));
  return "#"+[c(n>>16),c((n>>8)&255),c(n&255)].map(v=>v.toString(16).padStart(2,"0")).join("");
}
const IND="#4f46e5", SKY="#0ea5e9", GRN="#16a34a", RED="#dc2626", AMB="#f59e0b", GRY="#94a3b8";

// ---- shared scene builders ----
function pvChart(s){
  const cols=["hundreds","tens","ones",".","tenths","hundredths","thousandths"], x0=60,w=74;
  cols.forEach((c,i)=>{
    if(c==="."){ s.txt(x0+i*w+w/2,205,".",42,{fw:"800"}); return; }
    s.rect(x0+i*w+4,100,w-8,110,"none",{stroke:GRY,"stroke-width":1.5,rx:8});
    s.txt(x0+i*w+w/2,90,c,11,{fill:GRY});
  });
  return {x0,w};
}
function pvPlace(s,digits,key){ // digits: {colIndex: '3'}
  const x0=60,w=74;
  Object.entries(digits).forEach(([ci,d],k)=>{
    s.chip(x0+ci*w+w/2,155,d,IND,{key:key+"_"+k,anim:"pop"});
  });
}
function axes(s,x0=90,y0=290,W=230,H=230,n=6){
  s.grid(x0,y0-H,W,H,n,n);
  s.arrow(x0,y0,x0+W+18,y0,GRY); s.arrow(x0,y0,x0,y0-H-18,GRY);
  for(let i=1;i<=n;i++){ s.txt(x0+i*W/n,y0+18,String(i),12,{fill:GRY}); s.txt(x0-14,y0-i*H/n+4,String(i),12,{fill:GRY}); }
  s.txt(x0-12,y0+16,"0",12,{fill:GRY}); s.txt(x0+W+30,y0+4,"x",14,{fill:GRY,fw:"700"}); s.txt(x0-4,y0-H-24,"y",14,{fill:GRY,fw:"700"});
  return {x0,y0,W,H,n,px:(vx,vy)=>[x0+vx*W/n, y0-vy*H/n]};
}

const ANIMS = {
// ============ c1 place value & powers of 10 ============
c1:{frames:[
 {cap:"This is a <b>place-value chart</b>. Every place is worth <b>10 times</b> the place to its right — and 1/10 of the place to its left. Here is <b>3.47</b>.",
  draw(s){ pvChart(s); pvPlace(s,{2:"3",4:"4",5:"7"},"a"); s.txt(320,50,"3.47",30,{fw:"800",fill:IND}); }},
 {cap:"<b>Multiply by 10</b> → every digit slides <b>one place LEFT</b>. 3.47 × 10 = <b>34.7</b>",
  draw(s){ pvPlace(s,{1:"3",2:"4",4:"7"},"a"); s.txt(320,50,"3.47 × 10 = 34.7",30,{fw:"800",fill:IND,key:"t"}); s.arrow(430,240,330,240,AMB,{key:"ar"}); s.txt(380,262,"digits slide left",13,{fill:AMB,key:"al"}); }},
 {cap:"Multiply by 10 <b>again</b> → slide left again. 34.7 × 10 = <b>347</b>. So ×100 slides two places, ×1000 slides three!",
  draw(s){ pvPlace(s,{0:"3",1:"4",2:"7"},"a"); s.txt(320,50,"3.47 × 100 = 347",30,{fw:"800",fill:IND,key:"t"}); }},
 {cap:"<b>Divide by 10</b> → digits slide one place <b>RIGHT</b>. 347 ÷ 10 = 34.7, and 347 ÷ 100 = 3.47 again.",
  draw(s){ pvPlace(s,{2:"3",4:"4",5:"7"},"a"); s.txt(320,50,"347 ÷ 100 = 3.47",30,{fw:"800",fill:IND,key:"t"}); s.arrow(330,240,430,240,SKY,{key:"ar"}); s.txt(380,262,"digits slide right",13,{fill:SKY,key:"al"}); }},
 {cap:"Powers of 10 use <b>exponents</b>: 10<sup>3</sup> means 10 × 10 × 10 = 1,000. The exponent counts the zeros — and how many places the digits slide!",
  draw(s){ s.rect(150,240,340,64,"none",{stroke:AMB,"stroke-width":2,rx:12,anim:"pop"}); s.txt(320,268,"10³ = 10 × 10 × 10 = 1,000",21,{fw:"800",anim:"pop"}); s.txt(320,292,"3 zeros ↔ slide 3 places",14,{fill:GRY,anim:"pop"}); }},
]},
// ============ c2 compare & round decimals ============
c2:{frames:[
 {cap:"Which is bigger: <b>0.4</b> or <b>0.35</b>? Put them on a number line from 0 to 1, split into tenths.",
  draw(s){ s.line(60,150,580,150,GRY,{sw:3}); for(let i=0;i<=10;i++){ s.line(60+i*52,142,60+i*52,158,GRY); s.txt(60+i*52,178,"0."+i,12,{fill:GRY}); } s.txt(580,178,"1.0",12,{fill:GRY,key:"one"}); }},
 {cap:"<b>0.4 = 0.40</b> = 40 hundredths. <b>0.35</b> = 35 hundredths. 40 > 35, so <b>0.4 &gt; 0.35</b> — even though 35 has more digits!",
  draw(s){ s.circ(60+4*52,150,8,IND,{anim:"pop"}); s.txt(60+4*52,128,"0.4",15,{fw:"800",fill:IND,anim:"pop"});
    s.circ(60+3.5*52,150,8,RED,{anim:"pop"}); s.txt(60+3.5*52,205,"0.35",15,{fw:"800",fill:RED,anim:"pop"});
    s.txt(320,60,"0.40 > 0.35",26,{fw:"800",anim:"slide"}); }},
 {cap:"Reading decimals with <b>expanded form</b>: 0.35 = 3 × (1/10) + 5 × (1/100). Say it: “thirty-five hundredths.”",
  draw(s){ s.rect(140,230,360,58,"none",{stroke:SKY,"stroke-width":2,rx:12,anim:"pop"}); s.txt(320,265,"0.35 = 3×(1/10) + 5×(1/100)",19,{fw:"700",anim:"pop"}); }},
 {cap:"<b>Rounding</b> 0.35 to the nearest tenth: it sits exactly between 0.3 and 0.4 — halfway rounds <b>up</b>: 0.35 → <b>0.4</b>. Rule: look at the digit to the right; 5 or more rounds up.",
  draw(s){ s.arrow(60+3.5*52,150,60+4*52,150,GRN,{key:"rnd"}); s.txt(320,95,"0.35 → 0.4  (5 rounds up)",20,{fw:"800",fill:GRN,anim:"pop"}); }},
]},
// ============ c3 primes & factorization ============
c3:{frames:[
 {cap:"A <b>prime</b> number has exactly 2 factors: 1 and itself. A <b>composite</b> number has more. Watch the primes light up (2, 3, 5, 7, 11, 13, 17, 19, 23…).",
  draw(s){ for(let n=2;n<=25;n++){ const i=n-2, x=70+(i%8)*64, y=60+Math.floor(i/8)*58;
    const isP=[2,3,5,7,11,13,17,19,23].includes(n);
    s.rect(x-22,y-20,44,40,isP?GRN:"none",{stroke:isP?GRN:GRY,"stroke-width":1.5,rx:9,anim:isP?"pop":undefined});
    s.txt(x,y+6,String(n),17,{fill:isP?"#fff":"currentColor",fw:isP?"800":"400"}); } }},
 {cap:"<b>Prime factorization</b> breaks a composite number into a product of primes. Let's build a <b>factor tree</b> for 36.",
  draw(s){ s.chip(320,255,"36",IND,{key:"root"}); }},
 {cap:"36 = 6 × 6 … but 6 is not prime, so keep splitting: 6 = 2 × 3.",
  draw(s){ s.line(310,268,250,290,GRY); s.line(330,268,390,290,GRY);
    s.chip(245,300,"6",SKY,{}); s.chip(395,300,"6",SKY,{});
    s.line(237,312,210,330,GRY); s.line(253,312,278,330,GRY);
    s.line(387,312,360,330,GRY); s.line(403,312,430,330,GRY); }},
 {cap:"All branches end in primes: 36 = <b>2 × 2 × 3 × 3</b> = 2² × 3². Every composite number has exactly one prime factorization!",
  draw(s){ s.chip(205,336,"2",GRN,{}); s.chip(283,336,"3",GRN,{}); s.chip(355,336,"2",GRN,{}); s.chip(435,336,"3",GRN,{});
    s.txt(320,40,"36 = 2 × 2 × 3 × 3 = 2² × 3²",22,{fw:"800",anim:"slide"}); }},
]},
// ============ c4 area-model multiplication ============
c4:{frames:[
 {cap:"Let's multiply <b>23 × 45</b> with an <b>area model</b>: split 23 into 20 + 3, and 45 into 40 + 5.",
  draw(s){ s.rect(160,80,280,50,"none",{stroke:GRY,"stroke-width":2}); s.rect(160,130,280,180,"none",{stroke:GRY,"stroke-width":2});
    s.line(390,80,390,310,GRY); s.txt(275,70,"40",16,{fw:"700"}); s.txt(415,70,"5",16,{fw:"700"});
    s.txt(140,225,"20",16,{fw:"700"}); s.txt(140,105,"3",16,{fw:"700"});
    s.txt(320,40,"23 × 45 = (20 + 3) × (40 + 5)",20,{fw:"800"}); }},
 {cap:"Big piece first: 20 × 40 = <b>800</b>. Then 20 × 5 = <b>100</b>.",
  draw(s){ s.rect(162,132,226,176,"#c7d2fe",{anim:"pop"}); s.txt(275,225,"20 × 40 = 800",17,{fw:"800",fill:"#1e1b4b"});
    s.rect(392,132,46,176,"#bae6fd",{anim:"pop"}); s.txt(416,225,"100",15,{fw:"800",fill:"#0c4a6e"}); }},
 {cap:"Now the 3-row: 3 × 40 = <b>120</b>, and 3 × 5 = <b>15</b>.",
  draw(s){ s.rect(162,82,226,46,"#bbf7d0",{anim:"pop"}); s.txt(275,110,"3 × 40 = 120",16,{fw:"800",fill:"#14532d"});
    s.rect(392,82,46,46,"#fde68a",{anim:"pop"}); s.txt(416,110,"15",15,{fw:"800",fill:"#713f12"}); }},
 {cap:"Add the four partial products: 800 + 100 + 120 + 15 = <b>1,035</b>. The standard algorithm computes these same pieces — just stacked!",
  draw(s){ s.rect(470,90,150,140,"none",{stroke:AMB,"stroke-width":2,rx:10,anim:"pop"});
    ["800","100","120","+  15","1,035"].forEach((t,i)=>s.txt(545,120+i*26,t,17,{fw:i===4?"800":"500",anim:"pop"}));
    s.line(480,206,610,206,AMB); }},
]},
// ============ c5 division ============
c5:{frames:[
 {cap:"<b>156 ÷ 12</b> asks: how many groups of 12 fit in 156? Picture 156 as a long bar.",
  draw(s){ s.rect(60,140,520,54,"#e0e7ff",{stroke:IND,"stroke-width":2}); s.txt(320,172,"156",22,{fw:"800",fill:"#1e1b4b"}); }},
 {cap:"Grab a <b>big friendly chunk</b>: 10 groups of 12 = 120. That leaves 156 − 120 = 36.",
  draw(s){ s.rect(60,140,400,54,IND,{anim:"pop"}); s.txt(260,172,"120 = 10 groups of 12",17,{fw:"800",fill:"#fff"});
    s.txt(520,172,"36",18,{fw:"800",key:"rem"}); }},
 {cap:"36 left: that's 3 more groups of 12. Total: 10 + 3 = <b>13 groups</b>. So 156 ÷ 12 = 13. ✔ Check: 13 × 12 = 156.",
  draw(s){ s.rect(460,140,120,54,GRN,{anim:"pop",key:"rem"}); s.txt(520,172,"36 = 3 groups",14,{fw:"800",fill:"#fff"});
    s.txt(320,80,"156 ÷ 12 = 10 + 3 = 13",24,{fw:"800",anim:"slide"}); }},
 {cap:"What about <b>158 ÷ 12</b>? 13 groups use 156, leaving <b>remainder 2</b>. Write it three ways: 13 R2, 13 {{2/12}} = 13 {{1/6}}, or ≈ 13.17. <b>The problem's story tells you which to use!</b>",
  draw(s){ s.rect(90,230,460,80,"none",{stroke:AMB,"stroke-width":2,rx:12,anim:"pop"});
    s.txt(320,262,"158 ÷ 12 = 13 R2",20,{fw:"800",anim:"pop"});
    s.txt(320,292,"13 buses needed? Round UP to 14! Leftover pizza? R2 is fine.",14,{fill:GRY,anim:"pop"}); }},
]},
// ============ c6 decimal operations ============
c6:{frames:[
 {cap:"Adding decimals: <b>line up the decimal points!</b> 2.45 + 1.3 — give 1.3 a helper zero: 1.30.",
  draw(s){ ["2.45","+ 1.30"].forEach((t,i)=>s.txt(200,110+i*36,t,26,{fw:"700",ta:"end"}));
    s.line(120,158,210,158,"currentColor",{sw:2}); s.line(178,70,178,170,RED,{sw:1.5,"stroke-dasharray":"4 3"});
    s.txt(178,60,"points aligned",12,{fill:RED}); }},
 {cap:"Now add place by place: 2.45 + 1.30 = <b>3.75</b>. The decimal point drops straight down.",
  draw(s){ s.txt(200,192,"3.75",26,{fw:"800",fill:GRN,ta:"end",anim:"pop"}); }},
 {cap:"Multiplying: <b>0.3 × 0.4</b> on a hundredths grid — shade 0.4 of the width, 0.3 of the height. The overlap is 12 squares out of 100 = <b>0.12</b>.",
  draw(s){ const x=330,y=80,w=200; s.grid(x,y,w,w,10,10); s.rect(x,y,w*0.4,w,"#bae6fd",{"fill-opacity":.7,anim:"pop"});
    s.rect(x,y,w,w*0.3,"#fecaca",{"fill-opacity":.7,anim:"pop"}); s.rect(x,y,w*0.4,w*0.3,"#a78bfa",{anim:"pop"});
    s.txt(x+w/2,y+w+24,"0.3 × 0.4 = 0.12 (tenths × tenths = hundredths)",14,{fw:"700"}); }},
 {cap:"Dividing: <b>1.5 ÷ 0.3</b> asks “how many 0.3-hops make 1.5?” Hop the number line: <b>5 hops</b>. So 1.5 ÷ 0.3 = 5.",
  draw(s){ const y=300; s.line(40,y,300,y,GRY,{sw:3}); for(let i=0;i<=5;i++){ s.line(40+i*50,y-7,40+i*50,y+7,GRY); s.txt(40+i*50,y+22,(i*0.3).toFixed(1),11,{fill:GRY}); }
    for(let i=0;i<5;i++) s.n("path",{d:`M ${45+i*50} ${y-4} Q ${65+i*50} ${y-36} ${88+i*50} ${y-4}`,stroke:GRN,fill:"none","stroke-width":2.5,anim:"draw"});
    s.txt(170,240,"5 hops!",16,{fw:"800",fill:GRN,anim:"pop"}); }},
]},
// ============ c7 order of operations ============
c7:{frames:[
 {cap:"Evaluate <b>2 × (8 + 7)</b>. Grouping symbols ( ), [ ], { } always shout: <b>“ME FIRST!”</b>",
  draw(s){ s.txt(320,140,"2 × (8 + 7)",40,{fw:"800",key:"expr"});
    s.n("ellipse",{cx:382,cy:128,rx:88,ry:36,fill:"none",stroke:AMB,"stroke-width":3,anim:"pop"}); }},
 {cap:"Inside the parentheses: 8 + 7 = <b>15</b>.",
  draw(s){ s.txt(320,140,"2 × 15",40,{fw:"800",key:"expr",anim:"pop"}); }},
 {cap:"Now multiply: 2 × 15 = <b>30</b>.",
  draw(s){ s.txt(320,140,"2 × 15 = 30",40,{fw:"800",fill:GRN,key:"expr",anim:"pop"}); }},
 {cap:"⚠️ Without the rule you'd get 2 × 8 = 16, then +7 = 23 — <b>wrong!</b> Order of operations: <b>Grouping symbols → × and ÷ (left to right) → + and − (left to right)</b>.",
  draw(s){ s.txt(320,230,"2 × 8 + 7 = 23 ✗",24,{fill:RED,anim:"slide",key:"bad"});
    s.line(215,222,425,222,RED,{sw:3,anim:"pop"});
    s.rect(120,260,400,52,"none",{stroke:SKY,"stroke-width":2,rx:12,anim:"pop"});
    s.txt(320,292,"( ) → × ÷ → + −",22,{fw:"800",anim:"pop"}); }},
 {cap:"You can also <b>compare without computing</b>: 3 × (18,932 + 921) is exactly <b>3 times as large</b> as 18,932 + 921. No arithmetic needed!",
  draw(s){ s.txt(320,60,"3 × (18,932 + 921)  =  3 × [that sum]",20,{fw:"700",anim:"slide",key:"cmp"}); }},
]},
// ============ c8 patterns & function machines ============
c8:{frames:[
 {cap:"A <b>function machine</b> takes an input, applies a rule, and gives an output. This machine's rule is <b>× 3</b>. Put in 1 → out comes 3.",
  draw(s){ s.rect(240,110,160,110,IND,{rx:16}); s.txt(320,155,"RULE",14,{fill:"#c7d2fe"}); s.txt(320,185,"× 3",30,{fw:"800",fill:"#fff"});
    s.arrow(160,165,235,165,GRY); s.arrow(405,165,480,165,GRY);
    s.chip(140,165,"1",SKY,{key:"in"}); s.chip(505,165,"3",GRN,{key:"out"}); }},
 {cap:"Feed it 2, 3, 4 … the table of <b>input → output</b> pairs grows: (2,6), (3,9), (4,12).",
  draw(s){ s.chip(140,165,"4",SKY,{key:"in"}); s.chip(505,165,"12",GRN,{key:"out"});
    const rows=[["in","out"],["1","3"],["2","6"],["3","9"],["4","12"]];
    rows.forEach((r,i)=>{ s.rect(60,40+i*30,50,28,i?"none":"#e0e7ff",{stroke:GRY,"stroke-width":1}); s.rect(110,40+i*30,50,28,i?"none":"#e0e7ff",{stroke:GRY,"stroke-width":1});
      s.txt(85,60+i*30,r[0],14,{fw:i?"400":"700"}); s.txt(135,60+i*30,r[1],14,{fw:i?"400":"700"}); }); }},
 {cap:"<b>Multiplicative</b> pattern: y = 3 × x (multiply). <b>Additive</b> pattern: y = x + 3 (add). Compare outputs for the same inputs — very different!",
  draw(s){ const rows=[["x","×3","+3"],["1","3","4"],["2","6","5"],["3","9","6"],["4","12","7"]];
    rows.forEach((r,i)=>{ r.forEach((c,j)=>{ s.rect(420+j*54,40+i*30,52,28,i?"none":"#fef3c7",{stroke:GRY,"stroke-width":1,anim:"slide"});
      s.txt(446+j*54,60+i*30,c,14,{fw:i?"400":"700"}); }); }); }},
 {cap:"Turn pairs into <b>ordered pairs</b> and graph them! (1,3), (2,6) … the ×3 pattern makes a straight line through the origin — corresponding terms are always <b>3 times</b> apart.",
  draw(s){ const A=axes(s,90,300,190,190,12); [[1,3],[2,6],[3,9],[4,12]].forEach(([x,y],i)=>{ const [px,py]=A.px(x,y); s.circ(px,py,6,IND,{anim:"pop"}); }); }},
]},
// ============ c9 variables & equations ============
c9:{frames:[
 {cap:"A letter can stand for an unknown number. <b>x + 3 = 10</b> — picture a balance scale: both sides weigh the same.",
  draw(s){ s.line(320,90,320,150,GRY,{sw:5}); s.line(160,150,480,150,GRY,{sw:5});
    s.line(160,150,160,180,GRY,{sw:3}); s.line(480,150,480,180,GRY,{sw:3});
    s.rect(105,182,115,46,"none",{stroke:IND,"stroke-width":2,rx:8}); s.txt(162,212,"x + 3",20,{fw:"800"});
    s.rect(425,182,110,46,"none",{stroke:IND,"stroke-width":2,rx:8}); s.txt(480,212,"10",20,{fw:"800"});
    s.poly("300,255 340,255 320,232","#94a3b8"); }},
 {cap:"To find x, <b>take 3 away from BOTH sides</b> — the scale stays balanced.",
  draw(s){ s.txt(162,262,"− 3",18,{fill:RED,fw:"800",anim:"pop"}); s.txt(480,262,"− 3",18,{fill:RED,fw:"800",anim:"pop"}); }},
 {cap:"<b>x = 7</b>. Always check by substituting back: 7 + 3 = 10 ✔",
  draw(s){ s.rect(230,285,180,44,GRN,{rx:10,anim:"pop"}); s.txt(320,313,"x = 7  ✔",22,{fw:"800",fill:"#fff"}); }},
 {cap:"True or false? An equation or inequality can be <b>tested</b> with a value. Is 4 + n &gt; 10 true when n = 5? Try it: 4 + 5 = 9, and 9 &gt; 10 is <b>FALSE</b>. When n = 7: 11 &gt; 10 <b>TRUE</b> ✔",
  draw(s){ s.rect(70,40,500,44,"none",{stroke:AMB,"stroke-width":2,rx:10,anim:"slide"});
    s.txt(320,68,"n = 5 → 9 > 10 ✗     n = 7 → 11 > 10 ✔",18,{fw:"700",anim:"slide"}); }},
]},
// ============ c10 add/subtract fractions ============
c10:{frames:[
 {cap:"<b>{{1/2}} + {{1/3}}</b> — but halves and thirds are different-sized pieces. You can't add pieces that don't match!",
  draw(s){ s.fbar(80,90,220,54,2,1,IND); s.txt(190,175,"1/2",17,{fw:"700"});
    s.txt(320,125,"+",30,{fw:"800"}); s.fbar(350,90,220,54,3,1,SKY); s.txt(460,175,"1/3",17,{fw:"700"}); }},
 {cap:"Find a <b>common denominator</b>: 6 works for both (2 × 3). Re-slice: {{1/2}} = {{3/6}} and {{1/3}} = {{2/6}}. Same shaded amount — smaller matching pieces!",
  draw(s){ s.fbar(80,90,220,54,6,3,IND,{key:"b1",anim:"pop"}); s.txt(190,175,"3/6",17,{fw:"700",key:"l1",anim:"pop"});
    s.fbar(350,90,220,54,6,2,SKY,{key:"b2",anim:"pop"}); s.txt(460,175,"2/6",17,{fw:"700",key:"l2",anim:"pop"}); }},
 {cap:"Now the pieces match — combine them: 3 sixths + 2 sixths = <b>{{5/6}}</b>.",
  draw(s){ const g=s.n("g",{anim:"pop"}); s.fbar(210,220,220,54,6,5,GRN,{parent:g}); s.txt(320,305,"3/6 + 2/6 = 5/6",20,{fw:"800",fill:GRN,anim:"pop"}); }},
 {cap:"The recipe: ① find the LCD ② make equivalent fractions ③ add the numerators. For mixed numbers, handle wholes and fractions (regroup if needed). <b>Estimate first</b> with benchmarks: {{1/2}} + {{1/3}} ≈ 1/2 + 1/2 = 1, so 5/6 is reasonable ✔",
  draw(s){ s.rect(110,40,420,40,"none",{stroke:AMB,"stroke-width":2,rx:10,anim:"slide"}); s.txt(320,66,"LCD → equivalent fractions → add tops",17,{fw:"700",anim:"slide"}); }},
]},
// ============ c11 fractions as division ============
c11:{frames:[
 {cap:"<b>3 pizzas, 4 friends.</b> How much pizza does each friend get? That's a division problem: 3 ÷ 4.",
  draw(s){ [0,1,2].forEach(i=>s.circ(180+i*140,120,54,"#fbbf24",{stroke:"#b45309","stroke-width":3}));
    [0,1,2,3].forEach(i=>s.txt(212+i*74,260,"🧒",30)); }},
 {cap:"Cut <b>each pizza into 4 equal slices</b> (fourths).",
  draw(s){ [0,1,2].forEach(i=>{ const cx=180+i*140; s.line(cx-54,120,cx+54,120,"#b45309",{anim:"pop"}); s.line(cx,66,cx,174,"#b45309",{anim:"pop"}); }); }},
 {cap:"Deal them out: every friend gets <b>1 slice from each pizza</b> = 3 slices = <b>{{3/4}} of a pizza</b>.",
  draw(s){ [0,1,2,3].forEach(i=>{ s.fbar(180+i*74,285,64,20,4,3,GRN,{anim:"pop"}); }); }},
 {cap:"Big idea: <b>a ÷ b = {{a/b}}</b>. The fraction bar IS a division sign! 3 ÷ 4 = 3/4, and 13 ÷ 4 = 13/4 = 3{{1/4}} — that's how division answers become mixed numbers.",
  draw(s){ s.rect(150,30,340,44,"none",{stroke:IND,"stroke-width":2.5,rx:10,anim:"pop"}); s.txt(320,58,"a ÷ b = a/b     3 ÷ 4 = 3/4",20,{fw:"800",anim:"pop"}); }},
]},
// ============ c12 multiply fractions & scaling ============
c12:{frames:[
 {cap:"<b>{{2/3}} × {{4/5}}</b> means “2/3 <b>of</b> 4/5.” Start with one whole square and shade <b>{{4/5}}</b> of it (vertical stripes).",
  draw(s){ const x=210,y=70,w=220; s.grid(x,y,w,w,5,3); s.rect(x,y,w*0.8,w,"#bae6fd",{"fill-opacity":.75,anim:"pop"}); s.txt(x+w/2,y+w+26,"4/5 shaded",15,{fw:"700"}); }},
 {cap:"Now take <b>{{2/3}}</b> of that shaded part (horizontal band).",
  draw(s){ const x=210,y=70,w=220; s.rect(x,y,w,w*(2/3),"#fecaca",{"fill-opacity":.6,anim:"pop"}); }},
 {cap:"The double-shaded overlap: <b>8 pieces out of 15</b>. So {{2/3}} × {{4/5}} = {{8/15}}. Shortcut: multiply tops (2×4=8) and bottoms (3×5=15)!",
  draw(s){ const x=210,y=70,w=220; s.rect(x,y,w*0.8,w*(2/3),"#a78bfa",{anim:"pop"});
    s.txt(320,40,"2/3 × 4/5 = 8/15",24,{fw:"800",anim:"slide"}); }},
 {cap:"<b>Scaling</b>: you can predict the size without multiplying! × a fraction <b>less than 1</b> shrinks: {{1/2}} × 8 = 4 &lt; 8. × a number <b>greater than 1</b> grows: {{3/2}} × 8 = 12 &gt; 8. × 1 keeps it the same.",
  draw(s){ const y=320; s.line(60,y,580,y,GRY,{sw:3}); [0,4,8,12].forEach(v=>{ s.line(60+v*40,y-7,60+v*40,y+7,GRY); s.txt(60+v*40,y+22,String(v),12,{fill:GRY}); });
    s.circ(60+8*40,y,7,"currentColor",{}); s.arrow(60+8*40,y-26,60+4*40,y-26,SKY,{}); s.txt(300,y-40,"× 1/2",14,{fw:"700",fill:SKY});
    s.arrow(60+8*40,y-64,60+12*40,y-64,RED,{}); s.txt(470,y-78,"× 3/2",14,{fw:"700",fill:RED}); }},
]},
// ============ c13 divide unit fractions ============
c13:{frames:[
 {cap:"<b>3 ÷ {{1/4}}</b> asks: “how many quarter-pieces fit in 3 wholes?” Here are 3 whole sandwiches.",
  draw(s){ [0,1,2].forEach(i=>s.rect(90+i*160,100,140,60,"#fbbf24",{stroke:"#b45309","stroke-width":2,rx:6})); }},
 {cap:"Cut every whole into <b>fourths</b>…",
  draw(s){ [0,1,2].forEach(i=>{ for(let k=1;k<4;k++) s.line(90+i*160+k*35,100,90+i*160+k*35,160,"#b45309",{anim:"pop"}); }); }},
 {cap:"Count the pieces: 4 + 4 + 4 = <b>12</b>. So 3 ÷ {{1/4}} = 12 = 3 × 4. Dividing by a unit fraction = multiplying by its denominator!",
  draw(s){ [0,1,2].forEach(i=>{ for(let k=0;k<4;k++) s.txt(90+i*160+17+k*35,195,String(i*4+k+1),13,{fill:GRN,fw:"700",anim:"pop"}); });
    s.txt(320,50,"3 ÷ 1/4 = 3 × 4 = 12",24,{fw:"800",anim:"slide"}); }},
 {cap:"The other direction: <b>{{1/3}} ÷ 4</b> = share one-third among 4 people. The third gets split into 4 slivers — each is <b>{{1/12}}</b> of the whole (denominators multiply: 3 × 4 = 12).",
  draw(s){ s.fbar(150,250,340,50,3,1,IND,{}); [1,2,3].forEach(k=>s.line(150+k*(340/12),250,150+k*(340/12),300,"#fff",{anim:"pop",sw:2}));
    s.txt(320,330,"1/3 ÷ 4 = 1/12",20,{fw:"800",anim:"pop"}); }},
]},
// ============ c14 measurement conversions ============
c14:{frames:[
 {cap:"<b>Metric</b> units are a staircase of 10s: km → m → cm → mm. Going <b>down</b> to smaller units? <b>Multiply</b>. Going up? Divide.",
  draw(s){ const steps=[["km","× 1000"],["m","× 100"],["cm","× 10"],["mm",""]];
    steps.forEach((st,i)=>{ s.rect(90+i*120,80+i*50,110,44,IND,{rx:10}); s.txt(145+i*120,108+i*50,st[0],19,{fw:"800",fill:"#fff"});
      if(st[1]) s.txt(205+i*120,70+i*50+52,st[1],13,{fill:AMB,fw:"700"}); }); }},
 {cap:"<b>3.5 m = ? cm</b> — meters to centimeters is one hop down: × 100. So 3.5 × 100 = <b>350 cm</b> (digits slide 2 places!).",
  draw(s){ s.arrow(240,150,330,195,GRN,{}); s.txt(320,300,"3.5 m × 100 = 350 cm",22,{fw:"800",fill:GRN,anim:"pop"}); }},
 {cap:"<b>Customary</b> units you must memorize: 1 ft = 12 in · 1 yd = 3 ft · 1 mi = 5,280 ft · 1 lb = 16 oz · 1 gal = 4 qt = 8 pt = 16 cups.",
  draw(s){ s.rect(70,50,500,110,"none",{stroke:SKY,"stroke-width":2,rx:12,anim:"pop",key:"box"});
    ["1 ft = 12 in      1 yd = 3 ft      1 mi = 5,280 ft","1 lb = 16 oz      1 ton = 2,000 lb","1 gal = 4 qt      1 qt = 2 pt      1 pt = 2 cups"].forEach((t,i)=>s.txt(320,85+i*30,t,15.5,{fw:"600",anim:"pop"})); }},
 {cap:"Chain conversions for word problems: <b>2 yd = ? in</b> → 2 yd = 6 ft = <b>72 in</b>. Multi-step: convert first, THEN compare, add, or subtract.",
  draw(s){ s.chip(160,250,"2 yd",IND,{key:"c1x"}); s.arrow(200,250,260,250,AMB,{key:"a1"}); s.txt(230,235,"×3",13,{fw:"700",fill:AMB,key:"t1"});
    s.chip(300,250,"6 ft",SKY,{key:"c2x"}); s.arrow(340,250,400,250,AMB,{key:"a2"}); s.txt(370,235,"×12",13,{fw:"700",fill:AMB,key:"t2"});
    s.chip(450,250,"72 in",GRN,{key:"c3x"}); }},
]},
// ============ c15 volume ============
c15:{frames:[
 {cap:"<b>Volume</b> = how many <b>unit cubes</b> fill a solid, measured in cubic units. Here's a box that is 4 long, 3 wide, 2 tall.",
  draw(s){ const d=38*0.45; s.poly(`170,120 ${170+4*38},120 ${170+4*38+3*d},${120-3*d} ${170+3*d},${120-3*d}`,"none",{stroke:GRY,"stroke-width":2});
    s.poly(`170,120 170,${120+2*38} ${170+4*38},${120+2*38} ${170+4*38},120`,"none",{stroke:GRY,"stroke-width":2});
    s.poly(`${170+4*38},120 ${170+4*38+3*d},${120-3*d} ${170+4*38+3*d},${120-3*d+2*38} ${170+4*38},${120+2*38}`,"none",{stroke:GRY,"stroke-width":2});
    s.txt(245,290,"4 long",14,{fill:GRY}); s.txt(420,270,"3 wide",14,{fill:GRY}); s.txt(130,180,"2 tall",14,{fill:GRY}); }},
 {cap:"Fill the <b>bottom layer</b>: 4 × 3 = <b>12 cubes</b>.",
  draw(s){ for(let r=2;r>=0;r--) for(let c=0;c<4;c++) s.cube(170+c*38+r*17,120+38+ -r*17+38-38,38,SKY,{anim:"pop"}); s.txt(540,120,"layer 1 = 12",15,{fw:"700",key:"lay"}); }},
 {cap:"Stack a <b>second layer</b> of 12 on top: 12 × 2 = <b>24 cubes</b>. Volume = 24 cubic units!",
  draw(s){ for(let r=2;r>=0;r--) for(let c=0;c<4;c++) s.cube(170+c*38+r*17,120-r*17,38,IND,{anim:"pop"}); s.txt(540,120,"2 layers = 24",15,{fw:"700",key:"lay"}); }},
 {cap:"The formulas do the counting for you: <b>V = length × width × height</b> = 4 × 3 × 2 = 24, or <b>V = Base area × height</b> = 12 × 2 = 24.",
  draw(s){ s.rect(120,300,400,36,"none",{stroke:AMB,"stroke-width":2,rx:10,anim:"pop"}); s.txt(320,324,"V = l × w × h  =  B × h",19,{fw:"800",anim:"pop"}); }},
 {cap:"<b>Composite figures</b>: an L-shape is two boxes! Find each volume and <b>ADD</b>: (5×2×2) + (2×2×3) = 20 + 12 = 32 cubic units. Volume is additive.",
  draw(s){ s.n("g",{anim:"slide",key:"comp"});
    s.rect(470,190,120,48,"#c7d2fe",{stroke:IND,"stroke-width":2,anim:"slide"}); s.rect(470,142,48,48,"#bbf7d0",{stroke:GRN,"stroke-width":2,anim:"slide"});
    s.txt(530,218,"20",16,{fw:"800",fill:"#1e1b4b"}); s.txt(494,170,"12",14,{fw:"800",fill:"#14532d"});
    s.txt(530,262,"20 + 12 = 32",15,{fw:"800",anim:"pop"}); }},
]},
// ============ c16 coordinate plane ============
c16:{frames:[
 {cap:"The <b>coordinate plane</b>: the x-axis runs → and the y-axis runs ↑. They cross at the <b>origin (0,0)</b>. An ordered pair (x, y) names any point.",
  draw(s){ axes(s); s.txt(430,80,"(x, y)",22,{fw:"800",fill:IND}); s.txt(430,108,"across, then up",14,{fill:GRY}); }},
 {cap:"Plot <b>(3, 2)</b>: from the origin go <b>RIGHT 3</b> (x first!)…",
  draw(s){ const A={px:(x,y)=>[90+x*230/6,290-y*230/6]}; const [px,py]=A.px(3,0); s.arrow(90,290,px,py,AMB,{key:"mv"}); }},
 {cap:"…then <b>UP 2</b>. That's the point (3, 2). ✔ x is ALWAYS first: “run before you jump!”",
  draw(s){ const A={px:(x,y)=>[90+x*230/6,290-y*230/6]}; const [px,py]=A.px(3,2); s.arrow(90+3*230/6,290,px,py,AMB,{key:"mv"});
    s.circ(px,py,7,IND,{anim:"pop"}); s.txt(px+34,py-6,"(3, 2)",16,{fw:"800",fill:IND,anim:"pop"}); }},
 {cap:"⚠️ Order matters! <b>(2, 3)</b> is a DIFFERENT point than (3, 2). Swapping x and y is the #1 test mistake.",
  draw(s){ const [px,py]=[90+2*230/6,290-3*230/6]; s.circ(px,py,7,RED,{anim:"pop"}); s.txt(px-40,py-8,"(2, 3)",16,{fw:"800",fill:RED,anim:"pop"}); }},
 {cap:"Graphs tell stories: plotting a pattern like (1,2), (2,4), (3,6) shows the relationship <b>y = 2 × x</b> as a straight line of points.",
  draw(s){ [[1,2],[2,4],[3,6]].forEach(([x,y])=>{ s.circ(90+x*230/6,290-y*230/6,6,GRN,{anim:"pop"}); }); s.txt(480,200,"y = 2 × x",18,{fw:"800",fill:GRN,anim:"pop"}); }},
]},
// ============ c17 classify 2D figures ============
c17:{frames:[
 {cap:"Shapes live in a <b>family tree</b>. Every property of a parent is inherited by ALL its children.",
  draw(s){ const box=(x,y,t,c)=>{ s.rect(x-62,y-18,124,36,"none",{stroke:c,"stroke-width":2.5,rx:9}); s.txt(x,y+6,t,14.5,{fw:"700"}); };
    box(320,50,"Quadrilateral",GRY); s.line(320,68,180,102,GRY); s.line(320,68,420,102,GRY);
    box(180,120,"Trapezoid",SKY); box(420,120,"Parallelogram",IND);
    s.line(420,138,340,172,GRY); s.line(420,138,500,172,GRY);
    box(340,190,"Rectangle",GRN); box(500,190,"Rhombus",AMB);
    s.line(340,208,420,242,GRY); s.line(500,208,420,242,GRY);
    box(420,260,"Square",RED); }},
 {cap:"Follow the path: a <b>square</b> is a rectangle AND a rhombus AND a parallelogram AND a quadrilateral. So “every square is a rectangle” ✔ — but “every rectangle is a square” ✗!",
  draw(s){ s.n("path",{d:"M 420 242 L 340 208 M 340 172 L 420 138 M 420 102 L 320 68",stroke:RED,fill:"none","stroke-width":4,"stroke-linecap":"round",anim:"draw"}); }},
 {cap:"<b>Triangles by sides</b>: scalene (0 equal sides), isosceles (2 equal), equilateral (3 equal).",
  draw(s){ s.svg.innerHTML=""; const names=[["Scalene","0 equal sides"],["Isosceles","2 equal sides"],["Equilateral","3 equal sides"]];
    const tris=["70,120 190,120 160,45","260,120 380,120 320,38","450,120 570,120 510,16"];
    tris.forEach((p,i)=>{ s.poly(p,"none",{stroke:IND,"stroke-width":3,anim:"pop"}); s.txt(130+190*i,150,names[i][0],15,{fw:"800"}); s.txt(130+190*i,170,names[i][1],12.5,{fill:GRY}); }); }},
 {cap:"<b>Triangles by angles</b>: acute (all &lt; 90°), right (one = 90°), obtuse (one &gt; 90°). A triangle's three angles always add to 180°!",
  draw(s){ const names=[["Acute","all angles < 90°"],["Right","one 90° angle"],["Obtuse","one angle > 90°"]];
    const tris=["70,310 190,310 130,225","260,310 380,310 260,225","450,310 570,310 425,268"];
    tris.forEach((p,i)=>{ s.poly(p,"none",{stroke:GRN,"stroke-width":3,anim:"pop"}); s.txt(130+190*i,333,names[i][0],15,{fw:"800"}); });
    s.rect(260,292,17,17,"none",{stroke:GRN,"stroke-width":2}); s.txt(320,355,"angles always sum to 180°",13,{fill:GRY}); }},
]},
// ============ c18 3D figures & nets ============
c18:{frames:[
 {cap:"A <b>net</b> is a 3-D shape unfolded flat. Six identical squares in a cross — what will it fold into?",
  draw(s){ const q=52, x=210,y=60; [[1,0],[0,1],[1,1],[2,1],[1,2],[1,3]].forEach(([c,r],i)=>{
    s.rect(x+c*q,y+r*q,q-3,q-3,"#bae6fd",{stroke:SKY,"stroke-width":2,anim:"pop"}); s.txt(x+c*q+q/2,y+r*q+q/2+6,String(i+1),16,{fw:"700",fill:"#0c4a6e"}); }); }},
 {cap:"Fold up the sides… it becomes a <b>cube</b>! A cube has <b>6 faces, 12 edges, 8 vertices</b> (corners).",
  draw(s){ s.cube(460,160,80,SKY,{anim:"pop"}); s.txt(500,290,"6 faces · 12 edges · 8 vertices",14,{fw:"700",anim:"pop"}); }},
 {cap:"A square + 4 triangles folds into a <b>square pyramid</b>: 5 faces, 8 edges, 5 vertices. Prisms have two matching parallel bases; pyramids have one base and a point (apex).",
  draw(s){ s.svg.innerHTML=""; const q=62,x=120,y=120;
    s.rect(x,y,q,q,"#fde68a",{stroke:AMB,"stroke-width":2});
    s.poly(`${x},${y} ${x+q},${y} ${x+q/2},${y-52}`,"none",{stroke:AMB,"stroke-width":2,anim:"pop"});
    s.poly(`${x},${y+q} ${x+q},${y+q} ${x+q/2},${y+q+52}`,"none",{stroke:AMB,"stroke-width":2,anim:"pop"});
    s.poly(`${x},${y} ${x},${y+q} ${x-52},${y+q/2}`,"none",{stroke:AMB,"stroke-width":2,anim:"pop"});
    s.poly(`${x+q},${y} ${x+q},${y+q} ${x+q+52},${y+q/2}`,"none",{stroke:AMB,"stroke-width":2,anim:"pop"});
    s.poly("400,240 540,240 470,110","#fde68a",{stroke:AMB,"stroke-width":2,anim:"pop"});
    s.line(400,240,470,262,AMB,{sw:2}); s.line(540,240,470,262,AMB,{sw:2}); s.line(470,110,470,262,AMB,{sw:1.5,"stroke-dasharray":"4 3"});
    s.txt(470,300,"square pyramid: 5 faces · 8 edges · 5 vertices",14,{fw:"700"}); }},
 {cap:"The 3-D family: <b>prisms</b> (2 parallel bases — name comes from base shape), <b>pyramids</b> (1 base + apex), and the curved crew: <b>cylinder</b> (2 circles), <b>cone</b> (1 circle + apex), <b>sphere</b> (no flat faces at all).",
  draw(s){ s.rect(60,320,520,0,"none"); s.txt(320,340,"prism · pyramid · cylinder · cone · sphere",16,{fw:"700",fill:IND,anim:"slide"}); }},
]},
// ============ c19 line plots ============
c19:{frames:[
 {cap:"We measured 10 caterpillars to the nearest {{1/4}} inch. A <b>line plot</b> stacks an ✗ for each measurement above a number line.",
  draw(s){ const x0=100,y=270,w=440; s.line(x0,y,x0+w,y,GRY,{sw:3});
    const ticks=["1","1 1/4","1 1/2","1 3/4","2"]; ticks.forEach((t,i)=>{ s.line(x0+i*w/4,y-8,x0+i*w/4,y+8,GRY); s.txt(x0+i*w/4,y+28,t,13,{fill:GRY}); }); }},
 {cap:"Data: 1, 1{{1/4}}, 1{{1/4}}, 1{{1/2}}, 1{{1/2}}, 1{{1/2}}, 1{{3/4}}, 1{{3/4}}, 2, 1{{1/2}} — each ✗ lands on its value.",
  draw(s){ const x0=100,y=270,w=440; const counts=[1,2,4,2,1];
    counts.forEach((n,i)=>{ for(let k=0;k<n;k++) s.txt(x0+i*w/4,y-22-k*26,"✗",22,{fill:IND,fw:"800",anim:"pop"}); }); }},
 {cap:"Read it! Most common length (the tallest stack): <b>1{{1/2}} in</b>. Range = longest − shortest = 2 − 1 = <b>1 inch</b>. Number measured = count all ✗s = <b>10</b>.",
  draw(s){ s.rect(275,140,90,120,"none",{stroke:GRN,"stroke-width":2.5,rx:10,anim:"pop"}); }},
 {cap:"Line plots + fraction skills together: total length = 1 + 2×(1{{1/4}}) + 4×(1{{1/2}}) + 2×(1{{3/4}}) + 2 = <b>15 inches</b>. Test questions love asking totals and differences from the plot!",
  draw(s){ s.rect(120,40,400,44,"none",{stroke:AMB,"stroke-width":2,rx:10,anim:"pop"}); s.txt(320,68,"Add the data right off the plot!",17,{fw:"700",anim:"pop"}); }},
]},
// ============ c20 data displays ============
c20:{frames:[
 {cap:"One class survey, many displays! A <b>frequency table</b> counts how many chose each pet.",
  draw(s){ const rows=[["Pet","Votes"],["Dog","8"],["Cat","6"],["Fish","3"],["Bird","2"]];
    rows.forEach((r,i)=>{ s.rect(70,50+i*36,90,34,i?"none":"#e0e7ff",{stroke:GRY,"stroke-width":1}); s.rect(160,50+i*36,70,34,i?"none":"#e0e7ff",{stroke:GRY,"stroke-width":1});
      s.txt(115,73+i*36,r[0],15,{fw:i?"400":"700"}); s.txt(195,73+i*36,r[1],15,{fw:i?"400":"700"}); }); }},
 {cap:"The same data as a <b>bar graph</b> — compare categories at a glance. Dogs win!",
  draw(s){ const x0=300,y0=250; s.line(x0,y0,x0+270,y0,GRY,{sw:2}); s.line(x0,y0,x0,80,GRY,{sw:2});
    const data=[["Dog",8,IND],["Cat",6,SKY],["Fish",3,GRN],["Bird",2,AMB]];
    data.forEach((d,i)=>{ s.rect(x0+20+i*64,y0-d[1]*20,44,d[1]*20,d[2],{anim:"pop"}); s.txt(x0+42+i*64,y0+20,d[0],13,{fill:GRY}); s.txt(x0+42+i*64,y0-d[1]*20-8,String(d[1]),13,{fw:"700"}); }); }},
 {cap:"Data that changes <b>over time</b> → use a <b>line graph</b>. Temperature across a week rises and falls — the line shows the trend.",
  draw(s){ s.svg.innerHTML=""; const x0=90,y0=270; s.line(x0,y0,x0+460,y0,GRY,{sw:2}); s.line(x0,y0,x0,60,GRY,{sw:2});
    const temps=[60,64,70,68,74,78,72]; const pts=temps.map((t,i)=>[x0+40+i*64,y0-(t-55)*7]);
    s.n("polyline",{points:pts.map(p=>p.join(",")).join(" "),fill:"none",stroke:IND,"stroke-width":3,anim:"draw"});
    pts.forEach((p,i)=>{ s.circ(p[0],p[1],5,IND,{}); s.txt(p[0],y0+20,["M","T","W","Th","F","Sa","Su"][i],12,{fill:GRY}); s.txt(p[0],p[1]-12,String(temps[i]),11,{fill:GRY}); });
    s.txt(320,40,"Line graph: change over time",16,{fw:"700"}); }},
 {cap:"A <b>stem-and-leaf plot</b> keeps every value: stems are tens, leaves are ones. KEY: 3 | 4 = 34. Data shown: 23, 25, 31, 34, 38, 42.",
  draw(s){ s.svg.innerHTML=""; s.txt(220,60,"Stem | Leaf",18,{fw:"800"});
    [["2","3 5"],["3","1 4 8"],["4","2"]].forEach((r,i)=>{ s.txt(200,100+i*34,r[0],17,{fw:"700",ta:"end"}); s.txt(240,100+i*34,r[1],17,{ta:"start",anim:"pop"}); });
    s.line(215,70,215,205,GRY,{sw:2}); s.txt(220,240,"KEY: 3 | 4 = 34",15,{fill:GRY});
    s.txt(450,140,"Every data value\nis still visible!",15,{fw:"600"}); }},
 {cap:"A <b>scatterplot</b> shows PAIRS: hours studied vs. quiz score, one dot per student. More hours ↗ higher scores — that's a pattern in paired data (Texas tests this!).",
  draw(s){ s.svg.innerHTML=""; const A=axes(s,90,290,220,220,6);
    [[1,2],[2,3],[2,4],[3,4],[4,5],[5,6]].forEach(([x,y])=>{ const [px,py]=A.px(x,y); s.circ(px,py,6,RED,{anim:"pop"}); });
    s.txt(200,330,"hours studied →",13,{fill:GRY}); s.txt(430,150,"Each dot = one student's",14,{fw:"600"}); s.txt(430,172,"(hours, score) pair",14,{fw:"600"}); }},
]},
// ============ c21 mean median mode range ============
c21:{frames:[
 {cap:"Four friends scored <b>2, 4, 6, 8</b> points. The <b>mean</b> is the “fair share”: what everyone would have if all points were shared equally.",
  draw(s){ const heights=[2,4,6,8]; heights.forEach((h,i)=>{ for(let k=0;k<h;k++) s.rect(140+i*100,280-k*26,64,24,IND,{}); s.txt(172+i*100,310,"score "+h,13,{fill:GRY}); }); }},
 {cap:"<b>Level the towers!</b> Move blocks from tall stacks to short ones until they're equal — every tower becomes <b>5</b>. Mean = (2+4+6+8) ÷ 4 = 20 ÷ 4 = <b>5</b>.",
  draw(s){ const heights=[5,5,5,5]; s.svg.innerHTML="";
    heights.forEach((h,i)=>{ for(let k=0;k<h;k++) s.rect(140+i*100,280-k*26,64,24,k>=[2,4,5,5][i]&&i<2?GRN:(k<[2,4,6,8][i]?IND:GRN),{anim:k>=2?"pop":undefined}); s.txt(172+i*100,310,"5",15,{fw:"800"}); });
    s.txt(320,50,"mean = 20 ÷ 4 = 5",24,{fw:"800",fill:GRN,anim:"slide"}); }},
 {cap:"<b>Median</b> = middle of the ORDERED list: 2, 4, 6, 8 → middle two are 4 and 6 → median 5. <b>Mode</b> = most frequent value (this set has none!). <b>Range</b> = biggest − smallest = 8 − 2 = 6.",
  draw(s){ s.svg.innerHTML=""; ["2","4","6","8"].forEach((v,i)=>s.chip(220+i*70,120,v,i===1||i===2?AMB:GRY,{}));
    s.txt(320,180,"median = (4+6)÷2 = 5   ·   mode: none   ·   range = 8−2 = 6",16,{fw:"600",anim:"slide"}); }},
 {cap:"⚠️ Add one huge value, <b>20</b>: mean jumps to (20+20)÷5 = 8, but median only moves to 6. <b>Outliers drag the mean</b> — the median stays steady. Tests ask which measure describes data best!",
  draw(s){ ["2","4","6","8","20"].forEach((v,i)=>s.chip(180+i*70,250,v,i===4?RED:GRY,{key:"n"+i}));
    s.txt(320,310,"mean 5 → 8 (big jump!)   median 5 → 6 (small step)",16,{fw:"700",anim:"pop"}); }},
]},
// ============ c22 probability ============
c22:{frames:[
 {cap:"<b>Probability</b> measures how likely something is, from <b>0 (impossible)</b> to <b>1 (certain)</b>.",
  draw(s){ const y=150; s.line(70,y,570,y,GRY,{sw:4}); [0,.25,.5,.75,1].forEach((v,i)=>{ s.line(70+v*500,y-9,70+v*500,y+9,GRY,{sw:2});
    s.txt(70+v*500,y+30,["0","1/4","1/2","3/4","1"][i],15,{fw:"700"}); });
    ["impossible","unlikely","equally likely","likely","certain"].forEach((w,i)=>s.txt(70+i*125,y-24,w,12.5,{fill:GRY})); }},
 {cap:"A spinner with 4 equal sections, 1 red: P(red) = <b>favorable ÷ total</b> = {{1/4}}. Equal sections matter — probability assumes fair, equal chances.",
  draw(s){ const cx=200,cy=270,r=58; const cols=[RED,SKY,SKY,SKY];
    for(let i=0;i<4;i++){ const a0=i*Math.PI/2-Math.PI/2, a1=a0+Math.PI/2;
      s.n("path",{d:`M ${cx} ${cy} L ${cx+r*Math.cos(a0)} ${cy+r*Math.sin(a0)} A ${r} ${r} 0 0 1 ${cx+r*Math.cos(a1)} ${cy+r*Math.sin(a1)} Z`,fill:cols[i],stroke:"#fff","stroke-width":2,anim:"pop"}); }
    s.poly(`${cx-6},${cy-r-8} ${cx+6},${cy-r-8} ${cx},${cy-r+8}`,"currentColor");
    s.txt(370,265,"P(red) = 1/4",20,{fw:"800",anim:"pop"}); }},
 {cap:"<b>Sample space</b> = list of ALL possible outcomes. 3 shirts × 2 pants: a <b>tree diagram</b> finds every combo.",
  draw(s){ s.svg.innerHTML=""; const shirts=["R","B","G"], pants=["jeans","shorts"];
    shirts.forEach((sh,i)=>{ const y=90+i*90; s.chip(140,y,sh,IND,{});
      pants.forEach((p,j)=>{ const y2=y-22+j*44; s.line(165,y,240,y2,GRY); s.rect(245,y2-15,90,30,"none",{stroke:SKY,"stroke-width":2,rx:8,anim:"pop"}); s.txt(290,y2+5,p,13);
        s.txt(400,y2+5,sh+" + "+p,13,{fill:GRY,anim:"pop"}); }); }); }},
 {cap:"Count the ends of the branches: <b>6 outfits</b>. Shortcut — the <b>Fundamental Counting Principle</b>: 3 choices × 2 choices = 6. It works for any number of decisions!",
  draw(s){ s.rect(150,320,340,0,"none"); s.txt(320,335,"3 × 2 = 6 possible outcomes",20,{fw:"800",fill:GRN,anim:"pop"}); }},
]},
// ============ c23 financial literacy ============
c23:{frames:[
 {cap:"You earn money — but you don't keep it all! <b>Gross income</b> = everything you earn, before anything is taken out. Meet a $100 paycheck.",
  draw(s){ s.rect(120,110,400,70,GRN,{rx:12}); s.txt(320,152,"GROSS INCOME: $100",22,{fw:"800",fill:"#fff"}); }},
 {cap:"<b>Taxes</b> come out first: payroll & income tax (paycheck), sales tax (shopping), property tax (homes). Here $20 goes to taxes…",
  draw(s){ s.rect(420,110,100,70,RED,{rx:12,anim:"pop"}); s.txt(470,152,"TAX $20",16,{fw:"800",fill:"#fff"});
    s.arrow(470,190,470,240,RED,{}); s.txt(470,262,"to taxes",13,{fill:RED}); }},
 {cap:"…leaving <b>NET income: $80</b>. Remember: <b>net = gross − deductions</b>. Net is what actually lands in your pocket. (“Net” catches less — like a fishing net with holes!)",
  draw(s){ s.rect(120,110,300,70,GRN,{rx:12,key:"gross"}); s.txt(270,152,"NET: $80",22,{fw:"800",fill:"#fff",key:"nettxt"}); }},
 {cap:"A <b>budget</b> balances money in vs. money out. Income $80: plan $30 saving, $25 food, $15 fun, $10 gifts. If expenses &gt; income, cut spending or earn more!",
  draw(s){ const rows=[["Item","Plan"],["Save","$30"],["Food","$25"],["Fun","$15"],["Gifts","$10"],["Total","$80 ✔"]];
    rows.forEach((r,i)=>{ s.rect(180,205+i*22,140,21,i===0?"#e0e7ff":(i===5?"#dcfce7":"none"),{stroke:GRY,"stroke-width":1,rx:0});
      s.rect(320,205+i*22,80,21,i===0?"#e0e7ff":(i===5?"#dcfce7":"none"),{stroke:GRY,"stroke-width":1,rx:0});
      s.txt(250,220+i*22,r[0],12.5,{fw:i===0||i===5?"700":"400"}); s.txt(360,220+i*22,r[1],12.5,{fw:i===0||i===5?"700":"400"}); }); }},
 {cap:"Ways to pay: <b>cash</b> (simple, but can be lost), <b>check</b> (paper instructions to your bank), <b>debit card</b> (spends YOUR money instantly), <b>credit card</b> (borrows the bank's money — pay it back or owe interest!), <b>electronic payment</b> (fast, needs security).",
  draw(s){ ["💵 cash","🧾 check","💳 debit","💳 credit","📱 electronic"].forEach((t,i)=>{
    s.rect(60+i*108,300,100,34,"none",{stroke:SKY,"stroke-width":2,rx:9,anim:"pop"}); s.txt(110+i*108,322,t,12.5,{fw:"600"}); }); }},
]},
};
