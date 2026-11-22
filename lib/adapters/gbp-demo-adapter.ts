import {
  GoogleBusinessProfileProvider,
  NormalizedReview,
  NormalizedMediaAsset,
} from "./gbp-interface";
import { NormalizedBusinessProfile, PartialBusinessIntake } from "../types/contracts";

export type DemoCategoryType = "clothing" | "dental" | "cafe";

export function detectCategoryType(category?: string, name?: string): DemoCategoryType {
  const combined = `${category || ""} ${name || ""}`.toLowerCase();
  if (
    combined.includes("cloth") ||
    combined.includes("boutique") ||
    combined.includes("apparel") ||
    combined.includes("fashion") ||
    combined.includes("wear") ||
    combined.includes("dress") ||
    combined.includes("suit") ||
    combined.includes("shoe") ||
    combined.includes("wardrobe") ||
    combined.includes("retail") ||
    combined.includes("garment")
  ) {
    return "clothing";
  }
  if (
    combined.includes("dent") ||
    combined.includes("ortho") ||
    combined.includes("clinic") ||
    combined.includes("teeth") ||
    combined.includes("oral") ||
    combined.includes("hygiene") ||
    combined.includes("doctor") ||
    combined.includes("smile") ||
    combined.includes("medical")
  ) {
    return "dental";
  }
  return "cafe";
}

