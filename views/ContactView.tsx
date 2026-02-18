import React, { useState } from 'react';
import SEO from '../components/SEO';

const ContactView: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) return;
        const subject = encodeURIComponent(`Contact from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
        window.location.href = `mailto:blog.boopul@gmail.com?subject=${subject}&body=${body}`;
    };

    return (
        <div className="min-h-screen animate-[fade-enter_0.5s_ease-out]">
            <SEO
                title="Contact Us"
                description="Get in touch with the Daily Meditation Guide team. We're here to help with any questions, suggestions, or feedback about our meditation sessions."
                keywords="contact daily meditation guide, meditation support, feedback, get in touch"
                url="https://dailymeditationguide.com/contact"
            />

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="relative container mx-auto px-6 py-20 max-w-5xl">
                <div className="grid lg:grid-cols-2 gap-16 items-start">

                    {/* Header & Info */}
                    <div className="space-y-10">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-400 text-xs font-medium tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                                SUPPORT
                            </div>
                            <h1 className="text-5xl md:text-6xl font-medium text-zinc-100 tracking-tight leading-tight">
                                We'd love to <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-indigo-300">hear from you.</span>
                            </h1>
                            <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
                                Have questions about our sessions, suggestions for new sounds, or just want to say hello? We're here to help.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <a href="mailto:blog.boopul@gmail.com" className="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-zinc-900/60 transition-all duration-300">
                                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                    <iconify-icon icon="solar:letter-linear" width="24"></iconify-icon>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">Email Support</p>
                                    <p className="text-zinc-200 font-medium">blog.boopul@gmail.com</p>
                                </div>
                            </a>

                            <a href="#" className="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-zinc-900/60 transition-all duration-300">
                                <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                                    <iconify-icon icon="brandico:twitter-bird" width="20"></iconify-icon>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">Follow Updates</p>
                                    <p className="text-zinc-200 font-medium">@DailyMediGuide</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Contact Form Placeholder */}
                    <div className="relative p-8 rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-md">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-3xl"></div>

                        <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-zinc-400">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-zinc-400">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-zinc-400">Message</label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="How can we help?"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl transition-all hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)]"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ContactView;
