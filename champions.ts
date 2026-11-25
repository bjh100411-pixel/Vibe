export type Role = "전사" | "탱커" | "암살자" | "마법사" | "원거리 딜러" | "지원가";
export type SkillKind = "bolt" | "area" | "dash" | "heal";
export interface Skill {
  key: string; name: string; description: string; cooldown: number; damage: number; range: number; kind: SkillKind;
}
export interface Champion {
  id: string; name: string; title: string; role: Role; color: number;
  hp: number; attack: number; speed: number; range: number;
  passive: string; skills: [Skill, Skill, Skill, Skill];
}
const skill = (key:string,name:string,description:string,cooldown:number,damage:number,range:number,kind:SkillKind):Skill =>
  ({key,name,description,cooldown,damage,range,kind});

export const CHAMPIONS: Champion[] = [
  {id:"aegis",name:"아르덴",title:"철벽의 수호자",role:"탱커",color:0x4da3ff,hp:920,attack:48,speed:105,range:75,passive:"체력이 낮을수록 받는 피해 감소",skills:[
    skill("Q","방패 강타","전방의 적을 강타합니다.",5,105,145,"area"),
    skill("W","수호의 장막","자신을 보호하는 방어막을 얻습니다.",12,0,0,"heal"),
    skill("E","전선 돌파","지정한 위치로 돌진합니다.",9,80,210,"dash"),
    skill("R","철벽 진형","주변 적에게 큰 피해를 줍니다.",45,260,220,"area")]},
  {id:"ember",name:"이그니스",title:"화염의 계승자",role:"마법사",color:0xff784f,hp:590,attack:64,speed:112,range:230,passive:"스킬 적중 시 추가 화염 피해",skills:[
    skill("Q","화염구","불덩이를 발사합니다.",4,125,360,"bolt"),
    skill("W","잿불 폭발","주변에 폭발을 일으킵니다.",10,150,185,"area"),
    skill("E","불꽃 도약","짧게 이동하며 주변을 공격합니다.",9,75,165,"dash"),
    skill("R","용암 분출","넓은 범위에 강력한 피해를 줍니다.",48,300,260,"area")]},
  {id:"shade",name:"세라",title:"그림자 추적자",role:"암살자",color:0xb58cff,hp:610,attack:92,speed:150,range:95,passive:"대상 뒤에서 공격하면 피해 증가",skills:[
    skill("Q","그림자 베기","가까운 적을 빠르게 베어냅니다.",4,145,125,"area"),
    skill("W","연막","짧은 시간 안전하게 이탈합니다.",13,0,0,"dash"),
    skill("E","순보","대상 방향으로 순간 이동합니다.",8,55,230,"dash"),
    skill("R","종말의 일격","가까운 적 하나에게 큰 피해를 줍니다.",42,330,160,"bolt")]},
  {id:"volt",name:"카이",title:"폭풍의 사수",role:"원거리 딜러",color:0xffd166,hp:560,attack:82,speed:118,range:260,passive:"연속 기본 공격의 공격 속도 증가",skills:[
    skill("Q","관통 사격","긴 사거리의 화살을 발사합니다.",4,130,420,"bolt"),
    skill("W","전류 함정","범위 안의 적을 공격합니다.",11,115,180,"area"),
    skill("E","후퇴 사격","뒤로 물러나며 공격합니다.",10,70,170,"dash"),
    skill("R","천둥 화살","일직선의 강력한 공격을 발사합니다.",46,290,480,"bolt")]},
  {id:"mira",name:"미라",title:"새벽의 치유사",role:"지원가",color:0x75e0bd,hp:650,attack:45,speed:110,range:205,passive:"주기적으로 주변 아군을 회복",skills:[
    skill("Q","빛의 파동","적에게 빛의 피해를 줍니다.",5,95,280,"bolt"),
    skill("W","온기","자신과 주변 아군을 회복합니다.",12,125,200,"heal"),
    skill("E","정화의 빛","가까운 적에게 피해를 줍니다.",9,90,175,"area"),
    skill("R","새벽의 축복","모든 아군 영웅을 회복합니다.",55,220,9999,"heal")]},
  {id:"bront",name:"브론트",title:"대지의 거인",role:"탱커",color:0x9cbd78,hp:1050,attack:55,speed:88,range:75,passive:"최대 체력이 높습니다",skills:[
    skill("Q","대지 강타","지면을 내리쳐 주변을 공격합니다.",5,120,160,"area"),
    skill("W","바위 피부","자신을 회복합니다.",13,145,0,"heal"),
    skill("E","지각 변동","전방에 충격파를 일으킵니다.",10,100,210,"area"),
    skill("R","산맥의 분노","거대한 범위 공격을 합니다.",50,280,250,"area")]},
  {id:"lyra",name:"리라",title:"별빛의 마도사",role:"마법사",color:0x9b8cff,hp:570,attack:68,speed:110,range:250,passive:"스킬 피해가 조금 더 강합니다",skills:[
    skill("Q","별빛 탄환","별빛 투사체를 발사합니다.",4,130,390,"bolt"),
    skill("W","성운","지정 범위에 피해를 줍니다.",10,145,190,"area"),
    skill("E","차원 이동","짧은 거리를 이동합니다.",9,0,190,"dash"),
    skill("R","유성우","넓은 범위에 유성을 떨어뜨립니다.",48,310,270,"area")]},
  {id:"rune",name:"룬",title:"룬의 검사",role:"전사",color:0xf0a0c0,hp:760,attack:78,speed:120,range:90,passive:"기본 공격으로 체력을 조금 회복",skills:[
    skill("Q","연속 베기","연속으로 적을 공격합니다.",4,135,130,"area"),
    skill("W","전투 태세","자신을 회복합니다.",12,100,0,"heal"),
    skill("E","돌진 베기","적에게 돌진합니다.",9,110,220,"dash"),
    skill("R","룬 해방","주변 적에게 강력한 피해를 줍니다.",45,275,220,"area")]},
  {id:"nox",name:"녹스",title:"황혼의 사냥꾼",role:"원거리 딜러",color:0x84b9ff,hp:600,attack:75,speed:122,range:245,passive:"체력이 낮은 적에게 추가 피해",skills:[
    skill("Q","황혼 화살","적에게 화살을 발사합니다.",4,120,400,"bolt"),
    skill("W","사냥 표식","가까운 적을 공격합니다.",10,155,210,"area"),
    skill("E","회피 기동","빠르게 이동합니다.",9,0,190,"dash"),
    skill("R","월식","긴 사거리의 강력한 화살을 발사합니다.",48,300,500,"bolt")]},
  {id:"toto",name:"토토",title:"숲의 안내자",role:"지원가",color:0x8fd16a,hp:680,attack:52,speed:115,range:190,passive:"주변 아군의 이동 속도 증가",skills:[
    skill("Q","덩굴 채찍","덩굴로 적을 공격합니다.",5,100,260,"bolt"),
    skill("W","숲의 숨결","주변 아군을 회복합니다.",12,115,200,"heal"),
    skill("E","씨앗 폭탄","범위에 피해를 줍니다.",10,120,175,"area"),
    skill("R","생명의 숲","모든 아군 영웅을 회복합니다.",55,200,9999,"heal")]}
];
