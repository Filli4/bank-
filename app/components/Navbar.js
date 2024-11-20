//app/components/Navbar.js

import Link from "next/link.js";

import "../globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <nav className="flex flex-wrap justify-center  p-4 sm:gap-11 items-center bg-zinc-500 w-full sm:w-auto sm:rounded-b-full">

        <Link href="/" className="hover:bg-slate-500 p-3 rounded-lg font-bold text-xl">Home</Link>
        <Link href="/accounts" className="hover:bg-slate-500 p-3 rounded-lg font-bold text-xl">Balance</Link>
        <Link href="/auth" className="hover:bg-slate-500 p-3 rounded-lg font-bold text-xl">Login</Link>
       
        
      </nav>
      
    </>
    
  );
}

