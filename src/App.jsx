import {useEffect,useMemo,useRef,useState} from 'react';
import {Activity,LogIn,LogOut,Pause,Play,Plus,RotateCcw,Sun,Moon,Upload,Users} from 'lucide-react';
import {supabase} from './lib/supabase';

const modes={Games:{work:120,rest:0,rounds:1},Workout:{work:40,rest:20,rounds:5},HIIT:{work:30,rest:15,rounds:8},Boxing:{work:180,rest:60,rounds:3},Custom:{work:60,rest:15,rounds:1}};
const fmt=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
const library=[
 {name:'Cinematic Mood',url:'/music/cinematic-mood.mp3'},
 {name:'Corporate Promo',url:'/music/corporate-promo.mp3'},
 {name:'Party Countdown',url:'/music/party-countdown.mp3'},
 {name:'Modern Tech Background',url:'/music/tech-innovate.mp3'},
 {name:'Referee Whistle',url:'/music/referee-whistle.mp3'},
 {name:'Seasons Alone',url:'/music/seasons-alone.mp3'},
 {name:'Luxury Chill',url:'/music/luxury-chill.mp3'},
 {name:'Blues Ballad',url:'/music/blues-ballad.mp3'},
 {name:'Football Anthem',url:'/music/football-anthem.mp3'},
 {name:'Calm and Bright',url:'/music/calm-and-bright.mp3'}
];

