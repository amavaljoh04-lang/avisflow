import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
}

export default function SEO({ title, description }: SEOProps) {
  useEffect(() => {
    const base = "AvisFlow";
    document.title = title ? `${title} | ${base}` : `${base} - Collectez et gerez vos avis Google automatiquement`;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", description);
    }
  }, [title, description]);
  return null;
}
