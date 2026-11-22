import * as React from "react";
import { Shield, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-paper-100 border-t border-paper-300 py-10 mt-auto text-xs text-charcoal-600 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-paper-200">
          {/* Company Identification */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-charcoal-900 text-sm">
              <span>bran</span>
              <span className="text-branvidia-800 font-extrabold">v</span>
              <span>idia</span>
              <span className="font-normal text-charcoal-500 text-xs ml-1">
                Solutions Private Limited
              </span>
            </div>
            <p className="text-[11px] font-mono text-charcoal-500">
              CIN: U62011KA2026PTC229604
            </p>
            <p className="text-charcoal-500 text-[11px] leading-relaxed">
              Registered Office: #25, 3rd Cross, Kalyana Nagar, T. Dasarahalli, Peenya Dasarahalli, Bangalore North, Bangalore, Karnataka, India – 560057
            </p>
          </div>

          {/* Privacy & Security Guarantees */}
          <div className="space-y-2">
            <h5 className="font-semibold text-charcoal-900 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-branvidia-700" />
              Privacy & Security Architecture
            </h5>
            <p className="text-[11px] text-charcoal-500 leading-relaxed">
              We never request your Google password or store unencrypted credentials. Google Business Profile read-only access is used strictly for generating your audit analysis and is never retained without consent.
            </p>
          </div>

          {/* Contact & Verification */}
          <div className="space-y-2 md:text-right">
            <h5 className="font-semibold text-charcoal-900">Direct Inquiries</h5>
            <p className="text-charcoal-600">contact@branvidia.com</p>
            <p className="text-charcoal-600">+91 63614 27326</p>
            <p className="text-branvidia-900 font-medium">www.branvidia.com</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-charcoal-500">
          <div className="flex items-center gap-2">
            <Lock className="h-3 w-3 text-emerald-600" />
            <span>Secure Server-Side Architecture • OAuth 2.0 Authorization Flow</span>
          </div>
          <div>
            © {new Date().getFullYear()} Branvidia Solutions Private Limited. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