// ---------------------------------------------------------------------------
// 1. CLOTHING STORE FIXTURE
// ---------------------------------------------------------------------------
function getClothingFixture(businessName: string) {
  const reviews: NormalizedReview[] = [
    {
      reviewId: "rev_cloth_001",
      authorName: "Sophia Lin",
      starRating: 5,
      comment:
        `Found the most flattering tailored wool coat here! The staff took time to help me style it with a silk scarf. Beautiful boutique curation.`,
      createTime: "2026-10-14T11:20:00Z",
      sentiment: "POSITIVE",
      reviewReply: {
        comment:
          `Thank you Sophia! That tailored coat looks stunning on you. Enjoy the season in style!`,
        updateTime: "2026-10-14T16:00:00Z",
      },
    },
    {
      reviewId: "rev_cloth_002",
      authorName: "Alexander Hayes",
      starRating: 5,
      comment:
        "Top tier menswear and knitwear. High quality fabrics that don't pill after two wears. Excellent customer service.",
      createTime: "2026-10-18T14:30:00Z",
      sentiment: "POSITIVE",
      reviewReply: {
        comment:
          "Appreciate the kind words Alexander! We source our merino and cashmere with great care. See you again soon!",
        updateTime: "2026-10-19T09:15:00Z",
      },
    },
    {
      reviewId: "rev_cloth_003",
      authorName: "Rachel Davies",
      starRating: 2,
      comment:
        "Beautiful dresses but the fitting rooms had a 20 minute wait on Saturday afternoon. Only two dressing stalls for the entire floor.",
      createTime: "2026-10-22T15:45:00Z",
      sentiment: "NEGATIVE",
      // Unreplied review (Opportunity for AI suggested reply)
    },
    {
      reviewId: "rev_cloth_004",
      authorName: "Maya Patel",
      starRating: 4,
      comment:
        "Gorgeous seasonal collection. Knocked off one star because the store return policy is store credit only, which wasn't clearly stated at checkout.",
      createTime: "2026-10-25T13:10:00Z",
      sentiment: "NEUTRAL",
      // Unreplied review
    },
    {
      reviewId: "rev_cloth_005",
      authorName: "Oliver Vance",
      starRating: 5,
      comment:
        "Booked a 30-minute private styling session with Emma and it completely revitalized my professional wardrobe. Worth every penny.",
      createTime: "2026-10-29T16:00:00Z",
      sentiment: "POSITIVE",
      reviewReply: {
        comment:
          "Thank you Oliver! Emma was thrilled to collaborate with you on your capsule wardrobe. Best of luck with your presentations!",
        updateTime: "2026-10-30T10:00:00Z",
      },
    },
    {
      reviewId: "rev_cloth_006",
      authorName: "Claire Bennett",
      starRating: 1,
      comment:
        "Drove 35 minutes because Google showed they carried the designer trench in size Medium. Arrived and associate said they sold out two weeks ago.",
      createTime: "2026-11-02T17:15:00Z",
      sentiment: "NEGATIVE",
      // Unreplied negative review (Critical reputation gap!)
    },
    {
      reviewId: "rev_cloth_007",
      authorName: "David Sterling",
      starRating: 5,
      comment:
        "Exceptional Japanese denim and leather jackets. Staff knows the mill provenance and fit of every single pair.",
      createTime: "2026-11-05T12:00:00Z",
      sentiment: "POSITIVE",
      reviewReply: {
        comment:
          "Thanks David! Those selvedge pieces are truly works of art. Wear them in good health!",
        updateTime: "2026-11-05T18:20:00Z",
      },
    },
    {
      reviewId: "rev_cloth_008",
      authorName: "Isabella Rossi",
      starRating: 4,
      comment:
        "Very chic accessories and jewelry. Prices are on the premium side, but the exclusivity makes it worth it for special occasions.",
      createTime: "2026-11-08T14:40:00Z",
      sentiment: "POSITIVE",
      // Unreplied review
    },
    {
      reviewId: "rev_cloth_009",
      authorName: "Marcus Thorne",
      starRating: 3,
      comment:
        "Decent clothing selection, but street parking on Elmwood is virtually impossible on weekends. Wish they validated nearby garage parking.",
      createTime: "2026-11-10T11:00:00Z",
      sentiment: "NEUTRAL",
      // Unreplied review
    },
    {
      reviewId: "rev_cloth_010",
      authorName: "Emily Zhao",
      starRating: 5,
      comment:
        "Clean, elegant boutique layout, gentle background music, and complimentary beverage while shopping. Feels like a boutique in Milan.",
      createTime: "2026-11-12T15:30:00Z",
      sentiment: "POSITIVE",
      reviewReply: {
        comment:
          "We love creating a calm, luxurious shopping sanctuary! Thank you Emily, see you next season!",
        updateTime: "2026-11-13T09:40:00Z",
      },
    },
    {
      reviewId: "rev_cloth_011",
      authorName: "Julian Ortiz",
      starRating: 4,
      comment:
        "Great collection of blazers and trousers. Would love if they offered online fitting appointments directly through their Google profile.",
      createTime: "2026-11-15T13:20:00Z",
      sentiment: "POSITIVE",
      // Unreplied review (Highlights missing appointment link!)
    },
    {
      reviewId: "rev_cloth_012",
      authorName: "Hannah Brooks",
      starRating: 5,
      comment:
        "Hands down my favorite boutique in town. Sustainable fabrics, transparent supply chain, and lovely staff who remember my style preferences.",
      createTime: "2026-11-18T16:10:00Z",
      sentiment: "POSITIVE",
      // Unreplied review
    },
  ];

  const media: NormalizedMediaAsset[] = [
    {
      mediaId: "med_cloth_logo_01",
      mediaFormat: "PHOTO",
      category: "PROFILE",
      googleUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80",
      createTime: "2026-06-01T10:00:00Z",
      dimensions: { widthPixels: 400, heightPixels: 400 },
      description: "Official boutique brand monogram logo badge",
    },
    {
      mediaId: "med_cloth_cover_01",
      mediaFormat: "PHOTO",
      category: "COVER",
      googleUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      createTime: "2026-06-01T10:05:00Z",
      dimensions: { widthPixels: 1200, heightPixels: 675 },
      description: "Boutique storefront window display with seasonal designer mannequins",
    },
    {
      mediaId: "med_cloth_ext_01",
      mediaFormat: "PHOTO",
      category: "EXTERIOR",
      googleUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-07-15T14:20:00Z",
      dimensions: { widthPixels: 800, heightPixels: 600 },
      description: "Main avenue retail storefront with exterior branded awning and glass entrance",
    },
    {
      mediaId: "med_cloth_int_01",
      mediaFormat: "PHOTO",
      category: "INTERIOR", // Only 1 interior photo (deliberate gap!)
      googleUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-07-20T11:00:00Z",
      dimensions: { widthPixels: 800, heightPixels: 533 },
      description: "Minimalist boutique showroom floor with polished concrete and brass garment racks",
    },
    {
      mediaId: "med_cloth_prod_01",
      mediaFormat: "PHOTO",
      category: "PRODUCT",
      googleUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-08-10T09:45:00Z",
      dimensions: { widthPixels: 800, heightPixels: 800 },
      description: "Hand-tailored wool trench coat styled on showroom display",
    },
    {
      mediaId: "med_cloth_prod_02",
      mediaFormat: "PHOTO",
      category: "PRODUCT",
      googleUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-08-15T10:15:00Z",
      dimensions: { widthPixels: 800, heightPixels: 600 },
      description: "Artisanal Italian leather tote and silk accessory display",
    },
    {
      mediaId: "med_cloth_prod_03",
      mediaFormat: "PHOTO",
      category: "PRODUCT",
      googleUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-09-02T13:30:00Z",
      dimensions: { widthPixels: 800, heightPixels: 800 },
      description: "Curated seasonal evening dress collection on walnut hangers",
    },
    {
      mediaId: "med_cloth_team_01",
      mediaFormat: "PHOTO",
      category: "AT_WORK",
      googleUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-09-20T15:00:00Z",
      dimensions: { widthPixels: 800, heightPixels: 533 },
      description: "Lead stylist arranging seasonal capsule wardrobe for client appointment",
    },
    {
      mediaId: "med_cloth_prod_04",
      mediaFormat: "PHOTO",
      category: "PRODUCT",
      googleUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-10-05T09:00:00Z",
      dimensions: { widthPixels: 800, heightPixels: 600 },
      description: "Organic knitwear and cashmere sweater display on oak shelves",
    },
    {
      mediaId: "med_cloth_add_01",
      mediaFormat: "PHOTO",
      category: "ADDITIONAL",
      googleUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-10-18T16:40:00Z",
      dimensions: { widthPixels: 800, heightPixels: 533 },
      description: "Checkout lounge and bespoke gift packaging service counter",
    },
  ];

  return {
    defaultName: "Velvet & Thread Boutique",
    primaryCategory: "Clothing Store",
    additionalCategories: ["Women's Clothing Store", "Boutique", "Fashion Accessories Store"],
    address: {
      street: "284 Fashion Boulevard, Suite 100",
      city: "New York",
      state: "NY",
      postalCode: "10018",
      country: "US",
    },
    phoneNumber: "+1 (212) 555-0142",
    websiteUrl: null, // Deliberate gap
    description: "Curated independent boutique specializing in contemporary women's apparel, premium outerwear, and handcrafted accessories.", // 124 chars
    regularHours: [
      { day: "Monday", open: "10:00", close: "19:00", isClosed: false },
      { day: "Tuesday", open: "10:00", close: "19:00", isClosed: false },
      { day: "Wednesday", open: "10:00", close: "19:00", isClosed: false },
      { day: "Thursday", open: "10:00", close: "19:00", isClosed: false },
      { day: "Friday", open: "10:00", close: "20:00", isClosed: false },
      { day: "Saturday", open: "10:00", close: "20:00", isClosed: false },
      { day: "Sunday", open: "12:00", close: "17:00", isClosed: false },
    ],
    missingFields: [
      "websiteUrl (Missing Website)",
      "description_length_suboptimal (124/750 chars)",
      "appointment_or_booking_link (Missing Personal Styling Link)",
      "interior_photo_coverage_low (1 interior photo)",
    ],
    reviews,
    media,
  };
}

