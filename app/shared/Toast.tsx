"use client";
import { useEffect, useState } from "react";

let globalShow: ((s:string)=>void) | null = null;

export function showToast(msg: string){
  if(globalShow) globalShow(msg);
}

export default function Toast(){
  const [msg, setMsg] = useState("");
  useEffect(()=>{ globalShow = (s)=>{ setMsg(s); setTimeout(()=>setMsg(''), 2500); }; return ()=>{ globalShow = null; } },[]);
  if(!msg) return null;
  return (
    <div style={{position:'fixed',right:20,bottom:20,background:'#111827',color:'#fff',padding:'10px 14px',borderRadius:8,boxShadow:'0 12px 40px rgba(0,0,0,0.2)'}}>
      {msg}
    </div>
  );
}
