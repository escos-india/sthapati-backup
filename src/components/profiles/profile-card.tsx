
import { Profile } from '@/app/lib/data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Zap } from 'lucide-react';
import { Badge } from '../ui/badge';

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <Card className="h-full flex flex-col text-center items-center p-6 hover:shadow-xl transition-shadow duration-300">
      <Avatar className="h-24 w-24 mb-4">
        <AvatarImage src={profile.avatarUrl} alt={profile.name} />
        <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
      </Avatar>
      <CardHeader className="p-0 mb-2">
        <p className="font-bold text-lg">{profile.name}</p>
        <p className="text-sm text-muted-foreground">{profile.role}</p>
      </CardHeader>
      <CardContent className="p-0 flex items-center gap-4">
        {profile.followers !== undefined && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{profile.followers.toLocaleString()}</span>
          </Badge>
        )}
        {profile.activity !== undefined && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span>{profile.activity}%</span>
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
