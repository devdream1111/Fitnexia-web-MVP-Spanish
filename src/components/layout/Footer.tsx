'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { Mail, Phone, MapPin, Home, User, Settings, Heart, Star } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#121C2D] border-t border-[#334155]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo size="md" />
            </Link>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
              Conecta con los mejores instructores y gimnasios para alcanzar tus metas de fitness.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-[#94A3B8] hover:text-[#60A5FA] transition">
                <Heart size={20} />
              </a>
              <a href="#" className="text-[#94A3B8] hover:text-[#60A5FA] transition">
                <Star size={20} />
              </a>
              <a href="#" className="text-[#94A3B8] hover:text-[#60A5FA] transition">
                <User size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#F8FAFC] font-semibold text-lg mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-[#94A3B8] hover:text-[#60A5FA] transition text-sm">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#94A3B8] hover:text-[#60A5FA] transition text-sm">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#94A3B8] hover:text-[#60A5FA] transition text-sm">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#94A3B8] hover:text-[#60A5FA] transition text-sm">
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h3 className="text-[#F8FAFC] font-semibold text-lg mb-4">Para ti</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-[#94A3B8] hover:text-[#60A5FA] transition text-sm">
                  Encontrar clases
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#94A3B8] hover:text-[#60A5FA] transition text-sm">
                  Ser instructor
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#94A3B8] hover:text-[#60A5FA] transition text-sm">
                  Registrar gimnasio
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#94A3B8] hover:text-[#60A5FA] transition text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[#F8FAFC] font-semibold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-[#94A3B8] text-sm">
                <MapPin size={18} className="text-[#60A5FA] shrink-0" />
                <span>Buenos Aires, Argentina</span>
              </li>
              <li className="flex items-center gap-3 text-[#94A3B8] text-sm">
                <Mail size={18} className="text-[#60A5FA] shrink-0" />
                <a href="mailto:hola@fitnexia.com" className="hover:text-[#60A5FA] transition">
                  hola@fitnexia.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-[#94A3B8] text-sm">
                <Phone size={18} className="text-[#60A5FA] shrink-0" />
                <a href="tel:+541112345678" className="hover:text-[#60A5FA] transition">
                  +54 11 1234-5678
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#334155] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#94A3B8] text-sm">
            © 2026 Fitnexia. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-[#94A3B8] hover:text-[#60A5FA] transition text-sm">
              Política de privacidad
            </Link>
            <Link href="#" className="text-[#94A3B8] hover:text-[#60A5FA] transition text-sm">
              Términos y condiciones
            </Link>
            <Link href="#" className="text-[#94A3B8] hover:text-[#60A5FA] transition text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
