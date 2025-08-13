import { getRecipe } from '@/app/actions/recipes';
import RecipeForm from '@/components/recipes/RecipeForm';
import { notFound } from 'next/navigation';

interface EditRecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params;
  
  try {
    const recipe = await getRecipe(id);
    return (
      <div>
        <RecipeForm initialData={recipe} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
