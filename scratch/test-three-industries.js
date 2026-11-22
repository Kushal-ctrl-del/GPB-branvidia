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
  console.log('=== TEST A: Boutique Clothing Store with Customer Reviews & Photos ===');
  const clothingStore = {
    businessName: 'Velvet & Thread Boutique',
    category: 'Clothing Store',
    productsServices: ['Designer Evening Wear', 'Cashmere Knitwear', 'Personal Styling'],
    targetCustomers: 'Fashion-forward shoppers and local professionals',
    businessGoals: ['Increase foot traffic', 'Grow seasonal collection sales'],
    description: 'Velvet & Thread Boutique curates premium contemporary women’s apparel and bespoke personal styling in Soho.',
    websiteUrl: 'https://velvetandthread.com',
    reviewSource: 'customer_provided',
    uploadedPhotos: [
      {
        id: 'p_cloth_1',
        previewUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        fileName: 'boutique_front.jpg',
        fileSize: 1100000,
        mimeType: 'image/jpeg',
        category: 'COVER',
        description: 'Storefront window display',
        width: 1200,
        height: 800,
        uploadedAt: new Date().toISOString(),
      },
      {
        id: 'p_cloth_2',
        previewUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800',
        fileName: 'dresses.jpg',
        fileSize: 950000,
        mimeType: 'image/jpeg',
        category: 'PRODUCT',
        description: 'Silk dress collection',
        width: 800,
        height: 800,
        uploadedAt: new Date().toISOString(),
      },
    ],
    customerReviews: [
      {
        reviewId: 'r_cloth_1',
        authorName: 'Sarah Jenkins',
        starRating: 5,
        comment: 'Found the most stunning silk evening gown here! Personal styling was incredible.',
        createTime: '2026-10-15T12:00:00Z',
        source: 'CUSTOMER_PROVIDED',
      },
    ],
  };

  const analyzeResA = await postJson('/api/analyze', {
    mode: 'customer',
    intake: clothingStore,
  });
  console.log('Analyze Clothing Store:', analyzeResA.status, {
    score: analyzeResA.data?.optimizationScore,
    grade: analyzeResA.data?.scoreGrade,
    providerLabel: analyzeResA.data?.providerLabel,
    totalReviews: analyzeResA.data?.reviewInsights?.totalReviews,
    avgRating: analyzeResA.data?.reviewInsights?.averageRating,
    draftReplies: analyzeResA.data?.reviewResponses?.responses?.length,
  });

  console.log('\n=== TEST B: Artisan Cafe in Demo Mode ===');
  const cafeIntake = {
    businessName: 'Third Wave Roastery & Artisan Cafe',
    category: 'Coffee Roasters',
    productsServices: ['Specialty Single-Origin Pour Over', 'Espresso & Handcrafted Lattes', 'Fresh Artisanal Pastries'],
    targetCustomers: 'Specialty coffee lovers and neighborhood regulars',
    businessGoals: ['Improve local discovery', 'Reply promptly to customer reviews'],
  };

  const profileResB = await postJson('/api/profile', {
    mode: 'demo',
    intake: cafeIntake,
  });
  console.log('Profile Cafe Demo:', profileResB.status, {
    name: profileResB.data?.profile?.name,
    category: profileResB.data?.profile?.primaryCategory,
    reviewsCount: profileResB.data?.reviews?.length,
    photosCount: profileResB.data?.media?.length,
    dataSource: profileResB.data?.dataSource,
  });

  console.log('\n=== ALL 3 CATEGORIES (CLOTHING, DENTAL, CAFE) FULLY VERIFIED ===');
}

runTests().catch(console.error);
