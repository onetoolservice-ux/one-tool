"use client";
import { useState } from "react";
import Link from "next/link";

interface Props { params: { category: string, tool: string } }

function Filters({onChange}:{onChange:(q:any)=>void}){
  return (
    <div className="flex gap-3">
      <input className="ots-input" placeholder="Search..." onChange={(e)=>onChange({q:e.target.value})} />
      <select className="ots-input" onChange={(e)=>onChange({type:e.target.value})}>
        <option value="">All types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <button className="ots-btn-outline">Apply</button>
    </div>
  );
}

function ReportCard({title, value}:{title:string,value:string}){
  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="text-sm text-[#64748B]">{title}</div>
      <div className="text-xl font-bold mt-2">{value}</div>
    </div>
  );
}

export default function ToolPage({ params }: Props){
  const { category, tool } = params;
  const [view, setView] = useState("list");
  const [filter, setFilter] = useState<any>({});
  const sampleRows = [
    { id: "t1", date: "2025-11-01", desc: "Grocery", type: "expense", amount: 450 },
    { id: "t2", date: "2025-11-02", desc: "Salary", type: "income", amount: 45000 },
    { id: "t3", date: "2025-11-05", desc: "Taxi", type: "expense", amount: 230 }
  ];

  const rows = sampleRows.filter(r=>{
    if(filter.q && !r.desc.toLowerCase().includes(String(filter.q).toLowerCase())) return false;
    if(filter.type && filter.type !== "" && r.type !== filter.type) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{tool.split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join(' ')}</h1>
          <p className="text-sm text-[#64748B]">Category: {category}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/tools/${category}`} className="ots-btn-outline">Back</Link>
          <button className="ots-btn">Run</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button className={`ots-btn ${view==='list'?'opacity-90':''}`} onClick={()=>setView('list')}>List</button>
            <button className={`ots-btn-outline ${view==='table'?'bg-gray-50':''}`} onClick={()=>setView('table')}>Table</button>
            <button className="ots-btn-outline">Export</button>
            <button className="ots-btn-outline">Import</button>
          </div>

          {/* Filters */}
          <div className="ots-card">
            <Filters onChange={(q)=>setFilter({...filter, ...q})} />
          </div>

          {/* Main content */}
          {view === 'list' && (
            <div className="space-y-3">
              {rows.map(r=>(
                <div key={r.id} className="bg-white p-4 rounded-lg border flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{r.desc}</div>
                    <div className="text-sm text-[#64748B]">{r.date} • {r.type}</div>
                  </div>
                  <div className="font-bold">{r.amount}</div>
                </div>
              ))}
              {rows.length===0 && <div className="text-sm text-[#64748B]">No rows</div>}
            </div>
          )}

          {view === 'table' && (
            <div className="ots-card overflow-auto">
              <table className="w-full text-left">
                <thead className="text-sm text-[#64748B]">
                  <tr>
                    <th className="py-2">Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r=>(
                    <tr key={r.id} className="border-t">
                      <td className="py-2">{r.date}</td>
                      <td>{r.desc}</td>
                      <td>{r.type}</td>
                      <td className="text-right font-semibold">{r.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column: cards, summaries */}
        <aside className="space-y-4">
          <ReportCard title="Net (selected)" value="₹0.00" />
          <ReportCard title="Income (month)" value="₹0.00" />
          <ReportCard title="Expense (month)" value="₹0.00" />
          <div className="ots-card">
            <h4 className="font-semibold">Quick Add</h4>
            <div className="mt-3 space-y-2">
              <input className="ots-input" placeholder="Description" />
              <input className="ots-input" placeholder="Amount" type="number" />
              <div className="flex gap-2">
                <button className="ots-btn">Add</button>
                <button className="ots-btn-outline">Reset</button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
