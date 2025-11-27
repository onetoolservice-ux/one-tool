export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 prose prose-slate">
      <h1>Privacy Policy</h1>
      <p className="text-lg text-slate-600">Last updated: November 2025</p>
      
      <h3>1. Our Core Promise</h3>
      <p>One Tool Solutions (OTS) is built on a <strong>Local-First Architecture</strong>. This means that when you use our tools (like calculating a budget, merging a PDF, or editing an image), the processing happens entirely within your web browser using JavaScript and WebAssembly.</p>
      
      <h3>2. Data Collection</h3>
      <p><strong>We do not collect, store, or transmit your personal data.</strong></p>
      <ul>
        <li><strong>Documents:</strong> Any file you "upload" to OTS never leaves your device. It is processed in your browser's memory and then deleted.</li>
        <li><strong>Financial Data:</strong> Your budget entries and loan details are stored in your browser's <code>Local Storage</code>. We do not have a database.</li>
      </ul>

      <h3>3. Cookies & Tracking</h3>
      <p>We do not use tracking cookies for advertising. We may use basic, anonymous analytics (like Vercel Analytics) purely to see which tools are popular, but this data is aggregated and cannot identify you personally.</p>

      <h3>4. Your Rights</h3>
      <p>Since we do not hold your data, you do not need to request deletion from us. You can simply clear your browser cache, and all your OTS data will be wiped instantly.</p>
    </div>
  );
}
