import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0B4A7C]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col items-center text-center">
          {/* Logo INSARAG (topo) */}
          <Image
            src="/insarag-logo.svg"
            alt="INSARAG"
            width={220}
            height={56}
            className="h-[56px] w-auto"
            priority
          />

          <div className="mt-5 text-sm font-semibold text-white">
            International Search and Rescue Advisory Group
          </div>
          <div className="mt-1 text-xs text-white/80">
            United Nations Office for the Coordination of Humanitarian Affairs
          </div>

          {/* Divider */}
          <div className="mt-8 h-px w-full max-w-3xl bg-white/20" />

          {/* Links ativados */}
          <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/90">
            <Link
              href="/about"
              className="transition hover:text-white hover:underline"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="transition hover:text-white hover:underline"
            >
              Contact
            </Link>
            <Link
              href="/terms"
              className="transition hover:text-white hover:underline"
            >
              Terms of Use
            </Link>
            <Link
              href="/privacy"
              className="transition hover:text-white hover:underline"
            >
              Privacy Policy
            </Link>
          </nav>

          {/* Copyright */}
          <div className="mt-8 text-xs text-white/70">
            © {new Date().getFullYear()} INSARAG. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
