import React from 'react';
import { Link } from 'react-router-dom';
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

                        <h3>1. Acceptance of Terms</h3>
                        <p>
                            By accessing and using Daily Meditation Guide (dailymeditationguide.com), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>

                        <h3>2. Description of Service</h3>
                        <p>
                            Daily Meditation Guide provides curated meditation sessions, guided audio content, ambient soundscapes, and wellness resources. All content is provided for informational and educational purposes to support your personal mindfulness and relaxation practice.
                        </p>

                        <h3>3. Health and Medical Disclaimer</h3>
                        <p>
                            <strong>The content on this website is not intended to be a substitute for professional medical advice, diagnosis, or treatment.</strong> The meditation sessions, guided practices, and wellness content provided on Daily Meditation Guide are for general informational and educational purposes only.
                        </p>
                        <ul>
                            <li>Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical or mental health condition.</li>
                            <li>Never disregard professional medical advice or delay in seeking it because of something you have read or heard on this website.</li>
                            <li>If you are experiencing a medical emergency, call your local emergency services immediately.</li>
                            <li>Meditation and mindfulness practices may not be suitable for everyone. If you have existing medical or mental health conditions (such as PTSD, severe anxiety, or psychosis), please consult a healthcare professional before beginning any new wellness practice.</li>
                            <li>Daily Meditation Guide does not claim that its content can cure, treat, or prevent any disease or medical condition.</li>
                        </ul>
                        <p>
                            For a complete disclaimer, please visit our <Link to="/disclaimer" className="text-indigo-400 hover:text-indigo-300">Disclaimer page</Link>.
                        </p>

                        <h3>4. User Conduct</h3>
                        <p>By using this website, you agree not to:</p>
                        <ul>
                            <li>Use the website for any unlawful purpose or in violation of any applicable laws</li>
                            <li>Attempt to gain unauthorized access to any part of the website or its systems</li>
                            <li>Distribute, reproduce, or create derivative works from our content without written permission</li>
                            <li>Use the content for any commercial purpose without authorization</li>
                            <li>Use automated tools to scrape, crawl, or extract data from the website</li>
                            <li>Interfere with or disrupt the website's functionality or servers</li>
                        </ul>

                        <h3>5. Intellectual Property</h3>
                        <p>
                            All content on Daily Meditation Guide, including but not limited to audio sessions, written content, images, design elements, and logos, is the property of Daily Meditation Guide or its content creators and is protected by applicable copyright and intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from our content without prior written consent.
                        </p>

                        <h3>6. Use License</h3>
                        <p>
                            Permission is granted to temporarily access and use the materials on Daily Meditation Guide for personal, non-commercial purposes only. This is the grant of a license, not a transfer of title. Under this license, you may not:
                        </p>
                        <ul>
                            <li>Modify or copy the materials for distribution</li>
                            <li>Use the materials for any commercial purpose or public display</li>
                            <li>Attempt to reverse engineer any software on the website</li>
                            <li>Remove any copyright or proprietary notations from the materials</li>
                            <li>Transfer the materials to another person or mirror them on another server</li>
                        </ul>
                        <p>
                            This license will automatically terminate if you violate any of these restrictions.
                        </p>

                        <h3>7. User-Generated Content</h3>
                        <p>
                            If you submit feedback, suggestions, or other content through our contact form or other channels, you grant Daily Meditation Guide a non-exclusive, royalty-free license to use, reproduce, and display such content for the purpose of improving our services. You retain ownership of your submitted content.
                        </p>

                        <h3>8. Third-Party Content and Links</h3>
                        <p>
                            Our website may contain links to third-party websites and services. Daily Meditation Guide is not responsible for the content, accuracy, or practices of third-party sites. The inclusion of any link does not imply endorsement. Your use of any linked website is at your own risk.
                        </p>

                        <h3>9. Advertising</h3>
                        <p>
                            Daily Meditation Guide displays third-party advertisements, including ads served by Google AdSense. Any interaction with advertisers, including the purchase of goods or services, is solely between you and the advertiser. Daily Meditation Guide is not responsible for any advertiser's content, products, or services.
                        </p>

                        <h3>10. Disclaimer of Warranties</h3>
                        <p>
                            All materials on Daily Meditation Guide are provided "as is" without warranties of any kind, either express or implied. Daily Meditation Guide makes no warranties regarding the accuracy, completeness, reliability, or fitness for a particular purpose of the content on this website. We do not warrant that the website will be uninterrupted, error-free, or free of harmful components.
                        </p>

                        <h3>11. Limitation of Liability</h3>
                        <p>
                            In no event shall Daily Meditation Guide, its owner (Bipul Kumar), or its contributors be liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from your use of or inability to use the website or its content, including but not limited to damages for loss of data, health-related outcomes, or other intangible losses.
                        </p>

                        <h3>12. Indemnification</h3>
                        <p>
                            You agree to indemnify and hold harmless Daily Meditation Guide and its owner from any claims, damages, losses, or expenses (including legal fees) arising from your use of the website, violation of these terms, or infringement of any third-party rights.
                        </p>

                        <h3>13. Privacy</h3>
                        <p>
                            Your use of Daily Meditation Guide is also governed by our <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>, which explains how we collect, use, and protect your data. By using this website, you consent to the practices described in our Privacy Policy.
                        </p>

                        <h3>14. Changes to Terms</h3>
                        <p>
                            Daily Meditation Guide reserves the right to revise these Terms of Service at any time without prior notice. Changes will be posted on this page with an updated "Last Updated" date. By continuing to use the website after changes are posted, you agree to be bound by the revised terms.
                        </p>

                        <h3>15. Governing Law</h3>
                        <p>
                            These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising from or relating to these terms shall be subject to the exclusive jurisdiction of the courts in India.
                        </p>

                        <h3>16. Contact</h3>
                        <p>
                            If you have any questions about these Terms of Service, please contact us at:
                        </p>
                        <ul>
                            <li><strong>Email:</strong> <a href="mailto:blog.boopul@gmail.com">blog.boopul@gmail.com</a></li>
                            <li><strong>Website:</strong> <a href="https://dailymeditationguide.com/contact">dailymeditationguide.com/contact</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsView;
