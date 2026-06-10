import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { get } from "../../utils/apiMethods";
import { API } from "../../utils/apiPaths";

const fallbackContent = {
  about: {
    title: "About Us",
    content:
      "LUXE is a premium multi-vendor fashion marketplace connecting discerning customers with curated brands and independent designers.",
  },
  contact: {
    title: "Contact Us",
    content:
      "Reach out to our customer service team at support@luxefashion.com or call +91 1800-XXX-XXXX. Available 24/7.",
  },
  faq: {
    title: "Frequently Asked Questions",
    content:
      "Find answers about ordering, shipping, returns, and more. For further assistance, contact our support team.",
  },
  privacy: {
    title: "Privacy Policy",
    content:
      "Your privacy is important to us. We are committed to protecting your personal data and being transparent about how we use your information.",
  },
  terms: {
    title: "Terms & Conditions",
    content:
      "By using LUXE, you agree to these terms. They govern your use of our marketplace and services.",
  },
  shipping: {
    title: "Shipping Information",
    content:
      "Free shipping on orders above ₹999. Standard delivery: 3-7 business days. Express shipping available.",
  },
  "size-guide": {
    title: "Size Guide",
    content:
      "Find your perfect fit. Measurements are in inches and centimeters for all product categories.",
  },
  "refund-policy": {
    title: "Refund Policy",
    content:
      "We want you to be completely satisfied with your purchase. If you are not happy with your order, you can return it within 30 days for a full refund.",
  },
};

const CMSPage = () => {
  const location = useLocation();
  const page = location.pathname.replace("/", "");
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get(API.CMS.PAGE(page))
      .then(({ data }) => {
        let pageContent = null;

        if (data?.page) {
          // Check if content is a string that needs parsing
          if (typeof data.page.content === "string") {
            try {
              // Parse the JSON string
              const parsedContent = JSON.parse(data.page.content);
              pageContent = {
                title: parsedContent.title || data.page.title,
                content: parsedContent.content || data.page.content,
              };
            } catch (e) {
              // If parsing fails, use the raw content
              pageContent = data.page;
            }
          } else {
            pageContent = data.page;
          }
        }

        setContent(pageContent);
      })
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [page]);

  const fallback = fallbackContent[page];

  if (loading)
    return (
      <div className="container-luxe py-20">
        <div className="h-64 skeleton" />
      </div>
    );

  return (
    <div className="container-luxe min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-3xl mx-auto">
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-semibold mb-6 sm:mb-8">
        {content?.title ||
          fallback?.title ||
          page?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </h1>
      <div className="prose prose-sm sm:prose-base max-w-none text-gray-600 leading-relaxed">
        {content?.content ? (
          content.content.split("\n").map((p, i) => (
            <p key={i} className="mb-4">
              {p}
            </p>
          ))
        ) : (
          <p>{fallback?.content || "Content coming soon."}</p>
        )}
      </div>
    </div>
  );
};

export default CMSPage;
