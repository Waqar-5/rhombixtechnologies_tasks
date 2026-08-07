import { useState } from 'react';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Note: this is a UI-only contact form (no backend endpoint spec'd for
    // it). Wire it to a real endpoint or a service like Formspree when ready.
    setTimeout(() => {
      toast.success("Thanks for reaching out — we'll get back to you soon.");
      e.target.reset();
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16">
      <span className="eyebrow">Contact</span>
      <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Get in touch</h1>
      <p className="mt-3 text-ink-400">Questions, feedback, or partnership ideas — we'd love to hear from you.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-ink-600 mb-1.5 block">Name</label>
          <input required className="input" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-600 mb-1.5 block">Email</label>
          <input type="email" required className="input" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-600 mb-1.5 block">Message</label>
          <textarea required rows={5} className="input" />
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Sending...' : 'Send message'}
        </button>
      </form>
    </div>
  );
};

export default ContactPage;