// ---------------------------------------------------------------------------
// 2. DENTAL CLINIC FIXTURE
// ---------------------------------------------------------------------------
function getDentalFixture(businessName: string) {
  const reviews: NormalizedReview[] = [
    {
      reviewId: "rev_dent_001",
      authorName: "Sarah Jenkins",
      starRating: 5,
      comment:
        `Best dental experience I've ever had. Dr. Miller explained every step of my dental implant procedure with total clarity and no discomfort at all.`,
      createTime: "2026-10-14T09:15:00Z",
      sentiment: "POSITIVE",
      reviewReply: {
        comment:
          `Thank you Sarah! Ensuring patient comfort is our highest priority. We look forward to seeing you at your follow-up!`,
        updateTime: "2026-10-14T15:30:00Z",
      },
    },
    {
      reviewId: "rev_dent_002",
      authorName: "Michael Chang",
      starRating: 5,
      comment:
        "Completed my 6-month Invisalign treatment here and my smile transformation is incredible. Hygienists are gentle and thorough.",
      createTime: "2026-10-18T10:45:00Z",
      sentiment: "POSITIVE",
      reviewReply: {
        comment:
          "Congratulations on your new smile Michael! It was our pleasure guiding your Invisalign journey.",
        updateTime: "2026-10-19T08:20:00Z",
      },
    },
    {
      reviewId: "rev_dent_003",
      authorName: "Jonathan Miller",
      starRating: 2,
      comment:
        "Good clinical dental work, but reception had me waiting in the lobby for 35 minutes past my scheduled appointment time without an explanation.",
      createTime: "2026-10-22T14:10:00Z",
      sentiment: "NEGATIVE",
      // Unreplied review
    },
    {
      reviewId: "rev_dent_004",
      authorName: "Lisa Morgan",
      starRating: 4,
      comment:
        "Modern operatory and state of the art 3D imaging equipment. Bill took a couple of weeks to clear insurance, but front desk was helpful when I called.",
      createTime: "2026-10-25T11:20:00Z",
      sentiment: "NEUTRAL",
      // Unreplied review
    },
    {
      reviewId: "rev_dent_005",
      authorName: "David Kowalski",
      starRating: 5,
      comment:
        "In-office laser teeth whitening delivered phenomenal results. Teeth were three shades lighter in just one 45-minute session with zero sensitivity.",
      createTime: "2026-10-29T14:00:00Z",
      sentiment: "POSITIVE",
      reviewReply: {
        comment:
          "Thrilled to hear that David! Our laser whitening technology is calibrated to maximize brightness while protecting enamel.",
        updateTime: "2026-10-30T11:30:00Z",
      },
    },
    {
      reviewId: "rev_dent_006",
      authorName: "Amanda Torres",
      starRating: 1,
      comment:
        "Called regarding an urgent chipped tooth emergency on Friday afternoon. Voicemail said open until 4 PM, but no one answered or returned my message.",
      createTime: "2026-11-02T16:30:00Z",
      sentiment: "NEGATIVE",
      // Unreplied negative review
    },
    {
      reviewId: "rev_dent_007",
      authorName: "Robert Kelly",
      starRating: 5,
      comment:
        "Brought my 7-year-old for her first cavity filling. The pediatric care was patient, playful, and completely tear-free. Highly recommended for families.",
      createTime: "2026-11-05T13:40:00Z",
      sentiment: "POSITIVE",
      reviewReply: {
        comment:
          "That warms our hearts Robert! Helping kids feel safe and confident in the dental chair is everything to our team.",
        updateTime: "2026-11-06T09:12:00Z",
      },
    },
    {
      reviewId: "rev_dent_008",
      authorName: "Jessica Lee",
      starRating: 4,
      comment:
        "High quality porcelain crown restoration. Pricing was transparent with my insurance co-pay explained upfront.",
      createTime: "2026-11-08T15:15:00Z",
      sentiment: "POSITIVE",
      // Unreplied review
    },
    {
      reviewId: "rev_dent_009",
      authorName: "Daniel Foster",
      starRating: 3,
      comment:
        "Competent dentists, but clinic parking lot has limited visitor spaces. Had to park on the street two blocks away in the rain.",
      createTime: "2026-11-10T09:20:00Z",
      sentiment: "NEUTRAL",
      // Unreplied review
    },
    {
      reviewId: "rev_dent_010",
      authorName: "Elena Vasquez",
      starRating: 5,
      comment:
        "Spotlessly clean clinic, ceiling TV screens with noise-canceling headphones during treatments, and warm scented towels afterwards. 5 stars!",
      createTime: "2026-11-12T10:50:00Z",
      sentiment: "POSITIVE",
      reviewReply: {
        comment:
          "Thank you Elena! We want every dental visit to feel like a restorative wellness experience.",
        updateTime: "2026-11-12T16:00:00Z",
      },
    },
    {
      reviewId: "rev_dent_011",
      authorName: "Brian O'Shea",
      starRating: 4,
      comment:
        "Great preventive checkup and digital x-rays. Wish they had an online calendar booking button directly on their Google profile to book routine cleanings.",
      createTime: "2026-11-15T14:10:00Z",
      sentiment: "POSITIVE",
      // Unreplied review (Highlights missing appointment link!)
    },
    {
      reviewId: "rev_dent_012",
      authorName: "Priya Patel",
      starRating: 5,
      comment:
        "Dr. Miller caught an early gum issue that my previous dentist overlooked. Grateful for their thorough diagnostic approach.",
      createTime: "2026-11-18T11:30:00Z",
      sentiment: "POSITIVE",
      // Unreplied review
    },
  ];

  const media: NormalizedMediaAsset[] = [
    {
      mediaId: "med_dent_logo_01",
      mediaFormat: "PHOTO",
      category: "PROFILE",
      googleUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80",
      createTime: "2026-06-01T10:00:00Z",
      dimensions: { widthPixels: 400, heightPixels: 400 },
      description: "Official clinic logo and aesthetic dental wellness crest",
    },
    {
      mediaId: "med_dent_cover_01",
      mediaFormat: "PHOTO",
      category: "COVER",
      googleUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80",
      createTime: "2026-06-01T10:05:00Z",
      dimensions: { widthPixels: 1200, heightPixels: 675 },
      description: "Modern dental clinic reception area and welcoming patient lounge",
    },
    {
      mediaId: "med_dent_ext_01",
      mediaFormat: "PHOTO",
      category: "EXTERIOR",
      googleUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-07-15T14:20:00Z",
      dimensions: { widthPixels: 800, heightPixels: 600 },
      description: "Medical Arts pavilion exterior facade and accessible main entrance",
    },
    {
      mediaId: "med_dent_int_01",
      mediaFormat: "PHOTO",
      category: "INTERIOR", // Only 1 interior photo (gap!)
      googleUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-07-20T11:00:00Z",
      dimensions: { widthPixels: 800, heightPixels: 533 },
      description: "Surgical dental operatory with ergonomic patient chair and ceiling screen",
    },
    {
      mediaId: "med_dent_prod_01",
      mediaFormat: "PHOTO",
      category: "PRODUCT",
      googleUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-08-10T09:45:00Z",
      dimensions: { widthPixels: 800, heightPixels: 800 },
      description: "High-resolution 3D intraoral digital imaging scanner",
    },
    {
      mediaId: "med_dent_prod_02",
      mediaFormat: "PHOTO",
      category: "PRODUCT",
      googleUrl: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-08-15T10:15:00Z",
      dimensions: { widthPixels: 800, heightPixels: 600 },
      description: "Professional take-home laser teeth whitening wellness kit",
    },
    {
      mediaId: "med_dent_prod_03",
      mediaFormat: "PHOTO",
      category: "PRODUCT",
      googleUrl: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-09-02T13:30:00Z",
      dimensions: { widthPixels: 800, heightPixels: 800 },
      description: "Custom clear aligner orthodontic orthodontic model display",
    },
    {
      mediaId: "med_dent_team_01",
      mediaFormat: "PHOTO",
      category: "AT_WORK",
      googleUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-09-20T15:00:00Z",
      dimensions: { widthPixels: 800, heightPixels: 533 },
      description: "Dentist and dental hygienist reviewing digital scans during care consultation",
    },
    {
      mediaId: "med_dent_prod_04",
      mediaFormat: "PHOTO",
      category: "PRODUCT",
      googleUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-10-05T09:00:00Z",
      dimensions: { widthPixels: 800, heightPixels: 600 },
      description: "Medical autoclave instrument sterilization center and hygienic station",
    },
    {
      mediaId: "med_dent_add_01",
      mediaFormat: "PHOTO",
      category: "ADDITIONAL",
      googleUrl: "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-10-18T16:40:00Z",
      dimensions: { widthPixels: 800, heightPixels: 533 },
      description: "Private treatment consultation and patient care planning suite",
    },
  ];

  return {
    defaultName: "Aura Dental Wellness & Aesthetics",
    primaryCategory: "Dental Clinic",
    additionalCategories: ["Cosmetic Dentist", "Teeth Whitening Service", "Pediatric Dentist"],
    address: {
      street: "450 Medical Arts Pavilion, Suite 300",
      city: "Chicago",
      state: "IL",
      postalCode: "60611",
      country: "US",
    },
    phoneNumber: "+1 (312) 555-0188",
    websiteUrl: null, // Deliberate gap
    description: "Modern family and aesthetic dental clinic offering gentle preventative care, clear aligners, and laser whitening treatments.", // 127 chars
    regularHours: [
      { day: "Monday", open: "08:00", close: "17:00", isClosed: false },
      { day: "Tuesday", open: "08:00", close: "17:00", isClosed: false },
      { day: "Wednesday", open: "08:00", close: "17:00", isClosed: false },
      { day: "Thursday", open: "08:00", close: "17:00", isClosed: false },
      { day: "Friday", open: "08:00", close: "14:00", isClosed: false },
      { day: "Saturday", open: "09:00", close: "13:00", isClosed: true },
      { day: "Sunday", open: "09:00", close: "13:00", isClosed: true },
    ],
    missingFields: [
      "websiteUrl (Missing Website)",
      "description_length_suboptimal (127/750 chars)",
      "appointment_or_booking_link (Missing Online Appointment Link)",
      "interior_photo_coverage_low (1 interior photo)",
    ],
    reviews,
    media,
  };
}

