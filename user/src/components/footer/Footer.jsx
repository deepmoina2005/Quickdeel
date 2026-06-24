import { Facebook, Instagram, Store, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
      <div>
        <div className="flex items-center gap-2 text-xl font-black"><Store className="h-7 w-7 text-brand-600" />QuickDeal</div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Buy and sell locally with a fast, simple marketplace experience.</p>
      </div>
      <div>
        <h3 className="font-bold">Company</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-500"><p>About Us</p><p>Contact Us</p></div>
      </div>
      <div>
        <h3 className="font-bold">Legal</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-500"><p>Terms & Conditions</p><p>Privacy Policy</p></div>
      </div>
      <div>
        <h3 className="font-bold">Explore</h3>
        <div className="mt-3 flex gap-3">
          {[Facebook, Instagram, Twitter].map((Icon, index) => <Link key={index} className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 dark:bg-slate-900"><Icon className="h-5 w-5" /></Link>)}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
