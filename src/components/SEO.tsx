import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO = ({ 
  title = 'Sikkim Tourism - AI-Powered Travel Planner | Himato | Custom Sikkim Itineraries',
  description = 'Sikkim tourism made easy! Plan your perfect Sikkim trip with our AI-powered travel planner. Discover Sikkim tourism destinations: Gangtok, Pelling, Gurudongmar Lake, Yumthang Valley, and 30+ Sikkim tourism attractions. Free Sikkim tourism itineraries.',
  keywords = 'Sikkim tourism, Sikkim tourism guide, Sikkim tourism places, Sikkim tourism packages, Sikkim tourism itinerary, Sikkim tourism destinations, Sikkim travel planner, Sikkim tourism attractions, Gangtok Sikkim tourism, Pelling Sikkim tourism, North Sikkim tourism, South Sikkim tourism, Sikkim tourism plan, Sikkim tourism trip',
  image = '/gurudungmar.jpg',
  url = 'https://himato.waglogy.com',
  type = 'website'
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Primary meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('title', title);

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', `${url}${image}`, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', `${url}${image}`);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [title, description, keywords, image, url, type]);

  return null;
};

