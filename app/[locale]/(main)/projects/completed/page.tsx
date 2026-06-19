import { SITE_URL } from '@/src/lib/seo';
import CompletedProjectsContent from '@/src/components/projects/CompletedProjectsContent';

const completedProjectsData = [
  {
    id: 'shree-shyam-residency',
    title: 'Shree Shyam Residency',
    location: 'Jaipur (near Hope Farm Junction)',
    lat: 26.9124,
    lng: 75.7873,
    type: '3BHK/4BHK (Ready-to-move)',
    description:
      'A premium residential complex offering spacious 3BHK and 4BHK apartments with modern amenities, designed for those who appreciate luxury and comfort.',
    fullDescription:
      "Shree Shyam Residency is a hallmark of luxury living strategically positioned near Jaipur's Hope Farm Junction. Boasting meticulously designed 3BHK and 4BHK apartments, this ready-to-move complex offers an unparalleled lifestyle. Residents enjoy premium amenities including a state-of-the-art clubhouse, landscaped gardens, 24/7 security, and seamless connectivity to major city hubs. Every detail reflects our commitment to superior craftsmanship and architectural excellence.",
    status: 'Completed',
    img: '/images/hero1.png',
    gallery: ['/images/hero1.png', '/images/hero2.png', '/images/hero3.png'],
    pdf: true,
  },
  {
    id: 'shivani-city',
    title: 'Shivani City',
    location: 'Manpura Machedi',
    lat: 27.05,
    lng: 75.8,
    type: 'Premier Residential Development',
    description:
      'An elegantly planned residential development that completely sold out due to its unmatched quality, strategic location, and lifestyle offerings.',
    fullDescription:
      'Shivani City at Manpura Machedi stands as a premier residential development offering intricately planned plots and bespoke home designs. Selling out completely shortly after its launch, it proves high market demand and customer trust. The project integrates green parks, expansive walkways, and robust infrastructure, creating a wholesome environment tailored for modern families.',
    status: 'Sold Out',
    img: '/images/project2.png',
    gallery: ['/images/project2.png', '/images/house1.png'],
    pdf: true,
  },
  {
    id: 'shivani-residency',
    title: 'Shivani Residency',
    location: 'Dobadi near Sambhar & Fulera, Jaipur district',
    lat: 26.9,
    lng: 75.18,
    type: 'Residential',
    description:
      'Nestled in a peaceful environment near Sambhar Lake, offering competitive pricing and a serene lifestyle away from the city hustle.',
    fullDescription:
      'Shivani Residency lies in a uniquely peaceful environment in Dobadi, nestled close to the historic Sambhar Lake and Fulera in the Jaipur district. Designed as an escape from city congestion, this residential haven provides spacious plots, lush surroundings, and top-tier infrastructure at incredibly competitive prices, catering specifically to families desiring a balanced and tranquil lifestyle.',
    status: 'Completed',
    img: '/images/project1.png',
    gallery: ['/images/project1.png', '/images/hero3.png'],
    pdf: true,
  },
];

export default function CompletedProjectsPage() {
  const realEstateListingsSchema = {
    '@context': 'https://schema.org',
    '@graph': completedProjectsData.map((project) => ({
      '@type': 'RealEstateListing',
      name: project.title,
      description: project.fullDescription || project.description,
      listingType: 'SoldOut',
      address: {
        '@type': 'PostalAddress',
        addressLocality: project.location.split('(')[0].trim(),
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
        availability:
          project.status === 'Sold Out'
            ? 'https://schema.org/SoldOut'
            : 'https://schema.org/InStock',
        priceStatus: 'https://schema.org/InquirePrice',
      },
      image: `https://sviiinfrasolutions.com${project.img}`,
      url: `https://sviiinfrasolutions.com/projects/completed#${project.id}`,
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
            Completed Projects
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Explore our portfolio of successfully delivered projects. Each property is a testament
            to our commitment to excellence, timely delivery, and unmatched quality.
          </p>
        </div>
      </section>
      <CompletedProjectsContent projects={completedProjectsData} />
    </div>
  );
}
