import React from 'react';
import SEO from '../components/SEO';

const PrivacyPolicyView: React.FC = () => {
    return (
        <div className="min-h-screen animate-[fade-enter_0.5s_ease-out]">
            <SEO
                title="Privacy Policy - Daily Meditation Guide"
                description="Our commitment to protecting your privacy. Read our Privacy Policy to understand how we collect and use your data."
                canonical="/privacy"
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
                        Last Updated: {new Date().toLocaleDateString()}
                    </div>
                </div>

                {/* Content Container */}
                <div className="p-8 md:p-12 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm">
                    <div className="prose prose-invert prose-zinc max-w-none 
              prose-headings:font-medium prose-headings:text-zinc-200 
              prose-p:text-zinc-400 prose-p:leading-relaxed
              prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:text-indigo-300
              prose-strong:text-zinc-300">

                        <p className="lead text-lg text-zinc-300">
                            At Daily Meditation Guide, accessible from dailymeditationguide.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Daily Meditation Guide and how we use it.
                        </p>

                        <h3>Log Files</h3>
                        <p>
                            Daily Meditation Guide follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
                        </p>

                        <h3>Cookies and Web Beacons</h3>
                        <p>
                            Like any other website, Daily Meditation Guide uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
                        </p>

                        <h3>Google DoubleClick DART Cookie</h3>
                        <p>
                            Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy.
                        </p>

                        <h3>Privacy Policies</h3>
                        <p>
                            You may consult this list to find the Privacy Policy for each of the advertising partners of Daily Meditation Guide.
                        </p>
                        <p>
                            Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Daily Meditation Guide, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
                        </p>
                        <p>
                            Note that Daily Meditation Guide has no access to or control over these cookies that are used by third-party advertisers.
                        </p>

                        <h3>Third Party Privacy Policies</h3>
                        <p>
                            Daily Meditation Guide's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
                        </p>

                        <h3>Consent</h3>
                        <p>
                            By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyView;
