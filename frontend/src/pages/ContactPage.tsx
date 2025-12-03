import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#0A1F44] mb-2">Contact Us</h1>
        <p className="text-gray-600">Get in touch with the Coimbatore Express team</p>
        <div className="h-1 w-24 bg-[#0A1F44] mt-4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#0A1F44] mb-6">Send us a message</h2>

            {submitted && (
              <div className="bg-green-50 border border-green-400 text-green-800 rounded-lg p-4 mb-6">
                <p className="font-semibold">Thank you for reaching out!</p>
                <p className="text-sm mt-1">We'll get back to you as soon as possible.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none transition"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none transition"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none transition"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none transition resize-none"
                  placeholder="Your message here..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0A1F44] text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition flex items-center justify-center space-x-2"
              >
                <Send size={18} />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#0A1F44] mb-6">Contact Information</h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-[#0A1F44] p-3 rounded-full flex-shrink-0">
                  <Mail className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0A1F44] mb-1">Email</h3>
                  <a
                    href="mailto:editor@coimbatoreexpress.com"
                    className="text-gray-600 hover:text-[#0A1F44] transition"
                  >
                    editor@coimbatoreexpress.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-[#0A1F44] p-3 rounded-full flex-shrink-0">
                  <Phone className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0A1F44] mb-1">Phone</h3>
                  <a
                    href="tel:+919500980047"
                    className="text-gray-600 hover:text-[#0A1F44] transition"
                  >
                    +91 95009 80047
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-[#0A1F44] p-3 rounded-full flex-shrink-0">
                  <MapPin className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0A1F44] mb-1">Address</h3>
                  <p className="text-gray-600">
                    Coimbatore, Tamil Nadu<br />
                    India
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0A1F44] to-[#1a3a6e] rounded-lg shadow-lg p-8 text-white">
            <h3 className="text-xl font-bold mb-4">Have a News Tip?</h3>
            <p className="text-gray-200 mb-4 leading-relaxed">
              If you have a story idea or news tip you'd like to share with us, we'd love to hear from you.
              Your insights help us serve the Coimbatore community better.
            </p>
            <a
              href="mailto:editor@coimbatoreexpress.com?subject=News Tip"
              className="inline-block bg-[#0A1F44] hover:bg-gray-800 px-6 py-3 rounded-full font-semibold transition"
            >
              Submit a News Tip
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-[#0A1F44] mb-4">Advertise With Us</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Reach thousands of engaged readers in Coimbatore. Contact us to learn about our
              advertising opportunities and packages.
            </p>
            <a
              href="mailto:editor@coimbatoreexpress.com?subject=Advertising Inquiry"
              className="inline-block border-2 border-[#0A1F44] text-[#0A1F44] px-6 py-3 rounded-full font-semibold hover:bg-[#0A1F44] hover:text-white transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