// ---------------------------------------------------------------------------
// 3. CAFÉ / ROASTERY FIXTURE
// ---------------------------------------------------------------------------
function getCafeFixture(businessName: string) {
  const reviews: NormalizedReview[] = [
    {
      reviewId: "rev_cafe_001",
      authorName: "Marcus Vance",
      starRating: 5,
      comment:
        "The Ethiopian Yirgacheffe pour-over is simply phenomenal. Notes of jasmine and bergamot come through crystal clear. Baristas really know their craft.",
      createTime: "2026-10-14T09:30:00Z",
      sentiment: "POSITIVE",
      reviewReply: {
        comment:
          "Thank you so much Marcus! Our roasting team dialed in that Ethiopian lot with extra care. Hope to brew for you again soon!",
        updateTime: "2026-10-14T14:15:00Z",
      },
    },
    {
      reviewId: "rev_cafe_002",
      authorName: "Elena Rostova",
      starRating: 5,
      comment:
        "Best almond croissant in town, baked fresh every morning. Great natural light for reading and catching up on work.",
      createTime: "2026-10-18T11:45:00Z",
      sentiment: "POSITIVE",
      reviewReply: {
        comment:
          "Thanks Elena! Our pastry chef will be thrilled to hear this. See you next time!",
        updateTime: "2026-10-19T08:00:00Z",
      },
    },
    {
      reviewId: "rev_cafe_003",
      authorName: "David K.",
      starRating: 2,
      comment:
        "Coffee is decent but parking on weekends is an absolute nightmare. Drove around Elmwood for 25 minutes before finding a spot two blocks away.",
      createTime: "2026-10-22T14:10:00Z",
      sentiment: "NEGATIVE",
      // Unreplied review
    },
    {
      reviewId: "rev_cafe_004",
      authorName: "Sarah Chen",
      starRating: 4,
      comment:
        "Love the minimalist aesthetic and the flat whites are silky smooth. Knocked off one star because the Wi-Fi dropped multiple times during my Zoom meeting.",
      createTime: "2026-10-25T16:20:00Z",
      sentiment: "NEUTRAL",
      // Unreplied review
    },
    {
      reviewId: "rev_cafe_005",
      authorName: "Brian O'Connor",
      starRating: 5,
      comment:
        "Bought a bag of the Colombia Huila beans for my home espresso setup. Roasted just 3 days ago. Crema and flavor profile are exceptional.",
      createTime: "2026-10-29T10:05:00Z",
      sentiment: "POSITIVE",
      reviewReply: {
        comment:
          "Appreciate the kind words Brian! That Huila lot has been a customer favorite. Enjoy your home brews!",
        updateTime: "2026-10-29T17:30:00Z",
      },
    },
    {
      reviewId: "rev_cafe_006",
      authorName: "Jessica Miller",
      starRating: 1,
      comment:
        "Arrived at 11:30 AM on a Saturday and they were completely sold out of both croissants and gluten-free pastries. Barista seemed indifferent when I asked if more were coming.",
      createTime: "2026-11-02T12:00:00Z",
      sentiment: "NEGATIVE",
      // Unreplied review
    },
    {
      reviewId: "rev_cafe_007",
      authorName: "Tariq Mansoor",
      starRating: 5,
      comment:
        "The Saturday barista cupping session was informative and relaxed. Learned how processing methods change flavor clarity completely. Highly recommended!",
      createTime: "2026-11-05T13:40:00Z",
      sentiment: "POSITIVE",
      reviewReply: {
        comment:
          "So glad you enjoyed the cupping workshop Tariq! We host them every other Saturday. See you at the next one!",
        updateTime: "2026-11-06T09:12:00Z",
      },
    },
    {
      reviewId: "rev_cafe_008",
      authorName: "Chloe Dupont",
      starRating: 4,
      comment:
        "High quality matcha latte with oat milk. A bit pricey at $7.50, but you get what you pay for in terms of quality.",
      createTime: "2026-11-08T15:15:00Z",
      sentiment: "POSITIVE",
      // Unreplied review
    },
    {
      reviewId: "rev_cafe_009",
      authorName: "Nathaniel Ward",
      starRating: 3,
      comment:
        "Good coffee, but the seating is cramped. Only about 6 small tables and they were all occupied by people with laptops for hours.",
      createTime: "2026-11-10T11:20:00Z",
      sentiment: "NEUTRAL",
      // Unreplied review
    },
    {
      reviewId: "rev_cafe_010",
      authorName: "Hannah Kim",
      starRating: 5,
      comment:
        "Super clean space, welcoming staff, and dog friendly on the outdoor patio! My go-to spot on morning walks.",
      createTime: "2026-11-12T08:50:00Z",
      sentiment: "POSITIVE",
      reviewReply: {
        comment:
          "We love our patio pup visitors! Thanks Hannah, give your dog some love from the team!",
        updateTime: "2026-11-12T16:00:00Z",
      },
    },
    {
      reviewId: "rev_cafe_011",
      authorName: "Robert Garcia",
      starRating: 4,
      comment:
        "Consistent quality every time. Great cold brew on tap. Wish they had an online order pickup option on their Google profile to skip the morning line.",
      createTime: "2026-11-15T09:10:00Z",
      sentiment: "POSITIVE",
      // Unreplied review
    },
    {
      reviewId: "rev_cafe_012",
      authorName: "Priya Sundaram",
      starRating: 5,
      comment:
        "Unpretentious specialty coffee. The staff took the time to explain the difference between washed and natural processes without any snobbery.",
      createTime: "2026-11-18T10:30:00Z",
      sentiment: "POSITIVE",
      // Unreplied review
    },
  ];

  const media: NormalizedMediaAsset[] = [
    {
      mediaId: "med_cafe_logo_01",
      mediaFormat: "PHOTO",
      category: "PROFILE",
      googleUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80",
      createTime: "2026-06-01T10:00:00Z",
      dimensions: { widthPixels: 400, heightPixels: 400 },
      description: "Official circular badge logo",
    },
    {
      mediaId: "med_cafe_cover_01",
      mediaFormat: "PHOTO",
      category: "COVER",
      googleUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
      createTime: "2026-06-01T10:05:00Z",
      dimensions: { widthPixels: 1200, heightPixels: 675 },
      description: "Espresso bar and wooden countertop",
    },
    {
      mediaId: "med_cafe_ext_01",
      mediaFormat: "PHOTO",
      category: "EXTERIOR",
      googleUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-07-15T14:20:00Z",
      dimensions: { widthPixels: 800, heightPixels: 600 },
      description: "Street view of shopfront with avenue signage",
    },
    {
      mediaId: "med_cafe_int_01",
      mediaFormat: "PHOTO",
      category: "INTERIOR", // Only 1 interior photo (gap!)
      googleUrl: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-07-20T11:00:00Z",
      dimensions: { widthPixels: 800, heightPixels: 533 },
      description: "Seating area with high barstools and exposed brick",
    },
    {
      mediaId: "med_cafe_prod_01",
      mediaFormat: "PHOTO",
      category: "PRODUCT",
      googleUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-08-10T09:45:00Z",
      dimensions: { widthPixels: 800, heightPixels: 800 },
      description: "Craft latte art in ceramic cup",
    },
    {
      mediaId: "med_cafe_prod_02",
      mediaFormat: "PHOTO",
      category: "FOOD_AND_DRINK",
      googleUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-08-15T10:15:00Z",
      dimensions: { widthPixels: 800, heightPixels: 600 },
      description: "Freshly baked almond and butter croissants",
    },
    {
      mediaId: "med_cafe_prod_03",
      mediaFormat: "PHOTO",
      category: "PRODUCT",
      googleUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-09-02T13:30:00Z",
      dimensions: { widthPixels: 800, heightPixels: 800 },
      description: "Whole bean coffee bags in kraft packaging",
    },
    {
      mediaId: "med_cafe_team_01",
      mediaFormat: "PHOTO",
      category: "AT_WORK",
      googleUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-09-20T15:00:00Z",
      dimensions: { widthPixels: 800, heightPixels: 533 },
      description: "Head roaster adjusting temperature curve on roaster",
    },
    {
      mediaId: "med_cafe_prod_04",
      mediaFormat: "PHOTO",
      category: "FOOD_AND_DRINK",
      googleUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-10-05T09:00:00Z",
      dimensions: { widthPixels: 800, heightPixels: 600 },
      description: "Cold brew pour with oat milk layer",
    },
    {
      mediaId: "med_cafe_add_01",
      mediaFormat: "PHOTO",
      category: "ADDITIONAL",
      googleUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
      createTime: "2026-10-18T16:40:00Z",
      dimensions: { widthPixels: 800, heightPixels: 533 },
      description: "Pour-over brew bar setup with copper kettle and V60 drippers",
    },
  ];

  return {
    defaultName: "Third Wave Roastery & Artisan Cafe",
    primaryCategory: "Coffee Roasters",
    additionalCategories: ["Cafe", "Espresso Bar", "Pastry Shop"],
    address: {
      street: "142 Elmwood Boulevard, Suite 100",
      city: "Seattle",
      state: "WA",
      postalCode: "98101",
      country: "US",
    },
    phoneNumber: "+1 (206) 555-0194",
    websiteUrl: null, // Deliberate gap
    description: "Neighborhood micro-roastery serving single-origin coffees and handmade pastries. Roasted weekly in small batches.", // 111 chars
    regularHours: [
      { day: "Monday", open: "07:00", close: "17:00", isClosed: false },
      { day: "Tuesday", open: "07:00", close: "17:00", isClosed: false },
      { day: "Wednesday", open: "07:00", close: "17:00", isClosed: false },
      { day: "Thursday", open: "07:00", close: "17:00", isClosed: false },
      { day: "Friday", open: "07:00", close: "18:00", isClosed: false },
      { day: "Saturday", open: "08:00", close: "18:00", isClosed: false },
      { day: "Sunday", open: "08:00", close: "16:00", isClosed: false },
    ],
    missingFields: [
      "websiteUrl (Missing Website)",
      "description_length_suboptimal (111/750 chars)",
      "appointment_or_booking_link (Missing Booking Link)",
      "interior_photo_coverage_low (1 interior photo)",
    ],
    reviews,
    media,
  };
}

