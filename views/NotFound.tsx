import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFound: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-[fade-enter_0.5s_ease-out]">
            <SEO
                title="Page Not Found"
                description="The page you are looking for does not exist."
                type="website"
                noindex={true}
            />

            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full animate-breathe"></div>
                <h1 className="relative text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-zinc-200 to-zinc-800 tracking-tighter">
                    404
                </h1>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
                <h2 className="text-2xl font-medium text-zinc-200">
                    Lost in the void?
                </h2>
                <p className="text-zinc-500">
                    The page you are looking for seems to have drifted away. Let's guide you back to clarity.
                </p>
            </div>

            <Link
                to="/"
                className="group flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded-full font-medium text-sm transition-all hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
            >
                <iconify-icon icon="solar:home-angle-linear" width="18" stroke-width="1.5"></iconify-icon>
                Return Home
            </Link>
        </div>
    );
};

export default NotFound;
