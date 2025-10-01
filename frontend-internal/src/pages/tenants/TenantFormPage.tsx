import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTenant, useCreateTenant, useUpdateTenant } from '@/hooks/useTenants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

const tenantSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  address: z.string().min(5, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().min(4, 'Code postal invalide'),
  country: z.string().min(2, 'Pays requis'),
});

type TenantForm = z.infer<typeof tenantSchema>;

export const TenantFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';

  const { data: tenant, isLoading: isLoadingTenant } = useTenant(
    Number(id),
  );
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TenantForm>({
    resolver: zodResolver(tenantSchema),
  });

  useEffect(() => {
    if (tenant && isEdit) {
      reset({
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        address: tenant.address,
        city: tenant.city,
        postalCode: tenant.postalCode,
        country: tenant.country,
      });
    }
  }, [tenant, isEdit, reset]);

  const onSubmit = (data: TenantForm) => {
    if (isEdit) {
      updateTenant.mutate(
        { id: Number(id), data },
        {
          onSuccess: () => navigate(`/tenants/${id}`),
        }
      );
    } else {
      createTenant.mutate(data, {
        onSuccess: (newTenant) => navigate(`/tenants/${newTenant.id}`),
      });
    }
  };

  if (isLoadingTenant && isEdit) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-flotteq-blue" />
      </div>
    );
  }

  const isSubmitting = createTenant.isPending || updateTenant.isPending;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/tenants')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Modifier' : 'Nouveau'} Tenant
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Modifiez les informations du tenant' : 'Créez un nouveau tenant'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'entreprise *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Transport Express SARL"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="contact@entreprise.fr"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+33 6 12 34 56 78"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="45 Rue de la République"
              disabled={isSubmitting}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code Postal *</Label>
              <Input
                id="postalCode"
                {...register('postalCode')}
                placeholder="69002"
                disabled={isSubmitting}
              />
              {errors.postalCode && (
                <p className="text-sm text-destructive">
                  {errors.postalCode.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Lyon"
                disabled={isSubmitting}
              />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Pays *</Label>
              <Input
                id="country"
                {...register('country')}
                placeholder="France"
                disabled={isSubmitting}
              />
              {errors.country && (
                <p className="text-sm text-destructive">{errors.country.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/tenants')}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-flotteq-blue hover:bg-flotteq-navy"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Modification...' : 'Création...'}
                </>
              ) : (
                <>{isEdit ? 'Modifier' : 'Créer'}</>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
