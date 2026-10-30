import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Update when the terms or the privacy section change.
const LAST_UPDATED = '30 October 2026';

export const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-ai-dark text-ai-text py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-ai-muted hover:text-ai-text mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-8 md:p-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-ai-accent/10 rounded-xl">
              <FileText className="w-8 h-8 text-ai-accent" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-ai-text">
                Terms and Conditions
              </h1>
              <p className="text-ai-muted text-sm mt-1">Last updated: {LAST_UPDATED}</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-ai-text mb-4">1. Acceptance of Terms</h2>
              <p className="text-ai-muted leading-relaxed">
                By accessing and using the Sikkim Tourism AI-Powered Travel Planner ("the Service"), 
                you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ai-text mb-4">2. Use License</h2>
              <p className="text-ai-muted leading-relaxed mb-4">
                Permission is granted to temporarily access the materials on our website for personal, 
                non-commercial transitory viewing only. This is the grant of a license, not a transfer 
                of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-ai-muted ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose without written consent</li>
                <li>Attempt to decompile or reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ai-text mb-4">3. Account Registration</h2>
              <p className="text-ai-muted leading-relaxed mb-4">
                To access certain features of the Service, you may be required to register for an account. 
                You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-ai-muted ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your information to keep it accurate, current, and complete</li>
                <li>Maintain the security of your password and identification</li>
                <li>Accept all responsibility for activities that occur under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ai-text mb-4">4. Business Accounts</h2>
              <p className="text-ai-muted leading-relaxed">
                Users may register as business/travel agent accounts. Business accounts may have access 
                to additional features. You are responsible for ensuring that your use of business features 
                complies with all applicable laws and regulations in your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ai-text mb-4">5. Guest Access</h2>
              <p className="text-ai-muted leading-relaxed">
                The Service may be used without creating an account. Guest users agree to comply with 
                all terms and conditions set forth herein. Certain features may be limited for guest users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ai-text mb-4">6. AI-Generated Content</h2>
              <p className="text-ai-muted leading-relaxed">
                The Service uses artificial intelligence to generate travel itineraries and recommendations. 
                While we strive for accuracy, AI-generated content may contain errors or inaccuracies. 
                You acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-ai-muted ml-4">
                <li>All content is provided for informational purposes only</li>
                <li>You should verify all information, including prices, availability, and regulations</li>
                <li>We are not liable for decisions made based on AI-generated content</li>
              </ul>
            </section>

            <section id="privacy">
              <h2 className="text-2xl font-semibold text-ai-text mb-4">7. Privacy: What We Collect and Why</h2>
              <p className="text-ai-muted leading-relaxed">
                We collect only what we need to plan your trip, connect you with travel agents when you ask,
                keep the Service safe and improve it.
              </p>

              <h3 className="text-lg font-semibold text-ai-text mt-6 mb-2">What we collect</h3>
              <ul className="list-disc list-inside text-ai-muted space-y-2 ml-4">
                <li><strong className="text-ai-text">Account details:</strong> your name, email address, phone number (if you give it) and, if you sign in with Google, your Google profile picture.</li>
                <li><strong className="text-ai-text">Trip details you choose to share:</strong> when you plan to travel, how many people are travelling, your WhatsApp number and any message you send with a quote request.</li>
                <li><strong className="text-ai-text">What you type into the planner:</strong> your trip request. If you are signed in, we also save the itinerary we generate so you can come back to it. If you are not signed in, we keep only what you typed, not the itinerary.</li>
                <li><strong className="text-ai-text">Usage and device information:</strong> your IP address, browser and device type, the pages you visit, the page you arrived on and the website that sent you, and the main actions you take (for example generating a plan, signing up, downloading a PDF or requesting quotes). A random ID stored in your browser links these together. It does not contain your name or contact details.</li>
              </ul>

              <h3 className="text-lg font-semibold text-ai-text mt-6 mb-2">How we use it</h3>
              <ul className="list-disc list-inside text-ai-muted space-y-2 ml-4">
                <li>To generate, save and share your itineraries</li>
                <li>To pass your quote request to travel agents, as described below</li>
                <li>To prevent abuse, for example by limiting how many plans can be generated without an account</li>
                <li>To understand which guides and features help travellers, and to improve the Service</li>
              </ul>

              <h3 className="text-lg font-semibold text-ai-text mt-6 mb-2">When we share it</h3>
              <ul className="list-disc list-inside text-ai-muted space-y-2 ml-4">
                <li><strong className="text-ai-text">Travel agents, only when you request quotes.</strong> Our team reviews each request and sends your name, contact details, trip details and itinerary to the agents you chose or that we match you with. Himato may charge agents for connecting them with travellers.</li>
                <li><strong className="text-ai-text">Service providers that run Himato for us:</strong> hosting, email delivery, the AI providers that generate itineraries (your trip request is sent to them to create your plan) and Google Analytics for usage statistics.</li>
                <li>We do not sell your information to advertisers, and we do not share your IP address or device information with travel agents.</li>
              </ul>

              <h3 className="text-lg font-semibold text-ai-text mt-6 mb-2">How long we keep it</h3>
              <ul className="list-disc list-inside text-ai-muted space-y-2 ml-4">
                <li><strong className="text-ai-text">Usage and device information, and planner requests:</strong> deleted automatically after 180 days.</li>
                <li><strong className="text-ai-text">Your account, saved itineraries, trip details and quote requests:</strong> kept while your account is active, or until you ask us to delete them.</li>
              </ul>

              <h3 className="text-lg font-semibold text-ai-text mt-6 mb-2">Your choices</h3>
              <p className="text-ai-muted leading-relaxed">
                Your trip details and WhatsApp number are optional. You can ask us to show you, correct or delete
                the information we hold about you at any time by emailing <strong className="text-ai-text">hello@himato.in</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ai-text mb-4">8. Limitation of Liability</h2>
              <p className="text-ai-muted leading-relaxed">
                In no event shall the Service or its suppliers be liable for any damages (including, 
                without limitation, damages for loss of data or profit, or due to business interruption) 
                arising out of the use or inability to use the materials on the Service, even if the 
                Service or an authorized representative has been notified orally or in writing of the 
                possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ai-text mb-4">9. Revisions and Errata</h2>
              <p className="text-ai-muted leading-relaxed">
                The materials appearing on the Service could include technical, typographical, or 
                photographic errors. We do not warrant that any of the materials on its website are 
                accurate, complete, or current. We may make changes to the materials contained on 
                the Service at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ai-text mb-4">10. Modifications to Terms</h2>
              <p className="text-ai-muted leading-relaxed">
                We may revise these terms of service at any time without notice. By using this Service, 
                you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ai-text mb-4">11. Contact Information</h2>
              <p className="text-ai-muted leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-ai-card/30 rounded-xl">
                <p className="text-ai-muted">
                  <strong className="text-ai-text">Email:</strong> hello@himato.in<br />
                  <strong className="text-ai-text">Phone:</strong> +91 9733814168<br />
                  <strong className="text-ai-text">Website:</strong> www.himato.in
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-black/10 text-center">
            <p className="text-ai-muted text-sm">
              By using this service, you acknowledge that you have read, understood, and agree to be 
              bound by these Terms and Conditions.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};



