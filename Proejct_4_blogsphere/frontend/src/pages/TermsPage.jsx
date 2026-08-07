const TermsPage = () => (
  <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
    <span className="eyebrow">Legal</span>
    <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Terms of Service</h1>
    <p className="mt-2 text-sm text-ink-400 font-mono">Last updated: {new Date().getFullYear()}</p>
    <div className="mt-8 prose-editorial">
      <h3>Your content</h3>
      <p>
        You retain full ownership of everything you publish on BlogSphere. By posting, you
        grant us a license to display and distribute your content on the platform.
      </p>
      <h3>Acceptable use</h3>
      <p>
        Don't post content that is illegal, harassing, or infringes on others' rights.
        We reserve the right to remove content or suspend accounts that violate these terms.
      </p>
      <h3>Account termination</h3>
      <p>
        You may delete your account at any time. We may suspend accounts that repeatedly
        violate our community guidelines.
      </p>
      <h3>Changes</h3>
      <p>
        We may update these terms occasionally. Continued use of BlogSphere after changes
        means you accept the updated terms.
      </p>
    </div>
  </div>
);

export default TermsPage;
