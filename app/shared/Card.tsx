export default function Card({ children, className='' }: any){
  return <div className={`ots-card ${className}`}>{children}</div>;
}
