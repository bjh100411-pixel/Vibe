import Phaser from "phaser";
import { CHAMPIONS, type Champion } from "../data/champions";

type Team = "blue" | "red";
type UnitKind = "hero" | "minion" | "tower" | "monster" | "core";
interface Unit {
  id:number; team:Team; kind:UnitKind; name:string; x:number; y:number;
  hp:number; maxHp:number; attack:number; speed:number; range:number; radius:number;
  color:number; alive:boolean; target?:Unit; champion?:Champion; level:number;
  gold:number; xp:number; respawn:number; attackTimer:number; cooldowns:number[];
  isPlayer?:boolean; side?:number;
}
const W=1400, H=900;
const laneY=[220,450,680];
const distance=(a:Unit,b:Unit)=>Phaser.Math.Distance.Between(a.x,a.y,b.x,b.y);

export class GameScene extends Phaser.Scene {
  private units:Unit[]=[];
  private nextId=1;
  private player!:Unit;
  private selected!:Champion;
  private cursors!:Phaser.Types.Input.Keyboard.CursorKeys;
  private keys:any;
  private moveTarget={x:260,y:450};
  private attackMove=false;
  private paused=false;
  private elapsed=0;
  private gold=500;
  private kills=0;
  private deaths=0;
  private towers:{blue:Unit[];red:Unit[]}={blue:[],red:[]};
  private core!: {blue:Unit;red:Unit};
  private graphics!:Phaser.GameObjects.Graphics;
  private labels:Phaser.GameObjects.Text[]=[];
  private onUpdate:(s:any)=>void=()=>{};
  private lastUi=0;
  constructor(){super("GameScene");}
  init(data:{championId:string;onUpdate:(s:any)=>void}) {
    this.selected=CHAMPIONS.find(c=>c.id===data.championId)??CHAMPIONS[0];
    this.onUpdate=data.onUpdate??(()=>{});
  }
  create(){
    this.cameras.main.setBounds(0,0,W,H);
    this.cameras.main.setZoom(0.82);
    this.graphics=this.add.graphics();
    this.drawMap();
    this.cursors=this.input.keyboard!.createCursorKeys();
    this.keys=this.input.keyboard!.addKeys("W,A,S,D,Q,E,R,F,D,B,P,TAB,SPACE,ESC");
    this.input.on("pointerdown",(p:Phaser.Input.Pointer)=>{
      const pos=this.cameras.main.getWorldPoint(p.x,p.y);
      if(p.rightButtonDown() || p.button===2){this.moveTarget={x:pos.x,y:pos.y};this.attackMove=false;}
      else if(p.leftButtonDown() || p.button===0){this.moveTarget={x:pos.x,y:pos.y};this.attackMove=true;}
    });
    this.input.mouse?.disableContextMenu();
    this.createBases();
    this.createTeams();
    this.spawnMinions();
    this.time.addEvent({delay:25000,loop:true,callback:()=>this.spawnMinions()});
    this.time.addEvent({delay:90000,loop:true,callback:()=>this.spawnMonster()});
    this.cameras.main.startFollow(this.player as any,false,0.08,0.08);
    this.emitUi();
  }
  private drawMap(){
    const g=this.graphics; g.fillStyle(0x172a27,1);g.fillRect(0,0,W,H);
    g.fillStyle(0x1d3b31,1);g.fillRect(60,55,W-120,H-110);
    // Three lanes and river
    g.lineStyle(58,0x9b9278,1);
    g.beginPath();g.moveTo(170,130);g.lineTo(1230,770);g.strokePath();
    g.beginPath();g.moveTo(170,450);g.lineTo(1230,450);g.strokePath();
    g.beginPath();g.moveTo(170,770);g.lineTo(1230,130);g.strokePath();
    g.lineStyle(3,0xc8b994,0.65);
    [[170,130,1230,770],[170,450,1230,450],[170,770,1230,130]].forEach(a=>{g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(a[2],a[3]);g.strokePath();});
    g.fillStyle(0x286b72,0.8);g.fillEllipse(700,450,230,720);
    g.fillStyle(0x31513b,1);
    for(let i=0;i<42;i++){const x=220+(i*173)%960,y=90+(i*97)%720;g.fillCircle(x,y,15+(i%3)*4);}
    g.fillStyle(0x284d39,1);
    for(let i=0;i<12;i++){g.fillRoundedRect(300+(i%4)*210,180+Math.floor(i/4)*230,95,65,12);}
    g.lineStyle(2,0x587a66,0.8);g.strokeRect(60,55,W-120,H-110);
    this.add.text(700,40,"AI MOBA ARENA",{fontSize:"24px",color:"#d9e8df",fontStyle:"bold"}).setOrigin(.5);
  }
  private addUnit(data:Partial<Unit>&Pick<Unit,"team"|"kind"|"name"|"x"|"y"|"hp"|"attack"|"speed"|"range"|"radius"|"color">):Unit{
    const u:Unit={id:this.nextId++,maxHp:data.hp,alive:true,level:1,gold:0,xp:0,respawn:0,attackTimer:0,cooldowns:[0,0,0,0],...data} as Unit;
    this.units.push(u);return u;
  }
  private createBases(){
    this.core={
      blue:this.addUnit({team:"blue",kind:"core",name:"아군 넥서스",x:125,y:450,hp:5000,attack:0,speed:0,range:0,radius:48,color:0x3d9cff}),
      red:this.addUnit({team:"red",kind:"core",name:"적 넥서스",x:1275,y:450,hp:5000,attack:0,speed:0,range:0,radius:48,color:0xff5c67})
    };
    for(const team of ["blue","red"] as Team[]){
      const dir=team==="blue"?1:-1;
      for(let lane=0;lane<3;lane++){
        const y=laneY[lane];
        for(let n=0;n<2;n++){
          const x=team==="blue"?360+n*280:1040-n*280;
          const t=this.addUnit({team,kind:"tower",name:`${team==="blue"?"아군":"적"} 포탑`,x,y,hp:1800,attack:95,speed:0,range:270,radius:28,color:team==="blue"?0x5bb7ff:0xff7777});
          this.towers[team].push(t);
        }
      }
    }
  }
  private createTeams(){
    const allySpots=[[260,390],[250,510],[210,300],[210,600]];
    this.player=this.addUnit({team:"blue",kind:"hero",name:this.selected.name,x:260,y:450,hp:this.selected.hp,attack:this.selected.attack,speed:this.selected.speed,range:this.selected.range,radius:20,color:this.selected.color,champion:this.selected,isPlayer:true});
    const bots=CHAMPIONS.filter(c=>c.id!==this.selected.id).slice(0,4);
    bots.forEach((c,i)=>this.addHero("blue",c,allySpots[i][0],allySpots[i][1],false));
    const reds=[...CHAMPIONS].reverse().slice(0,5);
    reds.forEach((c,i)=>this.addHero("red",c,1140+(i%2)*35,300+i*75,false));
  }
  private addHero(team:Team,c:Champion,x:number,y:number,isPlayer:boolean){return this.addUnit({team,kind:"hero",name:c.name,x,y,hp:c.hp,attack:c.attack,speed:c.speed,range:c.range,radius:19,color:team==="blue"?c.color:0xff7777,champion:c,isPlayer});}
  private spawnMinions(){
    for(const team of ["blue","red"] as Team[])for(let lane=0;lane<3;lane++){
      for(let i=0;i<3;i++){
        const x=team==="blue"?190-i*24:1210+i*24;
        this.addUnit({team,kind:"minion",name:"미니언",x,y:laneY[lane]+(i-1)*19,hp:260,attack:28,speed:54,range:55,radius:10,color:team==="blue"?0x72baff:0xff8585});
      }
    }
  }
  private spawnMonster(){
    const m=this.addUnit({team:"red",kind:"monster",name:"고대 수호수",x:700,y:450,hp:2300,attack:95,speed:38,range:95,radius:31,color:0xe0b65e});
    m.side=0;
  }
  update(_:number,delta:number){
    if(this.paused)return;
    const dt=Math.min(delta,50)/1000;this.elapsed+=dt;
    this.handleInput(dt);
    for(const u of this.units){
      if(!u.alive){if(u.kind==="hero"){u.respawn-=dt;if(u.respawn<=0)this.respawn(u);}continue;}
      if(u.kind==="hero")this.updateHero(u,dt);
      else if(u.kind==="minion"||u.kind==="monster")this.updateMob(u,dt);
      else if(u.kind==="tower")this.updateTower(u,dt);
    }
    this.units=this.units.filter(u=>u.alive||u.kind==="hero"||u.kind==="core");
    this.renderWorld();
    if(this.time.now-this.lastUi>200){this.lastUi=this.time.now;this.emitUi();}
    if(this.core.red.hp<=0||this.core.blue.hp<=0){this.paused=true;this.onUpdate({...this.snapshot(),result:this.core.red.hp<=0?"승리":"패배"});}
  }
  private handleInput(dt:number){
    const k=this.keys;
    if(Phaser.Input.Keyboard.JustDown(k.ESC)){this.paused=!this.paused;this.onUpdate({...this.snapshot(),paused:this.paused});}
    if(Phaser.Input.Keyboard.JustDown(k.TAB))this.onUpdate({...this.snapshot(),scoreboard:true});
    if(Phaser.Input.Keyboard.JustUp(k.TAB))this.onUpdate({...this.snapshot(),scoreboard:false});
    if(Phaser.Input.Keyboard.JustDown(k.B)){this.moveTarget={x:150,y:450};this.player.hp=this.player.maxHp;}
    if(Phaser.Input.Keyboard.JustDown(k.P))this.onUpdate({...this.snapshot(),shop:true});
    if(Phaser.Input.Keyboard.JustDown(k.SPACE))this.attackMove=true;
    const dx=(k.D.isDown?1:0)-(k.A.isDown?1:0),dy=(k.S.isDown?1:0)-(k.W.isDown?1:0);
    if(dx||dy){this.moveTarget={x:this.player.x+dx*200,y:this.player.y+dy*200};this.attackMove=false;}
    ["Q","W","E","R"].forEach((key,i)=>{if(Phaser.Input.Keyboard.JustDown(k[key]))this.cast(i);});
    if(Phaser.Input.Keyboard.JustDown(k.F))this.player.hp=Math.min(this.player.maxHp,this.player.hp+150);
  }
  private updateHero(u:Unit,dt:number){
    if(u.isPlayer){
      this.moveToward(u,this.moveTarget.x,this.moveTarget.y,dt);
      if(this.attackMove){const target=this.closestEnemy(u,Math.max(u.range+80,190));if(target&&distance(u,target)<=u.range+target.radius+8)this.basicAttack(u,target,dt);}
    }else{
      const lane=laneY[(u.id%3)];
      const enemy=this.closestEnemy(u,Math.max(u.range+100,220));
      if(enemy&&distance(u,enemy)<260){if(distance(u,enemy)>u.range)this.moveToward(u,enemy.x,enemy.y,dt);else this.basicAttack(u,enemy,dt);}
      else{
        const tx=u.team==="blue"?Math.min(1190,u.x+100):Math.max(210,u.x-100);
        const ty=lane+(u.team==="blue"?0:0);
        this.moveToward(u,tx,ty,dt);
      }
      if(u.champion?.role==="지원가"&&u.hp<u.maxHp*.65)u.hp=Math.min(u.maxHp,u.hp+8*dt);
    }
    if(u.isPlayer&&this.attackMove===false){
      const target=this.closestEnemy(u,u.range+u.radius+35);
      if(target&&distance(u,target)<=u.range+target.radius)this.basicAttack(u,target,dt);
    }
    u.cooldowns=u.cooldowns.map(v=>Math.max(0,v-dt));
  }
  private updateMob(u:Unit,dt:number){
    const enemy=this.closestEnemy(u,u.range+u.radius+120);
    if(enemy&&distance(u,enemy)<=u.range+enemy.radius+8)this.basicAttack(u,enemy,dt);
    else if(enemy&&distance(u,enemy)<u.range+180)this.moveToward(u,enemy.x,enemy.y,dt);
    else{
      const target=this.core[u.team==="blue"?"red":"blue"];
      const tower=this.towers[u.team==="blue"?"red":"blue"].find(t=>t.alive&&Math.abs(t.y-u.y)<110);
      const dest=tower??target;
      this.moveToward(u,dest.x,dest.y,dt);
    }
  }
  private updateTower(u:Unit,dt:number){
    const target=this.units.filter(v=>v.alive&&v.team!==u.team&&(v.kind==="minion"||v.kind==="hero")&&distance(u,v)<u.range).sort((a,b)=>distance(u,a)-distance(u,b))[0];
    if(target)this.basicAttack(u,target,dt);
  }
  private moveToward(u:Unit,x:number,y:number,dt:number){
    const d=Phaser.Math.Distance.Between(u.x,u.y,x,y);if(d<5)return;
    const step=Math.min(d,u.speed*dt);u.x+=(x-u.x)/d*step;u.y+=(y-u.y)/d*step;
    u.x=Phaser.Math.Clamp(u.x,80,W-80);u.y=Phaser.Math.Clamp(u.y,80,H-80);
  }
  private closestEnemy(u:Unit,range:number):Unit|undefined{
    return this.units.filter(v=>v.alive&&v.team!==u.team&&v!==u&&v.kind!=="core"&&distance(u,v)<=range).sort((a,b)=>distance(u,a)-distance(u,b))[0];
  }
  private basicAttack(a:Unit,b:Unit,dt:number){
    if(a.attackTimer>0){a.attackTimer-=dt;return;}
    const speed=a.kind==="tower"?1.1:a.kind==="hero"?.85:1.15;
    a.attackTimer=speed;
    this.damage(b,a.attack+(a.kind==="hero"?(a.level-1)*5:0),a);
  }
  private damage(target:Unit,amount:number,source:Unit){
    if(!target.alive)return;
    let dmg=amount;
    if(target.kind==="hero"&&target.champion?.role==="탱커")dmg*=.82;
    target.hp-=dmg;
    if(target.hp<=0){
      target.hp=0;target.alive=false;
      if(target.kind==="hero"){target.respawn=8+target.level*1.5;if(source.team==="blue")this.kills++;else this.deaths++;}
      else if(target.kind==="minion"||target.kind==="monster"){if(source.team==="blue"){this.gold+=target.kind==="monster"?180:22;this.player.xp+=target.kind==="monster"?120:18;}}
      if(target.kind==="tower"&&target.team==="red")this.core.red.hp-=350;
      if(target.kind==="tower"&&target.team==="blue")this.core.blue.hp-=350;
    }
  }
  private cast(index:number){
    const u=this.player,sk=u.champion!.skills[index];if(u.cooldowns[index]>0||!u.alive)return;
    u.cooldowns[index]=sk.cooldown;
    if(sk.kind==="heal"){
      const allies=this.units.filter(v=>v.alive&&v.team==="blue"&&v.kind==="hero"&&distance(u,v)<=Math.max(220,sk.range));
      allies.forEach(a=>a.hp=Math.min(a.maxHp,a.hp+(sk.damage||110)));
      return;
    }
    if(sk.kind==="dash"){
      const target=this.closestEnemy(u,sk.range+100);
      if(target){const d=distance(u,target);this.moveToward(u,target.x,target.y,Math.min(.5,sk.range/Math.max(1,d)/u.speed));if(sk.damage)this.damage(target,sk.damage,u);}
      else{const angle=Phaser.Math.Angle.Between(u.x,u.y,this.moveTarget.x,this.moveTarget.y);u.x+=Math.cos(angle)*sk.range*.65;u.y+=Math.sin(angle)*sk.range*.65;}
      return;
    }
    const target=this.closestEnemy(u,sk.range+u.range);
    if(!target)return;
    if(sk.kind==="bolt")this.damage(target,sk.damage,u);
    else this.units.filter(v=>v.alive&&v.team!==u.team&&distance(target,v)<sk.range*.55).forEach(v=>this.damage(v,sk.damage,u));
  }
  private respawn(u:Unit){
    u.alive=true;u.hp=u.maxHp;u.x=u.team==="blue"?180:1220;u.y=450;u.attackTimer=0;
  }
  private renderWorld(){
    const g=this.graphics;g.clear();
    this.units.forEach(u=>{
      if(!u.alive)return;
      const r=u.radius;
      g.fillStyle(u.color,1);g.fillCircle(u.x,u.y,r);
      if(u.kind==="tower"||u.kind==="core"){g.lineStyle(4,0xffffff,.8);g.strokeCircle(u.x,u.y,r+4);}
      if(u.kind==="hero"&&u.isPlayer){g.lineStyle(3,0xffe08a,1);g.strokeCircle(u.x,u.y,r+6);}
      g.fillStyle(0x111111,0.85);g.fillRect(u.x-r,u.y-r-12,r*2,5);
      g.fillStyle(u.team==="blue"?0x57d7ff:0xff6666,1);g.fillRect(u.x-r,u.y-r-12,r*2*Math.max(0,u.hp/u.maxHp),5);
    });
  }
  private snapshot(){
    const need=100+this.player.level*65;
    return {hp:this.player.hp,maxHp:this.player.maxHp,level:this.player.level,gold:this.gold,xp:this.player.xp,xpNeed:need,kills:this.kills,deaths:this.deaths,time:Math.floor(this.elapsed),champion:this.selected.name,skills:this.selected.skills.map((s,i)=>({...s,left:this.player.cooldowns[i]})),blueCore:this.core.blue.hp,redCore:this.core.red.hp};
  }
  private emitUi(){
    const need=100+this.player.level*65;
    while(this.player.xp>=need&&this.player.level<18){this.player.xp-=need;this.player.level++;this.player.maxHp+=35;this.player.hp=Math.min(this.player.maxHp,this.player.hp+90);this.player.attack+=5;}
    this.onUpdate(this.snapshot());
  }
  buyItem(id:string){
    const items:{[k:string]:{cost:number;hp:number;attack:number;label:string}}={
      blade:{cost:350,hp:0,attack:18,label:"강철 검"},
      armor:{cost:300,hp:180,attack:0,label:"수호 갑옷"},
      crystal:{cost:450,hp:80,attack:28,label:"마력 수정"}
    };
    const item=items[id];if(!item||this.gold<item.cost)return false;
    this.gold-=item.cost;this.player.maxHp+=item.hp;this.player.hp+=item.hp;this.player.attack+=item.attack;this.emitUi();return true;
  }
  togglePause(){this.paused=!this.paused;this.emitUi();}
}
