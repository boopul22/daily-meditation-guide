import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const DisclaimerView: React.FC = () => {
    return (
        <div className="min-h-screen animate-[fade-enter_0.5s_ease-out]">
            <SEO
                title="Disclaimer - Daily Meditation Guide"
                description="Important disclaimers regarding the content on Daily Meditation Guide. This website does not provide medical advice."
                url="https://dailymeditationguide.com/disclaimer"
            />

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="relative container mx-auto px-6 py-20 max-w-3xl">

                {/* Header */}
                <div className="mb-12 text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-medium text-zinc-100 tracking-tight">Disclaimer</h1>
                    <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-zinc-900/50 text-zinc-400 text-sm">
                        Last Updated: February 18, 2026
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

                        <p className="lead text-lg text-zinc-300">
                            The information provided on Daily Meditation Guide (dailymeditationguide.com) is for general informational and educational purposes only. Please read this disclaimer carefully before using our website.
                        </p>

                        <h3>General Disclaimer</h3>
                        <p>
                            All content on this website, including meditation sessions, guided audio, articles, and wellness resources, is provided on an "as is" basis. While we strive to keep the information accurate and up to date, Daily Meditation Guide makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the content for any purpose.
                        </p>

                        <h3>Medical and Health Disclaimer</h3>
                        <p>
                            <strong>Daily Meditation Guide does not provide medical advice.</strong> The meditation sessions, mindfulness practices, and wellness content on this website are intended for general well-being and relaxation purposes only.
                        </p>
                        <ul>
                            <li>The content on this site is <strong>not a substitute</strong> for professional medical advice, diagnosis, or treatment from a qualified healthcare provider.</li>
                            <li>Always seek the advice of your physician, therapist, or other qualified health professional with any questions you may have regarding a medical or mental health condition.</li>
                            <li>Never disregard professional medical advice or delay in seeking it because of something you have read, heard, or practiced from this website.</li>
                            <li>If you are experiencing a medical or mental health emergency, contact your local emergency services immediately.</li>
                            <li>Meditation and mindfulness practices may not be appropriate for everyone. Individuals with certain mental health conditions (including but not limited to PTSD, severe anxiety disorders, psychosis, or a history of trauma) should consult a qualified mental health professional before engaging in meditation practices.</li>
                            <li>Daily Meditation Guide does not claim that its content can cure, treat, diagnose, or prevent any disease, illness, or medical condition.</li>
                        </ul>

                        <h3>No Professional-Client Relationship</h3>
                        <p>
                            Using this website does not establish a therapist-client, doctor-patient, counselor-client, or any other professional relationship between you and Daily Meditation Guide or its creator. The content is shared for educational purposes and should not be interpreted as personalized professional advice.
                        </p>

                        <h3>Results Disclaimer</h3>
                        <p>
                            Individual experiences with meditation and mindfulness practices vary greatly. The benefits described on this website represent general possibilities and are not guaranteed outcomes. Your results may differ based on your individual circumstances, consistency of practice, and other personal factors. Any descriptions of benefits or outcomes do not constitute a guarantee or promise of specific results.
                        </p>

                        <h3>Third-Party Links Disclaimer</h3>
                        <p>
                            Daily Meditation Guide may contain links to external websites and resources that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. The inclusion of any link does not imply endorsement or recommendation by Daily Meditation Guide.
                        </p>

                        <h3>Advertising and Affiliate Disclaimer</h3>
                        <p>
                            This website displays third-party advertisements served by advertising networks, including Google AdSense. These advertisements are provided by third parties and may use cookies and tracking technologies to deliver relevant ads. Daily Meditation Guide is not responsible for the content, accuracy, or practices of advertised products or services.
                        </p>
                        <p>
                            Some links on this website may be affiliate links, meaning we may earn a small commission if you make a purchase through these links. This does not affect the price you pay or the integrity of our content. We only recommend products or services that we believe may be helpful to our audience.
                        </p>

                        <h3>Content Accuracy</h3>
                        <p>
                            While every effort is made to keep the information on Daily Meditation Guide accurate and current, errors or omissions may occur. The website reserves the right to make changes, corrections, or updates to its content at any time without prior notice. We do not guarantee that the information presented is always complete or up to date.
                        </p>

                        <h3>Copyright Notice</h3>
                        <p>
                            All original content on Daily Meditation Guide, including audio sessions, written articles, images, and design elements, is protected by copyright law and is the property of Daily Meditation Guide or its respective content creators. Unauthorized reproduction, distribution, or use of this content without written permission is prohibited.
                        </p>

                        <h3>Limitation of Liability</h3>
                        <p>
                            In no event shall Daily Meditation Guide, its owner, or contributors be held liable for any loss, injury, claim, or damage of any kind resulting from the use of this website or reliance on any information provided herein. This includes, but is not limited to, any direct, indirect, incidental, consequential, or punitive damages.
                        </p>

                        <h3>Contact Us</h3>
                        <p>
                            If you have any questions or concerns about this disclaimer, please contact us at:
                        </p>
                        <ul>
                            <li><strong>Email:</strong> <a href="mailto:blog.boopul@gmail.com">blog.boopul@gmail.com</a></li>
                            <li><strong>Contact Page:</strong> <Link to="/contact" className="text-indigo-400 hover:text-indigo-300">dailymeditationguide.com/contact</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisclaimerView;
