import React from 'react';
import SEO from '../components/SEO';

const PrivacyPolicyView: React.FC = () => {
    return (
        <div className="min-h-screen animate-[fade-enter_0.5s_ease-out]">
            <SEO
                title="Privacy Policy"
                description="Our commitment to protecting your privacy. Read our Privacy Policy to understand how we collect, use, and protect your data at Daily Meditation Guide."
                keywords="privacy policy, data protection, cookies, GDPR, CCPA, daily meditation guide"
                url="https://dailymeditationguide.com/privacy"
                noindex={true}
            />

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="relative container mx-auto px-6 py-20 max-w-3xl">

                {/* Header */}
                <div className="mb-12 text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-medium text-zinc-100 tracking-tight">Privacy Policy</h1>
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
                            At Daily Meditation Guide, accessible from dailymeditationguide.com, your privacy is one of our top priorities. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data. This site is operated by Bipul Kumar.
                        </p>

                        <h3>Information We Collect</h3>
                        <p>
                            We collect information to provide and improve our services. The types of information we may collect include:
                        </p>
                        <ul>
                            <li><strong>Log Data:</strong> When you visit our website, our hosting provider (Cloudflare) automatically collects information such as your IP address, browser type, Internet Service Provider (ISP), date and time stamps, referring and exit pages, and the number of clicks. This information is used to analyze trends, administer the site, and gather broad demographic information.</li>
                            <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to enhance your browsing experience. See the "Cookies and Tracking Technologies" section below for more details.</li>
                            <li><strong>Contact Information:</strong> If you contact us through our contact form, we may collect your name, email address, and the content of your message.</li>
                        </ul>

                        <h3>Cookies and Tracking Technologies</h3>
                        <p>
                            Cookies are small files stored on your device that help us improve your experience on our site. We use the following types of cookies:
                        </p>
                        <ul>
                            <li><strong>Essential Cookies:</strong> Required for the basic functionality of the website, such as remembering your cookie consent preference.</li>
                            <li><strong>Advertising Cookies:</strong> Used by third-party advertising partners, including Google, to serve ads relevant to your interests based on your browsing activity on this and other websites.</li>
                        </ul>
                        <p>
                            You can manage or disable cookies through your browser settings. Please note that disabling cookies may affect the functionality of the website.
                        </p>

                        <h3>Google AdSense and Advertising</h3>
                        <p>
                            We use Google AdSense to display advertisements on our website. Google AdSense uses cookies, including the DoubleClick DART cookie, to serve ads based on your visits to dailymeditationguide.com and other websites on the Internet.
                        </p>
                        <ul>
                            <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website and other websites.</li>
                            <li>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.</li>
                            <li>Third-party ad servers or ad networks may use technologies such as cookies, JavaScript, or web beacons in their advertisements. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of advertising campaigns and to personalize the advertising content you see.</li>
                            <li>Daily Meditation Guide has no access to or control over cookies that are used by third-party advertisers.</li>
                        </ul>
                        <p>
                            You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>. You may also opt out of third-party vendor cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info/choices</a>.
                        </p>
                        <p>
                            For more information about how Google uses data, please review <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.
                        </p>

                        <h3>How We Use Your Information</h3>
                        <p>We use the information we collect for the following purposes:</p>
                        <ul>
                            <li>To provide, maintain, and improve our website and services</li>
                            <li>To personalize your experience and deliver content relevant to your interests</li>
                            <li>To analyze website usage and trends to improve performance</li>
                            <li>To serve relevant advertisements through third-party advertising partners</li>
                            <li>To respond to your inquiries and provide support</li>
                        </ul>

                        <h3>Third-Party Services</h3>
                        <p>
                            We use the following third-party services that may collect and process your data:
                        </p>
                        <ul>
                            <li><strong>Cloudflare:</strong> Our hosting and content delivery provider. Cloudflare may collect log data and use security cookies. <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare Privacy Policy</a></li>
                            <li><strong>Google AdSense:</strong> Our advertising partner. Google may use cookies to serve personalized ads. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
                        </ul>

                        <h3>GDPR Compliance (European Users)</h3>
                        <p>
                            If you are a resident of the European Economic Area (EEA), the United Kingdom, or Switzerland, you have the following rights under the General Data Protection Regulation (GDPR):
                        </p>
                        <ul>
                            <li><strong>Right to Access:</strong> You can request a copy of the personal data we hold about you.</li>
                            <li><strong>Right to Rectification:</strong> You can request that we correct any inaccurate or incomplete data.</li>
                            <li><strong>Right to Erasure:</strong> You can request that we delete your personal data ("right to be forgotten").</li>
                            <li><strong>Right to Restrict Processing:</strong> You can request that we limit how we use your data.</li>
                            <li><strong>Right to Data Portability:</strong> You can request to receive your data in a structured, commonly used format.</li>
                            <li><strong>Right to Object:</strong> You can object to the processing of your personal data for certain purposes, including direct marketing.</li>
                        </ul>
                        <p>
                            To exercise any of these rights, please contact us at <a href="mailto:blog.boopul@gmail.com">blog.boopul@gmail.com</a>.
                        </p>

                        <h3>CCPA Compliance (California Residents)</h3>
                        <p>
                            If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with the following rights:
                        </p>
                        <ul>
                            <li>The right to know what personal data is being collected about you.</li>
                            <li>The right to request deletion of your personal data.</li>
                            <li>The right to opt out of the sale of your personal data.</li>
                        </ul>
                        <p>
                            We do not sell your personal data to third parties. To exercise your rights under the CCPA, contact us at <a href="mailto:blog.boopul@gmail.com">blog.boopul@gmail.com</a>.
                        </p>

                        <h3>Children's Privacy</h3>
                        <p>
                            Daily Meditation Guide does not knowingly collect personal information from children under the age of 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at <a href="mailto:blog.boopul@gmail.com">blog.boopul@gmail.com</a>. If we become aware that we have collected personal data from a child under 13 without verifiable parental consent, we will take steps to delete that information promptly.
                        </p>

                        <h3>Data Security</h3>
                        <p>
                            We take reasonable measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Our website is served over HTTPS with SSL encryption provided by Cloudflare. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security.
                        </p>

                        <h3>Changes to This Privacy Policy</h3>
                        <p>
                            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your data.
                        </p>

                        <h3>Contact Us</h3>
                        <p>
                            If you have any questions or concerns about this Privacy Policy, please contact us at:
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

export default PrivacyPolicyView;
