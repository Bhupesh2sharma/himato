import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-ai-dark text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-ai-muted hover:text-white mb-8 transition-colors"
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
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-ai-text to-ai-muted">
                Terms and Conditions
              </h1>
              <p className="text-ai-muted text-sm mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-ai-muted leading-relaxed">
                By accessing and using the Sikkim Tourism AI-Powered Travel Planner ("the Service"), 
                you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Use License</h2>
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
              <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration</h2>
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
              <h2 className="text-2xl font-semibold text-white mb-4">4. Business Accounts</h2>
              <p className="text-ai-muted leading-relaxed">
                Users may register as business/travel agent accounts. Business accounts may have access 
                to additional features. You are responsible for ensuring that your use of business features 
                complies with all applicable laws and regulations in your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Guest Access</h2>
              <p className="text-ai-muted leading-relaxed">
                The Service may be used without creating an account. Guest users agree to comply with 
                all terms and conditions set forth herein. Certain features may be limited for guest users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. AI-Generated Content</h2>
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

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Privacy Policy</h2>
              <p className="text-ai-muted leading-relaxed">
                Your use of the Service is also governed by our Privacy Policy. Please review our Privacy 
                Policy, which also governs the Service, to understand our practices regarding the collection 
                and use of your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
              <p className="text-ai-muted leading-relaxed">
                In no event shall the Service or its suppliers be liable for any damages (including, 
                without limitation, damages for loss of data or profit, or due to business interruption) 
                arising out of the use or inability to use the materials on the Service, even if the 
                Service or an authorized representative has been notified orally or in writing of the 
                possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Revisions and Errata</h2>
              <p className="text-ai-muted leading-relaxed">
                The materials appearing on the Service could include technical, typographical, or 
                photographic errors. We do not warrant that any of the materials on its website are 
                accurate, complete, or current. We may make changes to the materials contained on 
                the Service at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Modifications to Terms</h2>
              <p className="text-ai-muted leading-relaxed">
                We may revise these terms of service at any time without notice. By using this Service, 
                you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Information</h2>
              <p className="text-ai-muted leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-ai-card/30 rounded-xl">
                <p className="text-ai-muted">
                  <strong className="text-white">Email:</strong> hello@himato.in<br />
                  <strong className="text-white">Phone:</strong> +91 9733814168<br />
                  <strong className="text-white">Website:</strong> www.himato.in
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center">
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


