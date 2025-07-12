import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MapPin, Clock, Users, Star } from 'lucide-react';
import { useAllPackages, useCreatePackage, useUpdatePackage, useDeletePackage, Package } from '@/hooks/usePackages';
import PackageForm from './PackageForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PackageManagement = () => {
  const { data: packages = [], isLoading } = useAllPackages();
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const deletePackage = useDeletePackage();

  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; package: Package | null }>({
    open: false,
    package: null,
  });

  const existingCodes = packages.map(pkg => pkg.package_code);

  const handleCreate = () => {
    setEditingPackage(null);
    setShowForm(true);
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setShowForm(true);
  };

  const handleDelete = (pkg: Package) => {
    setDeleteDialog({ open: true, package: pkg });
  };

  const confirmDelete = () => {
    if (deleteDialog.package) {
      deletePackage.mutate(deleteDialog.package.id);
      setDeleteDialog({ open: false, package: null });
    }
  };

  const handleSubmit = async (packageData: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingPackage) {
        await updatePackage.mutateAsync({ ...packageData, id: editingPackage.id });
      } else {
        await createPackage.mutateAsync(packageData);
      }
      setShowForm(false);
      setEditingPackage(null);
    } catch (error) {
      console.error('Error saving package:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPackage(null);
  };

  if (showForm) {
    return (
      <PackageForm
        package={editingPackage || undefined}
        existingCodes={existingCodes}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createPackage.isPending || updatePackage.isPending}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading packages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Package Management</h2>
          <p className="text-muted-foreground">Manage tour packages for your website</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={`group hover:shadow-lg transition-shadow ${!pkg.is_active ? 'opacity-50' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {pkg.package_code}
                  </Badge>
                  {!pkg.is_active && <Badge variant="destructive">Inactive</Badge>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(pkg)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(pkg)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <img 
                  src={pkg.image_url} 
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-white/90 text-black px-2 py-1 rounded text-sm font-medium">
                  {pkg.price}
                </div>
              </div>

              <div>
                <CardTitle className="text-lg mb-1">{pkg.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  {pkg.location}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {pkg.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {pkg.group_size}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-amber-500">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {pkg.rating} ({pkg.reviews_count})
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {pkg.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {pkg.features.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{pkg.features.length - 3} more
                  </Badge>
                )}
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Locations Included:</div>
                <div className="text-xs text-muted-foreground">
                  {pkg.locations_included.slice(0, 2).join(', ')}
                  {pkg.locations_included.length > 2 && ` +${pkg.locations_included.length - 2} more`}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, package: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.package?.title}"? This action cannot be undone.
              The package will be marked as inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PackageManagement;