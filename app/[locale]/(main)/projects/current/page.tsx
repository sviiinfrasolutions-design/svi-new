import { SITE_URL } from '@/src/lib/seo';
import CurrentProjectsContent from '@/src/components/projects/CurrentProjectsContent';

const currentProjectsData = [
  {
    id: 'shivani-vatika',
    title: 'Shivani Vatika',
    location: 'Nayla',
    lat: 26.85,
    lng: 76.0,
    type: 'Modern Living',
    description:
      'A modern living community in the serene landscapes of Nayla, offering well-designed residential spaces in a rapidly developing area.',
    fullDescription:
      "Located in the serene landscapes of Nayla, Shivani Vatika is redefining modern community living. Offering uniquely crafted residential spaces equipped with essential urban facilities, this project reflects SVI Infra Solutions' commitment to quality, timely delivery, and producing environments that foster active and peaceful lifestyles. With excellent connectivity and promising growth potential, Shivani Vatika is an ideal choice for families seeking a balanced lifestyle.",
    status: 'Under Development',
    img: '/images/project2.png',
    gallery: ['/images/project2.png', '/images/hero1.png'],
  },
  {
    id: 'shyam-aangan',
    title: 'Shyam Aangan',
    location: 'Basri Khurd near Jaipur',
    lat: 26.65,
    lng: 75.85,
    type: 'Integrated Township',
    description:
      'JDA-approved integrated township on NH-12 (Tonk Road), perfectly positioned near the upcoming Inner Ring Road, IT corridors, and SEZs. Offers affordable pricing and flexible plans.',
    fullDescription:
      'Shyam Aangan is a sprawling, JDA-approved integrated township situated strategically on NH-12 (Tonk Road). It provides unparalleled connectivity to the upcoming Inner Ring Road, key IT corridors, and Special Economic Zones (SEZs). Designed to cater to diverse residential needs, the project blends affordable pricing with world-class facilities, paving the way for substantial future appreciation and a thriving community atmosphere.',
    status: 'Under Development',
    img: '/images/project1.png',
    gallery: ['/images/project1.png'],
  },
];

export default function CurrentProjectsPage() {
  const realEstateListingsSchema = {
    '@context': 'https://schema.org',
    '@graph': currentProjectsData.map((project) => ({
      '@type': 'RealEstateListing',
      name: project.title,
      description: project.fullDescription || project.description,
      listingType: 'ForSale',
      address: {
        '@type': 'PostalAddress',
        addressLocality: project.location,
        addressRegion: 'Rajasthan',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: project.lat,
        longitude: project.lng,
      },
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/PreOrderAction',
        priceStatus: 'https://schema.org/InquirePrice',
      },
      image: `https://sviiinfrasolutions.com${project.img}`,
      url: `https://sviiinfrasolutions.com/projects/current#${project.id}`,
    })),
  };

  return (
    <div className="dark:bg-brand-dark-bg min-h-screen bg-gray-50 pt-20 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateListingsSchema) }}
      />
      <section className="bg-brand-bg border-b border-gray-200 py-14 text-center md:py-20 dark:border-gray-700 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h1 className="text-brand-navy animate-hero-h1 mb-6 font-serif text-3xl leading-tight sm:text-4xl md:text-6xl dark:text-gray-100">
            Current Projects
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Discover our ongoing developments. We are currently working on exciting new residential
            and commercial projects in prime locations, offering unparalleled amenities and
            lifestyle options.
          </p>
        </div>
      </section>
      <CurrentProjectsContent projects={currentProjectsData} />
    </div>
  );
}
