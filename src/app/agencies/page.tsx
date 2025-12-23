
import { agencyProfiles } from '@/app/lib/data';
import { ProfileListings } from '@/components/profiles/profile-listings';

export default function AgenciesPage() {
  const mostFollowed = [...agencyProfiles].sort((a, b) => (b.followers || 0) - (a.followers || 0));
  const mostActive = [...agencyProfiles].sort((a, b) => (b.activity || 0) - (a.activity || 0));

  return (
    <ProfileListings
      categoryName="Agencies"
      mostFollowed={mostFollowed}
      mostActive={mostActive}
    />
  );
}
