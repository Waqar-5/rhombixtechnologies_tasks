import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { companySchema } from '@/lib/schemas';
import { companiesApi } from '@/api/companies';

const sizeOptions = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function RecruiterCompany() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(companySchema) });

  useEffect(() => {
    companiesApi
      .getMine()
      .then((data) => {
        setCompany(data.company);
        reset({
          name: data.company.name,
          tagline: data.company.tagline || '',
          description: data.company.description || '',
          industry: data.company.industry || '',
          companySize: data.company.companySize,
          founded: data.company.founded || '',
          website: data.company.website || '',
          headquarters: data.company.headquarters || ''
        });
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      const updated = await companiesApi.updateMine(data);
      setCompany(updated.company);
      toast.success('Company profile updated');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const { logo } = await companiesApi.uploadLogo(formData);
      setCompany((prev) => ({ ...prev, logo }));
      toast.success('Logo updated');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Company profile" description="This is what job seekers see when they view your open roles." />

      <Card className="mb-6">
        <CardContent className="pt-6 flex items-center gap-5">
          <div className="relative">
            <Avatar src={company?.logo?.url} name={company?.name} size="xl" className="rounded-2xl" />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-white shadow-glow"
              aria-label="Change logo"
            >
              {uploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </button>
            <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />
          </div>
          <div>
            <p className="font-medium">{company?.name}</p>
            <p className="text-sm text-muted-foreground">/companies/{company?.slug}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Company name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" placeholder="A short one-liner about what you do" {...register('tagline')} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={5} placeholder="Tell candidates about your mission and culture" {...register('description')} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" placeholder="e.g. Fintech" {...register('industry')} />
              </div>
              <div>
                <Label>Company size</Label>
                <Select value={watch('companySize')} onValueChange={(v) => setValue('companySize', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="founded">Founded year</Label>
                <Input id="founded" type="number" {...register('founded')} />
              </div>
              <div>
                <Label htmlFor="headquarters">Headquarters</Label>
                <Input id="headquarters" placeholder="City, Country or Remote" {...register('headquarters')} />
              </div>
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="https://yourcompany.com" {...register('website')} />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
