import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = 'dmg_cookie_consent';

const CookieConsent: React.FC = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            setVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        setVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-[fade-enter_0.3s_ease-out]">
            <div className="max-w-4xl mx-auto p-5 md:p-6 rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-1">
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            We use cookies to enhance your experience and serve personalized advertisements through Google AdSense. By clicking "Accept," you consent to our use of cookies. Read our{' '}
                            <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                Privacy Policy
                            </Link>{' '}
                            for more information.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={handleDecline}
                            className="px-5 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 border border-white/10 hover:border-white/20 rounded-xl transition-colors"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            className="px-5 py-2 text-sm font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-xl transition-all"
                        >
                            Accept
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
