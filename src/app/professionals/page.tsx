
import { professionalProfiles } from '@/app/lib/data';
import { ProfileListings } from '@/components/profiles/profile-listings';

export default function ProfessionalsPage() {
  const mostFollowed = [...professionalProfiles].sort((a, b) => (b.followers || 0) - (a.followers || 0));
  const mostActive = [...professionalProfiles].sort((a, b) => (b.activity || 0) - (a.activity || 0));

  return (
    <ProfileListings
      categoryName="Professionals"
      mostFollowed={mostFollowed}
      mostActive={mostActive}
    />
  );
}
