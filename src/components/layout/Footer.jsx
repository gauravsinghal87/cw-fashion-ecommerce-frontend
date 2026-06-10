import { Link } from "react-router-dom";
import { useSite } from "../../context/SiteContext";

const Footer = () => {
  const { settings } = useSite();

  const title = settings?.title || "CWFASHION";
  const logoUrl = settings?.logo?.url;
  const supportEmail = settings?.supportEmail;
  const supportPhone = settings?.supportPhone;
  const address = settings?.address;
  const social = settings?.socialLinks || {};

  return (
    <footer className="bg-primary text-white">
      <div className="container-luxe py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="min-w-0">
            <div className="flex justify-start items-center" >{logoUrl && (
              <img
                src={logoUrl}
                alt={title}
                className="h-8 sm:h-10 w-auto max-w-full object-contain mb-3 sm:mb-4"
              />
            )}
            <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold mb-3 sm:mb-4 break-words">
              {title}
            </h3></div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Premium multi-vendor fashion marketplace. Discover the latest
              trends from top brands and independent designers.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">
              Shop
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/category/men"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Men
                </Link>
              </li>
              <li>
                <Link
                  to="/category/women"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Women
                </Link>
              </li>
              <li>
                <Link
                  to="/category/kids"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Kids
                </Link>
              </li>
              <li>
                <Link
                  to="/products?sort=newest"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              {supportEmail && (
                <li>
                  <a
                    href={`mailto:${supportEmail}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {supportEmail}
                  </a>
                </li>
              )}
              {supportPhone && (
                <li>
                  <a
                    href={`tel:${supportPhone}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {supportPhone}
                  </a>
                </li>
              )}
              {address && (
                <li>
                  <span className="text-sm text-gray-400 block leading-relaxed">
                    {address}
                  </span>
                </li>
              )}
              <li>
                <Link
                  to="/help"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Shipping
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  to="/size-guide"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/referral"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Refer & Earn
                </Link>
              </li>
              <li>
                <Link
                  to="/vendor/register"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Become a Vendor
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <p className="text-xs sm:text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {title}. All rights reserved.
          </p>
          <div className="flex gap-2 sm:gap-6 flex-wrap justify-center">
            {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-xs sm:text-sm text-gray-500 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                Facebook
              </a>
            )}
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-xs sm:text-sm text-gray-500 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                Instagram
              </a>
            )}
            {social.twitter && (
              <a
                href={social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-xs sm:text-sm text-gray-500 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                Twitter
              </a>
            )}
            {social.youtube && (
              <a
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-xs sm:text-sm text-gray-500 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                YouTube
              </a>
            )}
            {social.linkedin && (
              <a
                href={social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-xs sm:text-sm text-gray-500 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                LinkedIn
              </a>
            )}
            {social.whatsapp && (
              <a
                href={`https://wa.me/${social.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-xs sm:text-sm text-gray-500 hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
