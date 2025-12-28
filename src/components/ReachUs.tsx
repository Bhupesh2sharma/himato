import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Building2, User, MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReachUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate form submission (you can replace this with actual API call)
    try {
      // TODO: Replace with actual API endpoint
      // await fetch('/api/reach-us', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ai-dark text-white selection:bg-ai-accent/30">
      {/* Header Section */}
      <div className="relative py-16 px-6 sm:px-12 overflow-hidden border-b border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-ai-accent/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-ai-muted hover:text-white transition-colors mb-8 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-6xl font-bold mb-4 tracking-tight">
              Reach <span className="text-ai-accent">Us</span>
            </h1>
            <p className="text-ai-muted text-lg sm:text-xl max-w-2xl mx-auto">
              Are you a travel agent? Partner with us to offer amazing Sikkim tourism experiences to your clients.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glass p-6 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
              <p className="text-ai-muted mb-8 leading-relaxed">
                We're always looking to partner with travel agents and tour operators who share our passion for showcasing the beauty of Sikkim. Fill out the form and we'll get back to you soon.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="p-3 bg-ai-accent/20 rounded-full">
                    <Mail className="w-5 h-5 text-ai-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-ai-muted">Email</p>
                    <p className="font-medium">hello@himato.in</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-gray-300">
                  <div className="p-3 bg-ai-accent/20 rounded-full">
                    <Phone className="w-5 h-5 text-ai-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-ai-muted">Phone</p>
                    <p className="font-medium">+91 9733814168</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-gray-300">
                  <div className="p-3 bg-ai-accent/20 rounded-full">
                    <Building2 className="w-5 h-5 text-ai-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-ai-muted">Company</p>
                    <p className="font-medium">Waglogy</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 sm:p-8 rounded-2xl border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>

            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200"
              >
                Thank you! We've received your message and will get back to you soon.
              </motion.div>
            )}

            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200"
              >
                Something went wrong. Please try again or contact us directly.
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-ai-muted focus:outline-none focus:border-ai-accent/50 transition-all"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-ai-muted focus:outline-none focus:border-ai-accent/50 transition-all"
                  placeholder="yourname@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-ai-muted focus:outline-none focus:border-ai-accent/50 transition-all"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Company / Agency Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-ai-muted focus:outline-none focus:border-ai-accent/50 transition-all"
                  placeholder="Your Travel Agency"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-ai-muted focus:outline-none focus:border-ai-accent/50 transition-all resize-none"
                  placeholder="Tell us about your travel agency and how we can work together..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-ai-accent hover:bg-ai-secondary text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-ai-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
