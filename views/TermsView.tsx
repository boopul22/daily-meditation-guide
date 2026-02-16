import React from 'react';
import SEO from '../components/SEO';

const TermsView: React.FC = () => {
    return (
        <div className="min-h-screen animate-[fade-enter_0.5s_ease-out]">
            <SEO
                title="Terms of Service - Daily Meditation Guide"
                description="Terms and Conditions for using Daily Meditation Guide. Please read these terms carefully before using our website."
                canonical="/terms"
            />

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="relative container mx-auto px-6 py-20 max-w-3xl">

                {/* Header */}
                <div className="mb-12 text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-medium text-zinc-100 tracking-tight">Terms of Service</h1>
                    <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-zinc-900/50 text-zinc-400 text-sm">
                        Last Updated: {new Date().toLocaleDateString()}
                    </div>
                </div>

                {/* Content Container */}
                <div className="p-8 md:p-12 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm">
                    <div className="prose prose-invert prose-zinc max-w-none 
              prose-headings:font-medium prose-headings:text-zinc-200 
              prose-p:text-zinc-400 prose-p:leading-relaxed
              prose-li:text-zinc-400
              prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:text-indigo-300
              prose-strong:text-zinc-300">

                        <h3>1. Terms</h3>
                        <p>
                            By accessing this Website, accessible from dailymeditationguide.com, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site. The materials contained in this Website are protected by copyright and trade mark law.
                        </p>

                        <h3>2. Use License</h3>
                        <p>
                            Permission is granted to temporarily download one copy of the materials on Daily Meditation Guide's Website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul>
                            <li>modify or copy the materials;</li>
                            <li>use the materials for any commercial purpose or for any public display;</li>
                            <li>attempt to reverse engineer any software contained on Daily Meditation Guide's Website;</li>
                            <li>remove any copyright or other proprietary notations from the materials; or</li>
                            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                        </ul>
                        <p>
                            This will let Daily Meditation Guide to terminate upon violations of any of these restrictions. Upon termination, your viewing right will also be terminated and you should destroy any downloaded materials in your possession whether it is printed or electronic format.
                        </p>

                        <h3>3. Disclaimer</h3>
                        <p>
                            All the materials on Daily Meditation Guide's Website are provided "as is". Daily Meditation Guide makes no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore, Daily Meditation Guide does not make any representations concerning the accuracy or likely results of the use of the materials on its Website or otherwise relating to such materials or on any sites linked to this Website.
                        </p>

                        <h3>4. Limitations</h3>
                        <p>
                            Daily Meditation Guide or its suppliers will not be hold accountable for any damages that will arise with the use or inability to use the materials on Daily Meditation Guide's Website, even if Daily Meditation Guide or an authorize representative of this Website has been notified, orally or written, of the possibility of such damage. Some jurisdiction does not allow limitations on implied warranties or limitations of liability for incidental damages, these limitations may not apply to you.
                        </p>

                        <h3>5. Revisions and Errata</h3>
                        <p>
                            The materials appearing on Daily Meditation Guide's Website may include technical, typographical, or photographic errors. Daily Meditation Guide will not promise that any of the materials in this Website are accurate, complete, or current. Daily Meditation Guide may change the materials contained on its Website at any time without notice. Daily Meditation Guide does not make any commitment to update the materials.
                        </p>

                        <h3>6. Links</h3>
                        <p>
                            Daily Meditation Guide has not reviewed all of the sites linked to its Website and is not responsible for the contents of any such linked site. The presence of any link does not imply endorsement by Daily Meditation Guide of the site. The use of any linked website is at the user's own risk.
                        </p>

                        <h3>7. Site Terms of Use Modifications</h3>
                        <p>
                            Daily Meditation Guide may revise these Terms of Use for its Website at any time without prior notice. By using this Website, you are agreeing to be bound by the current version of these Terms and Conditions of Use.
                        </p>

                        <h3>8. Your Privacy</h3>
                        <p>
                            Please read our Privacy Policy.
                        </p>

                        <h3>9. Governing Law</h3>
                        <p>
                            Any claim related to Daily Meditation Guide's Website shall be governed by the laws of our jurisdiction without regards to its conflict of law provisions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsView;
