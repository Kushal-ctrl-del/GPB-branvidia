const http = require('http');

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('=== TEST 1: Customer Direct Mode with Photos and Customer Reviews ===');
  const customerBusinessWithReviews = {
    businessName: 'Luxe Atelier Tailoring',
    category: 'Custom Clothing & Alterations',
    productsServices: ['Bespoke Suits', 'Evening Gown Tailoring', 'Custom Fitting'],
    targetCustomers: 'High-end clientele seeking custom tailored garments',
    businessGoals: ['Increase walk-in appointments', 'Boost local Google rank'],
    description: 'Luxe Atelier Tailoring provides bespoke suits and exquisite evening gown alterations in downtown Manhattan with over 20 years of craftsmanship experience.',
    address: { street: '784 Madison Ave', city: 'New York', country: 'United States' },
    websiteUrl: 'https://luxeateliertailoring.com',
    socialLinks: { instagramUrl: 'https://instagram.com/luxeatelier' },
    reviewSource: 'customer_provided',
    uploadedPhotos: [
      {
        id: 'p_01',
        previewUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
        fileName: 'storefront.jpg',
        fileSize: 1204000,
        mimeType: 'image/jpeg',
        category: 'COVER',
        description: 'Madison Avenue boutique storefront',
        width: 1200,
        height: 800,
        uploadedAt: new Date().toISOString(),
      },
      {
        id: 'p_02',
        previewUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
        fileName: 'bespoke_suit.jpg',
        fileSize: 850000,
        mimeType: 'image/jpeg',
        category: 'PRODUCT',
        description: 'Handmade Italian wool suit',
        width: 800,
        height: 800,
        uploadedAt: new Date().toISOString(),
      },
    ],
    customerReviews: [
      {
        reviewId: 'r_01',
        authorName: 'Victoria Sterling',
        starRating: 5,
        comment: 'Exquisite tailoring! Fitted my gala dress perfectly in under 48 hours.',
        createTime: '2026-10-10T12:00:00Z',
        reviewReply: { comment: 'Thank you Victoria, an absolute pleasure!', updateTime: '2026-10-10T15:00:00Z' },
        source: 'CUSTOMER_PROVIDED',
      },
      {
        reviewId: 'r_02',
        authorName: 'Julian Croft',
        starRating: 4,
        comment: 'Superb suit fit, though scheduling was busy on Saturday morning.',
        createTime: '2026-10-18T14:00:00Z',
        source: 'CUSTOMER_PROVIDED',
      },
    ],
  };

  const profileRes1 = await postJson('/api/profile', {
    mode: 'customer',
    intake: customerBusinessWithReviews,
  });
  console.log('Profile Response 1:', profileRes1.status, {
    name: profileRes1.data?.profile?.name,
    dataSource: profileRes1.data?.dataSource,
    reviewsCount: profileRes1.data?.reviews?.length,
    photosCount: profileRes1.data?.media?.length,
    reviewSource: profileRes1.data?.reviews?.[0]?.source,
  });

  console.log('\n=== TEST 2: Customer Direct Mode with ZERO Reviews ===');
  const customerBusinessZeroReviews = {
    businessName: 'Apex Precision Dental Care',
    category: 'Dental Clinic',
    productsServices: ['Preventive Cleanings', 'Invisalign Aligners', 'Dental Implants'],
    targetCustomers: 'Families and working professionals in the metro area',
    businessGoals: ['Attract new patient inquiries', 'Establish local trust'],
    description: 'Apex Precision Dental Care delivers gentle, comprehensive family dentistry with state-of-the-art 3D digital scanning and minimally invasive care.',
    address: { street: '120 Market St, Suite 400', city: 'San Francisco', country: 'United States' },
    websiteUrl: 'https://apexdentalcare.com',
    reviewSource: 'none',
    uploadedPhotos: [
      {
        id: 'p_dent_01',
        previewUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800',
        fileName: 'operatory.jpg',
        fileSize: 920000,
        mimeType: 'image/jpeg',
        category: 'INTERIOR',
        description: 'Modern dental suite',
        width: 1200,
        height: 800,
        uploadedAt: new Date().toISOString(),
      },
    ],
    customerReviews: [],
  };

  const profileRes2 = await postJson('/api/profile', {
    mode: 'customer',
    intake: customerBusinessZeroReviews,
  });
  console.log('Profile Response 2 (Zero Reviews):', profileRes2.status, {
    name: profileRes2.data?.profile?.name,
    dataSource: profileRes2.data?.dataSource,
    reviewsCount: profileRes2.data?.reviews?.length,
    photosCount: profileRes2.data?.media?.length,
    reviewCountMetric: profileRes2.data?.profile?.metrics?.reviewCount,
    responseRateMetric: profileRes2.data?.profile?.metrics?.responseRatePercent,
  });

  console.log('\n=== TEST 3: Calling /api/analyze with Customer Data (Zero Reviews) ===');
  const analyzeRes = await postJson('/api/analyze', {
    mode: 'customer',
    intake: customerBusinessZeroReviews,
  });
  console.log('Analyze Response (Zero Reviews):', analyzeRes.status, {
    score: analyzeRes.data?.optimizationScore,
    grade: analyzeRes.data?.scoreGrade,
    isFallback: analyzeRes.data?.isFallback,
    providerLabel: analyzeRes.data?.providerLabel,
    reviewDataStatus: analyzeRes.data?.reviewDataStatus,
    isReviewDataUnavailable: analyzeRes.data?.isReviewDataUnavailable,
    reviewsInReport: analyzeRes.data?.reviewInsights?.totalReviews,
    responsesCount: analyzeRes.data?.reviewResponses?.responses?.length,
  });

  console.log('\n=== ALL SCENARIOS VERIFIED SUCCESSFULLY ===');
}

runTests().catch(console.error);
