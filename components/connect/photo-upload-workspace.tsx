"use client";

import * as React from "react";
import { CustomerUploadedPhoto, PhotoCategory } from "@/lib/types/contracts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Camera,
  Layers,
} from "lucide-react";

export interface PhotoUploadWorkspaceProps {
  photos: CustomerUploadedPhoto[];
  onChange: (photos: CustomerUploadedPhoto[]) => void;
  maxFiles?: number;
}

const CATEGORY_OPTIONS: { value: PhotoCategory; label: string; description: string }[] = [
  { value: "PROFILE", label: "Logo / Brand Avatar", description: "Square icon or brand logo (min 720×720 recommended)" },
  { value: "COVER", label: "Cover Photo", description: "Primary banner image displayed at top of search results (16:9)" },
  { value: "EXTERIOR", label: "Exterior / Storefront", description: "Street view, building entrance, parking or signage" },
  { value: "INTERIOR", label: "Interior Ambience", description: "Seating, fitting rooms, treatment areas, reception" },
  { value: "PRODUCT", label: "Products / Services", description: "Apparel, retail merchandise, menu items or equipment" },
  { value: "FOOD_AND_DRINK", label: "Food & Beverage", description: "Dishes, coffee, drinks, fresh specials" },
  { value: "AT_WORK", label: "Team & Staff at Work", description: "Customer consultations, service in progress, friendly staff" },
  { value: "ADDITIONAL", label: "Additional Visual Asset", description: "Certifications, awards, promotions, event photos" },
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function PhotoUploadWorkspace({
  photos,
  onChange,
  maxFiles = 20,
}: PhotoUploadWorkspaceProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleFiles = (fileList: FileList) => {
    setErrorMessage(null);
    const files = Array.from(fileList);

    if (photos.length + files.length > maxFiles) {
      setErrorMessage(`Maximum limit is ${maxFiles} photos. Please select fewer files.`);
      return;
    }

    const newPhotos: CustomerUploadedPhoto[] = [];

    files.forEach((file) => {
      // 1. Validation
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setErrorMessage(`"${file.name}" was skipped: Only JPG, PNG, and WEBP formats are accepted.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(`"${file.name}" exceeds the 5MB file size limit (${(file.size / 1024 / 1024).toFixed(1)}MB).`);
        return;
      }

      // 2. Client-side preview & dimension inspection
      const previewUrl = URL.createObjectURL(file);
      const photoId = `user_img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Default smart category assignment based on existing photo inventory
      let assignedCategory: PhotoCategory = "ADDITIONAL";
      const existingCategories = new Set(photos.map((p) => p.category));
      if (!existingCategories.has("PROFILE")) assignedCategory = "PROFILE";
      else if (!existingCategories.has("COVER")) assignedCategory = "COVER";
      else if (!existingCategories.has("INTERIOR")) assignedCategory = "INTERIOR";
      else if (!existingCategories.has("EXTERIOR")) assignedCategory = "EXTERIOR";
      else if (!existingCategories.has("PRODUCT")) assignedCategory = "PRODUCT";

      const photoRecord: CustomerUploadedPhoto = {
        id: photoId,
        previewUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        category: assignedCategory,
        description: "",
        uploadedAt: new Date().toISOString(),
        provenance: "CUSTOMER_UPLOADED",
      };

      // Measure natural dimensions asynchronously
      const img = new Image();
      img.onload = () => {
        photoRecord.width = img.naturalWidth;
        photoRecord.height = img.naturalHeight;
        onChange([...photos, ...newPhotos]);
      };
      img.src = previewUrl;

      newPhotos.push(photoRecord);
    });

    if (newPhotos.length > 0) {
      onChange([...photos, ...newPhotos]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleCategoryChange = (id: string, newCategory: PhotoCategory) => {
    const updated = photos.map((p) =>
      p.id === id ? { ...p, category: newCategory } : p
    );
    onChange(updated);
  };

  const handleDescriptionChange = (id: string, description: string) => {
    const updated = photos.map((p) =>
      p.id === id ? { ...p, description } : p
    );
    onChange(updated);
  };

  const handleRemovePhoto = (id: string) => {
    const target = photos.find((p) => p.id === id);
    if (target?.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(target.previewUrl);
    }
    const updated = photos.filter((p) => p.id !== id);
    onChange(updated);
  };

  // Category coverage metrics
  const categoriesPresent = new Set(photos.map((p) => p.category));
  const missingCategories = CATEGORY_OPTIONS.filter(
    (opt) => !["ADDITIONAL", "FOOD_AND_DRINK"].includes(opt.value) && !categoriesPresent.has(opt.value)
  );

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? "border-branvidia-800 bg-branvidia-50/60"
            : "border-paper-300 bg-paper-50/60 hover:border-branvidia-600 hover:bg-paper-100/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="h-12 w-12 rounded-full bg-white border border-paper-200 shadow-subtle flex items-center justify-center mx-auto text-branvidia-800">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-charcoal-950">
              Drag & drop business photos, or <span className="text-branvidia-800 underline">browse files</span>
            </h4>
            <p className="text-xs text-charcoal-500 mt-1">
              Supports JPEG, PNG, and WebP (up to 5MB each). Add logo, storefront, interior, products, and team photos.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Badge variant="neutral" size="sm">Max 20 Photos</Badge>
            <Badge variant="outline" size="sm">Resolution & Quality Checked</Badge>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Transparency & Scope Disclosure Banner */}
      <div className="p-3.5 bg-paper-100 rounded-xl border border-paper-200/90 text-xs text-charcoal-700 flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <span className="font-semibold text-charcoal-900 block text-[11px] uppercase tracking-wider font-mono">
            Tier 1 Metadata Audit Guarantee
          </span>
          <p className="text-[11px]">
            Branvidia validates file resolution, aspect ratios, file sizes, and Google category coverage deterministically. We do <strong>not</strong> claim to perform deep visual content recognition unless a vision-capable AI model is verified.
          </p>
        </div>
      </div>

      {/* Photo Inventory Stats Strip */}
      {photos.length > 0 && (
        <div className="p-4 bg-white border border-paper-300 rounded-xl shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-branvidia-800" />
            <span className="text-xs font-semibold text-charcoal-900">
              {photos.length} Photo{photos.length === 1 ? "" : "s"} Staged for Audit
            </span>
            <Badge variant={photos.length >= 6 ? "success" : "warning"} size="sm">
              {categoriesPresent.size}/6 Key Categories Covered
            </Badge>
          </div>

          {missingCategories.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-charcoal-500">Recommended additions:</span>
              {missingCategories.slice(0, 3).map((mc) => (
                <Badge key={mc.value} variant="outline" size="sm" className="text-[10px] bg-amber-50 text-amber-800 border-amber-300">
                  + {mc.label.split(" / ")[0]}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Uploaded Photos Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => {
            const aspect = photo.width && photo.height ? (photo.width / photo.height).toFixed(2) : null;
            const isLandscape = aspect && Number(aspect) >= 1.3;
            const isSquare = aspect && Math.abs(Number(aspect) - 1.0) <= 0.15;

            return (
              <div
                key={photo.id}
                className="bg-white border border-paper-300 rounded-xl overflow-hidden shadow-subtle hover:border-paper-400 transition-all flex flex-col"
              >
                {/* Image Preview Box */}
                <div className="relative h-44 bg-paper-200 overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt={photo.description || photo.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    aria-label="Remove photo"
                    className="absolute top-2 right-2 p-1.5 bg-charcoal-950/70 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-subtle cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-charcoal-950/80 text-white text-[10px] px-2 py-0.5 rounded font-mono backdrop-blur-sm">
                    {photo.width ? `${photo.width}×${photo.height}px` : "Inspecting..."} • {(photo.fileSize / 1024 / 1024).toFixed(1)}MB
                  </div>
                </div>

                {/* Details & Category Editing */}
                <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-500 block mb-1">
                        Google Category Tag
                      </label>
                      <select
                        value={photo.category}
                        onChange={(e) => handleCategoryChange(photo.id, e.target.value as PhotoCategory)}
                        className="w-full text-xs bg-paper-50 border border-paper-300 rounded-lg px-2.5 py-1.5 text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-branvidia-700"
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-500 block mb-1">
                        Description / Caption (Optional)
                      </label>
                      <input
                        type="text"
                        value={photo.description || ""}
                        placeholder="e.g. Handmade ceramic pour-over bar"
                        onChange={(e) => handleDescriptionChange(photo.id, e.target.value)}
                        className="w-full text-xs bg-paper-50 border border-paper-300 rounded-lg px-2.5 py-1.5 text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-branvidia-700 placeholder:text-charcoal-400"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-paper-200 flex items-center justify-between text-[11px] text-charcoal-500">
                    <span className="truncate max-w-[140px] font-mono text-[10px]">{photo.fileName}</span>
                    <Badge variant="neutral" size="sm" className="text-[9px]">
                      {isSquare ? "1:1 Square" : isLandscape ? "Landscape" : "Portrait"}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