// ---------------------------------------------------------------------------
// ADAPTER IMPLEMENTATION
// ---------------------------------------------------------------------------
export class DemoGoogleBusinessProfileAdapter implements GoogleBusinessProfileProvider {
  name: "demo" = "demo";
  displayName: string;
  private intake?: PartialBusinessIntake;

  constructor(intake?: PartialBusinessIntake) {
    this.intake = intake;
    const catType = detectCategoryType(intake?.category, intake?.businessName);
    if (catType === "clothing") {
      this.displayName = "Demo Profile (Clothing Boutique)";
    } else if (catType === "dental") {
      this.displayName = "Demo Profile (Dental Clinic)";
    } else {
      this.displayName = "Demo Profile (Artisan Coffee Roastery)";
    }
  }

  private getFixture() {
    const catType = detectCategoryType(this.intake?.category, this.intake?.businessName);
    const activeName = this.intake?.businessName?.trim() || "";

    if (catType === "clothing") {
      return { type: catType, data: getClothingFixture(activeName) };
    }
    if (catType === "dental") {
      return { type: catType, data: getDentalFixture(activeName) };
    }
    return { type: catType, data: getCafeFixture(activeName) };
  }

  async getProfile(): Promise<NormalizedBusinessProfile> {
    const { type, data: fixture } = this.getFixture();
    const reviews = await this.getReviews();
    const media = await this.getMedia();

    // Preserve the customer's submitted identity 100%
    const businessName = this.intake?.businessName?.trim() || fixture.defaultName;
    const primaryCategory = this.intake?.category?.trim() || fixture.primaryCategory;

    const totalReviews = reviews.length;
    const totalStars = reviews.reduce((sum, r) => sum + r.starRating, 0);
    const calculatedAvgRating = totalReviews > 0 ? Number((totalStars / totalReviews).toFixed(1)) : 0;
    const repliedCount = reviews.filter((r) => Boolean(r.reviewReply)).length;
    const calculatedResponseRate = totalReviews > 0 ? Number(((repliedCount / totalReviews) * 100).toFixed(1)) : 0;

    return {
      dataSource: "SIMULATED_DEMO",
      locationId: `loc_demo_${type}_01`,
      name: businessName, // STRICTLY PRESERVED CUSTOMER NAME
      primaryCategory: primaryCategory, // STRICTLY PRESERVED CUSTOMER CATEGORY
      additionalCategories: fixture.additionalCategories,
      address: fixture.address,
      phoneNumber: fixture.phoneNumber,
      websiteUrl: fixture.websiteUrl, // Deliberate profile gap
      description: fixture.description, // Deliberate short description gap
      regularHours: fixture.regularHours,
      metrics: {
        reviewCount: totalReviews,
        averageRating: calculatedAvgRating, // Exactly 4.0 derived from 48 / 12
        photosCount: media.length, // Exactly 10 matching media asset inventory
        responseRatePercent: calculatedResponseRate, // Exactly 41.7% (5 replied / 12 total)
      },
      missingFields: fixture.missingFields,
    };
  }

  async getReviews(): Promise<NormalizedReview[]> {
    const { data: fixture } = this.getFixture();
    return fixture.reviews.map((r) => ({
      ...r,
      source: "SIMULATED_DEMO" as const,
      isDemo: true,
    }));
  }

  async getMedia(): Promise<NormalizedMediaAsset[]> {
    const { data: fixture } = this.getFixture();
    return fixture.media.map((m) => ({
      ...m,
      source: "SIMULATED_DEMO" as const,
    }));
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    const { type } = this.getFixture();
    return {
      ok: true,
      message: `Demo provider operational for archetype [${type}]. 12 category-relevant reviews and 10 media assets loaded.`,
    };
  }
}
