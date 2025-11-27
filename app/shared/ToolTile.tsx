import Link from "next/link";

export default function ToolTile({ href, title, desc }: { href: string; title: string; desc?: string }){
  return (
    <Link href={href}>
      <div className="ots-card cursor-pointer hover:shadow-lg transition">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm small-muted mt-1">{desc}</p>
          </div>
          <div style={{fontSize:22,color:"rgb(117,163,163)"}}>🔧</div>
        </div>
      </div>
    </Link>
  );
}
