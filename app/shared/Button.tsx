"use client";
export default function Button({ children, className='', ...props }: any){
  return <button className={`ots-btn ${className}`} {...props}>{children}</button>;
}
