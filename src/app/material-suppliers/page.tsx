
import { supplierProfiles } from '@/app/lib/data';
import { ProfileListings } from '@/components/profiles/profile-listings';

export default function MaterialSuppliersPage() {
  const mostFollowed = [...supplierProfiles].sort((a, b) => (b.followers || 0) - (a.followers || 0));
  const mostActive = [...supplierProfiles].sort((a, b) => (b.activity || 0) - (a.activity || 0));

  return (
    <ProfileListings
      categoryName="Material Suppliers"
      mostFollowed={mostFollowed}
      mostActive={mostActive}
    />
  );
}
