import { create } from 'zustand'
type SelState = { selected: string[]; toggle:(id:string)=>void; set:(ids:string[])=>void; clear:()=>void }
export const useSelection = create<SelState>((set, get) => ({
  selected: [],
  toggle: id => { const s=new Set(get().selected); s.has(id)?s.delete(id):s.add(id); set({selected:[...s]}) },
  set: ids => set({selected: ids}), clear: () => set({selected: []})
}))
