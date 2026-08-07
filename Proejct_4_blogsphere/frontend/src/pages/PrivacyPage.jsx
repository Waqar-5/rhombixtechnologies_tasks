const PrivacyPage = () => (
  <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
    <span className="eyebrow">Legal</span>
    <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Privacy Policy</h1>
    <p className="mt-2 text-sm text-ink-400 font-mono">Last updated: {new Date().getFullYear()}</p>
    <div className="mt-8 prose-editorial">
      <h3>What we collect</h3>
      <p>
        We collect the information you give us directly — your name, email, and anything
        you add to your profile — along with basic usage data (like which posts you view)
        that helps us improve the product.
      </p>
      <h3>How we use it</h3>
      <p>
        Your data powers your account, your published content, and features like
        notifications and bookmarks. We do not sell your personal data to third parties.
      </p>
      <h3>Cookies</h3>
      <p>
        We use essential cookies to keep you logged in securely. See our cookie consent
        banner for details on optional analytics cookies.
      </p>
      <h3>Your rights</h3>
      <p>
        You can update or delete your account at any time from your settings page. Contact
        us if you'd like a full export of your data.
      </p>
    </div>
  </div>
);

export default PrivacyPage;
