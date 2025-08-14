"use client";

import { RecipeImport } from "@/components/recipes/recipe-import";
import { PageContainer } from "@/components/page-container";
import { SectionHeader } from "@/components/section-header";
import type { ExtractedRecipe } from "@/lib/recipe-extract";

export default function RecipeImportPage() {
  const handleSave = async (recipe: ExtractedRecipe) => {
    console.log("Saving recipe:", recipe);
    // TODO: Implement actual save logic
    alert("Recipe saved successfully! (Check console for details)");
  };

  const handleCancel = () => {
    console.log("Import cancelled");
  };

  return (
    <PageContainer>
      <SectionHeader
        title="Recipe Import"
        description="Import recipes from URLs to quickly add them to your collection"
      />

      <RecipeImport onSave={handleSave} onCancel={handleCancel} />
    </PageContainer>
  );
}
