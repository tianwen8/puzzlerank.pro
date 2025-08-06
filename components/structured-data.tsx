import Script from 'next/script'

interface StructuredDataProps {
  type: 'website' | 'game' | 'article' | 'organization'
  data?: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlerank.pro'
    
    switch (type) {
      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'PuzzleRank.pro',
          description: 'Ultimate puzzle games platform with global rankings. Play 2048, word practice games, and brain games with competitive leaderboards.',
          url: baseUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          },
          publisher: {
            '@type': 'Organization',
            name: 'PuzzleRank.pro',
            url: baseUrl,
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/logo.png`,
              width: 512,
              height: 512
            }
          },
          sameAs: [
            'https://twitter.com/puzzlerankpro',
            'https://facebook.com/puzzlerankpro'
          ]
        }
      
      case 'game':
        return {
          '@context': 'https://schema.org',
          '@type': 'Game',
          name: data?.name || 'Puzzle Games',
          description: data?.description || 'Competitive puzzle games with global rankings',
          genre: 'Puzzle',
          gamePlatform: ['Web Browser', 'Mobile Web'],
          applicationCategory: 'Game',
          operatingSystem: 'Any',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '15000',
            bestRating: '5',
            worstRating: '1'
          },
          author: {
            '@type': 'Organization',
            name: 'PuzzleRank.pro'
          },
          publisher: {
            '@type': 'Organization',
            name: 'PuzzleRank.pro',
            url: baseUrl
          }
        }
      
      case 'article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data?.title || 'Puzzle Game Strategy Guide',
          description: data?.description || 'Master puzzle games with professional strategies and tips',
          author: {
            '@type': 'Organization',
            name: 'PuzzleRank.pro'
          },
          publisher: {
            '@type': 'Organization',
            name: 'PuzzleRank.pro',
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/logo.png`,
              width: 512,
              height: 512
            }
          },
          datePublished: data?.datePublished || new Date().toISOString(),
          dateModified: data?.dateModified || new Date().toISOString(),
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': data?.url || baseUrl
          }
        }
      
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'PuzzleRank.pro',
          description: 'Leading online puzzle games platform with competitive rankings and leaderboards',
          url: baseUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/logo.png`,
            width: 512,
            height: 512
          },
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            email: 'support@puzzlerank.pro'
          },
          sameAs: [
            'https://twitter.com/puzzlerankpro',
            'https://facebook.com/puzzlerankpro'
          ],
          foundingDate: '2024',
          areaServed: 'Worldwide',
          knowsAbout: [
            'Puzzle Games',
            'Brain Training',
            'Competitive Gaming',
            'Word Puzzles',
            '2048 Game',
            'Global Rankings'
          ]
        }
      
      default:
        return null
    }
  }

  const structuredData = getStructuredData()
  
  if (!structuredData) return null

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}

// 面包屑导航结构化数据
export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlerank.pro'
  
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`
    }))
  }

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbData)
      }}
    />
  )
}

// FAQ结构化数据
export function FAQStructuredData({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <Script
      id="faq-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqData)
      }}
    />
  )
}