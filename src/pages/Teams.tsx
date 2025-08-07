import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import TeamCard from '@/components/TeamCard';
import { useTeamStore } from '@/stores/teamStore';
import { Plus, Search } from 'lucide-react';

const Teams = () => {
  const navigate = useNavigate();
  const { teams, loading, fetchTeams, createTeam } = useTeamStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    
    const success = await createTeam(newTeamName, newTeamDescription);
    if (success) {
      setShowCreateDialog(false);
      setNewTeamName('');
      setNewTeamDescription('');
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewTeam = (teamId: string) => {
    navigate(`/teams/${teamId}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Trading Teams</h1>
          <p className="text-muted-foreground">
            Tham gia hoặc tạo nhóm để chia sẻ kinh nghiệm trading
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo nhóm mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo nhóm trading mới</DialogTitle>
              <DialogDescription>
                Tạo một nhóm để chia sẻ kiến thức và cùng nhau phát triển
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tên nhóm</label>
                <Input
                  placeholder="Ví dụ: S17 Crypto Hunters"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mô tả (tùy chọn)</label>
                <Textarea
                  placeholder="Mô tả về nhóm, mục tiêu và chiến lược trading..."
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim()}
                  className="flex-1"
                >
                  Tạo nhóm
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm nhóm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-lg animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-muted h-12 w-12"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onJoin={fetchTeams}
              onLeave={fetchTeams}
              onView={() => handleViewTeam(team.id)}
            />
          ))}
        </div>
      )}

      {!loading && filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery ? 'Không tìm thấy nhóm nào phù hợp' : 'Chưa có nhóm nào. Hãy tạo nhóm đầu tiên!'}
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;