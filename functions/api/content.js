const STATIC_CONTENT = [
  {
    id: 1, section: "nav", sort_order: 1,
    content: {
      tagline: "Premium Hand-Coded Websites",
      cta: "Get Free Demo",
      links: [
        { label: "Services", href: "#services" },
        { label: "Work", href: "#work" },
        { label: "Pricing", href: "#pricing" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" }
      ]
    }
  },
  {
    id: 2, section: "hero", sort_order: 2,
    content: {
      eyebrow: "Finpixel India · Bihar to Bharat",
      title: "Websites That Win Business.",
      subheadline: "Hand-coded, blazing-fast websites for schools, hotels, clinics, restaurants, startups & local brands. Demo first — pay only after you approve.",
      primary: "Get Your Free Demo",
      secondary: "See Our Work",
      assurances: ["Demo First, Pay After Approval", "You Own Everything"],
      floatingCards: [
        { label: "PageSpeed Score", value: "100 / 100" },
        { label: "Serving", value: "Pan-India" }
      ]
    }
  },
  {
    id: 3, section: "trust", sort_order: 3,
    content: {
      label: "Our Promise",
      stats: [
        { value: "100", label: "% Hand-Coded" },
        { value: "48", label: "hr First Draft" },
        { value: "100", label: "% Client Ownership" }
      ]
    }
  },
  {
    id: 4, section: "services", sort_order: 4,
    content: {
      eyebrow: "What We Build",
      headline: "Precision-Crafted Digital Products",
      subheadline: "No page builders. No bloated themes. Every line of code written for performance, accessibility, and conversion.",
      items: [
        {
          eyebrow: "01 — Websites",
          title: "Hand-Coded Premium Websites",
          description: "Clean HTML, CSS & JavaScript. No WordPress, no Wix. Optimised for PageSpeed 100, technical SEO, and real conversions.",
          badge: "PageSpeed 100 · SSL · Mobile-First",
          cta: "Start a website project",
          interest: "Website",
          visual: "browser"
        },
        {
          eyebrow: "02 — Hosting & Security",
          title: "Secure Global Hosting",
          description: "We handle domain, DNS, SSL, and global CDN. Your site stays fast and secure — always.",
          badge: "99.9% Uptime · Free SSL · Daily Backups",
          cta: "Talk about hosting",
          interest: "Hosting",
          visual: "security"
        },
        {
          eyebrow: "03 — Growth & Analytics",
          title: "Conversion & Growth Systems",
          description: "Local SEO, social media growth, lead tracking and workflow automation that turns visitors into customers.",
          badge: "Local SEO · Lead Capture · Automation",
          cta: "Grow my business",
          interest: "Growth",
          visual: "analytics"
        }
      ]
    }
  },
  {
    id: 5, section: "comparison", sort_order: 5,
    content: {
      eyebrow: "Why Finpixel",
      headline: "The Smarter Choice",
      subheadline: "See how Finpixel compares to DIY builders and generic agencies.",
      criteriaLabel: "Criteria",
      winnerLabel: "Best Choice",
      columns: [
        { name: "Finpixel", note: "Hand-coded studio", featured: true },
        { name: "Wix / Squarespace", note: "DIY builder" },
        { name: "Generic Agency", note: "Template shop" }
      ],
      rows: [
        { label: "PageSpeed Score", note: "Affects SEO & conversions", values: [{ positive: true, text: "95–100" }, { positive: false, text: "40–70" }, { positive: false, text: "60–80" }] },
        { label: "Code Quality", note: "Clean, maintainable", values: [{ positive: true, text: "Hand-written" }, { positive: false, text: "Builder bloat" }, { positive: false, text: "Theme-based" }] },
        { label: "You Own the Code", note: "No vendor lock-in", values: [{ positive: true, text: "Always" }, { positive: false, text: "Never" }, { positive: false, text: "Rarely" }] },
        { label: "Demo Before Payment", note: "See it before you pay", values: [{ positive: true, text: "Yes, always" }, { positive: false, text: "No" }, { positive: false, text: "No" }] },
        { label: "Local SEO Ready", note: "Rank on Google Maps", values: [{ positive: true, text: "Built-in" }, { positive: false, text: "Limited" }, { positive: false, text: "Extra cost" }] }
      ]
    }
  },
  {
    id: 6, section: "industries", sort_order: 6,
    content: {
      eyebrow: "Who We Serve",
      headline: "Built for Every Business",
      subheadline: "From local shops to pan-India startups — we build for the real India.",
      items: [
        { icon: "graduation", label: "Education", title: "Schools & Colleges", description: "Admissions-focused websites with fee portals, event pages, and full mobile optimisation." },
        { icon: "hotel", label: "Hospitality", title: "Hotels & Resorts", description: "Booking-ready, visually premium hotel websites that convert lookers into guests." },
        { icon: "health", label: "Healthcare", title: "Clinics & Hospitals", description: "Patient-friendly clinic websites with appointment forms and local SEO." },
        { icon: "coffee", label: "Food & Beverage", title: "Restaurants & Cafés", description: "Menu-rich, delivery-ready sites that drive walk-ins and online orders." },
        { icon: "retail", label: "Retail", title: "Shops & Malls", description: "Local retail presence with product showcases, maps, and offer pages." },
        { icon: "startup", label: "Startup", title: "Startups & Brands", description: "Lean, fast product sites built for growth, investors, and early customers." }
      ]
    }
  },
  {
    id: 7, section: "promise", sort_order: 7,
    content: {
      eyebrow: "Our Commitment",
      headline: "The Finpixel Promise",
      subheadline: "Four principles that guide every project we take on.",
      items: [
        { icon: "approve", title: "Demo First, Pay After Approval", description: "See your complete website before paying a single rupee. No risk, no pressure." },
        { icon: "ownership", title: "You Own Everything", description: "Your code, your domain, your assets. We hand it all over — no lock-in, ever." },
        { icon: "speed", title: "Built for Speed", description: "Hand-coded for PageSpeed 100. Faster sites rank higher and convert better." },
        { icon: "support", title: "Direct WhatsApp Support", description: "No ticket queues. Talk to the builder directly on WhatsApp, any time." }
      ]
    }
  },
  {
    id: 8, section: "process", sort_order: 8,
    content: {
      eyebrow: "How It Works",
      headline: "From Idea to Live Site",
      subheadline: "A simple, transparent process with no surprises.",
      steps: [
        { timing: "Day 1", title: "Discovery Call", description: "Tell us about your business, goals, and audience. We listen and plan." },
        { timing: "Day 2–3", title: "First Draft", description: "We design and code your first version. You see real progress fast." },
        { timing: "Day 4–7", title: "Your Feedback", description: "Review and request changes. We refine until you love it." },
        { timing: "After Approval", title: "Pay & Go Live", description: "Pay only when satisfied. We deploy, set up SSL and hosting, and launch." }
      ]
    }
  },
  {
    id: 9, section: "pricing", sort_order: 9,
    content: {
      eyebrow: "Simple Pricing",
      headline: "Plans for Every Budget",
      subheadline: "Transparent pricing. No hidden fees. Final cost based on your scope.",
      note: "All plans include demo-first delivery. Pay only after you approve.",
      plans: [
        {
          label: "Starter",
          name: "Launch",
          description: "Perfect for local businesses, clinics, and shops getting their first professional website.",
          prefix: "₹",
          price: "7,499",
          suffix: "onwards",
          featured: false,
          interest: "Launch Plan",
          cta: "Start with Launch",
          features: [
            "Up to 5 pages — hand-coded",
            "Mobile-first responsive design",
            "Contact & WhatsApp integration",
            "Basic SEO setup",
            "1 month free support",
            "You own all the code"
          ]
        },
        {
          label: "Most Popular",
          badge: "Best Value",
          name: "Growth",
          description: "For businesses that want leads, local SEO, and a website that works hard.",
          prefix: "₹",
          price: "14,999",
          suffix: "onwards",
          featured: true,
          interest: "Growth Plan",
          cta: "Start with Growth",
          features: [
            "Up to 10 pages — hand-coded",
            "Lead capture forms & CRM",
            "Local SEO & Google Maps",
            "PageSpeed 95+ guaranteed",
            "3 months free support",
            "Analytics dashboard",
            "You own all the code"
          ]
        },
        {
          label: "Enterprise",
          name: "Scale",
          description: "For startups, colleges, and brands that need a full digital system.",
          prefix: "₹",
          price: "24,999",
          suffix: "onwards",
          featured: false,
          interest: "Scale Plan",
          cta: "Start with Scale",
          features: [
            "Unlimited pages",
            "Custom web application features",
            "Advanced SEO & content strategy",
            "Social media & automation setup",
            "6 months dedicated support",
            "Priority WhatsApp access",
            "You own all the code"
          ]
        }
      ]
    }
  },
  {
    id: 10, section: "cta", sort_order: 10,
    content: {
      eyebrow: "Ready to Start?",
      headline: "Let's Build Something Great Together.",
      subheadline: "Book a free demo. See your website before you pay. No commitment needed.",
      primary: "Get Your Free Demo",
      secondary: "WhatsApp Us Now",
      proofs: ["No upfront payment", "Demo in 48 hours", "100% ownership"]
    }
  },
  {
    id: 11, section: "footer", sort_order: 11,
    content: {
      description: "Premium hand-coded websites for ambitious businesses across India. Demo first, pay after approval.",
      availability: "Open for new projects",
      navLabel: "Navigate",
      contactLabel: "Contact",
      socialLabel: "Connect",
      whatsapp: "+91 WhatsApp",
      whatsappRaw: "919999999999",
      whatsappMessage: "Hi Finpixel India! I'm interested in a free demo for my website.",
      email: "finpixelindia@gmail.com",
      location: "Bihar · Pan-India Remote",
      copyright: "© 2026 Finpixel India. All rights reserved.",
      links: [
        { label: "Services", href: "#services" },
        { label: "Work", href: "#work" },
        { label: "Pricing", href: "#pricing" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" }
      ],
      legal: [
        { label: "Privacy Policy", href: "/privacy" }
      ],
      contactOptions: [
        { type: "whatsapp", label: "WhatsApp", value: "+91 WhatsApp", href: "https://wa.me/919999999999?text=Hi%20Finpixel%20India!" },
        { type: "email", label: "Email", value: "finpixelindia@gmail.com", href: "mailto:finpixelindia@gmail.com" },
        { type: "instagram", label: "Instagram", value: "@finpixelindia", href: "https://instagram.com/finpixelindia" }
      ]
    }
  },
  {
    id: 12, section: "leadForm", sort_order: 12,
    content: {
      eyebrow: "Free Demo Request",
      title: "Let's Build Your Website",
      subheadline: "Fill in your details and we'll have a first draft ready for you within 48 hours.",
      error: "We could not save your request. Please WhatsApp us and we will respond right away.",
      success: "Your request is saved! We'll contact you on WhatsApp shortly.",
      successEmail: "Done! We've saved your request and sent you a confirmation. We'll be in touch on WhatsApp shortly.",
      successEyebrow: "Request Received!",
      successTitle: "We'll be in touch soon.",
      referenceLabel: "Your Reference:",
      summaryName: "Name: ",
      summaryProject: "Project: ",
      nextLabel: "What happens next:",
      whatsappNote: "You'll be redirected to WhatsApp to continue the conversation.",
      whatsappCta: "Continue on WhatsApp",
      done: "Done",
      sending: "Sending…",
      submit: "Request Free Demo",
      note: "Your details are secure and never shared.",
      successSteps: [
        { title: "We review your request", description: "Within a few hours" },
        { title: "WhatsApp confirmation", description: "We'll reach out directly" },
        { title: "First draft in 48 hrs", description: "See your site before paying" }
      ],
      fields: { name: "Your Name", phone: "WhatsApp Number", email: "Email (optional)", business: "Business Type", message: "What do you want your website to achieve?" },
      placeholders: { name: "Ashish Singh", phone: "+91 98765 43210", email: "you@example.com", business: "Select your business type…", message: "Tell us your goals, audience, and any pages you need…" },
      validation: { name: "Please share your name.", phone: "Please enter a valid WhatsApp number.", email: "Please enter a valid email address.", business: "Please select your business type." },
      businessTypes: ["School / College / Coaching", "Hotel / Resort / Guest House", "Clinic / Hospital / Pharmacy", "Restaurant / Café / Cloud Kitchen", "Shop / Mall / Retail Store", "Startup / Tech Product", "NGO / Government / Trust", "Personal Brand / Portfolio", "Other"]
    }
  },
  {
    id: 13, section: "chatbot", sort_order: 13,
    content: {
      title: "EDITH",
      subtitle: "Finpixel AI Concierge",
      welcome: "Hi! I'm EDITH, Finpixel India's AI concierge. I can help you explore our services, understand pricing, or guide you toward the right plan. How can I help?",
      placeholder: "Ask me anything about Finpixel…",
      error: "Something went wrong. Please try again or WhatsApp us directly.",
      note: "EDITH is an AI assistant. For final decisions, always talk to the Finpixel team directly.",
      quickPrompts: ["What services do you offer?", "How does Demo First work?", "What's the pricing?", "Can you build for my industry?"]
    }
  },
  {
    id: 14, section: "privacy", sort_order: 14,
    content: {
      metaTitle: "Privacy Policy — Finpixel India",
      eyebrow: "Legal",
      title: "Privacy Policy",
      intro: "Finpixel India is committed to protecting your privacy. This policy explains how we collect, use, and protect your information.",
      effectiveLabel: "Effective Date:",
      effectiveDate: "1 January 2026",
      brandNote: "Premium Hand-Coded Websites",
      backLabel: "Back to Home",
      contentsLabel: "Contents",
      callout: { title: "Your Privacy Matters", description: "We collect only what's necessary to serve you. We never sell your data." },
      sections: [
        { title: "Information We Collect", paragraphs: ["We collect information you provide directly, such as your name, phone number, email address, and business details when you submit a demo request or contact us."], items: ["Name and contact details", "Business type and website goals", "Messages sent through our forms or WhatsApp"] },
        { title: "How We Use Your Information", paragraphs: ["We use your information to respond to your enquiries, prepare your free demo, and communicate with you about your project."], items: null },
        { title: "Data Security", paragraphs: ["Your information is stored securely. We do not share, sell, or rent your personal data to third parties."], items: null },
        { title: "Contact Us", paragraphs: ["If you have any questions about this privacy policy, please contact us."], items: null }
      ],
      contact: { eyebrow: "Questions?", title: "Get in Touch", description: "For any privacy-related queries, reach out to us directly.", email: "finpixelindia@gmail.com" },
      footer: "© 2026 Finpixel India. All rights reserved."
    }
  }
];

export async function onRequest() {
  return new Response(JSON.stringify(STATIC_CONTENT), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
