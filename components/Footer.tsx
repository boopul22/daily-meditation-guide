import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/5 bg-[#030303] text-zinc-500 pt-12 pb-24 mt-20">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer w-fit">
            <div className="w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center bg-zinc-900 group-hover:border-zinc-500 transition-colors">
              <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
            </div>
            <span className="text-zinc-200 font-medium tracking-tighter text-sm">dailymeditationguide.com</span>
          </Link>
          <p className="text-xs leading-relaxed max-w-xs">
            Daily curation of guided meditations and ambient soundscapes to help you find focus and stillness.
          </p>
        </div>

        {/* Links Column 1 */}
        <div className="space-y-4">
          <h4 className="text-zinc-200 font-medium text-sm">Platform</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/" className="hover:text-zinc-300 transition-colors">Browse</Link>
            <Link to="/sessions" className="hover:text-zinc-300 transition-colors">Sessions</Link>
            <Link to="/about" className="hover:text-zinc-300 transition-colors">About</Link>
          </div>
        </div>

        {/* Links Column 2 */}
        <div className="space-y-4">
          <h4 className="text-zinc-200 font-medium text-sm">Support</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/contact" className="hover:text-zinc-300 transition-colors">Contact Us</Link>
            <Link to="/disclaimer" className="hover:text-zinc-300 transition-colors">Disclaimer</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <p>&copy; {new Date().getFullYear()} dailymeditationguide.com. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
          <Link to="/disclaimer" className="hover:text-zinc-300 transition-colors">Disclaimer</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
