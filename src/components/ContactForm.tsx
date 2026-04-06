import React, { useState } from 'react';

const ContactForm: React.FC = () => {
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
    );
};

export default ContactForm;
