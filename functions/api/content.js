const STATIC_CONTENT = [
  {
    id: 1, section: "nav", sort_order: 1,
    content: {
      tagline: "Defining every pixel with precision",
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
      title: "We Build Brands, Not Just Websites.",
      subheadline: "We build high-performance websites for Schools, Colleges, Hotels, Restaurants and Brands across India. Fast. Secure. Affordable.",
      primary: "Get Your Free Demo",
      secondary: "See Our Work",
      assurances: ["Demo First, Pay After Approval", "100% Code Ownership"],
      floatingCards: [
        { label: "Google Speed", value: "100 / 100" },
        { label: "Pan-India", value: "Remote-First" }
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
      whatsapp: "+91 91423 44728",
      whatsappRaw: "919142344728",
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
        { type: "whatsapp", label: "WhatsApp", value: "+91 91423 44728", href: "https://wa.me/919142344728?text=Hi%20Finpixel%20India!%20I%27m%20interested%20in%20a%20free%20demo." },
        { type: "email", label: "Email", value: "finpixelindia@gmail.com", href: "mailto:finpixelindia@gmail.com" },
        { type: "instagram", label: "Instagram", value: "@finpixel.india", href: "https://www.instagram.com/finpixel.india" },
        { type: "linkedin", label: "LinkedIn", value: "Ashish Singh", href: "https://www.linkedin.com/in/ashish-singh-9212563a3" },
        { type: "fiverr", label: "Fiverr", value: "finpixelindia", href: "https://www.fiverr.com/finpixelindia" },
        { type: "x", label: "X", value: "@Finpixelindia", href: "https://x.com/Finpixelindia" },
        { type: "github", label: "GitHub", value: "finpixel-india", href: "https://github.com/finpixel-india" },
        { type: "linktree", label: "Linktree", value: "linktr.ee/finpixelindia", href: "https://linktr.ee/finpixelindia" },
        { type: "notion", label: "Notion", value: "FinPixel India", href: "https://www.notion.so/FinPixel-India-official-2dff04948ec9806ba968fdaab1925f53" }
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
      eyebrow: "Legal · Privacy",
      title: "Privacy Policy",
      intro: "At Finpixel India, your privacy is a core principle — not an afterthought. This policy explains exactly what we collect, why we collect it, and how we protect it.",
      effectiveLabel: "Effective Date:",
      effectiveDate: "1 September 2026",
      brandNote: "Premium Hand-Coded Websites",
      backLabel: "Back to Home",
      contentsLabel: "Contents",
      callout: { title: "Your Data, Your Rights", description: "We collect only what is necessary to serve you. We never sell, rent, or share your personal data with advertisers or third-party marketers." },
      sections: [
        {
          title: "Who We Are",
          paragraphs: [
            "Finpixel India is a remote-first digital studio founded by Ashish Singh, based in Bihar with a Pan-India presence. We build premium hand-coded websites, hosting systems, local SEO, and digital growth services for businesses across India.",
            "For the purposes of this Privacy Policy, 'Finpixel India', 'we', 'us', and 'our' refer to the Finpixel India studio and its team. 'You' refers to any visitor, client, or individual who interacts with our website or services."
          ],
          items: null
        },
        {
          title: "Information We Collect",
          paragraphs: [
            "We collect information you provide directly when you interact with our website or contact us through any channel. We collect only the minimum information necessary to serve you effectively."
          ],
          items: [
            "Full name and business name",
            "WhatsApp / phone number",
            "Email address (optional)",
            "Business type and project description",
            "Website goals and messages submitted through our forms",
            "Basic usage data such as browser type and page visits (no advertising trackers)"
          ]
        },
        {
          title: "How We Use Your Information",
          paragraphs: [
            "We use the information we collect exclusively to provide and improve our services. Specifically, we use it to:",
          ],
          items: [
            "Respond to your demo requests and enquiries",
            "Prepare and present your free demo website",
            "Communicate project timelines, pricing, and next steps",
            "Send project updates, invoices, and support communications",
            "Improve our website and service quality",
            "Comply with legal obligations"
          ]
        },
        {
          title: "How We Share Your Information",
          paragraphs: [
            "We do not sell, rent, or trade your personal information to any third party. We may share your information only in the following limited circumstances:",
            "With trusted service providers (such as email delivery services) strictly necessary to deliver our services — bound by confidentiality agreements. With legal authorities if required by applicable law, regulation, or court order. With your explicit written consent for any other purpose."
          ],
          items: null
        },
        {
          title: "Data Retention",
          paragraphs: [
            "We retain your personal information for as long as necessary to fulfil the purposes outlined in this policy — typically for the duration of our active client relationship.",
            "After project completion, basic contact details may be retained for up to 2 years for legal and accounting compliance. You may request deletion at any time (see 'Your Rights' section below)."
          ],
          items: null
        },
        {
          title: "Data Security",
          paragraphs: [
            "We take data security seriously. We implement industry-standard safeguards including encrypted HTTPS/TLS data transmission for all communications, secure cloud storage with access controls, and limited internal access on a need-to-know basis.",
            "While we work hard to protect your data, no method of transmission over the internet is 100% secure. We encourage you to contact us immediately if you suspect any unauthorised access to your information."
          ],
          items: null
        },
        {
          title: "Cookies & Tracking",
          paragraphs: [
            "Our website uses minimal, essential cookies only — specifically to remember your theme preference (light/dark mode) and your AI chat history stored locally on your device.",
            "We do not use advertising cookies, cross-site tracking, or third-party analytics that profile your behaviour. We do not sell your browsing data."
          ],
          items: null
        },
        {
          title: "Your Rights",
          paragraphs: [
            "You have clear rights regarding your personal data. You may exercise any of the following at any time by contacting us at finpixelindia@gmail.com:"
          ],
          items: [
            "Access — Request a copy of the personal data we hold about you",
            "Correction — Request that inaccurate or outdated data be corrected",
            "Deletion — Request that your data be deleted (subject to legal retention requirements)",
            "Restriction — Request that we limit how we use your data",
            "Portability — Request your data in a machine-readable format",
            "Withdraw consent — Opt out of non-essential communications at any time"
          ]
        },
        {
          title: "Children's Privacy",
          paragraphs: [
            "Finpixel India's services are intended for adults and businesses. We do not knowingly collect personal data from individuals under the age of 18.",
            "If you believe a minor has provided us with personal data, please contact us immediately and we will delete that information promptly."
          ],
          items: null
        },
        {
          title: "Third-Party Links",
          paragraphs: [
            "Our website may contain links to external platforms such as Instagram, LinkedIn, GitHub, and Fiverr. These links are provided for convenience. We are not responsible for the privacy practices of those third-party websites.",
            "We encourage you to review the privacy policies of any third-party sites you visit."
          ],
          items: null
        },
        {
          title: "Changes to This Policy",
          paragraphs: [
            "We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. When we do, we will revise the Effective Date at the top of this page.",
            "For significant changes, we will notify active clients via email or WhatsApp. Your continued use of our services after any changes constitutes your acceptance of the updated policy."
          ],
          items: null
        }
      ],
      contact: { eyebrow: "Privacy Queries", title: "Contact Our Team", description: "For any questions about this Privacy Policy, to exercise your rights, or to report a concern — reach out directly. We respond within 24 hours.", email: "finpixelindia@gmail.com" },
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
