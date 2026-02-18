import React from 'react';
import SEO from '../components/SEO';

const AboutView: React.FC = () => {
    return (
        <div className="min-h-screen animate-[fade-enter_0.5s_ease-out]">
            <SEO
                title="About - Daily Meditation Guide"
                description="Learn about Daily Meditation Guide - your daily source for guided meditations, ambient soundscapes, and mindfulness resources, created by Bipul Kumar."
                canonical="/about"
            />

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="relative container mx-auto px-6 py-20 max-w-4xl space-y-24">

                {/* Hero Section */}
                <section className="text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-400 text-xs font-medium tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        ABOUT
                    </div>

                    <h1 className="text-5xl md:text-7xl font-medium text-zinc-100 tracking-tight leading-[1.1]">
                        Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 animate-shine bg-[length:200%_auto]">Bipul Kumar</span> 👋
                    </h1>

                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light">
                        I'm an indie developer and designer from India. I believe that consistency beats talent and action beats intention.
                    </p>
                </section>

                {/* About the Site */}
                <section className="space-y-8">
                    <h2 className="text-3xl font-medium text-zinc-100 tracking-tight">About Daily Meditation Guide</h2>
                    <div className="p-8 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm space-y-6">
                        <p className="text-zinc-400 leading-relaxed text-lg">
                            Daily Meditation Guide is a curated platform offering guided meditation sessions, ambient soundscapes, and mindfulness resources designed to help you find focus, calm, and clarity in your everyday life.
                        </p>
                        <p className="text-zinc-400 leading-relaxed text-lg">
                            Whether you're looking to manage stress, improve sleep, sharpen your focus, or simply take a moment to breathe, our sessions are crafted to support your personal wellness journey. From short 5-minute breathing exercises to deep 30-minute guided meditations, there's something for everyone.
                        </p>
                        <p className="text-zinc-400 leading-relaxed text-lg">
                            Our mission is simple: <span className="text-zinc-200">make mindfulness and mental clarity accessible to everyone</span>, regardless of experience level or background. New sessions are added regularly to keep your practice fresh and engaging.
                        </p>
                    </div>
                </section>

                {/* My Story */}
                <section className="space-y-8">
                    <h2 className="text-3xl font-medium text-zinc-100 tracking-tight">My Story</h2>
                    <div className="p-8 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm">
                        <p className="text-zinc-400 leading-relaxed text-lg mb-6">
                            My journey hasn't been smooth or privileged. I grew up with limited resources, struggled academically in my early years, and paid my own college fees through persistence and self-learning. Those experiences shaped how I think, work, and build today — with clarity, resilience, and focus on long-term growth.
                        </p>
                        <p className="text-zinc-400 leading-relaxed text-lg">
                            I built Daily Meditation Guide to share the tools that helped me find focus and stillness amidst the chaos. It's a reflection of my belief that mental clarity shouldn't be a luxury, but a fundamental need.
                        </p>
                    </div>
                </section>

                {/* Core Values */}
                <section className="space-y-12">
                    <div className="text-center max-w-2xl mx-auto space-y-4">
                        <h2 className="text-3xl font-medium text-zinc-100 tracking-tight">Core Values</h2>
                        <p className="text-zinc-500">The principles that guide my work and life.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: "Privacy First", desc: "I prioritize user privacy and data protection above all else.", icon: "solar:shield-check-linear", color: "text-blue-400", bg: "bg-blue-500/10" },
                            { title: "User-Centric", desc: "Every feature is designed with you in mind, keeping things simple and useful.", icon: "solar:heart-angle-linear", color: "text-red-400", bg: "bg-red-500/10" },
                            { title: "Quality Assurance", desc: "I maintain high standards for performance, security, and experience.", icon: "solar:medal-ribbon-linear", color: "text-amber-400", bg: "bg-amber-500/10" },
                            { title: "Global Access", desc: "Building tools that are accessible to everyone, regardless of location.", icon: "solar:globe-linear", color: "text-purple-400", bg: "bg-purple-500/10" },
                            { title: "Community Focus", desc: "I value feedback and actively seek to improve based on user needs.", icon: "solar:users-group-rounded-linear", color: "text-green-400", bg: "bg-green-500/10" },
                            { title: "Speed & Reliability", desc: "Optimized for performance to ensure seamless experiences.", icon: "solar:bolt-linear", color: "text-indigo-400", bg: "bg-indigo-500/10" }
                        ].map((val, i) => (
                            <div key={i} className="group p-6 rounded-2xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all duration-300 text-center">
                                <div className={`w-12 h-12 rounded-full ${val.bg} flex items-center justify-center ${val.color} mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                                    <iconify-icon icon={val.icon} width="24"></iconify-icon>
                                </div>
                                <h3 className="text-lg font-medium text-zinc-200 mb-2">{val.title}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* What I Do */}
                <section className="space-y-8">
                    <div className="text-center max-w-2xl mx-auto space-y-4">
                        <h2 className="text-3xl font-medium text-zinc-100 tracking-tight">What I Do</h2>
                        <p className="text-zinc-500">I enjoy working at the intersection of AI, no-code tools, design, automation, and personal development</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { title: "Apps & Tools", desc: "Build small apps, tools, and websites using AI, no-code, and lightweight tech", icon: "solar:code-square-linear" },
                            { title: "AI Workflows", desc: "Experiment with AI workflows to automate ideas and simplify complex tasks", icon: "solar:magic-stick-3-linear" },
                            { title: "Digital Assets", desc: "Design and contribute to digital assets and creative projects", icon: "solar:palette-linear" },
                            { title: "Self-Improvement", desc: "Create content around discipline, fitness, self-improvement, and stoic thinking", icon: "solar:dumbbell-large-linear" },
                            { title: "Discipline & Fitness", desc: "Train regularly, follow structured routines, and treat physical health as a foundation", icon: "solar:running-linear" },
                            { title: "Communication", desc: "Continuously improve English communication and clarity of thought", icon: "solar:chat-round-line-linear" }
                        ].map((item, i) => (
                            <div key={i} className="group p-6 rounded-2xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all duration-300">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-300 mb-4 group-hover:scale-110 transition-transform">
                                    <iconify-icon icon={item.icon} width="20"></iconify-icon>
                                </div>
                                <h3 className="text-lg font-medium text-zinc-200 mb-2">{item.title}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-zinc-500 italic mt-8">"I prefer practical execution over theory, clean systems over noise, and steady progress over shortcuts."</p>
                </section>

                {/* Philosophy */}
                <section className="py-12 border-y border-white/5">
                    <h2 className="text-center text-2xl font-medium text-zinc-200 mb-12">Personal Philosophy</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {["Start small", "Stay consistent", "Build quietly", "Let results make the noise"].map((text, i) => (
                            <div key={i} className="space-y-4 group">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 mx-auto group-hover:scale-150 transition-transform"></div>
                                <p className="text-zinc-300 font-medium tracking-tight">{text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Other Projects */}
                <section className="space-y-8">
                    <h2 className="text-3xl font-medium text-zinc-100 tracking-tight">My Other Projects</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { name: "ExtractPics", desc: "Extract and download images from any website instantly. Supports batch processing and smart filtering.", link: "#" },
                            { name: "ImageToURL", desc: "Convert any image to URL instantly. Free image hosting with global CDN delivery.", link: "#" },
                            { name: "StoriesPDF", desc: "Discover and download captivated PDF stories for all ages.", link: "#" },
                            { name: "TamilKathai", desc: "A collection of wonderful Tamil stories and cultural narratives.", link: "#" }
                        ].map((project, i) => (
                            <a key={i} href={project.link} className="block p-8 rounded-3xl border border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all duration-300 group">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-medium text-zinc-200 group-hover:text-indigo-300 transition-colors">{project.name}</h3>
                                    <iconify-icon icon="solar:arrow-right-up-linear" class="text-zinc-500 group-hover:text-zinc-300 transition-colors"></iconify-icon>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed">{project.desc}</p>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Let's Connect */}
                <section className="space-y-8">
                    <h2 className="text-3xl font-medium text-zinc-100 tracking-tight">Let's Connect</h2>
                    <p className="text-zinc-400">If you're interested in AI, no-code tools, creative technology, fitness discipline, or personal growth — welcome, you're in the right place.</p>

                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { label: "GitHub", val: "Projects & Code", icon: "brandico:github", link: "#" },
                            { label: "Personal Instagram", val: "Life & Fitness", icon: "brandico:instagram", link: "#" },
                            { label: "Developer Instagram", val: "No-code & AI", icon: "brandico:instagram-filled", link: "#" },
                            { label: "Email", val: "blog.boopul@gmail.com", icon: "solar:letter-linear", link: "mailto:blog.boopul@gmail.com" },
                        ].map((item, i) => (
                            <a key={i} href={item.link} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-400">
                                    <iconify-icon icon={item.icon} width="20"></iconify-icon>
                                </div>
                                <div>
                                    <p className="text-zinc-200 font-medium text-sm">{item.label}</p>
                                    <p className="text-zinc-500 text-xs">{item.val}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default AboutView;
