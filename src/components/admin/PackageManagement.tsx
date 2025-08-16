import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Clock, 
  Users, 
  MapPin,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAllPackages, useCreatePackage, useUpdatePackage, useDeletePackage, Package, generatePackageCode } from '@/hooks/usePackages';
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
    package: null
  });

  // Get existing package codes for validation
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

  const handleSubmit = (packageData: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingPackage) {
      updatePackage.mutate({ id: editingPackage.id, ...packageData }, {
        onSuccess: () => {
          setShowForm(false);
          setEditingPackage(null);
        }
      });
    } else {
      createPackage.mutate(packageData, {
        onSuccess: () => {
          setShowForm(false);
        }
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPackage(null);
  };

  if (showForm) {
    return (
      <PackageForm
        package={editingPackage}
        existingCodes={existingCodes}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createPackage.isPending || updatePackage.isPending}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-lg">Loading packages...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Package Management</h1>
          <p className="text-muted-foreground">
            Create and manage travel packages for your destinations
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={`transition-all duration-200 hover:shadow-lg ${!pkg.is_active ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {pkg.package_code}
                  </Badge>
                  {!pkg.is_active && (
                    <Badge variant="secondary">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hidden
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(pkg)}
                    disabled={!pkg.is_editable}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(pkg)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <img
                  src={pkg.image_url || '/placeholder.svg'}
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold line-clamp-2">{pkg.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {pkg.location}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{pkg.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{pkg.group_size}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{pkg.rating}</span>
                  <span className="text-muted-foreground">({pkg.reviews_count})</span>
                </div>
                <div className="text-lg font-bold text-primary">{pkg.price}</div>
              </div>

              {pkg.features.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Features:</div>
                  <div className="flex flex-wrap gap-1">
                    {pkg.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {pkg.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{pkg.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {pkg.locations_included.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Destinations:</div>
                  <div className="text-sm text-muted-foreground">
                    {pkg.locations_included.slice(0, 2).join(', ')}
                    {pkg.locations_included.length > 2 && ` and ${pkg.locations_included.length - 2} more`}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <Card className="p-12">
          <CardContent className="text-center">
            <div className="text-muted-foreground">
              <Plus className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No packages yet</h3>
              <p className="mb-4">Create your first travel package to get started.</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Package
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, package: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.package?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Package
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PackageManagement;