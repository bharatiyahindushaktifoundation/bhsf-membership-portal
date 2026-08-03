export default function PublicFooter() {
  return (
    <footer className="bg-darkgray text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <h4 className="text-white font-semibold mb-2">Bharatiya Hindu Shakti Foundation</h4>
          <p className="text-sm text-gray-400">
            Serving society and strengthening culture through community, service, and unity.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Quick Links</h4>
          <ul className="text-sm space-y-1 text-gray-400">
            <li><a href="/activities" className="hover:text-saffron">Activities</a></li>
            <li><a href="/news" className="hover:text-saffron">News</a></li>
            <li><a href="/gallery" className="hover:text-saffron">Gallery</a></li>
            <li><a href="/apply" className="hover:text-saffron">Become a Member</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Contact</h4>
          <p className="text-sm text-gray-400">Reach out to your local Panchayat coordinator for membership queries.</p>
        </div>
      </div>
      <div className="border-t border-gray-700 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Bharatiya Hindu Shakti Foundation. All rights reserved.
      </div>
    </footer>
  );
}
