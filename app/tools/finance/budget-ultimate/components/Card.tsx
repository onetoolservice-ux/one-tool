export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-surface dark:bg-slate-800 dark:bg-surface border rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}
