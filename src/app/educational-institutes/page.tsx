
import { instituteProfiles } from '@/app/lib/data';
import { ProfileListings } from '@/components/profiles/profile-listings';

export default function EducationalInstitutesPage() {
  const mostFollowed = [...instituteProfiles].sort((a, b) => (b.followers || 0) - (a.followers || 0));
  const mostActive = [...instituteProfiles].sort((a, b) => (b.activity || 0) - (a.activity || 0));

  return (
    <ProfileListings
      categoryName="Educational Institutes"
      mostFollowed={mostFollowed}
      mostActive={mostActive}
    />
  );
}
