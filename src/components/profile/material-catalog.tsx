"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Package, Plus, X, Upload, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Material {
    _id?: string;
    name: string;
    type: string;
    price: string;
    photos: { url: string }[];
}

interface MaterialCatalogProps {
    materials?: Material[];
    onUpdate: (materials: Material[]) => void;
}

export function MaterialCatalog({ materials = [], onUpdate }: MaterialCatalogProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newMaterial, setNewMaterial] = useState<Material>({
        name: "",
        type: "",
        price: "",
        photos: [],
    });
    const [photoUrl, setPhotoUrl] = useState("");

    const handleAddMaterial = () => {
        if (!newMaterial.name || !newMaterial.type || !newMaterial.price || newMaterial.photos.length === 0) {
            return;
        }

        onUpdate([...materials, { ...newMaterial, _id: Date.now().toString() }]);
        setNewMaterial({ name: "", type: "", price: "", photos: [] });
        setPhotoUrl("");
        setIsDialogOpen(false);
    };

    const handleAddPhoto = () => {
        if (photoUrl.trim()) {
            setNewMaterial({
                ...newMaterial,
                photos: [...newMaterial.photos, { url: photoUrl }],
            });
            setPhotoUrl("");
        }
    };

    const handleRemovePhoto = (index: number) => {
        setNewMaterial({
            ...newMaterial,
            photos: newMaterial.photos.filter((_, i) => i !== index),
        });
    };

    const handleRemoveMaterial = (id: string) => {
        onUpdate(materials.filter((m) => m._id !== id));
    };

    return (
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Material Catalog</CardTitle>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                                Add materials you supply
                            </p>
                        </div>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Material
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add New Material</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Material Name *</Label>
                                    <Input
                                        placeholder="e.g., Premium Marble Tiles"
                                        value={newMaterial.name}
                                        onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Material Type *</Label>
                                    <Input
                                        placeholder="e.g., Flooring, Tiles, Cement"
                                        value={newMaterial.type}
                                        onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Price *</Label>
                                    <Input
                                        placeholder="e.g., ₹500/sq.ft"
                                        value={newMaterial.price}
                                        onChange={(e) => setNewMaterial({ ...newMaterial, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Photos * (at least 1)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter image URL"
                                            value={photoUrl}
                                            onChange={(e) => setPhotoUrl(e.target.value)}
                                        />
                                        <Button type="button" onClick={handleAddPhoto} size="sm">
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {newMaterial.photos.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            {newMaterial.photos.map((photo, idx) => (
                                                <div key={idx} className="relative group">
                                                    <img
                                                        src={photo.url}
                                                        alt={`Material ${idx + 1}`}
                                                        className="w-full h-20 object-cover rounded-lg"
                                                    />
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleRemovePhoto(idx)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white"
                                    onClick={handleAddMaterial}
                                    disabled={!newMaterial.name || !newMaterial.type || !newMaterial.price || newMaterial.photos.length === 0}
                                >
                                    Add Material
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {materials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {materials.map((material) => (
                            <Card key={material._id} className="group relative overflow-hidden">
                                <div className="relative h-40 overflow-hidden">
                                    {material.photos[0] && (
                                        <img
                                            src={material.photos[0].url}
                                            alt={material.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemoveMaterial(material._id!)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white">{material.name}</h4>
                                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{material.type}</p>
                                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mt-2">
                                        {material.price}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-500 dark:text-gray-400">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No materials added yet. Click "Add Material" to get started.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
