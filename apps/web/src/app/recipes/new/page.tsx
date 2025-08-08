"use client";

import Link from "next/link";
import { Protected } from "../../../components/auth/protected";
import { RecipeForm } from "../../../components/recipes/recipe-form";

export default function NewRecipePage() {
  return (
    <Protected>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/recipes"
              className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              ← Back to Recipes
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Recipe
            </h1>
            <p className="text-gray-600">Add a new recipe to your collection</p>
          </div>
        </div>

        {/* Form */}
        <RecipeForm />
      </div>
    </Protected>
  );
}
