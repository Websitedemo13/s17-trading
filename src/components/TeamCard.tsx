import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Team } from '@/types';
import { Users, Calendar, Crown } from 'lucide-react';
import { useTeamStore } from '@/stores/teamStore';

interface TeamCardProps {
  team: Team;
  onJoin?: () => void;
  onLeave?: () => void;
  onView?: () => void;
}

const TeamCard = ({ team, onJoin, onLeave, onView }: TeamCardProps) => {
  const { joinTeam, leaveTeam } = useTeamStore();

  const handleJoin = async () => {
    const success = await joinTeam(team.id);
    if (success && onJoin) {
      onJoin();
    }
  };

  const handleLeave = async () => {
    const success = await leaveTeam(team.id);
    if (success && onLeave) {
      onLeave();
    }
  };

  const isMember = team.role === 'admin' || team.role === 'member';

  return (
    <Card className="glass-card hover:shadow-lg transition-all duration-200 animate-fade-in">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={team.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {team.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="flex items-center gap-2">
                {team.name}
                {team.role === 'admin' && (
                  <Crown className="h-4 w-4 text-warning" />
                )}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {team.description || 'Không có mô tả'}
              </CardDescription>
            </div>
          </div>
          {team.role && (
            <Badge variant={team.role === 'admin' ? 'default' : 'secondary'}>
              {team.role === 'admin' ? 'Admin' : 'Member'}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{team.member_count || 0} thành viên</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(team.created_at).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onView}
          >
            Xem chi tiết
          </Button>
          
          {isMember ? (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleLeave}
            >
              Rời nhóm
            </Button>
          ) : (
            <Button 
              size="sm"
              onClick={handleJoin}
            >
              Tham gia
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamCard;