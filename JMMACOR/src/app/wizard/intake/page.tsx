'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { WizardNav } from '@/components/WizardNav';
import { Field } from '@/components/Field';
import { ChipInput } from '@/components/ChipInput';
import { useWizardStore } from '@/store/useWizardStore';
import { getClient, updateClientDraft, createClientDraft } from '@/app/actions/client';
import { intakeSchema, type IntakeForm } from '@/schemas/intake';
import { ACTIVITY_LEVELS, GOALS, MEAL_SLOTS } from '@/lib/constants';
import { sanitizeStringArray } from '@/lib/sanitize';

const ALLERGY_SUGGESTIONS = ['gluten', 'nuts', 'dairy', 'shellfish'];
const CUISINE_SUGGESTIONS = ['Thai', 'Indian', 'Asian', 'Italian', 'Mexican'];

export default function IntakePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clientId, setClientId, setClientDraft } = useWizardStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const clientIdFromUrl = searchParams.get('clientId');
  const currentClientId = clientIdFromUrl || clientId;

  const form = useForm<IntakeForm>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      fullName: '',
      gender: 'male',
      age: 25,
      heightCm: 170,
      weightKg: 70,
      activity: '',
      goal: '',
      allergies: [],
      cuisines: [],
      dislikes: [],
      includeMeals: [],
    },
  });

  const { formState: { errors, isSubmitting }, handleSubmit, reset, setValue, watch } = form;

  // Initialize form data
  useEffect(() => {
    const initializeForm = async () => {
      setIsInitializing(true);
      
      // Update store with URL clientId if different
      if (clientIdFromUrl && clientIdFromUrl !== clientId) {
        setClientId(clientIdFromUrl);
      }

      // If we have a clientId, fetch existing data
      if (currentClientId) {
        try {
          const client = await getClient(currentClientId);
          if (client) {
            // Prefill form with existing data
            reset({
              fullName: client.fullName,
              gender: client.gender as 'male' | 'female' | 'other',
              age: client.age,
              heightCm: client.heightCm,
              weightKg: client.weightKg,
              activity: client.activity,
              goal: client.goal,
              allergies: client.allergies,
              cuisines: client.cuisines,
              dislikes: client.dislikes,
              includeMeals: client.includeMeals as Array<'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Shakes'>,
            });
          }
        } catch (error) {
          console.error('Failed to load client data:', error);
        }
      }
      
      setIsInitializing(false);
    };

    initializeForm();
  }, [currentClientId, clientId, clientIdFromUrl, setClientId, reset]);

  const onSubmit = async (data: IntakeForm) => {
    setIsLoading(true);
    try {
      // Sanitize array fields
      const sanitizedData = {
        ...data,
        allergies: sanitizeStringArray(data.allergies),
        cuisines: sanitizeStringArray(data.cuisines),
        dislikes: sanitizeStringArray(data.dislikes),
      };

      let finalClientId = currentClientId;

      if (!finalClientId) {
        // Create new client
        const result = await createClientDraft(sanitizedData);
        finalClientId = result.id;
        setClientId(finalClientId);
      } else {
        // Update existing client
        await updateClientDraft(finalClientId, sanitizedData);
      }

      // Update Zustand store
      setClientDraft(sanitizedData);

      // Navigate to macros step
      router.push(`/wizard/macros?clientId=${finalClientId}`);
    } catch (error) {
      console.error('Failed to save client data:', error);
      alert('Failed to save data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center py-8">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Client Intake</h2>
        <p className="text-muted-foreground">
          Please provide detailed information about your client to create an accurate meal plan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identity Section */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-lg">Identity</h3>
            
            <Field 
              label="Full Name" 
              error={errors.fullName?.message}
              htmlFor="fullName"
            >
              <Input
                id="fullName"
                {...form.register('fullName')}
                placeholder="Enter full name"
              />
            </Field>

            <Field 
              label="Gender" 
              error={errors.gender?.message}
            >
              <RadioGroup
                value={watch('gender')}
                onValueChange={(value) => setValue('gender', value as 'male' | 'female' | 'other')}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </Field>

            <Field 
              label="Age" 
              error={errors.age?.message}
              htmlFor="age"
            >
              <Input
                id="age"
                type="number"
                {...form.register('age', { valueAsNumber: true })}
                placeholder="25"
              />
            </Field>
          </CardContent>
        </Card>

        {/* Body Section */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-lg">Body</h3>
            
            <Field 
              label="Height (cm)" 
              error={errors.heightCm?.message}
              htmlFor="heightCm"
            >
              <Input
                id="heightCm"
                type="number"
                {...form.register('heightCm', { valueAsNumber: true })}
                placeholder="170"
              />
            </Field>

            <Field 
              label="Weight (kg)" 
              error={errors.weightKg?.message}
              htmlFor="weightKg"
            >
              <Input
                id="weightKg"
                type="number"
                step="0.1"
                {...form.register('weightKg', { valueAsNumber: true })}
                placeholder="70.0"
              />
            </Field>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-lg">Preferences</h3>
            
            <Field 
              label="Allergies" 
              error={errors.allergies?.message}
              hint="Add allergies and dietary restrictions"
            >
              <ChipInput
                value={watch('allergies')}
                onChange={(value) => setValue('allergies', value)}
                placeholder="Type allergy and press Enter..."
                suggestions={ALLERGY_SUGGESTIONS}
                maxChips={30}
              />
            </Field>

            <Field 
              label="Cuisine Preferences" 
              error={errors.cuisines?.message}
              hint="Add preferred cuisines"
            >
              <ChipInput
                value={watch('cuisines')}
                onChange={(value) => setValue('cuisines', value)}
                placeholder="Type cuisine and press Enter..."
                suggestions={CUISINE_SUGGESTIONS}
                maxChips={30}
              />
            </Field>

            <Field 
              label="Food Dislikes" 
              error={errors.dislikes?.message}
              hint="Add foods to avoid"
            >
              <ChipInput
                value={watch('dislikes')}
                onChange={(value) => setValue('dislikes', value)}
                placeholder="Type food and press Enter..."
                maxChips={50}
              />
            </Field>
          </CardContent>
        </Card>

        {/* Plan Section */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-lg">Plan</h3>
            
            <Field 
              label="Included Meals" 
              error={errors.includeMeals?.message}
              hint="Select which meals to include in the plan"
            >
              <div className="space-y-2">
                {MEAL_SLOTS.map((meal) => (
                  <div key={meal} className="flex items-center space-x-2">
                    <Checkbox
                      id={meal}
                      checked={watch('includeMeals').includes(meal)}
                      onCheckedChange={(checked) => {
                        const current = watch('includeMeals');
                        if (checked) {
                          setValue('includeMeals', [...current, meal]);
                        } else {
                          setValue('includeMeals', current.filter(m => m !== meal));
                        }
                      }}
                    />
                    <Label htmlFor={meal}>{meal}</Label>
                  </div>
                ))}
              </div>
            </Field>

            <Field 
              label="Activity Level" 
              error={errors.activity?.message}
            >
              <Select
                value={watch('activity')}
                onValueChange={(value) => setValue('activity', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field 
              label="Goal" 
              error={errors.goal?.message}
            >
              <Select
                value={watch('goal')}
                onValueChange={(value) => setValue('goal', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  {GOALS.map((goal) => (
                    <SelectItem key={goal} value={goal}>
                      {goal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <WizardNav
        backHref="/"
        nextLabel={currentClientId ? "Continue" : "Start"}
        nextDisabled={isSubmitting || isLoading}
        isLoading={isSubmitting || isLoading}
        onNext={handleSubmit(onSubmit)}
      />
    </form>
  );
}
