export function readStorage(key: string){
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch(e){ return null; }
}
export function writeStorage(key:string, data:any){
  try { localStorage.setItem(key, JSON.stringify(data)); } catch(e){ console.error(e); }
}
