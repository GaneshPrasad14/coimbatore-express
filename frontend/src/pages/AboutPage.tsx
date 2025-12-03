import { Target, Users, Award, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#0A1F44] mb-2">About Us</h1>
        <div className="h-1 w-24 bg-[#D90429]"></div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            Welcome to <strong>Coimbatore Express</strong> — your trusted source for comprehensive,
            timely, and reliable news coverage exclusively focused on Coimbatore.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            In an era of information overload, we believe that local news matters more than ever.
            Coimbatore Express was founded with a simple yet powerful mission: to deliver fast,
            accurate, and in-depth coverage of the stories that shape our city.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            From breaking news and civic issues to business developments, educational achievements,
            cultural events, and community stories, we are committed to being the english voice of Coimbatore.
            Our dedicated team of journalists works around the clock to bring you the most relevant
            updates about our vibrant city.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-[#D90429] p-3 rounded-full">
              <Target className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#0A1F44]">Our Mission</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">
            To provide factual, unbiased, and timely news coverage that empowers the people of
            Coimbatore to stay informed, engaged, and connected with their community.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-[#D90429] p-3 rounded-full">
              <Award className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#0A1F44]">Our Values</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Integrity, accuracy, and transparency guide everything we do. We are committed to
            journalistic excellence and serving the public interest above all else.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-[#D90429] p-3 rounded-full">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#0A1F44]">Community First</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">
            We are more than just a news platform — we are part of the Coimbatore community.
            Your stories, voices, and concerns drive our editorial agenda.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-[#D90429] p-3 rounded-full">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#0A1F44]">Innovation</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Leveraging modern technology and digital platforms, we ensure that news reaches you
            faster and more conveniently than ever before.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#0A1F44] to-[#1a3a6e] rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">What We Cover</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="space-y-2 text-gray-200">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>Local governance and civic issues</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>Business and economic development</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>Education and academic achievements</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>Sports and athletic events</span>
            </li>
          </ul>
          <ul className="space-y-2 text-gray-200">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>Real estate and infrastructure</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>Arts, culture, and lifestyle</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>Community events and celebrations</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>Opinion and editorial perspectives</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mt-8 text-center">
        <h2 className="text-2xl font-bold text-[#0A1F44] mb-4">Join Our Journey</h2>
        <p className="text-gray-700 leading-relaxed mb-6 max-w-2xl mx-auto">
          Coimbatore Express is growing rapidly, and we invite you to be part of our story.
          Whether you have a news tip, want to advertise with us, or simply want to stay connected,
          we'd love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <a
            href="mailto:editor@coimbatoreexpress.com"
            className="bg-[#D90429] text-white px-8 py-3 rounded-full font-semibold hover:bg-red-700 transition"
          >
            Contact Us
          </a>
          <button className="border-2 border-[#0A1F44] text-[#0A1F44] px-8 py-3 rounded-full font-semibold hover:bg-[#0A1F44] hover:text-white transition">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
