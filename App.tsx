import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { CHAMPIONS, type Champion } from "./data/champions";
import { GameScene } from "./game/GameScene";

type Screen="menu"|"select"|"game";
type GameStats={hp:number;maxHp:number;level:number;gold:number;xp:number;xpNeed:number;kills:number;deaths:number;time:number;champion:string;skills:any[];blueCore:number;redCore:number;paused?:boolean;shop?:boolean;scoreboard?:boolean;result?:string};
export default function App(){
  const [screen,setScreen]=useState<Screen>("menu");
  const [chosen,setChosen]=useState<Champion>(CHAMPIONS[0]);
  const [stats,setStats]=useState<GameStats|null>(null);
  const [shop,setShop]=useState(false);
  const [pause,setPause]=useState(false);
  const [score,setScore]=useState(false);
  const [result,setResult]=useState("");
  const gameRef=useRef<Phaser.Game|null>(null);
  const hostRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(screen!=="game"||!hostRef.current)return;
    const game=new Phaser.Game({type:Phaser.AUTO,parent:hostRef.current,width:1100,height:700,backgroundColor:"#172a27",physics:{default:"arcade"},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[]});
    game.scene.add("GameScene",GameScene,true,{championId:chosen.id,onUpdate:(s:any)=>{
      setStats(s);if(s.shop!==undefined)setShop(s.shop);if(s.paused!==undefined)setPause(s.paused);if(s.scoreboard!==undefined)setScore(s.scoreboard);if(s.result)setResult(s.result);
    }});
    gameRef.current=game;
    return ()=>{game.destroy(true);gameRef.current=null;};
  },[screen,chosen]);
  const scene=()=>gameRef.current?.scene.getScene("GameScene") as GameScene|undefined;
  const start=()=>{setStats(null);setResult("");setShop(false);setPause(false);setScreen("game");};
  const fmt=(s:number)=>`${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
  if(screen==="menu")return <main className="menu"><div className="hero-mark">⚔</div><p className="eyebrow">SINGLE PLAYER · 5 VS 5</p><h1>AI MOBA <span>ARENA</span></h1><p className="sub">나만의 영웅으로 9명의 AI와 실시간 전투를 펼치세요.</p><button className="primary" onClick={()=>setScreen("select")}>게임 시작</button><div className="menu-foot">React · TypeScript · Phaser 3</div></main>;
  if(screen==="select")return <main className="select-screen"><header><div><p className="eyebrow">CHOOSE YOUR CHAMPION</p><h1>챔피언 선택</h1></div><button className="ghost" onClick={()=>setScreen("menu")}>뒤로</button></header><div className="champ-grid">{CHAMPIONS.map(c=><button key={c.id} className={`champ-card ${chosen.id===c.id?"chosen":""}`} onClick={()=>setChosen(c)}><div className="avatar" style={{background:`#${c.color.toString(16).padStart(6,"0")}`}}>{c.name.slice(0,1)}</div><b>{c.name}</b><span>{c.title}</span><small>{c.role}</small></button>)}</div><section className="chosen-panel"><div><b>{chosen.name} — {chosen.title}</b><p>{chosen.role} · 체력 {chosen.hp} · 공격력 {chosen.attack} · 사거리 {chosen.range}</p><p className="muted">패시브: {chosen.passive}</p></div><button className="primary" onClick={start}>이 챔피언으로 시작</button></section></main>;
  return <main className="game-screen">
    <header className="game-top"><div><b>⚔ AI MOBA ARENA</b><span>{stats?fmt(stats.time):"로딩 중"}</span></div><div className="core-bars"><span>아군 넥서스 {stats?Math.ceil(stats.blueCore):5000}</span><span>적 넥서스 {stats?Math.ceil(stats.redCore):5000}</span></div><button className="ghost" onClick={()=>{setScreen("menu");}}>나가기</button></header>
    <div className="game-layout"><section className="game-host"><div ref={hostRef} className="phaser-host"/><div className="controls-hint">우클릭: 이동 · 좌클릭: 공격 이동 · WASD: 이동 · QWER: 스킬 · F: 회복 · B: 귀환 · P: 상점 · ESC: 일시정지</div></section>
    <aside className="hud"><div className="profile"><div className="avatar small" style={{background:`#${chosen.color.toString(16).padStart(6,"0")}`}}>{chosen.name.slice(0,1)}</div><div><b>{chosen.name}</b><small>레벨 {stats?.level??1} · {chosen.role}</small></div></div>
      <div className="stat-line"><span>체력</span><b>{Math.ceil(stats?.hp??chosen.hp)} / {stats?.maxHp??chosen.hp}</b></div><div className="bar"><i style={{width:`${Math.max(0,(stats?.hp??chosen.hp)/(stats?.maxHp??chosen.hp)*100)}%`}}/></div>
      <div className="stat-line"><span>경험치</span><b>{stats?.xp??0} / {stats?.xpNeed??165}</b></div><div className="bar xp"><i style={{width:`${Math.min(100,(stats?.xp??0)/(stats?.xpNeed??165)*100)}%`}}/></div>
      <div className="economy"><div><small>골드</small><b>◈ {stats?.gold??500}</b></div><div><small>K / D</small><b>{stats?.kills??0} / {stats?.deaths??0}</b></div></div>
      <h3>스킬</h3><div className="skills">{(stats?.skills??chosen.skills).map((s:any,i:number)=><div className="skill" key={s.key}><kbd>{s.key}</kbd><div><b>{s.name}</b><small>{s.left>0?`${s.left.toFixed(1)}초`:`재사용 가능`} · 피해 ${s.damage}</small></div></div>)}</div>
      <button className="shop-button" onClick={()=>setShop(true)}>상점 열기 (P)</button><button className="ghost full" onClick={()=>setScore(!score)}>전투 정보 (Tab)</button>
      <div className="mini-map"><div className="mini-lane l1"/><div className="mini-lane l2"/><div className="mini-lane l3"/><i className="blue-dot"/><i className="red-dot"/></div>
    </aside></div>
    {shop&&<div className="overlay"><div className="modal"><button className="close" onClick={()=>setShop(false)}>×</button><p className="eyebrow">ITEM STORE</p><h2>아이템 상점</h2><p className="muted">구매한 아이템은 즉시 능력치에 반영됩니다.</p>{[{id:"blade",name:"강철 검",cost:350,desc:"공격력 +18"},{id:"armor",name:"수호 갑옷",cost:300,desc:"최대 체력 +180"},{id:"crystal",name:"마력 수정",cost:450,desc:"공격력 +28 · 체력 +80"}].map(it=><div className="item-row" key={it.id}><div><b>{it.name}</b><small>{it.desc}</small></div><button onClick={()=>scene()?.buyItem(it.id)}>◈ {it.cost} 구매</button></div>)}</div></div>}
    {(pause||result)&&<div className="overlay"><div className="modal center"><p className="eyebrow">{result?"MATCH RESULT":"PAUSED"}</p><h2>{result||"일시정지"}</h2><p>{result?`K/D ${stats?.kills??0} / ${stats?.deaths??0}`:"게임이 일시정지되었습니다."}</p><button className="primary" onClick={()=>{if(result){setScreen("menu");}else scene()?.togglePause();setPause(false);}}> {result?"메인 메뉴":"계속하기"} </button></div></div>}
    {score&&<div className="score-panel"><button className="close" onClick={()=>setScore(false)}>×</button><h3>전투 현황</h3><p>아군 5명 · 적군 5명</p><p>처치 {stats?.kills??0} / 사망 {stats?.deaths??0}</p><p>게임 시간 {stats?fmt(stats.time):"00:00"}</p></div>}
  </main>;
}