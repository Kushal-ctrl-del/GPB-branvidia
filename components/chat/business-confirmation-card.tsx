"use client";

import * as React from "react";
import { BusinessIntake, PartialBusinessIntake, BusinessSocialLinks, BusinessAddress } from "@/lib/types/contracts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  Edit3,
  ArrowRight,
  Building,
  Tag,
  Package,
  Users,
  Target,
  Plus,
  X,
  MapPin,
  Globe,
  FileText,
  ExternalLink,
  Instagram,
  Facebook,
  Link as LinkIcon,
  ShieldAlert,
} from "lucide-react";

export interface BusinessConfirmationCardProps {
  intake: PartialBusinessIntake;
  onConfirm: (confirmedIntake: BusinessIntake) => void;
  onUpdate: (updated: PartialBusinessIntake) => void;
}

export function BusinessConfirmationCard({
  intake,
  onConfirm,
  onUpdate,
}: BusinessConfirmationCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState<PartialBusinessIntake>(intake);
  const [newProduct, setNewProduct] = React.useState("");
  const [newGoal, setNewGoal] = React.useState("");

  React.useEffect(() => {
    setFormData(intake);
  }, [intake]);

  const completedCount = [
    Boolean(formData.businessName?.trim()),
    Boolean(formData.category?.trim()),
    Boolean(formData.productsServices && formData.productsServices.length > 0),
    Boolean(formData.targetCustomers?.trim()),
    Boolean(formData.businessGoals && formData.businessGoals.length > 0),
  ].filter(Boolean).length;

  const isReady = completedCount === 5;

  const handleAddProduct = () => {
    if (!newProduct.trim()) return;
    const updated = [...(formData.productsServices || []), newProduct.trim()];
    setFormData({ ...formData, productsServices: updated });
    setNewProduct("");
  };

  const handleRemoveProduct = (indexToRemove: number) => {
    const updated = (formData.productsServices || []).filter((_, i) => i !== indexToRemove);
    setFormData({ ...formData, productsServices: updated });
  };

  const handleAddGoal = () => {
    if (!newGoal.trim()) return;
    const updated = [...(formData.businessGoals || []), newGoal.trim()];
    setFormData({ ...formData, businessGoals: updated });
    setNewGoal("");
  };

  const handleRemoveGoal = (indexToRemove: number) => {
    const updated = (formData.businessGoals || []).filter((_, i) => i !== indexToRemove);
    setFormData({ ...formData, businessGoals: updated });
  };

  const handleSaveEdit = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleConfirm = () => {
    if (
      formData.businessName &&
      formData.category &&
      formData.productsServices &&
      formData.productsServices.length > 0 &&
      formData.targetCustomers &&
      formData.businessGoals &&
      formData.businessGoals.length > 0
    ) {
      onConfirm({
        businessName: formData.businessName.trim(),
        category: formData.category.trim(),
        productsServices: formData.productsServices,
        targetCustomers: formData.targetCustomers.trim(),
        businessGoals: formData.businessGoals,
        description: formData.description?.trim(),
        address: formData.address,
        phoneNumber: formData.phoneNumber?.trim(),
        websiteUrl: formData.websiteUrl?.trim(),
        socialLinks: formData.socialLinks,
        reviewSource: formData.reviewSource || "demo",
        uploadedPhotos: formData.uploadedPhotos || [],
        customerReviews: formData.customerReviews || [],
      });
    }
  };

  const formatUrl = (url?: string) => {
    if (!url) return "";
    return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  };

  return (
    <Card className="border border-branvidia-200/80 shadow-editorial bg-white my-4 overflow-hidden">
      <CardHeader className="bg-paper-50/70 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base text-charcoal-950 font-semibold">
                Captured Business Profile & Verification
              </CardTitle>
              <Badge variant={isReady ? "brand" : "warning"} size="sm" dot>
                {completedCount}/5 Core Fields Verified
              </Badge>
              <Badge variant="neutral" size="sm">
                Provenance: CUSTOMER_PROVIDED
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Extracted naturally from your dialogue with the Branvidia Business Advisor. You can refine or expand any details below.
            </CardDescription>
          </div>

          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 className="h-3.5 w-3.5" />}
              onClick={() => setIsEditing(true)}
            >
              Edit All Details
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-4 text-xs">
        {isEditing ? (
          <div className="space-y-4">
            {/* Core Row 1: Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Business Name *</label>
                <input
                  type="text"
                  value={formData.businessName || ""}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3 py-2 border border-paper-300 rounded-md bg-paper-50 text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-branvidia-700"
                  placeholder="e.g., Velvet & Thread Boutique"
                />
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Business Category *</label>
                <input
                  type="text"
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-paper-300 rounded-md bg-paper-50 text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-branvidia-700"
                  placeholder="e.g., Women's Fashion & Apparel"
                />
              </div>
            </div>

            {/* Description (with character count) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-charcoal-700">Business Description</label>
                <span className="text-[11px] font-mono text-charcoal-500">
                  {formData.description?.length || 0}/750 chars (250+ recommended for full SEO credit)
                </span>
              </div>
              <textarea
                rows={3}
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-paper-300 rounded-md bg-paper-50 text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-branvidia-700 leading-relaxed"
                placeholder="Describe your business, heritage, specialties, and customer commitment..."
              />
            </div>

            {/* Products & Services: Structured List Editor */}
            <div className="space-y-1.5">
              <label className="font-medium text-charcoal-700 block">Products & Services *</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.productsServices && formData.productsServices.length > 0 ? (
                  formData.productsServices.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-branvidia-50 text-branvidia-900 border border-branvidia-200 text-xs font-medium"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(idx)}
                        className="text-branvidia-500 hover:text-branvidia-900 p-0.5 rounded-full"
                        title="Remove product"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-charcoal-400 italic text-xs">No products added yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddProduct();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 border border-paper-300 rounded-md bg-paper-50 text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-branvidia-700"
                  placeholder="Add a product or service..."
                />
                <Button type="button" size="sm" variant="secondary" onClick={handleAddProduct} leftIcon={<Plus className="h-3 w-3" />}>
                  Add
                </Button>
              </div>
            </div>

            {/* Target Customers */}
            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Target Customers *</label>
              <input
                type="text"
                value={formData.targetCustomers || ""}
                onChange={(e) => setFormData({ ...formData, targetCustomers: e.target.value })}
                className="w-full px-3 py-2 border border-paper-300 rounded-md bg-paper-50 text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-branvidia-700"
                placeholder="e.g., Fashion-forward shoppers and local professionals"
              />
            </div>

            {/* Primary Business Goals: Structured List Editor */}
            <div className="space-y-1.5">
              <label className="font-medium text-charcoal-700 block">Primary Business Goals *</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.businessGoals && formData.businessGoals.length > 0 ? (
                  formData.businessGoals.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-paper-100 text-charcoal-900 border border-paper-300 text-xs font-medium"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(idx)}
                        className="text-charcoal-500 hover:text-charcoal-900 p-0.5 rounded-full"
                        title="Remove goal"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-charcoal-400 italic text-xs">No goals added yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddGoal();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 border border-paper-300 rounded-md bg-paper-50 text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-branvidia-700"
                  placeholder="Add a business goal..."
                />
                <Button type="button" size="sm" variant="secondary" onClick={handleAddGoal} leftIcon={<Plus className="h-3 w-3" />}>
                  Add
                </Button>
              </div>
            </div>

            {/* Address & Physical Location */}
            <div className="p-3.5 bg-paper-100 rounded-lg border border-paper-200 space-y-2.5">
              <div className="flex items-center gap-1.5 font-semibold text-charcoal-900">
                <MapPin className="h-4 w-4 text-branvidia-800" />
                <span>Physical Location & Address</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={formData.address?.street || ""}
                    placeholder="Street Address (e.g., 450 Fashion Avenue, Suite 12)"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...(formData.address || { city: "New York", country: "United States" }),
                          street: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 border border-paper-300 rounded-md bg-white text-charcoal-900"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.address?.city || ""}
                    placeholder="City (e.g., New York)"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...(formData.address || { country: "United States" }),
                          city: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 border border-paper-300 rounded-md bg-white text-charcoal-900"
                  />
                </div>
              </div>
            </div>

            {/* Business Links & URLs */}
            <div className="p-3.5 bg-paper-100 rounded-lg border border-paper-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-charcoal-900">
                  <Globe className="h-4 w-4 text-branvidia-800" />
                  <span>Business Links & Social Profiles</span>
                </div>
                <Badge variant="outline" size="sm" className="text-[10px]">
                  SEO Signal Consistency
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-charcoal-600 block mb-0.5">Official Website URL</label>
                  <input
                    type="url"
                    value={formData.websiteUrl || ""}
                    placeholder="https://yourbrand.com"
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full px-3 py-1.5 border border-paper-300 rounded-md bg-white text-charcoal-900 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-charcoal-600 block mb-0.5">Google Business Profile URL</label>
                  <input
                    type="url"
                    value={formData.socialLinks?.googleBusinessProfileUrl || ""}
                    placeholder="https://maps.google.com/?cid=..."
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...(formData.socialLinks || {}),
                          googleBusinessProfileUrl: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 border border-paper-300 rounded-md bg-white text-charcoal-900 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-charcoal-600 block mb-0.5">Instagram Profile</label>
                  <input
                    type="url"
                    value={formData.socialLinks?.instagramUrl || ""}
                    placeholder="https://instagram.com/yourhandle"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...(formData.socialLinks || {}),
                          instagramUrl: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 border border-paper-300 rounded-md bg-white text-charcoal-900 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-charcoal-600 block mb-0.5">Facebook Page</label>
                  <input
                    type="url"
                    value={formData.socialLinks?.facebookUrl || ""}
                    placeholder="https://facebook.com/yourpage"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...(formData.socialLinks || {}),
                          facebookUrl: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 border border-paper-300 rounded-md bg-white text-charcoal-900 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button size="sm" variant="primary" onClick={handleSaveEdit}>
                Save Changes
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Business Name */}
              <div className="p-3 bg-paper-50 rounded-lg border border-paper-200/90 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 font-medium">
                  <Building className="h-4 w-4" />
                  <span>Business Name</span>
                </div>
                {formData.businessName ? (
                  <p className="font-semibold text-charcoal-900 leading-snug">
                    {formData.businessName}
                  </p>
                ) : (
                  <p className="text-amber-700 font-medium italic flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Pending in conversation...
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="p-3 bg-paper-50 rounded-lg border border-paper-200/90 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 font-medium">
                  <Tag className="h-4 w-4" />
                  <span>Business Category</span>
                </div>
                {formData.category ? (
                  <p className="font-semibold text-charcoal-900 leading-snug">
                    {formData.category}
                  </p>
                ) : (
                  <p className="text-amber-700 font-medium italic flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Pending in conversation...
                  </p>
                )}
              </div>
            </div>

            {/* Description (if provided) */}
            {formData.description && (
              <div className="p-3 bg-paper-50 rounded-lg border border-paper-200/90 space-y-1">
                <div className="flex items-center justify-between text-charcoal-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>Business Description</span>
                  </div>
                  <span className="text-[11px] font-mono text-charcoal-400">
                    {formData.description.length} chars
                  </span>
                </div>
                <p className="text-xs text-charcoal-800 leading-relaxed font-sans">
                  {formData.description}
                </p>
              </div>
            )}

            {/* Products & Services (Rendered as structured tags) */}
            <div className="p-3 bg-paper-50 rounded-lg border border-paper-200/90 space-y-1">
              <div className="flex items-center gap-1.5 text-charcoal-500 font-medium">
                <Package className="h-4 w-4" />
                <span>Products & Services</span>
              </div>
              {formData.productsServices && formData.productsServices.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {formData.productsServices.map((p, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-branvidia-50 text-branvidia-900 border border-branvidia-200"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-amber-700 font-medium italic flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Pending in conversation...
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Target Customers */}
              <div className="p-3 bg-paper-50 rounded-lg border border-paper-200/90 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 font-medium">
                  <Users className="h-4 w-4" />
                  <span>Target Customers</span>
                </div>
                {formData.targetCustomers ? (
                  <p className="font-semibold text-charcoal-900 leading-snug">
                    {formData.targetCustomers}
                  </p>
                ) : (
                  <p className="text-amber-700 font-medium italic flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Pending in conversation...
                  </p>
                )}
              </div>

              {/* Business Goals */}
              <div className="p-3 bg-paper-50 rounded-lg border border-paper-200/90 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 font-medium">
                  <Target className="h-4 w-4" />
                  <span>Primary Business Goals</span>
                </div>
                {formData.businessGoals && formData.businessGoals.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {formData.businessGoals.map((g, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-paper-100 text-charcoal-800 border border-paper-300"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-amber-700 font-medium italic flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Pending in conversation...
                  </p>
                )}
              </div>
            </div>

            {/* Links & Address summary strip */}
            {(formData.websiteUrl || formData.address?.street || formData.socialLinks?.instagramUrl) && (
              <div className="p-3 bg-paper-100 rounded-lg border border-paper-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 flex-wrap">
                  {formData.address?.city && (
                    <span className="flex items-center gap-1 text-charcoal-700">
                      <MapPin className="h-3.5 w-3.5 text-branvidia-800" />
                      {formData.address.street ? `${formData.address.street}, ` : ""}{formData.address.city}
                    </span>
                  )}

                  {formData.websiteUrl && (
                    <a
                      href={formatUrl(formData.websiteUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-branvidia-800 hover:underline font-mono text-[11px]"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {formData.websiteUrl.replace(/^https?:\/\//, "")}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}

                  {formData.socialLinks?.instagramUrl && (
                    <a
                      href={formatUrl(formData.socialLinks.instagramUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-charcoal-700 hover:text-charcoal-950 font-mono text-[11px]"
                    >
                      <Instagram className="h-3.5 w-3.5 text-rose-600" />
                      Instagram
                    </a>
                  )}
                </div>

                <span className="text-[10px] text-charcoal-400">
                  Registered for SEO audit
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-paper-100/70 border-t border-paper-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-charcoal-500">
          {isReady
            ? "Core attributes verified. Ready to proceed to asset and data integration."
            : "Tell your Branvidia AI Advisor about any missing details above to complete your profile."}
        </p>

        <Button
          variant="primary"
          size="sm"
          disabled={!isReady}
          rightIcon={<ArrowRight className="h-4 w-4" />}
          onClick={handleConfirm}
        >
          Confirm & Proceed to Integration
        </Button>
      </CardFooter>
    </Card>
  );
}