export default function App(){
 const [theme,setTheme]=useState(localStorage.getItem('mb-theme')||'dark');
 const [mode,setMode]=useState('Games'); const [work,setWork]=useState(120); const [rest,setRest]=useState(0); const [rounds,setRounds]=useState(1);
 const [round,setRound]=useState(1); const [phase,setPhase]=useState('work'); const [left,setLeft]=useState(120); const [running,setRunning]=useState(false);
 const [endCount,setEndCount]=useState(10); const [music,setMusic]=useState(null); const [musicName,setMusicName]=useState('No music selected');
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [user,setUser]=useState(null); const [authOpen,setAuthOpen]=useState(false); const [message,setMessage]=useState('');
 const [teamName,setTeamName]=useState('My Team'); const [member,setMember]=useState(''); const [members,setMembers]=useState([]); const audio=useRef(null);
 const progress=useMemo(()=>100-(left/Math.max(1,phase==='work'?work:rest))*100,[left,phase,work,rest]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('mb-theme',theme)},[theme]);
 useEffect(()=>{if(!supabase)return;supabase.auth.getSession().then(({data})=>setUser(data.session?.user||null));return supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null)).data.subscription.unsubscribe},[]);
 useEffect(()=>{if(!running)return;const id=setInterval(()=>setLeft(v=>{if(v>1)return v-1;if(phase==='work'&&rest>0){setPhase('rest');return rest}if(round<rounds){setRound(r=>r+1);setPhase('work');return work}setRunning(false);audio.current?.pause();setMessage('Wonderful! Activity complete.');return 0}),1000);return()=>clearInterval(id)},[running,phase,rest,round,rounds,work]);
 function chooseMode(name){setMode(name);const p=modes[name];setWork(p.work);setRest(p.rest);setRounds(p.rounds);setLeft(p.work);setRound(1);setPhase('work');setRunning(false)}
 async function toggle(){if(left===0)reset();if(!running&&audio.current){try{await audio.current.play()}catch{setMessage('Tap Play again to allow audio.');return}}else audio.current?.pause();setRunning(v=>!v)}
 function reset(){setRunning(false);setRound(1);setPhase('work');setLeft(work);if(audio.current){audio.current.pause();audio.current.currentTime=0}}
 function pickAudio(e){const f=e.target.files?.[0];if(!f)return;if(music)URL.revokeObjectURL(music);const u=URL.createObjectURL(f);setMusic(u);setMusicName(f.name);setMessage('Music ready to play.');}
 function pickLibrary(e){const u=e.target.value;if(!u)return;setMusic(u);setMusicName(library.find(t=>t.url===u)?.name||'Library track');setMessage('Music ready to play.');}
 async function sign(action){if(!supabase)return setMessage('Supabase environment variables are missing.');const fn=action==='signup'?supabase.auth.signUp: supabase.auth.signInWithPassword;const {error}=await fn({email,password});setMessage(error?error.message:action==='signup'?'Check your email to confirm account.':'Logged in successfully.');if(!error)setAuthOpen(false)}
 async function logout(){await supabase?.auth.signOut();setMessage('Logged out.');}
 function addMember(){const n=member.trim();if(n&&!members.includes(n)){setMembers(v=>[...v,n]);setMember('')}}
 return <main className="app"><header><div className="brand"><Activity/><span>MOVE<b>BEAT</b><small>AI ACTIVITY COACH</small></span></div><div className="head-actions"><button className="icon" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?<Sun/>:<Moon/>}</button>{user?<button onClick={logout}><LogOut/> Logout</button>:<button onClick={()=>setAuthOpen(true)}><LogIn/> Login</button>}</div></header>
 <nav>{Object.keys(modes).map(x=><button key={x} className={mode===x?'active':''} onClick={()=>chooseMode(x)}>{x}</button>)}</nav>
 <section className="layout"><article className="timer-card"><div className={`phase ${phase}`}>{phase==='work'?'ACTIVE':'REST'} · ROUND {round}/{rounds}</div><div className="ring" style={{'--p':`${progress}%`}}><strong>{fmt(left)}</strong><span>{running?'Timer running':left===0?'Complete':'Ready'}</span></div>{left>0&&left<=endCount&&<div className="ending">FINAL COUNTDOWN: {left}</div>}<div className="controls"><button className="primary" onClick={toggle}>{running?<Pause/>:<Play/>}{running?'Pause':'Start'}</button><button onClick={reset}><RotateCcw/> Reset</button></div><div className="now-playing"><span className={running&&music?'pulse':''}/><div><b>{running&&music?'Now Playing':'Music'}</b><small>{musicName}</small></div></div>{message&&<p className="message">{message}</p>}</article>
 <aside><section className="panel"><h2>Timer settings</h2><div className="grid"><label>Active seconds<input type="number" min="1" value={work} onChange={e=>{const v=+e.target.value;setWork(v);if(!running&&phase==='work')setLeft(v)}}/></label><label>Rest seconds<input type="number" min="0" value={rest} onChange={e=>setRest(+e.target.value)}/></label><label>Rounds<input type="number" min="1" max="99" value={rounds} onChange={e=>setRounds(+e.target.value)}/></label><label>End countdown<input type="number" min="1" max="60" value={endCount} onChange={e=>setEndCount(+e.target.value)}/></label></div><label>Music library<select defaultValue="" onChange={pickLibrary}><option value="" disabled>Choose a track…</option>{library.map(t=><option key={t.url} value={t.url}>{t.name}</option>)}</select></label><label className="upload"><Upload/> Browse your music<input type="file" accept="audio/*" onChange={pickAudio}/></label>{music&&<audio ref={audio} src={music} loop preload="metadata"/>}</section>
 <section className="panel"><h2><Users/> Team members</h2><label>Team name<input value={teamName} onChange={e=>setTeamName(e.target.value)}/></label><div className="add"><input placeholder="Member name" value={member} onChange={e=>setMember(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addMember()}/><button onClick={addMember}><Plus/></button></div><div className="members">{members.length?members.map((m,i)=><span key={m}>{i+1}. {m}</span>):<small>No members added yet</small>}</div></section></aside></section>
 {authOpen&&<div className="modal" onMouseDown={e=>e.target===e.currentTarget&&setAuthOpen(false)}><form onSubmit={e=>e.preventDefault()}><h2>MoveBeat account</h2><p>Save teams, presets and workout history.</p><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" minLength="8" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="primary" onClick={()=>sign('login')}>Login</button><button onClick={()=>sign('signup')}>Create account</button></form></div>}</main>
}
